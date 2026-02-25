import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import NavBarLogo from '../../assets/Images/logoNavBar.png';
import './HomeNavBar.css';

const HomeNavBar = () => {
  const navigate = useNavigate();

  const handleDonateClick = () => {
    navigate('/login');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <nav className="custom-nav">
      <div className="custom-nav-container">
        {/* Logo Section */}
        <div className="logo">
          <img src={NavBarLogo} alt="Donors Logo" />
          <span>BloodCircle</span>
        </div>

        {/* Links and Buttons */}
        <div className="custom-nav-links-container">
          <ul className="custom-nav-links">
            <li><a href="/#home" className="custom-link">Home</a></li>
            <li><a href="/#why-donate" className="custom-link">Why Donate</a></li>
            <li><a href="/#mission" className="custom-link">Our Mission</a></li>
            <li><a href="/events" className="custom-link">Events</a></li>
            <li><a href="/#contact" className="custom-link">Contact</a></li>
          </ul>

          {/* Login Icon Button */}
          <button className="login-icon-btn" onClick={handleLoginClick} title="Login">
            <FaUserCircle size={28} />
          </button>

          {/* Donate Now Button */}
          {/* <button className="custom-donate-btn" onClick={handleDonateClick}>
            <FaUserCircle size={28} />  Login
          </button> */}
        </div>
      </div>
    </nav>
  );
};

export default HomeNavBar;