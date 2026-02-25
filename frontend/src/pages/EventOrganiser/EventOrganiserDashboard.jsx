import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './EventOrganiserDashboard.css';

const EventOrganiserDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    district: '',
    description: '',
    expectedParticipants: '',
    maxCapacity: ''
  });
  const [originalFormData, setOriginalFormData] = useState(null); // Store original event data for comparison

  const [stats, setStats] = useState({
    total: 0,
    past: 0,
    upcoming: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const districts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
    "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
    "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
    "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
    "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
  ];

  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  const formatTime = (timeStr) => {
    if (!timeStr) return 'TBD';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')) || null);
  }, []);

  useEffect(() => {
    if (formData.date === today) {
      if (formData.time && formData.time < currentTime) {
        setFormData(prev => ({ ...prev, time: '' }));
      }
      if (formData.endTime && formData.endTime < currentTime) {
        setFormData(prev => ({ ...prev, endTime: '' }));
      }
    }
  }, [formData.date]);

  useEffect(() => {
    if (formData.endTime && formData.time && formData.endTime <= formData.time) {
      setFormData(prev => ({ ...prev, endTime: '' }));
    }
  }, [formData.time]);

  const startTimeMin = formData.date === today ? currentTime : '00:00';
  const endTimeMin = formData.time || (formData.date === today ? currentTime : '00:00');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in again.');
        setLoading(false);
        return;
      }
      const response = await api.get('/api/events');

      if (response.data.success) {
        const sortedEvents = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setEvents(sortedEvents);
        calculateStats(sortedEvents);
      } else {
        setError(response.data.error || 'Failed to fetch events');
      }
      setLoading(false);
    } catch (err) {
      console.error('Fetch events error:', err);
      setError(err.response?.data?.details || err.response?.data?.error || 'Failed to fetch events. Please try again.');
      setLoading(false);
    }
  };

  const calculateStats = (eventsData) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTimeStr = now.toTimeString().slice(0, 5);

    const stats = {
      total: eventsData.length,
      past: eventsData.filter(e => e.date < todayStr || (e.date === todayStr && e.endTime < currentTimeStr)).length,
      upcoming: eventsData.filter(e => e.date > todayStr || (e.date === todayStr && e.endTime >= currentTimeStr)).length,
      pending: eventsData.filter(e => e.status === 'pending').length,
      approved: eventsData.filter(e => e.status === 'approved').length,
      rejected: eventsData.filter(e => e.status === 'rejected').length
    };
    setStats(stats);
  };

  const validateTimeFormat = (time) => {
    if (!time) return true; // Allow empty time during edit
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate time format only if provided
    if (formData.time && !validateTimeFormat(formData.time)) {
      setError('Event start time must be in HH:MM format');
      return;
    }
    if (formData.endTime && !validateTimeFormat(formData.endTime)) {
      setError('Event end time must be in HH:MM format');
      return;
    }
    if (formData.time && formData.endTime && formData.endTime <= formData.time) {
      setError('End time must be after start time');
      return;
    }

    // Prepare submission data, only include changed or provided fields
    const submitData = {};
    if (!isEdit || formData.name !== originalFormData?.name) submitData.name = formData.name;
    if (!isEdit || formData.date !== originalFormData?.date) submitData.date = formData.date;
    if (!isEdit || formData.time) submitData.time = formData.time || null; // Only include if provided
    if (!isEdit || formData.endTime) submitData.endTime = formData.endTime || null; // Only include if provided
    if (!isEdit || formData.location !== originalFormData?.location) submitData.location = formData.location;
    if (!isEdit || formData.district !== originalFormData?.district) submitData.district = formData.district;
    if (!isEdit || formData.description !== originalFormData?.description) submitData.description = formData.description || null;
    if (!isEdit || formData.expectedParticipants !== originalFormData?.expectedParticipants) {
      submitData.expectedParticipants = formData.expectedParticipants ? parseInt(formData.expectedParticipants, 10) : null;
    }
    if (!isEdit || formData.maxCapacity !== originalFormData?.maxCapacity) {
      submitData.maxCapacity = formData.maxCapacity ? parseInt(formData.maxCapacity, 10) : null;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in again.');
        return;
      }
      let response;
      if (isEdit) {
        if (Object.keys(submitData).length === 0) {
          setError('No changes detected.');
          return;
        }
        response = await api.put(`/api/events/${formData.id}`, submitData);
      } else {
        // For creation, ensure required fields are provided
        if (!submitData.time || !submitData.endTime) {
          setError('Start time and end time are required for new events');
          return;
        }
        response = await api.post('/api/events', submitData);
      }

      if (response.data.success) {
        setShowModal(false);
        setIsEdit(false);
        setFormData({
          id: null,
          name: '',
          date: '',
          time: '',
          endTime: '',
          location: '',
          district: '',
          description: '',
          expectedParticipants: '',
          maxCapacity: ''
        });
        setOriginalFormData(null);
        fetchEvents();
      } else {
        setError(response.data.error || 'Failed to process event');
      }
    } catch (err) {
      console.error('Submit event error:', err);
      setError(err.response?.data?.details || err.response?.data?.error || 'Something went wrong! Please try again.');
    }
  };

  const openCreateModal = () => {
    setFormData({
      id: null,
      name: '',
      date: '',
      time: '',
      endTime: '',
      location: '',
      district: '',
      description: '',
      expectedParticipants: '',
      maxCapacity: ''
    });
    setOriginalFormData(null);
    setIsEdit(false);
    setShowModal(true);
    setError(null);
  };

  const openEditModal = (event) => {
    setFormData({
      id: event.id,
      name: event.name || '',
      date: event.date || '',
      time: '', // Reset time
      endTime: '', // Reset endTime
      location: event.location || '',
      district: event.district || '',
      description: event.description || '',
      expectedParticipants: event.expectedParticipants ? event.expectedParticipants.toString() : '',
      maxCapacity: event.maxCapacity ? event.maxCapacity.toString() : ''
    });
    setOriginalFormData({
      id: event.id,
      name: event.name || '',
      date: event.date || '',
      time: event.time || '',
      endTime: event.endTime || '',
      location: event.location || '',
      district: event.district || '',
      description: event.description || '',
      expectedParticipants: event.expectedParticipants ? event.expectedParticipants.toString() : '',
      maxCapacity: event.maxCapacity ? event.maxCapacity.toString() : ''
    });
    setIsEdit(true);
    setShowModal(true);
    setError(null);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in again.');
        return;
      }
      await api.delete(`/api/events/${id}`);
      fetchEvents();
    } catch (err) {
      console.error('Delete event error:', err);
      setError(err.response?.data?.details || err.response?.data?.error || 'Failed to delete event. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredEvents = events.filter(event => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTimeStr = now.toTimeString().slice(0, 5);
    const isPast = event.date < todayStr || (event.date === todayStr && event.endTime < currentTimeStr);
    const matchesDateTime = showPastEvents ? isPast : (event.date > todayStr || (event.date === todayStr && event.endTime >= currentTimeStr));

    const matchesFilter = filter === 'all' || event.status === filter;
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.date.includes(searchTerm);
    return matchesFilter && matchesSearch && matchesDateTime;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'eod-status-pending', icon: '⏳', text: 'Pending' },
      approved: { class: 'eod-status-approved', icon: '✓', text: 'Approved' },
      rejected: { class: 'eod-status-rejected', icon: '✗', text: 'Rejected' },
      cancelled: { class: 'eod-status-cancelled', icon: '⊗', text: 'Cancelled' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`eod-status-badge ${badge.class}`}>{badge.icon} {badge.text}</span>;
  };

  if (loading) {
    return (
      <div className="eod-dashboard-container">
        <div className="eod-loading-spinner">
          <div className="eod-spinner"></div>
          <p>Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="eod-dashboard-container">
      <header className="eod-dashboard-header">
        <div className="eod-header-content">
          <div className="eod-header-left">
            <h1 className="eod-dashboard-title">
              <span className="eod-title-icon">📅</span>
              Event Organiser Dashboard
            </h1>
            <p className="eod-dashboard-subtitle">Welcome, {user?.name}! Manage your blood donation events</p>
          </div>
          <button onClick={handleLogout} className="eod-logout-btn">
            <span className="eod-logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </header>

      <div className="eod-stats-grid">
        <div className="eod-stat-card eod-total">
          <div className="eod-stat-icon">📊</div>
          <div className="eod-stat-info">
            <h3>{stats.total}</h3>
            <p>Total Events</p>
          </div>
        </div>
        <div className="eod-stat-card eod-past">
          <div className="eod-stat-icon">🕰️</div>
          <div className="eod-stat-info">
            <h3>{stats.past}</h3>
            <p>Past Events</p>
          </div>
        </div>
        <div className="eod-stat-card eod-upcoming">
          <div className="eod-stat-icon">📅</div>
          <div className="eod-stat-info">
            <h3>{stats.upcoming}</h3>
            <p>Upcoming Events</p>
          </div>
        </div>
        <div className="eod-stat-card eod-pending">
          <div className="eod-stat-icon">⏳</div>
          <div className="eod-stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending Approval</p>
          </div>
        </div>
        <div className="eod-stat-card eod-approved">
          <div className="eod-stat-icon">✓</div>
          <div className="eod-stat-info">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="eod-stat-card eod-rejected">
          <div className="eod-stat-icon">✗</div>
          <div className="eod-stat-info">
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      <div className="eod-controls-section">
        <div className="eod-search-box">
          <span className="eod-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search events by name, location, district, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="eod-filter-group">
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              className={`eod-filter-btn ${filter === status ? 'eod-active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="eod-toggle-past">
          <button
            className={`eod-toggle-btn ${showPastEvents ? 'eod-active' : ''}`}
            onClick={() => setShowPastEvents(!showPastEvents)}
          >
            {showPastEvents ? 'Show Upcoming Events' : 'Show Past Events'}
          </button>
        </div>

        {!showPastEvents && (
          <button className="eod-create-btn" onClick={openCreateModal}>
            <span className="eod-plus-icon">+</span>
            Create New Event
          </button>
        )}
      </div>

      {error && <div className="eod-error-message">{error}</div>}

      {filteredEvents.length === 0 ? (
        <div className="eod-no-events">
          <div className="eod-no-events-icon">📭</div>
          <h3>No {showPastEvents ? 'past' : 'upcoming'} events found</h3>
          <p>{showPastEvents ? 'No past events available.' : 'Create your first event to get started!'}</p>
        </div>
      ) : (
        <div className="eod-events-grid">
          {filteredEvents.map(event => (
            <div key={event.id} className="eod-event-card">
              <div className="eod-event-header">
                <h3 className="eod-event-name">{event.name}</h3>
                {getStatusBadge(event.status)}
              </div>

              <div className="eod-event-details">
                <div className="eod-detail-row">
                  <span className="eod-detail-icon">📅</span>
                  <span className="eod-detail-label">Date:</span>
                  <span className="eod-detail-value">{new Date(event.date).toLocaleDateString()}</span>
                </div>

                <div className="eod-detail-row">
                  <span className="eod-detail-icon">⏰</span>
                  <span className="eod-detail-label">Time:</span>
                  <span className="eod-detail-value">{formatTime(event.time)} - {formatTime(event.endTime)}</span>
                </div>

                <div className="eod-detail-row">
                  <span className="eod-detail-icon">📍</span>
                  <span className="eod-detail-label">Location:</span>
                  <span className="eod-detail-value">{event.location}</span>
                </div>

                <div className="eod-detail-row">
                  <span className="eod-detail-icon">🏛️</span>
                  <span className="eod-detail-label">District:</span>
                  <span className="eod-detail-value">{event.district}</span>
                </div>

                {event.description && (
                  <div className="eod-detail-row eod-description">
                    <span className="eod-detail-icon">📝</span>
                    <span className="eod-detail-label">Description:</span>
                    <p className="eod-detail-value">{event.description}</p>
                  </div>
                )}

                <div className="eod-detail-row">
                  <span className="eod-detail-icon">👥</span>
                  <span className="eod-detail-label">Expected:</span>
                  <span className="eod-detail-value">{event.expectedParticipants || 0} participants</span>
                </div>

                <div className="eod-detail-row">
                  <span className="eod-detail-icon">🎯</span>
                  <span className="eod-detail-label">Max Capacity:</span>
                  <span className="eod-detail-value">{event.maxCapacity || 100} people</span>
                </div>

                {event.rejectionReason && (
                  <div className="eod-rejection-reason">
                    <strong>Rejection Reason:</strong>
                    <p>{event.rejectionReason}</p>
                  </div>
                )}
              </div>

              {!showPastEvents && (
                <div className="eod-event-actions">
                  <button className="eod-edit-btn" onClick={() => openEditModal(event)} title="Edit Event">
                    ✏️
                  </button>
                  <button className="eod-delete-btn" onClick={() => handleDeleteEvent(event.id)} title="Delete Event">
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="eod-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="eod-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="eod-modal-header">
              <h2>{isEdit ? 'Edit Event' : 'Create New Event'}</h2>
              <button className="eod-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmitEvent} className="eod-event-form">
              <div className="eod-form-group">
                <label>Event Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Blood Donation Drive 2024"
                />
              </div>

              <div className="eod-form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  min={today}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="eod-form-row">
                <div className="eod-form-group">
                  <label>Start Time {isEdit ? '' : '*'}</label>
                  <input
                    type="time"
                    value={formData.time}
                    min={startTimeMin}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required={!isEdit}
                    pattern="([0-1][0-9]|2[0-3]):[0-5][0-9]"
                    title="Time must be in HH:MM format"
                  />
                </div>

                <div className="eod-form-group">
                  <label>End Time {isEdit ? '' : '*'}</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    min={endTimeMin}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required={!isEdit}
                    pattern="([0-1][0-9]|2[0-3]):[0-5][0-9]"
                    title="Time must be in HH:MM format"
                  />
                </div>
              </div>

              <div className="eod-form-row">
                <div className="eod-form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    placeholder="Add location"
                  />
                </div>

                <div className="eod-form-group">
                  <label>District *</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="eod-form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  placeholder="Provide details about the event..."
                />
              </div>

              <div className="eod-form-row">
                <div className="eod-form-group">
                  <label>Expected Participants</label>
                  <input
                    type="number"
                    value={formData.expectedParticipants}
                    onChange={(e) => setFormData({ ...formData, expectedParticipants: e.target.value })}
                    min="0"
                    placeholder="50"
                  />
                </div>

                <div className="eod-form-group">
                  <label>Max Capacity</label>
                  <input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                    min="1"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="eod-form-actions">
                <button type="button" className="eod-cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="eod-submit-btn">
                  {isEdit ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventOrganiserDashboard;