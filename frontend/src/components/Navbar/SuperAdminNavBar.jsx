// import React, { useState, useEffect } from 'react';
// import { Navbar, Nav, Button, Container, Offcanvas } from 'react-bootstrap';
// import { FaBars, FaTimes, FaHome, FaUsers, FaCog, FaSignOutAlt, FaTachometerAlt, FaUserAlt, FaHospital, FaChartLine, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
// import NavBarLogo from '../../assets/Images/logoNavBar.png';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './SuperAdminNavBar.css';

// function SuperAdminNavBar() {
//   const [showSidebar, setShowSidebar] = useState(false);
//   const [sidebarExpanded, setSidebarExpanded] = useState(true);
//   const [activeLink, setActiveLink] = useState('dashboard');
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  
//   const toggleSidebar = () => setShowSidebar(!showSidebar);
//   const toggleSidebarSize = () => setSidebarExpanded(!sidebarExpanded);
  
//   const handleLinkClick = (link) => {
//     setActiveLink(link);
//     setShowSidebar(false);
//   };

//   // Update isMobile state when window resizes
//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 992);
//       if (window.innerWidth >= 992 && showSidebar) {
//         setShowSidebar(false);
//       }
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, [showSidebar]);

//   // Set body padding based on sidebar state
//   useEffect(() => {
//     const updateBodyPadding = () => {
//       const body = document.body;
      
//       if (window.innerWidth >= 992) {
//         if (sidebarExpanded) {
//           body.classList.add('sidebar-expanded');
//           body.classList.remove('sidebar-collapsed');
//         } else {
//           body.classList.add('sidebar-collapsed');
//           body.classList.remove('sidebar-expanded');
//         }
//       } else {
//         body.classList.remove('sidebar-expanded', 'sidebar-collapsed');
//       }
//     };

//     updateBodyPadding();
//     window.addEventListener('resize', updateBodyPadding);
    
//     return () => window.removeEventListener('resize', updateBodyPadding);
//   }, [sidebarExpanded]);

//   return (
//     <>
//       {/* Top Navigation Bar */}
//       <Navbar bg="dark" variant="dark" expand="lg" fixed="top" className='navbarSuperAdmin shadow-sm'>
//         <Container fluid>
//           {/* Logo */}
//           <Navbar.Brand href="#" className="d-flex align-items-center">
//             <img
//               src={NavBarLogo}
//               alt="Logo"
//               height="35"
//               className="d-inline-block align-top me-2"
//             />
//             <span className="brand-text">Blood Bank Admin</span>
//           </Navbar.Brand>
          
//           {/* Hamburger Icon for Sidebar - Only visible on mobile */}
//           <Button
//             variant="link"
//             className="d-lg-none text-white p-0"
//             onClick={toggleSidebar}
//             aria-controls="sidebar"
//             aria-label="Toggle sidebar"
//           >
//             {showSidebar ? <FaTimes size={24} /> : <FaBars size={24} />}
//           </Button>
          
//           {/* Center Links - Visible on desktop */}
//           <Navbar.Collapse id="navbar-nav" className="d-none d-lg-flex">
//             <Nav className="mx-auto">
//               <Nav.Link 
//                 href="#dashboard" 
//                 className={`nav-link-custom ${activeLink === 'dashboard' ? 'active' : ''}`}
//                 onClick={() => handleLinkClick('dashboard')}
//               >
//                 <FaTachometerAlt className="me-1" /> Dashboard
//               </Nav.Link>
//               <Nav.Link 
//                 href="/admin/users" 
//                 className={`nav-link-custom ${activeLink === 'admin/users' ? 'active' : ''}`}
//                 onClick={() => handleLinkClick('admin/users')}
//               >
//                 <FaUsers className="me-1" /> Users
//               </Nav.Link>
//               <Nav.Link 
//                 href="#hospitals" 
//                 className={`nav-link-custom ${activeLink === 'hospitals' ? 'active' : ''}`}
//                 onClick={() => handleLinkClick('hospitals')}
//               >
//                 <FaHospital className="me-1" /> Hospitals
//               </Nav.Link>
//               <Nav.Link 
//                 href="#reports" 
//                 className={`nav-link-custom ${activeLink === 'reports' ? 'active' : ''}`}
//                 onClick={() => handleLinkClick('reports')}
//               >
//                 <FaChartLine className="me-1" /> Reports
//               </Nav.Link>
//             </Nav>
//           </Navbar.Collapse>
          
//           {/* Logout Button */}
//           <Button variant="outline-light" className="logout-btn d-none d-lg-flex">
//             <FaSignOutAlt className="me-2" />
//             Logout
//           </Button>
//         </Container>
//       </Navbar>
      
