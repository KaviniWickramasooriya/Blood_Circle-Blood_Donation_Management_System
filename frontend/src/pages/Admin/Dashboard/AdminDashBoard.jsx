import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import SuperAdminNavBar from '../../../components/Navbar/SuperAdminNavBar';
import CounterCard from '../../../components/Card/CounterCard/CounterCard';
import api from '../../../services/api';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminDashBoard.css';

// Icons for blood types
const bloodIcons = {
  'A+': '🩸',
  'A-': '🩸',
  'B+': '🩸',
  'B-': '🩸',
  'AB+': '🩸',
  'AB-': '🩸',
  'O+': '🩸',
  'O-': '🩸',
};

function AdminDashBoard() {
  const [donorCount, setDonorCount] = useState(0);
  const [organisorCount, setOrganisorCount] = useState(0);
  const [bloodTypes, setBloodTypes] = useState([]);

  // Calculate total units
  const totalUnits = bloodTypes.reduce((sum, type) => sum + type.quantity, 0);

  // Calculate critical levels (blood count less than 100)
  const criticalLevels = bloodTypes.filter(type => type.quantity < 100).length;

  // Fetch data on component mount
  useEffect(() => {
    const fetchDonorCount = async () => {
      try {
        const response = await api.get('/api/users/donor/count');
        setDonorCount(response.data.count || 0);
      } catch (error) {
        console.error('Error fetching donor count:', error);
        setDonorCount(0);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch donor count',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true,
        });
      }
    };

    const fetchOrganisorCount = async () => {
      try {
        const response = await api.get('/api/users/eventOrganisor');
        setOrganisorCount(response.data.count || 0);
      } catch (error) {
        console.error('Error fetching organiser count:', error);
        setOrganisorCount(0);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch organiser count',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true,
        });
      }
    };

    const fetchBloodTypes = async () => {
      try {
        const response = await api.get('/api/blood/v1');
        setBloodTypes(response.data || []);
      } catch (error) {
        console.error('Error fetching blood types:', error);
        setBloodTypes([]);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch blood type data',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true,
        });
      }
    };

    fetchDonorCount();
    fetchOrganisorCount();
    fetchBloodTypes();
  }, []);

  return (
    <div className="admin-dashboard" style={{ marginTop: '50px' }}>
      <SuperAdminNavBar />

      <Container fluid className="dashboard-container">
        {/* Summary Cards */}
        <Row className="summary-row mb-4">
          <Col md={3} className="mb-3">
            <Card className="summary-card total-card">
              <Card.Body>
                <Card.Title>Total Blood Units</Card.Title>
                <Card.Text className="summary-count">{totalUnits}</Card.Text>
                {/* <div className="summary-icon">🩸</div> */}
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="summary-card critical-card">
              <Card.Body>
                <Card.Title>Critical Levels</Card.Title>
                <Card.Text className="summary-count">{criticalLevels}</Card.Text>
                <div className="summary-icon">⚠️</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="summary-card donors-card">
              <Card.Body>
                <Card.Title>Active Donors</Card.Title>
                <Card.Text className="summary-count">{donorCount}</Card.Text>
                <div className="summary-icon">👥</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="summary-card organizers-card">
              <Card.Body>
                <Card.Title>Active Organizers</Card.Title>
                <Card.Text className="summary-count">{organisorCount}</Card.Text>
                <div className="summary-icon">📋</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Blood Type Cards */}
        <Row className="blood-types-row">
          <Col>
            <h2 className="section-title">Blood Type Inventory</h2>
            <div className="blood-types-grid">
              {bloodTypes.length > 0 ? (
                bloodTypes.map((bloodType, index) => (
                  <Col key={bloodType.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                    <CounterCard
                      title={bloodType.type}
                      count={bloodType.quantity}
                      icon={bloodIcons[bloodType.type] || '🩸'}
                      isCritical={bloodType.quantity < 100}
                    />
                  </Col>
                ))
              ) : (
                <Col>
                  <p className="text-muted text-center">No blood type data available.</p>
                </Col>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default AdminDashBoard;