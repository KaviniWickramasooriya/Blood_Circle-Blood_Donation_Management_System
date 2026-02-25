import React from 'react';
import './DonorFooter.css';
import { FaInstagram, FaFacebookF, FaTwitter, FaYoutube } from 'react-icons/fa';

const DonorFooter = () => {
  return (
    <footer className="footer">
      <div className="footer-section">
        <h3>Quick Links</h3>
        <ul>
          <li>About Us</li>
          <li>Events</li>
          <li>Contact Us</li>
          <li>Volunteers</li>
          <li>FAQs</li>
        </ul>
      </div>
      <div className="footer-section">
        <h3>Contact Info</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span>📞</span>
          <p style={{ margin: 0 }}>0112 765 4210</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span>📧</span>
          <p style={{ margin: 0 }}>support@bloodcircle.org</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📍</span>
          <p style={{ marginLeft: 10 }}>Colombo 06</p>
        </div>
      </div>
      <div className="footer-section">
        <h3>Newsletter</h3>
        <p>Subscribe to receive updates on donation drives and health tips.</p>
        <input type="email" placeholder="Email" />
        <button className="btn subscribe">Subscribe</button>
      </div>
      <div className="social-media">
        <a href="https://instagram.com"><FaInstagram /></a>
        <a href="https://facebook.com"><FaFacebookF /></a>
        <a href="https://twitter.com"><FaTwitter /></a>
        <a href="https://youtube.com"><FaYoutube /></a>
      </div>
      <p className="copyright">Copyright © 2025. All rights reserved.</p>
    </footer>
  );
};

export default DonorFooter;