//       {/* Fixed Sidebar for Desktop - Only visible on desktop */}
//       {!isMobile && (
//         <div className={`fixed-sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
//           <div className="sidebar-header">
//             <div className="logo-container">
//               <img src={NavBarLogo} alt="Logo" height="30" />
//               {sidebarExpanded && <span className="sidebar-title">Admin Panel</span>}
//             </div>
//             <Button 
//               variant="link" 
//               className="toggle-btn p-0"
//               onClick={toggleSidebarSize}
//               aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
//             >
//               {sidebarExpanded ? <FaAngleLeft size={18} /> : <FaAngleRight size={18} />}
//             </Button>
//           </div>
          
//           <Nav className="flex-column sidebar-nav">
//             <Nav.Link 
//               href="#dashboard" 
//               className={`sidebar-link ${activeLink === 'dashboard' ? 'active' : ''}`}
//               onClick={() => handleLinkClick('dashboard')}
//             >
//               <FaTachometerAlt className="sidebar-icon" />
//               {sidebarExpanded && <span className="sidebar-text">Dashboard</span>}
//             </Nav.Link>
            
//             <Nav.Link 
//               href="/admin/donors" 
//               className={`sidebar-link ${activeLink === 'donors' ? 'active' : ''}`}
//               onClick={() => handleLinkClick('donors')}
//             >
//               <FaUsers className="sidebar-icon" />
//               {sidebarExpanded && <span className="sidebar-text">Users</span>}
//             </Nav.Link>
            
//             <Nav.Link 
//               href="#hospitals" 
//               className={`sidebar-link ${activeLink === 'hospitals' ? 'active' : ''}`}
//               onClick={() => handleLinkClick('hospitals')}
//             >
//               <FaHospital className="sidebar-icon" />
//               {sidebarExpanded && <span className="sidebar-text">Hospitals</span>}
//             </Nav.Link>
            
//             <Nav.Link 
//               href="#reports" 
//               className={`sidebar-link ${activeLink === 'reports' ? 'active' : ''}`}
//               onClick={() => handleLinkClick('reports')}
//             >
//               <FaChartLine className="sidebar-icon" />
//               {sidebarExpanded && <span className="sidebar-text">Reports</span>}
//             </Nav.Link>
            
//             <Nav.Link 
//               href="#settings" 
//               className={`sidebar-link ${activeLink === 'settings' ? 'active' : ''}`}
//               onClick={() => handleLinkClick('settings')}
//             >
//               <FaCog className="sidebar-icon" />
//               {sidebarExpanded && <span className="sidebar-text">Settings</span>}
//             </Nav.Link>
            
//             <div className="sidebar-divider"></div>
            
//             <Nav.Link 
//               href="#logout" 
//               className="sidebar-link logout-link"
//             >
//               <FaSignOutAlt className="sidebar-icon" />
//               {sidebarExpanded && <span className="sidebar-text">Logout</span>}
//             </Nav.Link>
//           </Nav>
//         </div>
//       )}
      
//       {/* Mobile Sidebar (Offcanvas) - Only visible on mobile */}
//       {isMobile && (
//         <Offcanvas
//           show={showSidebar}
//           onHide={toggleSidebar}
//           placement="start"
//           id="sidebar"
//           className="sidebar-mobile"
//         >
//           <Offcanvas.Header closeButton className="sidebar-header">
//             <Offcanvas.Title className="sidebar-title">
//               <img src={NavBarLogo} alt="Logo" height="30" className="me-2" />
//               Admin Menu
//             </Offcanvas.Title>
//           </Offcanvas.Header>
//           <Offcanvas.Body className="sidebar-body">
//             <Nav className="flex-column">
//               <Nav.Link 
//                 href="#dashboard" 
//                 className={`sidebar-link ${activeLink === 'dashboard' ? 'active' : ''}`}
//                 onClick={() => handleLinkClick('dashboard')}
//               >
//                 <FaTachometerAlt className="sidebar-icon" />
//                 <span className="sidebar-text">Dashboard</span>
//               </Nav.Link>
              
//               <Nav.Link 
//                 href="/admin/donors" 
//                 className={`sidebar-link ${activeLink === 'donors' ? 'active' : ''}`}
//                 onClick={() => handleLinkClick('donors')}
//               >
//                 <FaUsers className="sidebar-icon" />
//                 <span className="sidebar-text">Users</span>
//               </Nav.Link>
              
//               <Nav.Link 
//                 href="#hospitals" 
//                 className={`sidebar-link ${activeLink === 'hospitals' ? 'active' : ''}`}
//                 onClick={() => handleLinkClick('hospitals')}
//               >
//                 <FaHospital className="sidebar-icon" />
//                 <span className="sidebar-text">Hospitals</span>
//               </Nav.Link>
              
