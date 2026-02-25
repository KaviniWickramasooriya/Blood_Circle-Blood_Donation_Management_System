import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, InputGroup, Row, Col, Spinner, Alert, Badge, Card } from 'react-bootstrap';
import SuperAdminNavBar from '../../../components/Navbar/SuperAdminNavBar';
import api from '../../../services/api';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function BloodManagement() {
  const [bloodRecords, setBloodRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [updateForm, setUpdateForm] = useState({ type: '', quantity: '' });
  const [createForm, setCreateForm] = useState({ type: '', quantity: '' });
  const [addQuantity, setAddQuantity] = useState('');
  const [noResults, setNoResults] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Fetch all blood records on component mount
  useEffect(() => {
    fetchBloodRecords();
  }, []);

  const fetchBloodRecords = async () => {
    setLoading(true);
    setNoResults(false);
    try {
      const response = await api.get('/api/blood/v1');
      setBloodRecords(response.data || []);
      if (response.data.length === 0) {
        setNoResults(true);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to fetch blood records',
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true,
      });
      setBloodRecords([]);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setCreateForm({ type: '', quantity: '' });
    setShowCreateModal(true);
  };

  const handleCreateChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async () => {
    if (!createForm.type || !createForm.quantity || Number(createForm.quantity) < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Please provide a valid blood type and quantity (must be 0 or greater)',
        confirmButtonText: 'OK',
      });
      return;
    }
    try {
      await api.post('/api/blood', createForm);
      setShowCreateModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Blood record created successfully',
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true,
      });
      fetchBloodRecords();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to create blood record',
        confirmButtonText: 'OK',
      });
    }
  };


  const handleUpdateClick = (record) => {
    setSelectedRecord(record);
    setUpdateForm({ type: record.type, quantity: record.quantity });
    setAddQuantity('');
    setShowUpdateModal(true);
  };

  const handleUpdateChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handleAddQuantityChange = (e) => {
    setAddQuantity(e.target.value);
  };

  const handleUpdateSubmit = async () => {
    try {
      await api.put(`/api/blood/${selectedRecord.id}`, updateForm);
      setShowUpdateModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Blood record updated successfully',
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true,
      });
      fetchBloodRecords();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to update blood record',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleAddQuantitySubmit = async () => {
    const quantityToAdd = Number(addQuantity);
    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Quantity must be a positive number',
        confirmButtonText: 'OK',
      });
      return;
    }
    try {
      await api.put(`/api/blood/${selectedRecord.id}/add-quantity`, { quantity: quantityToAdd });
      setShowUpdateModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Added ${quantityToAdd} units to blood type ${selectedRecord.type}`,
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true,
      });
      fetchBloodRecords();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to add blood quantity',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleDeleteClick = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      reverseButtons: true,
      focusCancel: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/api/blood/${id}`);
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Blood record has been deleted.',
            confirmButtonText: 'OK',
            timer: 3000,
            timerProgressBar: true,
          });
          fetchBloodRecords();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.error || 'Failed to delete blood record',
            confirmButtonText: 'OK',
          });
        }
      }
    });
  };

  return (
    <div className="blood-management p-4 bg-light min-vh-100" style={{ marginTop: '50px' }}>
      <SuperAdminNavBar />
      <Container fluid className="mt-4">
        <Card className="shadow-sm border-0" style={{ width: '1200px' }}>
          <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
            <h4 className="mb-0">
              <i className="bi bi-droplet-fill me-2 text-danger"></i>Blood Records
            </h4>
            <Button
              variant="primary"
              onClick={handleCreateClick}
              className="rounded-pill px-4 me-2"
            >
              <i className="bi bi-plus-circle me-1"></i> Add New
            </Button>
            <Badge bg="secondary" pill className="fs-6">
              <i className="bi bi-droplet me-1"></i> {bloodRecords.length} records found
            </Badge>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : noResults ? (
              <Alert variant="info" className="m-4 rounded-0">
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-3 fs-4"></i>
                  <div>
                    <h5 className="mb-1">No blood records found</h5>
                    <p className="mb-0">No blood records available. Please add new records.</p>
                  </div>
                </div>
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Created At</th>
                      <th>Updated At</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloodRecords.map((record) => (
                      <tr key={record.id} className="align-middle">
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2"
                              style={{ width: '36px', height: '36px' }}
                            >
                              <i className="bi bi-droplet-fill text-danger"></i>
                            </div>
                            <strong>{record.type}</strong>
                          </div>
                        </td>
                        <td>{record.quantity}</td>
                        <td>{new Date(record.createdAt).toLocaleString()}</td>
                        <td>{new Date(record.updatedAt).toLocaleString()}</td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center">
                            <Button
                              variant="warning"
                              size="sm"
                              className="me-2 rounded-pill px-3"
                              onClick={() => handleUpdateClick(record)}
                            >
                              <i className="bi bi-pencil-square me-1"></i> Update
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              className="rounded-pill px-3"
                              onClick={() => handleDeleteClick(record.id)}
                            >
                              <i className="bi bi-trash me-1"></i> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Create Modal */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg" className="border-0">
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title>
              <i className="bi bi-plus-circle me-2"></i>Create New Blood Record
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Blood Type <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-droplet-fill text-danger"></i>
                      </InputGroup.Text>
                      <Form.Select
                        name="type"
                        value={createForm.type}
                        onChange={handleCreateChange}
                        className="border-start-0 rounded-end"
                        required
                      >
                        <option value="">Select Blood Type</option>
                        {bloodTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </Form.Select>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Quantity <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-droplet"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="quantity"
                        value={createForm.quantity}
                        onChange={handleCreateChange}
                        className="border-start-0 rounded-end"
                        min="0"
                        required
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="rounded-pill px-4">
              <i className="bi bi-x-circle me-1"></i> Cancel
            </Button>
            <Button variant="success" onClick={handleCreateSubmit} className="rounded-pill px-4">
              <i className="bi bi-check-circle me-1"></i> Create Record
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Update Modal */}
        <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered size="lg" className="border-0">
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              <i className="bi bi-pencil-square me-2"></i>Update Blood Record
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Blood Type</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-droplet-fill text-danger"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="type"
                        value={updateForm.type || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Quantity</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-droplet"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="quantity"
                        value={updateForm.quantity || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                        min="0"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Add Quantity</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-plus-circle"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={addQuantity}
                        onChange={handleAddQuantityChange}
                        placeholder="Enter quantity to add"
                        className="border-start-0 rounded-end"
                        min="0"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUpdateModal(false)} className="rounded-pill px-4">
              <i className="bi bi-x-circle me-1"></i> Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateSubmit} className="rounded-pill px-4 me-2">
              <i className="bi bi-check-circle me-1"></i> Update Record
            </Button>
            <Button variant="success" onClick={handleAddQuantitySubmit} className="rounded-pill px-4">
              <i className="bi bi-plus-circle me-1"></i> Add Quantity
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
      <style jsx>{`
        .blood-management {
          transition: all 0.3s ease;
        }
        .table th {
          font-weight: 600;
          background-color: #f8f9fa;
          border-top: none;
        }
        .table td {
          vertical-align: middle;
        }
        .table tbody tr:hover {
          background-color: rgba(0, 123, 255, 0.05);
        }
        .btn {
          transition: all 0.2s ease;
        }
        .btn:hover {
          transform: translateY(-2px);
        }
        .card {
          transition: all 0.3s ease;
        }
        .card:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
        .form-control:focus,
        .form-select:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        .input-group-text {
          border-right: none;
        }
        .border-start-0 {
          border-left: none;
        }
        .border-end-0 {
          border-right: none;
        }
      `}</style>
    </div>
  );
}

export default BloodManagement;