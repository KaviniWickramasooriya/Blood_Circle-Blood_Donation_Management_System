import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBarLogo from '../../assets/Images/logoNavBar.png';
import './HospitalNavbar.css';

const HospitalNavbar = () => {
  

    return (
     <nav className="Hospital-navbar">
       <div className="logo">
        <Link to="/hospital" className="logo-link">
          <img src={NavBarLogo} alt="Logo" />
        </Link>
        </div>
        <div className="nav-right">

        <ul className="nav-links">
          <li>
          <Link to="/">Home</Link>
          </li>
          <li>
          <Link to="/hospital">Contact</Link>
          </li>
          <div className="navbar-buttons">
          <Link to="/">
            <button className="logout-btn">
              LogOut
              </button>
          </Link>

        </div>
        </ul>
       
        </div>

     </nav>
    );
  };
  
  export default HospitalNavbar;
  