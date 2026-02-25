import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import DonorNavBar from '../../../components/Navbar/DonorNavBar';
import Footer from '../../../components/Footer/DonorFooter';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import './DonationEvents.css';

function DonationEvents() {
  const [events, setEvents] = useState([]);
  const [donor, setDonor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Format time in AM/PM
  const formatTime = (timeStr) => {
    if (!timeStr) return 'TBD';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  // Fetch upcoming approved events (public, no token required but using api for consistency)
  const fetchEvents = async () => {
    try {
      setError(null);

      // Using api for consistency (token added if present, but endpoint is public)
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
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  // Fetch donor profile using token
  const fetchDonorProfile = async () => {
    try {
      const response = await api.get('/api/users/donor/profile');
      if (response.data.success) {
        setDonor(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch donor profile:', err);
      // Optionally redirect to login if unauthorized
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchDonorProfile();
  }, [navigate]);

  // Global search across event fields
  const filteredEvents = events.filter(event =>
    event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    formatTime(event.time).toLowerCase().includes(searchQuery.toLowerCase()) ||
    new Date(event.date).toLocaleDateString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered events by district
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

  // Check if event district matches donor's district (extracted from address)
  const isEventHighlighted = (event) => {
    if (!donor || !event.district || !donor.address) return false;
    // Extract district from donor address (assuming format like "street, city, district")
    const donorDistrict = donor.address.split(',').pop()?.trim().toLowerCase() || '';
    return event.district.toLowerCase() === donorDistrict;
  };

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div className="donation-events">
      <DonorNavBar />
      <header className="donation-events-header">
        <h1>Upcoming Approved Donation Events by District</h1>     
      </header>

      <section className="donation-events-content">
        {/* Global Search Bar */}
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

        {error && <p className="status-message error">{error}</p>}

        {/* District Sections */}
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
                  <div key={event._id} className={`event-card ${isEventHighlighted(event) ? 'highlighted' : ''}`}>
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
                        <span className="detail-value">
                          {formatTime(event.time)} - {formatTime(event.endTime)}
                        </span>
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

          {/* No Events Found */}
          {Object.keys(groupedEvents).length === 0 && (
            <div className="no-events">
              <p className="status-message">No upcoming approved events found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default DonationEvents;