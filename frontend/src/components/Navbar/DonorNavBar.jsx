import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import NavBarLogo from '../../assets/Images/logoNavBar.png';
import './DonorNavBar.css';

const DonorNavBar = ({ onScrollToSection }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const checkTokenAndNavigate = (sectionId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/donor');
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.userType || payload.userType !== 'Donor') {
        navigate('/donor');
        return false;
      }
    } catch (e) {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/donor');
      return false;
    }
    return true;
  };

  const handleNavigateAndScroll = (sectionId) => {
    if (!checkTokenAndNavigate(sectionId)) return;

    if (location.pathname === '/donor') {
      onScrollToSection(sectionId);
    } else {
      sessionStorage.setItem('scrollToSection', sectionId);
      navigate('/donor');
    }
  };

  const handleProtectedNavigation = (path) => {
    if (!checkTokenAndNavigate(path)) return;
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="donor-navbar">
      <div className="logo">
        <Link
          to="/donor"
          className="logo-link"
          onClick={(e) => {
            e.preventDefault();
            handleNavigateAndScroll('hero');
          }}
        >
          <img src={NavBarLogo} alt="Donors Logo" />
        </Link>
        <span>BloodCircle</span>
      </div>

      <ul className="nav-links">
        <li>
          <a
            onClick={() => handleNavigateAndScroll('hero')}
            style={{ cursor: 'pointer' }}
          >
            Home
          </a>
        </li>
        <li className="dropdown">
          <span>Pages</span>
          <div className="dropdown-content">
            <a
              onClick={() => handleNavigateAndScroll('services')}
              style={{ cursor: 'pointer' }}
            >
              Services
            </a>
            <a
              onClick={() => handleNavigateAndScroll('events')}
              style={{ cursor: 'pointer' }}
            >
              Donation Events
            </a>
            <a
              onClick={() => handleNavigateAndScroll('blog')}
              style={{ cursor: 'pointer' }}
            >
              Blogs
            </a>
            <a
              onClick={() => handleNavigateAndScroll('testimonials')}
              style={{ cursor: 'pointer' }}
            >
              Testimonials
            </a>
          </div>
        </li>
        {/* <li>
          <Link
            to="/donor/profile"
            onClick={(e) => {
              e.preventDefault();
              handleProtectedNavigation('/donor/profile');
            }}
          >
            My Profile
          </Link>
        </li> */}
      </ul>

      <div className="navbar-buttons">
        <Link
          to="/donor/donation-events"
          onClick={(e) => {
            e.preventDefault();
            handleProtectedNavigation('/donor/donation-events');
          }}
        >
          <button className="find-events-btn">Find Donation Events</button>
        </Link>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <FiLogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default DonorNavBar;