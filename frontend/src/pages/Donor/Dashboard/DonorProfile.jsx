import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api'; 
import DonorNavBar from '../../../components/Navbar/DonorNavBar';
import Footer from '../../../components/Footer/DonorFooter';
import './DonorProfile.css';

function DonorProfile() {
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      console.log('Token retrieved:', token ? 'Present' : 'Missing'); // Debug log

      if (!token) {
        setError('No authentication token found. Please log in again.');
      //   navigate('/login');
        return;
      }

      // Use api instance for the call
      const response = await api.get('/api/users/donor/profile');

      console.log('Profile response:', response.data); // Debug log

      if (response.data && response.data.data) {
        setDonor(response.data.data);
      } else {
        setError('No profile data received.');
      }
    } catch (err) {
      console.error('Error fetching profile:', err); // This is line ~39
      console.error('Full error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      }); // Enhanced logging

      setError(err.response?.data?.error || err.response?.statusText || 'Failed to fetch profile data.');
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Handle auth failures
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Session expired or insufficient permissions. Please log in again.');
      //   navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    // TODO: Implement navigation to edit profile form, e.g., navigate('/donor/edit-profile');
    console.log('Navigate to edit profile');
  };

  const handleChangePassword = () => {
    // TODO: Implement change password functionality (e.g., open modal or navigate to change-password page)
    console.log('Change password');
  };

  if (loading) {
    return (
      <div className="donor-profile">
        <DonorNavBar />
        <header className="donor-profile-header"></header>
        <section className="donor-profile-content">
          <h1>My Profile</h1>
          <div className="profile-loading">Loading profile...</div>
        </section>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="donor-profile">
        <DonorNavBar />
        <header className="donor-profile-header"></header>
        <section className="donor-profile-content">
          <h1>My Profile</h1>
          <div className="profile-error">Error: {error}</div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="donor-profile">
        <DonorNavBar />
        <header className="donor-profile-header"></header>
        <section className="donor-profile-content">
          <h1>My Profile</h1>
          <div className="profile-error">No profile data available.</div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="donor-profile">
      <DonorNavBar />
      <header className="donor-profile-header"></header>

      <section className="donor-profile-content">
        <h1>My Profile</h1>
        <div className="profile-details">
          <p><strong>Name:</strong> {donor.name}</p>
          <p><strong>Email:</strong> {donor.email}</p>
          <p><strong>Phone:</strong> {donor.telephoneNo}</p>
          <p><strong>Blood Type:</strong> {donor.bloodTypeName || donor.bloodType}</p>
          <p><strong>Date of Birth:</strong> {new Date(donor.dateOfBirth).toLocaleDateString()}</p>
          <p><strong>NIC:</strong> {donor.nic}</p>
          <p><strong>Address:</strong> {donor.address}</p>
          <p><strong>Gender:</strong> {donor.gender}</p>
          <p><strong>Member Since:</strong> {new Date(donor.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="profile-actions">
          <button className="btn edit-profile" onClick={handleEditProfile}>Edit Profile</button>
          <button className="btn change-password" onClick={handleChangePassword}>Change Password</button>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default DonorProfile;