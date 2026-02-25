import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

// Home Routes
import HomePage from '../pages/Home/HomePage';
import SignUpPage from '../pages/Authentication/SignUp/SignUpPage';
import Login from '../pages/Authentication/Login/Login';
import NotFound from '../pages/NotFound/NotFound';
import EventsDashboard from '../pages/Events/Dashboard/EventsDashboard';


// Admin Routes
import AdminDashBoard from '../pages/Admin/Dashboard/AdminDashBoard';
import DonorManagement from '../pages/Admin/DonorManagement/DonorManagement';
import UserManagement from '../pages/Admin/UserManagement/UserManagement';
import BloodManagement from '../pages/Admin/Blood/BloodManagement';
import BloodRequest from '../pages/Admin/BloodRequest/BloodRequest';
import Eventsmanagement from '../pages/Admin/Events/Eventsmanagement';


// Donor Routes
import DonorDashBoard from '../pages/Donor/Dashboard/DonorDashBoard';
import DonationEvents from '../pages/Donor/Dashboard/DonationEvents';
import DonorProfile from '../pages/Donor/Dashboard/DonorProfile';
//import DonationForm from '../pages/Donor/Dashboard/DonationForm';
//import DonorDonations from '../pages/Donor/Dashboard/DonorDonations';


// Request Blood Routes
import RequestBloodPage from '../pages/BloodRequest/BloodrequestDashboard';


// Event-Organizer Routes
import EventOrganiserDashboard from '../pages/EventOrganiser/EventOrganiserDashboard';
//import EventForm from '../pages/Events/Dashboard/EventForm';



// Protected Route Component
const ProtectedRoute = ({ element, allowedRoles }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Access Denied',
        text: 'Please log in to access this page.',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'animated fadeIn',
          title: 'text-danger',
          confirmButton: 'btn btn-danger',
        },
      }).then(() => {
        navigate('/login', { state: { from: window.location.pathname } });
      });
      setIsLoading(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userType = payload.userType;
      if (allowedRoles.includes(userType)) {
        setIsAuthorized(true);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Access Denied',
          text: 'You do not have permission to access this page.',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'animated fadeIn',
            title: 'text-danger',
            confirmButton: 'btn btn-danger',
          },
        }).then(() => {
          navigate('/');
        });
      }
    } catch (e) {
      localStorage.clear();
      sessionStorage.clear();
      Swal.fire({
        icon: 'error',
        title: 'Invalid Token',
        text: 'Please log in again.',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'animated fadeIn',
          title: 'text-danger',
          confirmButton: 'btn btn-danger',
        },
      }).then(() => {
        navigate('/login', { state: { error: 'Invalid token. Please log in again.' } });
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, allowedRoles]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return element;
};

// Main Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="*" element={<NotFound />} />
      <Route path='/' element={<HomePage />} />      
      <Route path="/login" element={<Login />} />
      <Route path="/signUp" element={<SignUpPage />} />

      {/* Admin Protected Routes */}
      <Route path='/admin' element={<ProtectedRoute element={<AdminDashBoard />} allowedRoles={['Admin']} />} />
      <Route path='/admin/donors' element={<ProtectedRoute element={<DonorManagement />} allowedRoles={['Admin']} />} />
      <Route path='/admin/users' element={<ProtectedRoute element={<UserManagement />} allowedRoles={['Admin']} />} />
      <Route path='/admin/blood' element={<ProtectedRoute element={<BloodManagement />} allowedRoles={['Admin']} />} />
      <Route path='/admin/bloodrequest' element={<ProtectedRoute element={<BloodRequest />} allowedRoles={['Admin']} />} />
      <Route path='/admin/events' element={<ProtectedRoute element={<Eventsmanagement />} allowedRoles={['Admin']} />} />

      {/* Donor Protected Routes */}
      <Route path='/donor' element={<ProtectedRoute element={<DonorDashBoard />} allowedRoles={['Donor']} />} />
      <Route path='/donor/donation-events' element={<ProtectedRoute element={<DonationEvents />} allowedRoles={['Donor']} />} />
      <Route path='/donor/profile' element={<ProtectedRoute element={<DonorProfile />} allowedRoles={['Donor']} />} />
      {/* <Route path='/donor/donations' element={<ProtectedRoute element={<DonorDonations />} allowedRoles={['Donor']} />} />
      <Route path='/donor/donation-form' element={<ProtectedRoute element={<DonationForm />} allowedRoles={['Donor']} />} /> */}

       
      {/* Blood Request Routes */}
      <Route path='/request-blood' element={<RequestBloodPage />} />

      {/* Event Routes */}
      <Route path="/event-organiser" element={<ProtectedRoute element={<EventOrganiserDashboard />} allowedRoles={['EventOrganiser']} />} />
      <Route path='/events' element={<EventsDashboard />} />

      {/* Catch-all Route - Must be last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;