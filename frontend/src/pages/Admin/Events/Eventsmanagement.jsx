import React, { useState, useEffect } from 'react';
import SuperAdminNavBar from '../../../components/Navbar/SuperAdminNavBar';
import { Container, Table, Button, Modal, Form, InputGroup, Row, Col, Spinner, Alert, Badge, Card } from 'react-bootstrap';
import api from '../../../services/api';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Eventsmanagement() {
  const [activeTab, setActiveTab] = useState('pending');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [updateForm, setUpdateForm] = useState({});
  const [viewEvent, setViewEvent] = useState(null);
  const [approveForm, setApproveForm] = useState({ status: 'approved', rejectionReason: '' });
  const [noResults, setNoResults] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const statuses = ['pending', 'approved', 'rejected', 'cancelled'];

  useEffect(() => {
    fetchEvents();
  }, [activeTab, search, currentPage]);

  const fetchEvents = async () => {
    setLoading(true);
    setNoResults(false);
    try {
      const params = {
        status: activeTab,
        search: search || undefined,
        page: currentPage,
        limit: itemsPerPage
      };
      const response = await api.get('/api/events', { params });
      const fetchedEvents = response.data.data || [];
      setEvents(fetchedEvents);
      setTotalPages(response.data.pagination?.pages || 1);
      if (fetchedEvents.length === 0) {
        setNoResults(true);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to fetch events',
        confirmButtonText: 'OK'
      });
      setEvents([]);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewClick = async (id) => {
    try {
      const response = await api.get(`/api/events/${id}`);
      setViewEvent(response.data.data);
      setShowViewModal(true);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to fetch event details',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleUpdateClick = (event) => {
    setSelectedEvent(event);
    setUpdateForm({
      name: event.name,
      date: event.date,
      time: event.time,
      endTime: event.endTime,
      location: event.location,
      district: event.district,
      description: event.description,
      expectedParticipants: event.expectedParticipants,
      maxCapacity: event.maxCapacity
    });
    setShowUpdateModal(true);
  };

  const handleUpdateChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async () => {
    try {
      await api.put(`/api/events/${selectedEvent.id}`, updateForm);
      setShowUpdateModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Event updated successfully',
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true
      });
      fetchEvents();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to update event',
        confirmButtonText: 'OK'
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
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/api/events/${id}`);
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Event has been deleted.',
            confirmButtonText: 'OK',
            timer: 3000,
            timerProgressBar: true
          });
          fetchEvents();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.error || 'Failed to delete event',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  };

  const handleApproveClick = (event) => {
    if (event.status !== 'pending') {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Action',
        text: 'Can only approve/reject pending events',
        confirmButtonText: 'OK'
      });
      return;
    }
    setSelectedEvent(event);
    setApproveForm({ status: 'approved', rejectionReason: '' });
    setShowApproveModal(true);
  };

  const handleApproveChange = (e) => {
    setApproveForm({ ...approveForm, [e.target.name]: e.target.value });
  };

  const handleApproveSubmit = async () => {
    try {
      await api.patch(`/api/events/${selectedEvent.id}/approve`, approveForm);
      setShowApproveModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Event ${approveForm.status} successfully`,
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true
      });
      fetchEvents();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to approve/reject event',
        confirmButtonText: 'OK'
      });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      cancelled: 'secondary'
    };
    return <Badge bg={badges[status]}>{status.toUpperCase()}</Badge>;
  };

  const getStatusCount = (status) => {
    return events.filter(e => e.status === status).length;
  };

  const paginatedEvents = events.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="events-management p-4 bg-light min-vh-100" style={{ marginTop: '50px' }}>
      <SuperAdminNavBar />
      <Container fluid className="mt-4">
        <Card className="shadow-sm mb-4 border-0" style={{ width: '1200px' }}>
          <Card.Header className="bg-primary text-white py-3">
            <h4 className="mb-0">
              <i className="bi bi-funnel me-2"></i>Search Events
            </h4>
          </Card.Header>
          <Card.Body className="p-4">
            <InputGroup>
              <InputGroup.Text className="bg-light border-end-0">
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search events by name, location, description, or district..."
                value={search}
                onChange={handleSearchChange}
                className="border-start-0 rounded-end"
              />
            </InputGroup>
          </Card.Body>
        </Card>

        <div className="d-flex mb-3" style={{ overflowX: 'auto' }}>
          {statuses.map((status) => (
            <Button
              key={status}
              variant={activeTab === status ? 'primary' : 'outline-primary'}
              onClick={() => { setActiveTab(status); setCurrentPage(1); }}
              className="me-2 rounded-pill px-4"
              style={{ whiteSpace: 'nowrap' }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({getStatusCount(status)})
            </Button>
          ))}
        </div>

        <Card className="shadow-sm border-0" style={{ width: '1200px' }}>
          <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
            <h4 className="mb-0">
              <i className="bi bi-table me-2"></i>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Events
            </h4>
            <Badge bg="secondary" pill className="fs-6">
              <i className="bi bi-calendar-event me-1"></i> {events.length} events found
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
                    <h5 className="mb-1">No events found</h5>
                    <p className="mb-0">No events match your criteria. Try adjusting filters.</p>
                  </div>
                </div>
              </Alert>
            ) : (
              <>
                <div className="table-responsive">
                  <Table striped bordered hover responsive className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Date & Time</th>
                        <th>Location</th>
                        <th>District</th>
                        <th>Organizer ID</th>
                        <th>Expected Participants</th>
                        <th>Max Capacity</th>
                        <th>Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEvents.map((event) => (
                        <tr key={event.id} className="align-middle">
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '36px', height: '36px' }}>
                                <i className="bi bi-calendar-event text-primary"></i>
                              </div>
                              <strong>{event.name}</strong>
                            </div>
                          </td>
                          <td>{`${event.date} ${event.time} - ${event.endTime}`}</td>
                          <td>{event.location}</td>
                          <td>{event.district}</td>
                          <td>{event.organizerId}</td>
                          <td>{event.expectedParticipants}</td>
                          <td>{event.maxCapacity}</td>
                          <td>{getStatusBadge(event.status)}</td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-1">
                              <Button
                                variant="info"
                                size="sm"
                                className="rounded-pill px-3"
                                onClick={() => handleViewClick(event.id)}
                              >
                                <i className="bi bi-eye me-1"></i>View
                              </Button>
                              {/* <Button
                                variant="warning"
                                size="sm"
                                className="rounded-pill px-3"
                                onClick={() => handleUpdateClick(event)}
                              >
                                <i className="bi bi-pencil me-1"></i>Update
                              </Button> */}
                              {/* <Button
                                variant="danger"
                                size="sm"
                                className="rounded-pill px-3"
                                onClick={() => handleDeleteClick(event.id)}
                              >
                                <i className="bi bi-trash me-1"></i>Delete
                              </Button> */}
                              {event.status === 'pending' && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="rounded-pill px-3"
                                  onClick={() => handleApproveClick(event)}
                                >
                                  <i className="bi bi-check-circle me-1"></i>Approve
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center p-3 border-top">
                    <div className="text-muted">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, events.length)} of {events.length} entries
                    </div>
                    <div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="me-2 rounded-pill px-3"
                      >
                        <i className="bi bi-chevron-left me-1"></i>Previous
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="rounded-pill px-3"
                      >
                        Next <i className="bi bi-chevron-right ms-1"></i>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>

        {/* View Modal */}
        <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg" className="border-0">
          <Modal.Header closeButton className="bg-info text-white">
            <Modal.Title>
              <i className="bi bi-eye me-2"></i>Event Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {viewEvent ? (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Name</Form.Label>
                    <Form.Control type="text" value={viewEvent.name || ''} readOnly />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Date</Form.Label>
                    <Form.Control type="date" value={viewEvent.date || ''} readOnly />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Time</Form.Label>
                    <Form.Control type="text" value={`${viewEvent.time} - ${viewEvent.endTime}`} readOnly />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Location</Form.Label>
                    <Form.Control type="text" value={viewEvent.location || ''} readOnly />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">District</Form.Label>
                    <Form.Control type="text" value={viewEvent.district || ''} readOnly />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Organizer ID</Form.Label>
                    <Form.Control type="text" value={viewEvent.organizerId || ''} readOnly />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Expected Participants</Form.Label>
                    <Form.Control type="number" value={viewEvent.expectedParticipants || ''} readOnly />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Max Capacity</Form.Label>
                    <Form.Control type="number" value={viewEvent.maxCapacity || ''} readOnly />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Description</Form.Label>
                    <Form.Control as="textarea" value={viewEvent.description || ''} readOnly />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Status</Form.Label>
                    <Form.Control type="text" value={viewEvent.status || ''} readOnly />
                  </Form.Group>
                </Col>
                {viewEvent.rejectionReason && (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Rejection Reason</Form.Label>
                      <Form.Control as="textarea" value={viewEvent.rejectionReason || ''} readOnly />
                    </Form.Group>
                  </Col>
                )}
              </Row>
            ) : (
              <Alert variant="info">
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-3 fs-4"></i>
                  <div>
                    <h5 className="mb-1">No event data</h5>
                    <p className="mb-0">Unable to load event details.</p>
                  </div>
                </div>
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowViewModal(false)} className="rounded-pill px-4">
              <i className="bi bi-x-circle me-1"></i> Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Update Modal */}
        <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered size="lg" className="border-0">
          <Modal.Header closeButton className="bg-warning text-dark">
            <Modal.Title>
              <i className="bi bi-pencil-square me-2"></i>Update Event
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Name</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-calendar-event"></i>
                      </InputGroup.Text>
                      <Form.Control
                        name="name"
                        value={updateForm.name || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Date</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-calendar"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="date"
                        name="date"
                        value={updateForm.date || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Time</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-clock"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="time"
                        name="time"
                        value={updateForm.time || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">End Time</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-clock-history"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="time"
                        name="endTime"
                        value={updateForm.endTime || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Location</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-geo-alt"></i>
                      </InputGroup.Text>
                      <Form.Control
                        name="location"
                        value={updateForm.location || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">District</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-map"></i>
                      </InputGroup.Text>
                      <Form.Control
                        name="district"
                        value={updateForm.district || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Description</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-card-text"></i>
                      </InputGroup.Text>
                      <Form.Control
                        as="textarea"
                        name="description"
                        value={updateForm.description || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                        rows={3}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Expected Participants</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-people"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="expectedParticipants"
                        value={updateForm.expectedParticipants || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                        min="0"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Max Capacity</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-people-fill"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="maxCapacity"
                        value={updateForm.maxCapacity || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                        min="1"
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
            <Button variant="primary" onClick={handleUpdateSubmit} className="rounded-pill px-4">
              <i className="bi bi-check-circle me-1"></i> Update Event
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Approve/Reject Modal */}
        <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)} centered size="lg" className="border-0">
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title>
              <i className="bi bi-check-circle me-2"></i>Approve/Reject Event
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Status</Form.Label>
                    <Form.Select name="status" value={approveForm.status} onChange={handleApproveChange}>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                {approveForm.status === 'rejected' && (
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Rejection Reason</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0">
                          <i className="bi bi-exclamation-triangle"></i>
                        </InputGroup.Text>
                        <Form.Control
                          as="textarea"
                          name="rejectionReason"
                          value={approveForm.rejectionReason}
                          onChange={handleApproveChange}
                          placeholder="Enter reason for rejection"
                          className="border-start-0 rounded-end"
                          rows={3}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                )}
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowApproveModal(false)} className="rounded-pill px-4">
              <i className="bi bi-x-circle me-1"></i> Cancel
            </Button>
            <Button variant="success" onClick={handleApproveSubmit} className="rounded-pill px-4">
              <i className="bi bi-check-circle me-1"></i> Submit
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
      <style jsx>{`
        .events-management {
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
        .form-control:focus, .form-select:focus {
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

export default Eventsmanagement;