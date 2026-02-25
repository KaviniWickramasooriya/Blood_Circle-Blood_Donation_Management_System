import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import CustomNavBar from '../../../components/Navbar/HomeNavBar';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import './EventsDashboard.css';

const EventsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatTime = (timeStr) => {
    if (!timeStr) return 'TBD';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // No token needed for public fetch
        const response = await api.get('/api/events/public?status=approved');
        if (response.data.success) {
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const currentTimeStr = now.toTimeString().slice(0, 5);

          const upcomingEvents = response.data.data.filter(event => {
            if (event.date > todayStr) return true;
            if (event.date === todayStr && event.time > currentTimeStr) return true;
            return false;
          });
          setEvents(upcomingEvents);
        } else {
          setEvents([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('API Error:', err);
        setError('Failed to fetch events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event =>
    event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    formatTime(event.time).toLowerCase().includes(searchQuery.toLowerCase()) ||
    new Date(event.date).toLocaleDateString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupEventsByDistrict = (events) => {
    const grouped = {};
    events.forEach(event => {
      const district = event.district || 'Unknown District';
      if (!grouped[district]) {
        grouped[district] = [];
      }
      grouped[district].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByDistrict(filteredEvents);

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div className="events-dashboard">
      <CustomNavBar />
      <div className="container">
        {/* Search Bar */}
        <div className="search-container">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search events by name, location, district, date, or time..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="events-header">Upcoming Approved Events by District</h1>

        {error && <p className="status-message error">{error}</p>}

        {/* Grouped Events */}
        <div className="district-sections">
          {Object.entries(groupedEvents).map(([district, districtEvents]) => (
            <section key={district} className="district-section">
              <div className="district-header">
                <FaMapMarkerAlt className="district-icon" />
                <h2 className="district-title">{district}</h2>
                <span className="event-count">{districtEvents.length} events</span>
              </div>
              <div className="events-grid">
                {districtEvents.map(event => (
                  <div key={event.id} className="event-card">
                    <div className="event-header">
                      <FaCalendarAlt className="event-icon" />
                      <h3 className="event-title">{event.name}</h3>
                    </div>
                    <div className="event-details">
                      <p className="event-detail">
                        <FaCalendarAlt className="detail-icon" />
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{new Date(event.date).toLocaleDateString()}</span>
                      </p>
                      <p className="event-detail">
                        <FaClock className="detail-icon" />
                        <span className="detail-label">Time:</span>
                        <span className="detail-value">{formatTime(event.time)} - {formatTime(event.endTime)}</span>
                      </p>
                      <p className="event-detail">
                        <FaMapMarkerAlt className="detail-icon" />
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">{event.location}</span>
                      </p>
                      {event.description && (
                        <p className="event-description">
                          <span className="detail-label">Description:</span>
                          <span className="detail-value">{event.description}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {Object.keys(groupedEvents).length === 0 && (
            <div className="no-events">
              <p className="status-message">No upcoming approved events found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsDashboard;