import React, { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import CustomNavBar from '../../../components/Navbar/HomeNavBar';
import './Login.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e, role) => {
    e.preventDefault();
    if (!role && !selectedRole) {
      await Swal.fire({
        icon: 'warning',
        title: 'Role Not Selected',
        text: 'Please select a role (Donor, Event Organiser, or Admin) to log in.',
      });
      return;
    }

    const effectiveRole = role || selectedRole;
    setLoading(true);
    try {
      let endpoint;
      switch (effectiveRole) {
        case 'Admin':
          endpoint = '/api/users/auth/admin/login';
          break;
        case 'Donor':
          endpoint = '/api/users/auth/donor/login';
          break;
        case 'EventOrganiser':
          endpoint = '/api/users/auth/organisor/login';
          break;
        default:
          throw new Error('Invalid role selected');
      }

      const response = await api.post(endpoint, { email: username, password });
      const { token, user } = response.data.data;

      if (rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({ username, role: effectiveRole }));
      } else {
        localStorage.removeItem('rememberedUser');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); // Store user data for district extraction

      await Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: `Welcome, ${user.name || username}! Role: ${user.userType}`,
        timer: 2000,
        showConfirmButton: false,
      });

      switch (user.userType) {
        case 'Admin':
          navigate('/admin');
          break;
        case 'Donor':
          navigate('/donor');
          break;
        case 'EventOrganiser':
          navigate('/event-organiser');
          break;
        default:
          throw new Error('Unknown user type');
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.error || 'Invalid credentials. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleForgotPassword = () => {
    Swal.fire({
      title: 'Forgot Password',
      text: 'Enter your email to reset your password',
      input: 'email',
      inputPlaceholder: 'Enter your email',
      showCancelButton: true,
      confirmButtonText: 'Reset',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Email Sent',
          text: 'Password reset instructions have been sent.',
          timer: 2500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div>
      <CustomNavBar />
      <div className="loginPage__container" style={{ marginTop: '8rem', marginBottom: '4rem' }}>
        {loading && (
          <div className="loginPage__loadingOverlay">
            <Spinner animation="border" variant="light" />
          </div>
        )}

        <div className="loginPage__header">
          <i className="bi bi-heart-pulse-fill"></i>
          <h1>Blood Bank System</h1>
          <p>Save lives, donate blood</p>
        </div>

        <Form onSubmit={(e) => handleLogin(e, selectedRole)} className="loginPage__form">
          <h2 className="loginPage__title">Login</h2>

          <div className="loginPage__inputBox">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
            <i className="bi bi-person-fill loginPage__icon"></i>
          </div>

          <div className="loginPage__inputBox">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <i
              className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} loginPage__icon`}
              onClick={togglePasswordVisibility}
            ></i>
          </div>

          <div className="loginPage__rememberForgot">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              Remember me
            </label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleForgotPassword();
              }}
            >
              Forgot Password?
            </a>
          </div>

          <div className="loginPage__roles">
            <Button
              className={`loginPage__roleBtn ${selectedRole === 'Donor' ? 'active' : ''}`}
              onClick={(e) => {
                setSelectedRole('Donor');
                handleLogin(e, 'Donor');
              }}
              disabled={loading}
            >
              <i className="bi bi-person-heart me-2"></i> Donor
            </Button>

            <Button
              className={`loginPage__roleBtn ${selectedRole === 'EventOrganiser' ? 'active' : ''}`}
              onClick={(e) => {
                setSelectedRole('EventOrganiser');
                handleLogin(e, 'EventOrganiser');
              }}
              disabled={loading}
            >
              <i className="bi bi-people-fill me-2"></i> Event Organiser
            </Button>

            <Button
              className={`loginPage__roleBtn ${selectedRole === 'Admin' ? 'active' : ''}`}
              onClick={(e) => {
                setSelectedRole('Admin');
                handleLogin(e, 'Admin');
              }}
              disabled={loading}
            >
              <i className="bi bi-shield-lock me-2"></i> Admin
            </Button>
          </div>

          {/* <button
            type="submit"
            className="loginPage__loginBtn"
            disabled={loading || !username || !password || !selectedRole}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button> */}

          <div className="loginPage__registerLink">
            <p>
              Don’t have an account? <a href="/signUp">Register</a>
            </p>
          </div>
        </Form>

        <div className="loginPage__footer">
          <p>© {new Date().getFullYear()} Blood Bank Management System. All rights reserved.</p>
          <div className="loginPage__footerLinks">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
            <a href="#">Help</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;