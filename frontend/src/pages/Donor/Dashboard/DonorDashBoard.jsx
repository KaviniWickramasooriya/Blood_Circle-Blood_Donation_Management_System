import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import donation from '../../../assets/Images/blood donate.jpg';
import donorTestimonials from '../../../assets/Images/donors.jpg';
import donorTestimonials2 from '../../../assets/Images/donors2.jpg';
import Blog1 from '../../../assets/Images/blog1.jpeg';
import Blog2 from '../../../assets/Images/blog2.jpg';
import Blog3 from '../../../assets/Images/blog3.jpg';
import BloodDonation from '../../../assets/Images/blood-donation.jpg';
import BloodDonation2 from '../../../assets/Images/blood-donation2.jpg';
import Donation from '../../../assets/Images/donation.jpg';
import BloodBank from '../../../assets/Images/blood-bank.jpg'; 
import HealthCheck from '../../../assets/Images/checkhealth.jpg'; 
import DonateBlood from '../../../assets/Images/Donate-Blood.png';
import DonorNavBar from '../../../components/Navbar/DonorNavBar';
import Footer from '../../../components/Footer/DonorFooter';
import './DonorDashboard.css';

const DonorDashBoard = () => {
  const [tab, setTab] = useState('Blood Donation');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Scroll helper
  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = element.offsetTop - 80; // adjust navbar height if needed
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  }, []);

  const handleTabChange = (tabName) => {
    setTab(tabName);
  };

  // Check session storage for scroll target when navigating from other pages
  useEffect(() => {
    const sectionId = sessionStorage.getItem('scrollToSection');
    if (sectionId) {
      setTimeout(() => scrollToSection(sectionId), 300); // slight delay for mount
      sessionStorage.removeItem('scrollToSection');
    }
  }, [scrollToSection]);

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
    <div className="donor-dashboard">
      <DonorNavBar onScrollToSection={scrollToSection} />

      <header id="hero" className="hero-section">
        <h1>Donate Blood, Keep the World Beating</h1>
        <p>Every donation can save up to three lives. Join us to make a difference today.</p>
        <div className="hero-buttons">
          <button className="btn discover" onClick={() => scrollToSection('how-it-works')}>Discover More</button>
          {/* Updated to navigate to donation form */}
          <button
            className="btn donate"
            onClick={() => navigate('/donor/donation-events')}
          >
            Start Donating
          </button>
        </div>
      </header>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <h2>How It Works</h2>
        <h1>Giving Blood Made Easy, Here's How</h1>
        <p>Learn the simple steps to become a blood donor and help save lives.</p>
        <div className="steps">
          <div className="step">
            <div className="step-number">01</div>
            <h3>Register & Health Check</h3>
            <p>Complete a quick registration and health screening at a donation center.</p>
          </div>
          <div className="step">
            <div className="step-number">02</div>
            <h3>Blood Donation</h3>
            <p>Donate blood in a safe and comfortable environment, taking about 10-15 minutes.</p>
          </div>
          <div className="step">
            <div className="step-number">03</div>
            <h3>Rest & Save Lives</h3>
            <p>Rest for a short period and enjoy knowing you've saved lives.</p>
          </div>
        </div>
      </section>

      {/* Why Donate */}
      <section id="why-donate" className="why-donate">
        <h2>Why Donate?</h2>
        <h1>The Life You Save Could Be Someone You Love</h1>
        <p>Your blood donation can be a lifeline for patients in need, including family or friends.</p>
        <div className="reasons">
          <div className="reason">
            <div className="reason-icon">💉</div>
            <h3>Your Blood, Their Second Chance</h3>
            <p>Give someone a chance to recover with your donation.</p>
          </div>
          <div className="reason">
            <div className="reason-icon">❤️</div>
            <h3>Urgent Need, Every Day</h3>
            <p>Blood is needed daily for surgeries, emergencies, and treatments.</p>
          </div>
          <div className="reason">
            <div className="reason-icon">⏱️</div>
            <h3>Save Lives in Minutes</h3>
            <p>Your donation process takes only a short time but has a lasting impact.</p>
          </div>
        </div>
        <div className="join-section">
          <img src={DonateBlood} alt="Join Heroes" />
          <p>Join 50,000+ heroes and be a lifesaver for others</p>
          <button className="btn join">Join Now</button>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="events">
        <h2>Upcoming Events & Drives</h2>
        <h1>Don't Miss Out! Upcoming Blood Donation Events</h1>
        <div className="events-list">
          {loading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <p>No upcoming events available.</p>
          ) : (
            events.map((event, index) => {
              const imgSrc = index % 2 === 0 ? BloodDonation2 : BloodDonation;
              return (
                <div key={event.id} className="event">
                  <img src={imgSrc} alt={event.name} />
                  <h3>{event.name}</h3>
                  <p><span>📅</span> {new Date(event.date).toLocaleDateString()} | {formatTime(event.time)} - {formatTime(event.endTime)}</p>
                  <p><span>📍</span> {event.location}</p>
                  <p>{event.description || 'Join us for a life-saving blood donation event.'}</p>
                </div>
              );
            })
          )}
        </div>
        <div className="action-call">
          <img src={donation} alt="Take Action" />
          <p>Take action now! Your donation could save a life in a medical emergency.</p>
          <button className="btn donate" onClick={() => navigate('/donor/donation-form')}>
            Start Donating
          </button>
        </div>
      </section>

      {/* Blog */}
      <section id="blog" className="blog-updates">
        <h2>Latest Blog & Update</h2>
        <h1>Stay Connected: News, Events & Blood Drive Updates</h1>
        <p>Get the latest news and updates on blood donation drives and health tips.</p>
        <div className="blog-posts">
          <div className="blog-post">
            <img src={Blog1} alt="How Often Can You Donate Blood" />
            <h3>How Often Can You Donate Blood? A Complete Guide</h3>
          </div>
          <div className="blog-post">
            <img src={Blog2} alt="Who Can Donate Blood" />
            <h3>Who Can Donate Blood? Eligibility & Requirements Explained</h3>
          </div>
          <div className="blog-post">
            <img src={Blog3} alt="Can Donating Blood Improve Your Health" />
            <h3>Can Donating Blood Improve Your Health? Here's What Science Says</h3>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials">
        <h2>Testimonials</h2>
        <h1>Lives Changed: Testimonials from Donors & Survivors</h1>
        <p>Hear inspiring stories from those who have donated or been saved by blood donations.</p>
        <div className="testimonials-list">
          <div className="testimonial">
            <img src={donorTestimonials} alt="Edward Collin" />
            <h3>Edward Collin</h3>
            <div className="quote-box">
              <p>Regular Blood Donor</p>
              <p>"A Simple Act, A Life Saved"</p>
              <p>Donating blood was easy and knowing it saved a life feels incredible.</p>
            </div>
          </div>
          <div className="testimonial">
            <img src={donorTestimonials2} alt="Robert Smith" />
            <h3>Robert Smith</h3>
            <div className="quote-box">
              <p>Survivor</p>
              <p>"A Gift of Life When I Needed It Most"</p>
              <p>Receiving blood during my surgery gave me a second chance at life.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="what-we-do">
        <h2>Do for Communities in Need</h2>
        <h1>Impact in Action: Empowering Communities Through Service & Support</h1>
        <div className="tabs">
          <button className={`tab ${tab === 'Blood Donation' ? 'active' : ''}`} onClick={() => handleTabChange('Blood Donation')}>Blood Donation</button>
          <button className={`tab ${tab === 'Blood Bank' ? 'active' : ''}`} onClick={() => handleTabChange('Blood Bank')}>Blood Bank</button>
          <button className={`tab ${tab === 'Health Check' ? 'active' : ''}`} onClick={() => handleTabChange('Health Check')}>Health Check</button>
        </div>
        <div className="tab-content">
          {tab === 'Blood Donation' && (
            <div className="content-wrapper">
              <div className="info-container">
                <h3>Blood Donation</h3>
                <div className="info-card">
                  <h4>Schedule Appointment</h4>
                  <p>Book your donation slot online or visit a local center.</p>
                </div>
                <div className="info-card">
                  <h4>Health Screening</h4>
                  <p>Undergo a quick health check to ensure eligibility.</p>
                </div>
                <div className="info-card">
                  <h4>Donation</h4>
                  <p>Donate safely in 10-15 minutes with professional care.</p>
                </div>
              </div>
              <div className="image-container">
                <img src={Donation} alt="Blood Donation" />
              </div>
            </div>
          )}
          {tab === 'Blood Bank' && (
            <div className="content-wrapper">
              <div className="info-container">
                <h3>Blood Bank</h3>
                <div className="info-card">
                  <h4>Stock Levels</h4>
                  <p>Monitor real-time availability of blood types.</p>
                </div>
                <div className="info-card">
                  <h4>Blood Requests</h4>
                  <p>Request blood for emergencies with a simple process.</p>
                </div>
                <div className="info-card">
                  <h4>Safe Storage</h4>
                  <p>Stored with advanced technology for safety.</p>
                </div>
              </div>
              <div className="image-container">
                <img src={BloodBank} alt="Blood Bank" />
              </div>
            </div>
          )}
          {tab === 'Health Check' && (
            <div className="content-wrapper">
              <div className="info-container">
                <h3>Health Check</h3>
                <div className="info-card">
                  <h4>Pre-Donation Check</h4>
                  <p>Free screening to assess your donation readiness.</p>
                </div>
                <div className="info-card">
                  <h4>Health Tips</h4>
                  <p>Receive advice to maintain optimal health.</p>
                </div>
                <div className="info-card">
                  <h4>Post-Donation Care</h4>
                  <p>Get guidance for a smooth recovery after donating.</p>
                </div>
              </div>
              <div className="image-container">
                <img src={HealthCheck} alt="Health Check" />
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DonorDashBoard;