import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, InputGroup, Row, Col, Spinner, Alert, Badge, Card, Nav } from 'react-bootstrap';
import SuperAdminNavBar from '../../../components/Navbar/SuperAdminNavBar';
import api from '../../../services/api';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function BloodRequest() {
  const [bloodRequests, setBloodRequests] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    blood_id: '',
    quantity: '',
    name: '',
    contactNumber: '',
    email: '',
    status: 'pending',
  });
  const [isStatusOnly, setIsStatusOnly] = useState(false);
  const [activeKey, setActiveKey] = useState('pending');

  // Fetch blood requests and blood types on component mount
  useEffect(() => {
    fetchBloodTypes();
    fetchBloodRequests();
  }, []);

  const fetchBloodTypes = async () => {
    try {
      const response = await api.get('/api/blood/v1');
      setBloodTypes(response.data || []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to fetch blood types',
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true,
      });
      setBloodTypes([]);
    }
  };

  const fetchBloodRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/blood/blood-requests');
      setBloodRequests(response.data || []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to fetch blood requests',
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true,
      });
      setBloodRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const pendingCount = bloodRequests.filter(r => r.status === 'pending').length;
  const approvedCount = bloodRequests.filter(r => r.status === 'approved').length;
  const declinedCount = bloodRequests.filter(r => r.status === 'declined').length;

  const getFilteredRequests = () => {
    switch (activeKey) {
      case 'pending':
        return bloodRequests.filter(r => r.status === 'pending');
      case 'approved':
        return bloodRequests.filter(r => r.status === 'approved');
      case 'declined':
        return bloodRequests.filter(r => r.status === 'declined');
      default:
        return [];
    }
  };

  const filteredRequests = getFilteredRequests();
  const noResults = filteredRequests.length === 0;

  const getBloodType = (bloodId) => {
    const blood = bloodTypes.find((bt) => bt.id === bloodId);
    return blood ? blood.type : 'Unknown';
  };

  const handleUpdateClick = (request) => {
    setSelectedRequest(request);
    setUpdateForm({
      blood_id: request.blood_id,
      quantity: request.quantity,
      name: request.name,
      contactNumber: request.contactNumber,
      email: request.email,
      status: request.status,
    });
    setIsStatusOnly(false);
    setShowUpdateModal(true);
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setUpdateForm({
      blood_id: request.blood_id,
      quantity: request.quantity,
      name: request.name,
      contactNumber: request.contactNumber,
      email: request.email,
      status: 'approved',
    });
    setIsStatusOnly(true);
    setShowUpdateModal(true);
  };

  const handleDecline = (request) => {
    setSelectedRequest(request);
    setUpdateForm({
      blood_id: request.blood_id,
      quantity: request.quantity,
      name: request.name,
      contactNumber: request.contactNumber,
      email: request.email,
      status: 'declined',
    });
    setIsStatusOnly(true);
    setShowUpdateModal(true);
  };

  const handleUpdateChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async () => {
    if (!isStatusOnly) {
      // Validate contactNumber (10 digits)
      if (!/^\d{10}$/.test(updateForm.contactNumber)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Input',
          text: 'Contact number must be a 10-digit number',
          confirmButtonText: 'OK',
        });
        return;
      }
      // Validate quantity (non-negative)
      if (isNaN(updateForm.quantity) || Number(updateForm.quantity) < 0) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Input',
          text: 'Quantity must be a non-negative number',
          confirmButtonText: 'OK',
        });
        return;
      }
    }

    try {
      let url = `/api/blood/blood-requests/${selectedRequest.id}`;
      let body = updateForm;
      if (isStatusOnly) {
        url += '/status';
        body = { status: updateForm.status };
      }
      await api.put(url, body);
      setShowUpdateModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Blood request updated successfully',
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true,
      });
      fetchBloodRequests();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to update blood request',
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
          await api.delete(`/api/blood/blood-requests/${id}`);
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Blood request has been deleted.',
            confirmButtonText: 'OK',
            timer: 3000,
            timerProgressBar: true,
          });
          fetchBloodRequests();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.error || 'Failed to delete blood request',
            confirmButtonText: 'OK',
          });
        }
      }
    });
  };

  const modalTitle = isStatusOnly 
    ? `Confirm ${capitalize(updateForm.status)}` 
    : 'Update Blood Request';

  const submitButtonText = isStatusOnly 
    ? `Confirm ${capitalize(updateForm.status)}` 
    : 'Update Request';

  return (
    <div className="blood-request-management p-4 bg-light min-vh-100" style={{marginTop:'50px'}}>
      <SuperAdminNavBar />
      <Container fluid className="mt-4">
        <Card className="shadow-sm border-0" style={{ width: '1200px' }}>
          <Card.Header className="bg-white py-3 border-bottom">
            <h4 className="mb-0">
              <i className="bi bi-droplet-fill me-2 text-danger"></i>Blood Requests
            </h4>
            <Nav variant="pills" activeKey={activeKey} onSelect={setActiveKey} className="ms-auto">
              <Nav.Item>
                <Nav.Link eventKey="pending">
                  Pending <Badge bg="warning" className="ms-1">{pendingCount}</Badge>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="approved">
                  Approved <Badge bg="success" className="ms-1">{approvedCount}</Badge>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="declined">
                  Declined <Badge bg="danger" className="ms-1">{declinedCount}</Badge>
                </Nav.Link>
              </Nav.Item>
            </Nav>
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
                    <h5 className="mb-1">No {capitalize(activeKey)} blood requests found</h5>
                    <p className="mb-0">No {activeKey} blood requests available. Please add new requests.</p>
                  </div>
                </div>
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Blood Type</th>
                      <th>Quantity</th>
                      <th>Name</th>
                      <th>Contact Number</th>
                      <th>Email</th>
                      <th>Request Date</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Updated At</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="align-middle">
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2"
                              style={{ width: '36px', height: '36px' }}
                            >
                              <i className="bi bi-droplet-fill text-danger"></i>
                            </div>
                            <strong>{getBloodType(request.blood_id)}</strong>
                          </div>
                        </td>
                        <td>{request.quantity}</td>
                        <td>{request.name}</td>
                        <td>{request.contactNumber}</td>
                        <td>{request.email}</td>
                        <td>{new Date(request.request_date).toLocaleDateString()}</td>
                        <td>
                          <Badge
                            bg={
                              request.status === 'approved'
                                ? 'success'
                                : request.status === 'declined'
                                ? 'danger'
                                : 'warning'
                            }
                            pill
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </td>
                        <td>{new Date(request.createdAt).toLocaleString()}</td>
                        <td>{new Date(request.updatedAt).toLocaleString()}</td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-1">
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  className="rounded-pill px-3"
                                  onClick={() => handleUpdateClick(request)}
                                >
                                  <i className="bi bi-pencil-square me-1"></i> Update
                                </Button>
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="rounded-pill px-3"
                                  onClick={() => handleApprove(request)}
                                >
                                  <i className="bi bi-check-circle me-1"></i> Approve
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="rounded-pill px-3"
                                  onClick={() => handleDecline(request)}
                                >
                                  <i className="bi bi-x-circle me-1"></i> Decline
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="rounded-pill px-3"
                                  onClick={() => handleDeleteClick(request.id)}
                                >
                                  <i className="bi bi-trash me-1"></i> Delete
                                </Button>
                              </>
                            )}
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

        {/* Update Modal */}
        <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered size="lg" className="border-0">
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              <i className="bi bi-pencil-square me-2"></i>{modalTitle}
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
                      <Form.Select
                        name="blood_id"
                        value={updateForm.blood_id || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                        disabled={isStatusOnly}
                      >
                        <option value="">Select Blood Type</option>
                        {bloodTypes.map((bt) => (
                          <option key={bt.id} value={bt.id}>
                            {bt.type}
                          </option>
                        ))}
                      </Form.Select>
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
                        disabled={isStatusOnly}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Name</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-person"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="name"
                        value={updateForm.name || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                        disabled={isStatusOnly}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Contact Number</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-telephone"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="contactNumber"
                        value={updateForm.contactNumber || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                        placeholder="10-digit number"
                        disabled={isStatusOnly}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Email</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-envelope"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        value={updateForm.email || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                        disabled={isStatusOnly}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Status</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-flag"></i>
                      </InputGroup.Text>
                      <Form.Select
                        name="status"
                        value={updateForm.status || 'pending'}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                        disabled={isStatusOnly}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="declined">Declined</option>
                      </Form.Select>
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
            <Button variant="primary" onClick={handleUpdateSubmit} className="rounded-pill px-4">
              <i className="bi bi-check-circle me-1"></i> {submitButtonText}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
      <style jsx>{`
        .blood-request-management {
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

export default BloodRequest;