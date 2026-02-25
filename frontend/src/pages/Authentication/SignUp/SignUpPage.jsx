import React, { useState, useEffect } from 'react';
import './SignUpPage.css';
import { FaUser, FaLock, FaAddressCard, FaPhone, FaUserMd, FaHospital } from 'react-icons/fa';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import SignUpPageImage from '../../../assets/Images/signUpPage1.png';
import CustomNavBar from '../../../components/Navbar/HomeNavBar';

function SignUpPage() {
  const [userType, setUserType] = useState('donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nic, setNic] = useState('');
  const [address, setAddress] = useState('');
  const [genderId, setGenderId] = useState('');
  const [telephoneNo, setTelephoneNo] = useState('');
  const [genders, setGenders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/users/gender/gender')
      .then(response => setGenders(response.data))
      .catch(error => {
        console.error('Error fetching genders:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load gender options. Please try again later.',
          confirmButtonText: 'OK',
        });
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match. Please try again.',
        confirmButtonText: 'OK',
      });
      return;
    }

    const payload = userType === 'donor'
      ? { name, email, password, bloodType, dateOfBirth, nic, address, genderId, telephoneNo }
      : { name, email, password, nic, address, telephoneNo }; // Added nic to Organisor payload

    try {
      const endpoint = userType === 'donor'
        ? '/api/users/donor/register'
        : '/api/users/eventOrganisor/register';
      
      const response = await api.post(endpoint, payload); // Capture response
      
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: `Welcome, ${name}! Please log in.`,
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => navigate('/login'));
    } catch (error) {
      console.error('Registration failed:', error.response?.data || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.response?.data?.error || 'An error occurred. Please try again.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <div>
      <CustomNavBar />
    <div className="signupPage_container" style={{padding:'8rem', paddingBottom:'2rem'}}>

      <div className="signupPage_card">
        <div className="signupPage_image">
          <img src={SignUpPageImage} alt="Blood Donation" />
          <div className="signupPage_imageOverlay">
            <h2 style={{ color: 'white', fontWeight: 'bold' }}>Join Our Life-Saving Community</h2>
            <p>Become a donor or partner hospital today</p>
          </div>
        </div>
        
        <div className="signupPage_form">
          <div className="signupPage_header">
            <h1>Create Account</h1>
            <p>Join our platform to save lives</p>
          </div>
          
          <div className="userType_selector">
            <button
              className={`userType_btn ${userType === 'donor' ? 'active' : ''}`}
              onClick={() => setUserType('donor')}
            >
              <FaUserMd /> <span>Donor</span>
            </button>
            <button
              className={`userType_btn ${userType === 'hospital' ? 'active' : ''}`} // 'hospital' maps to Organisor
              onClick={() => setUserType('hospital')}
            >
              <FaHospital /> <span>Organisor</span>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form_group">
              <div className="input_wrapper">
                <FaUser className="input_icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form_group">
              <div className="input_wrapper">
                <FaUser className="input_icon" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form_group">
              <div className="input_wrapper">
                <FaLock className="input_icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form_group">
              <div className="input_wrapper">
                <FaLock className="input_icon" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {userType === 'donor' && (
              <>
                <div className="form_group">
                  <div className="input_wrapper">
                    <span className="input_icon">🩸</span>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      required
                    >
                      <option value="">Select Blood Type</option>
                      <option value="1">A+</option>
                      <option value="2">A-</option>
                      <option value="3">B+</option>
                      <option value="4">B-</option>
                      <option value="5">AB+</option>
                      <option value="6">AB-</option>
                      <option value="7">O+</option>
                      <option value="8">O-</option>
                    </select>
                  </div>
                </div>
                
                <div className="form_group">
                  <div className="input_wrapper">
                    <span className="input_icon">📅</span>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="form_group">
                  <div className="input_wrapper">
                    <FaAddressCard className="input_icon" />
                    <input
                      type="text"
                      placeholder="NIC Number"
                      value={nic}
                      onChange={(e) => setNic(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="form_group">
                  <div className="input_wrapper">
                    <span className="input_icon">👤</span>
                    <select
                      value={genderId}
                      onChange={(e) => setGenderId(e.target.value)}
                      required
                    >
                      <option value="">Select Gender</option>
                      {genders.map(gender => (
                        <option key={gender.id} value={gender.id}>{gender.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
            
            {userType === 'hospital' && (
              <div className="form_group">
                <div className="input_wrapper">
                  <FaAddressCard className="input_icon" />
                  <input
                    type="text"
                    placeholder="NIC Number"
                    value={nic}
                    onChange={(e) => setNic(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="form_group">
              <div className="input_wrapper">
                <FaAddressCard className="input_icon" />
                <input
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <small className="input_hint">Please include your hometown in the address.</small>
            </div>
            
            <div className="form_group">
              <div className="input_wrapper">
                <FaPhone className="input_icon" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={telephoneNo}
                  onChange={(e) => setTelephoneNo(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="submit_btn">
              Create Account
            </button>
            
            <div className="signupPage_footer">
              <p>Already have an account? <a href="/login">Sign In</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}

export default SignUpPage;