//               <Nav.Link 
//                 href="#reports" 
//                 className={`sidebar-link ${activeLink === 'reports' ? 'active' : ''}`}
//                 onClick={() => handleLinkClick('reports')}
//               >
//                 <FaChartLine className="sidebar-icon" />
//                 <span className="sidebar-text">Reports</span>
//               </Nav.Link>
              
//               <Nav.Link 
//                 href="#settings" 
//                 className={`sidebar-link ${activeLink === 'settings' ? 'active' : ''}`}
//                 onClick={() => handleLinkClick('settings')}
//               >
//                 <FaCog className="sidebar-icon" />
//                 <span className="sidebar-text">Settings</span>
//               </Nav.Link>
              
//               <div className="sidebar-divider"></div>
              
//               <Nav.Link 
//                 href="#logout" 
//                 className="sidebar-link logout-link"
//               >
//                 <FaSignOutAlt className="sidebar-icon" />
//                 <span className="sidebar-text">Logout</span>
//               </Nav.Link>
//             </Nav>
//           </Offcanvas.Body>
//         </Offcanvas>
//       )}
//     </>
//   );
// }

// export default SuperAdminNavBar;


import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Button, Container, Offcanvas } from 'react-bootstrap';
import { FaBars, FaTimes, FaTachometerAlt, FaUsers, FaCog, FaSignOutAlt, FaHospital, FaChartLine, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import NavBarLogo from '../../assets/Images/logoNavBar.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SuperAdminNavBar.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function SuperAdminNavBar() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeLink, setActiveLink] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const navigate = useNavigate();

  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const toggleSidebarSize = () => setSidebarExpanded(!sidebarExpanded);

  const handleLinkClick = (link, path) => {
    setActiveLink(link);
    setShowSidebar(false);
    navigate(path);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of the admin panel.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, log out!',
      reverseButtons: true,
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
       
        localStorage.removeItem('token');
        navigate('/login');
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have been successfully logged out.',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true,
        });
      }
    });
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992 && showSidebar) {
        setShowSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showSidebar]);

  useEffect(() => {
    const updateBodyPadding = () => {
      const body = document.body;
      if (window.innerWidth >= 992) {
        if (sidebarExpanded) {
          body.classList.add('sidebar-expanded');
          body.classList.remove('sidebar-collapsed');
        } else {
          body.classList.add('sidebar-collapsed');
          body.classList.remove('sidebar-expanded');
        }
      } else {
        body.classList.remove('sidebar-expanded', 'sidebar-collapsed');
      }
    };

    updateBodyPadding();
    window.addEventListener('resize', updateBodyPadding);
    return () => window.removeEventListener('resize', updateBodyPadding);
  }, [sidebarExpanded]);

  return (
    <>
      {/* Top Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" fixed="top" className="navbarSuperAdmin shadow-sm">
        <Container fluid>
          <Navbar.Brand href="#" className="d-flex align-items-center">
            <img
              src={NavBarLogo}
              alt="Logo"
              height="35"
              className="d-inline-block align-top me-2"
            />
            <span className="brand-text">BloodCircle</span>
          </Navbar.Brand>

          <Button
            variant="link"
            className="d-lg-none text-white p-0"
            onClick={toggleSidebar}
            aria-controls="sidebar"
            aria-label="Toggle sidebar"
          >
            {showSidebar ? <FaTimes size={24} /> : <FaBars size={24} />}
          </Button>

          <Navbar.Collapse id="navbar-nav" className="d-none d-lg-flex">
            <Nav className="mx-auto">
              <Nav.Link
                className={`nav-link-custom ${activeLink === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleLinkClick('dashboard', '/admin')}
              >
                <FaTachometerAlt className="me-1" /> Dashboard
              </Nav.Link>
              <Nav.Link
                className={`nav-link-custom ${activeLink === 'users' ? 'active' : ''}`}
                onClick={() => handleLinkClick('users', '/admin/users')}
              >
                <FaUsers className="me-1" /> Users
              </Nav.Link>
              <Nav.Link
                className={`nav-link-custom ${activeLink === 'blood' ? 'active' : ''}`}
                onClick={() => handleLinkClick('blood', '/admin/blood')}
              >
                <FaHospital className="me-1" /> Blood
              </Nav.Link>
              <Nav.Link
                className={`nav-link-custom ${activeLink === 'bloodrequest' ? 'active' : ''}`}
                onClick={() => handleLinkClick('bloodrequest', '/admin/bloodrequest')}
              >
                <FaChartLine className="me-1" /> Blood Requests
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>

          <Button variant="outline-light" className="logout-btn d-none d-lg-flex" onClick={handleLogout}>
            <FaSignOutAlt className="me-2" />
            Logout
          </Button>
        </Container>
      </Navbar>

      {/* Fixed Sidebar for Desktop */}
      {!isMobile && (
        <div className={`fixed-sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
          <div className="sidebar-header">
            <div className="logo-container">
              <img src={NavBarLogo} alt="Logo" height="30" />
              {sidebarExpanded && <span className="sidebar-title">Admin Panel</span>}
            </div>
            <Button
              variant="link"
              className="toggle-btn p-0"
              onClick={toggleSidebarSize}
              aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarExpanded ? <FaAngleLeft size={18} /> : <FaAngleRight size={18} />}
            </Button>
          </div>

          <Nav className="flex-column sidebar-nav">
            <Nav.Link
              className={`sidebar-link ${activeLink === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleLinkClick('dashboard', '/admin')}
            >
              <FaTachometerAlt className="sidebar-icon" />
              {sidebarExpanded && <span className="sidebar-text">Dashboard</span>}
            </Nav.Link>
            <Nav.Link
              className={`sidebar-link ${activeLink === 'users' ? 'active' : ''}`}
              onClick={() => handleLinkClick('users', '/admin/users')}
            >
              <FaUsers className="sidebar-icon" />
              {sidebarExpanded && <span className="sidebar-text">Users</span>}
            </Nav.Link>
            <Nav.Link
              className={`sidebar-link ${activeLink === 'blood' ? 'active' : ''}`}
              onClick={() => handleLinkClick('blood', '/admin/blood')}
            >
              <FaHospital className="sidebar-icon" />
              {sidebarExpanded && <span className="sidebar-text">Blood</span>}
            </Nav.Link>
            <Nav.Link
              className={`sidebar-link ${activeLink === 'bloodrequest' ? 'active' : ''}`}
              onClick={() => handleLinkClick('bloodrequest', '/admin/bloodrequest')}
            >
              <FaChartLine className="sidebar-icon" />
              {sidebarExpanded && <span className="sidebar-text">Blood Requests</span>}
            </Nav.Link>
            <Nav.Link
              className={`sidebar-link ${activeLink === 'events' ? 'active' : ''}`}
              onClick={() => handleLinkClick('events', '/admin/events')}
            >
              <FaCog className="sidebar-icon" />
              {sidebarExpanded && <span className="sidebar-text">Events</span>}
            </Nav.Link>
            <div className="sidebar-divider"></div>
            <Nav.Link className="sidebar-link logout-link" onClick={handleLogout}>
              <FaSignOutAlt className="sidebar-icon" />
              {sidebarExpanded && <span className="sidebar-text">Logout</span>}
            </Nav.Link>
          </Nav>
        </div>
      )}

      {/* Mobile Sidebar (Offcanvas) */}
      {isMobile && (
        <Offcanvas show={showSidebar} onHide={toggleSidebar} placement="start" id="sidebar" className="sidebar-mobile">
          <Offcanvas.Header closeButton className="sidebar-header">
            <Offcanvas.Title className="sidebar-title">
              <img src={NavBarLogo} alt="Logo" height="30" className="me-2" />
              Admin Menu
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="sidebar-body">
            <Nav className="flex-column">
              <Nav.Link
                className={`sidebar-link ${activeLink === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleLinkClick('dashboard', '/admin')}
              >
                <FaTachometerAlt className="sidebar-icon" />
                <span className="sidebar-text">Dashboard</span>
              </Nav.Link>
              <Nav.Link
                className={`sidebar-link ${activeLink === 'users' ? 'active' : ''}`}
                onClick={() => handleLinkClick('users', '/admin/users')}
              >
                <FaUsers className="sidebar-icon" />
                <span className="sidebar-text">Users</span>
              </Nav.Link>
              <Nav.Link
                className={`sidebar-link ${activeLink === 'blood' ? 'active' : ''}`}
                onClick={() => handleLinkClick('blood', '/admin/blood')}
              >
                <FaHospital className="sidebar-icon" />
                <span className="sidebar-text">Blood</span>
              </Nav.Link>
              <Nav.Link
                className={`sidebar-link ${activeLink === 'bloodrequest' ? 'active' : ''}`}
                onClick={() => handleLinkClick('bloodrequest', '/admin/bloodrequest')}
              >
                <FaChartLine className="sidebar-icon" />
                <span className="sidebar-text">Blood Requests</span>
              </Nav.Link>
              <Nav.Link
                className={`sidebar-link ${activeLink === 'events' ? 'active' : ''}`}
                onClick={() => handleLinkClick('events', '/admin/events')}
              >
                <FaCog className="sidebar-icon" />
                <span className="sidebar-text">Events</span>
              </Nav.Link>
              <div className="sidebar-divider"></div>
              <Nav.Link className="sidebar-link logout-link" onClick={handleLogout}>
                <FaSignOutAlt className="sidebar-icon" />
                <span className="sidebar-text">Logout</span>
              </Nav.Link>
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>
      )}
    </>
  );
}

export default SuperAdminNavBar;