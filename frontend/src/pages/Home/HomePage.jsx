import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import CustomNavBar from '../../components/Navbar/HomeNavBar';
import Footer from '../../components/Footer/DonorFooter'; 
import { FaHeartbeat, FaTint, FaHandsHelping, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import heroImage from '../../assets/images/blood donate.jpg'; 
import communityDrive from '../../assets/images/Blood Donation.avif'; 
import universityDrive from '../../assets/images/blood-donation.jpg'; 
import './HomePage.css';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('donate');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleDonateClick = () => {
    navigate('/login');
  };

  const handleEventClick = () => {
    navigate('/events');
  };

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
        // No token needed for public fetch
        const response = await api.get('/api/events/public?status=approved');
        if (response.data.success) {
          // Improved filter for past dates and times
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const currentTimeStr = now.toTimeString().slice(0, 5);
          const upcomingEvents = response.data.data.filter(event => {
            if (event.date > todayStr) return true;
            if (event.date === todayStr && event.time > currentTimeStr) return true;
            return false;
          }).slice(0, 2); // Limit to 2 events
          setEvents(upcomingEvents);
        } else {
          setEvents([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="homepage-container">
      <CustomNavBar />

      <header id="home" className="hero-section-custom" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero-overlay-layer">
          <div className="hero-content-box">
            <h1>Donate Blood, Save Lives Every Day</h1>
            <p>Join thousands of heroes by giving the gift of life today.</p>
            <div className="hero-button-group">
              <button
                className={`custom-btn custom-btn-primary ${activeTab === 'donate' ? 'active' : ''}`}
                onClick={handleDonateClick}
              >
                Donate Blood
              </button>
              <button
                className={`custom-btn custom-btn-secondary ${activeTab === 'request' ? 'active' : ''}`}
                onClick={() => navigate('/request-blood')}
              >
                Request Blood
              </button>
            </div>
          </div>
        </div>
      </header>

      <section id="why-donate" className="why-donate-section">
        <h2 className="why-donate-title">Why Choose to Donate?</h2>
        <div className="why-donate-card-container">
          <div className="why-donate-card">
            <FaHeartbeat className="why-donate-icon" />
            <h3>Save Lives</h3>
            <p>Your donation supports surgeries, emergencies, and patients in need.</p>
          </div>
          <div className="why-donate-card">
            <FaTint className="why-donate-icon" />
            <h3>Health Benefits</h3>
            <p>Regular donation improves heart health and reduces stress levels.</p>
          </div>
          <div className="why-donate-card">
            <FaHandsHelping className="why-donate-icon" />
            <h3>Community Impact</h3>
            <p>Help build a stronger, healthier community through your generosity.</p>
          </div>
        </div>
      </section>

      <section id="mission" className="our-mission-section">
        <h2>Our Commitment</h2>
        <p>
          LifeStream is dedicated to maintaining a safe, reliable blood supply.
          Our technology connects donors with recipients quickly and securely.
          Together, we can save lives and strengthen communities.
        </p>
      </section>

      <section id="events" className="events-section">
        <h2 className="events-title">Upcoming Blood Drives</h2>
        <div className="event-card-wrapper">
          {loading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <p>No upcoming events available.</p>
          ) : (
            events.map((event, index) => {
              const imgSrc = index % 2 === 0 ? communityDrive : universityDrive;
              return (
                <article key={event.id} className="single-event-card">
                  <img src={imgSrc} alt={event.name} />
                  <h3>{event.name}</h3>
                  <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {formatTime(event.time)} - {formatTime(event.endTime)}</p>
                  <p><strong>Location:</strong> {event.location}, {event.district}</p>
                  <p>{event.description || 'Join us for a life-saving blood donation event.'}</p>
                </article>
              );
            })
          )}
        </div>

        {/* Create Event Button */}
        <div className="create-event-btn-container">
          <button className="custom-btn custom-btn-primary" onClick={handleEventClick} style={{ marginTop: '30px' }}>
            Discover More
          </button>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <h2 className="contact-title">Get in Touch</h2>
        <div className="contact-info-container">
          <div className="contact-box">
            <FaPhoneAlt className="contact-icon" />
            <h3>Call Us</h3>
            <p>0112 765 4210</p>
          </div>
          <div className="contact-box">
            <FaEnvelope className="contact-icon" />
            <h3>Email</h3>
            <p>support@bloodcircle.org</p>
          </div>
          <div className="contact-box">
            <FaMapMarkerAlt className="contact-icon" />
            <h3>Visit Us</h3>
            <p>Colombo 06, Sri Lanka</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;