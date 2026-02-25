import React, { useState } from 'react';
import SuperAdminNavBar from '../../../components/Navbar/SuperAdminNavBar';
import { Button, Form, Card, Row, Col, InputGroup, Spinner, Alert, Modal, Pagination, Badge, Table } from 'react-bootstrap';
import api from '../../../services/api';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function DonorManagement() {
  const [activeTab, setActiveTab] = useState('Donors');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    bloodType: '',
    nic: '',
    gender: ''
  });
  const [donors, setDonors] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [updateForm, setUpdateForm] = useState({});
  const [viewDonor, setViewDonor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const itemsPerPage = 10;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowTable(false);
    setDonors([]);
    setFilters({ name: '', email: '', bloodType: '', nic: '', gender: '' });
    setNoResults(false);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleClearFilters = () => {
    setFilters({ name: '', email: '', bloodType: '', nic: '', gender: '' });
    setShowTable(false);
    setDonors([]);
    setNoResults(false);
    setCurrentPage(1);
  };

  const handleSearch = async () => {
    setLoading(true);
    setNoResults(false);

    try {
      // Fetch all donors without any query parameters
      const response = await api.get('/api/users/donor');
      const allDonors = response.data.data || [];

      // Check if any filters are applied
      const isEmptyFilters = Object.values(filters).every(value => value === '');

      // If no filters are applied, use all donors
      let filteredDonors = allDonors;
      
      // If filters are applied, filter the data locally
      if (!isEmptyFilters) {
        filteredDonors = allDonors.filter(donor => {
          const nameMatch = filters.name
            ? donor.name.toLowerCase().includes(filters.name.toLowerCase())
            : true;
          const emailMatch = filters.email
            ? donor.email.toLowerCase().includes(filters.email.toLowerCase())
            : true;
          const bloodTypeMatch = filters.bloodType
            ? donor.bloodType.toLowerCase().includes(filters.bloodType.toLowerCase())
            : true;
          const nicMatch = filters.nic
            ? donor.nic.toLowerCase().includes(filters.nic.toLowerCase())
            : true;
          const genderMatch = filters.gender
            ? donor.genderId.toString() === filters.gender
            : true;

          return nameMatch && emailMatch && bloodTypeMatch && nicMatch && genderMatch;
        });
      }

      setDonors(filteredDonors);
      setShowTable(true);
      setTotalPages(Math.ceil(filteredDonors.length / itemsPerPage));
      setCurrentPage(1);
      if (filteredDonors.length === 0) {
        setNoResults(true);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to fetch donors',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = async (id) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/users/donor/${id}`);
      setViewDonor(response.data.data || null);
      setShowViewModal(true);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to fetch donor details',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (donor) => {
    setSelectedDonor(donor);
    setUpdateForm({
      name: donor.name,
      email: donor.email,
      bloodType: donor.bloodType,
      nic: donor.nic,
      address: donor.address,
      genderId: donor.genderId,
      telephoneNo: donor.telephoneNo,
      dateOfBirth: donor.dateOfBirth
    });
    setShowUpdateModal(true);
  };

  const handleUpdateChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async () => {
    try {
      await api.put(`/api/users/donor/${selectedDonor.id}`, updateForm);
      setShowUpdateModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Donor updated successfully',
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true
      });
      handleSearch();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to update donor',
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
      reverseButtons: true,
      focusCancel: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/api/users/donor/${id}`);
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Donor has been deleted.',
            confirmButtonText: 'OK',
            timer: 3000,
            timerProgressBar: true
          });
          handleSearch();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.error || 'Failed to delete donor',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedDonors = donors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getGenderName = (genderId) => {
    switch (genderId) {
      case 1: return 'Male';
      case 2: return 'Female';
      case 3: return 'Other';
      default: return 'Not specified';
    }
  };

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      'A+': 'primary',
      'A-': 'secondary',
      'B+': 'success',
      'B-': 'danger',
      'AB+': 'warning',
      'AB-': 'info',
      'O+': 'dark',
      'O-': 'light text-dark'
    };
    return colors[bloodType] || 'primary';
  };

  const getGenderIcon = (genderId) => {
    switch (genderId) {
      case 1: return 'bi bi-gender-male';
      case 2: return 'bi bi-gender-female';
      case 3: return 'bi bi-gender-ambiguous';
      default: return 'bi bi-person';
    }
  };

  return (
    <div className="userManage-dashboard p-4 bg-light min-vh-100" style={{ marginTop: '150px' }}>
      <SuperAdminNavBar />
      <div className="container-fluid mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-primary">
            <i className="bi bi-heart-pulse-fill me-2"></i>Donor Management
          </h2>
          <div className="d-flex">
            <Button
              variant={activeTab === 'Donors' ? 'primary' : 'outline-primary'}
              onClick={() => handleTabChange('Donors')}
              className="me-2 rounded-pill px-4"
            >
              <i className="bi bi-person-heart me-1"></i> Donors
            </Button>
            <Button
              variant={activeTab === 'Organizers' ? 'primary' : 'outline-primary'}
              onClick={() => handleTabChange('Organizers')}
              className="rounded-pill px-4"
            >
              <i className="bi bi-people-fill me-1"></i> Organizers
            </Button>
          </div>
        </div>

        {activeTab === 'Donors' && (
          <>
            {/* Filter Card */}
            <Card className="shadow-sm mb-4 border-0" style={{ width: '1200px' }}>
              <Card.Header className="bg-primary text-white py-3">
                <h4 className="mb-0">
                  <i className="bi bi-funnel me-2"></i>Donor Search Filters
                </h4>
              </Card.Header>
              <Card.Body className="p-4">
                <Form>
                  <Row>
                    <Col md={4} sm={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="fw-bold">Name</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-end-0">
                            <i className="bi bi-person-fill"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="name"
                            value={filters.name}
                            onChange={handleFilterChange}
                            placeholder="Enter name"
                            className="border-start-0 rounded-end"
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={4} sm={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="fw-bold">Email</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-end-0">
                            <i className="bi bi-envelope-fill"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="email"
                            name="email"
                            value={filters.email}
                            onChange={handleFilterChange}
                            placeholder="Enter email"
                            className="border-start-0 rounded-end"
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={4} sm={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="fw-bold">Blood Type</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-end-0">
                            <i className="bi bi-droplet-fill text-danger"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="bloodType"
                            value={filters.bloodType}
                            onChange={handleFilterChange}
                            placeholder="Enter blood type"
                            className="border-start-0 rounded-end"
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={4} sm={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="fw-bold">NIC</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-end-0">
                            <i className="bi bi-card-text"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="nic"
                            value={filters.nic}
                            onChange={handleFilterChange}
                            placeholder="Enter NIC"
                            className="border-start-0 rounded-end"
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={4} sm={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="fw-bold">Gender</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-end-0">
                            <i className="bi bi-gender-ambiguous"></i>
                          </InputGroup.Text>
                          <Form.Select
                            name="gender"
                            value={filters.gender}
                            onChange={handleFilterChange}
                            className="border-start-0 rounded-end"
                          >
                            <option value="">Select Gender</option>
                            <option value="1">Male</option>
                            <option value="2">Female</option>
                            <option value="3">Other</option>
                          </Form.Select>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={2} sm={6} className="mb-3 d-flex align-items-end">
                      <Button
                        variant="primary"
                        onClick={handleSearch}
                        className="w-100 rounded-pill"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            <span className="ms-2">Searching...</span>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-search me-1"></i> Search
                          </>
                        )}
                      </Button>
                    </Col>
                    <Col md={2} sm={6} className="mb-3 d-flex align-items-end">
                      <Button
                        variant="outline-secondary"
                        onClick={handleClearFilters}
                        className="w-100 rounded-pill"
                      >
                        <i className="bi bi-x-circle me-1"></i> Clear
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            {/* Results Card */}
            {showTable && (
              <Card className="shadow-sm border-0" style={{ width: '1200px' }}>
                <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                  <h4 className="mb-0">
                    <i className="bi bi-table me-2"></i>Donor Results
                  </h4>
                  <Badge bg="secondary" pill className="fs-6">
                    <i className="bi bi-people-fill me-1"></i> {donors.length} donors found
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
                          <h5 className="mb-1">No donors found</h5>
                          <p className="mb-0">No donors match your search criteria. Please try different filters.</p>
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
                              <th>Email</th>
                              <th>Blood Type</th>
                              <th>NIC</th>
                              <th>Gender</th>
                              <th>Telephone</th>
                              <th className="text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedDonors.map((donor, index) => (
                              <tr key={donor.id} className="align-middle">
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2" 
                                         style={{ width: '36px', height: '36px' }}>
                                      <i className="bi bi-person-fill text-primary"></i>
                                    </div>
                                    <strong>{donor.name}</strong>
                                  </div>
                                </td>
                                <td>{donor.email}</td>
                                <td>
                                  <Badge bg={getBloodTypeColor(donor.bloodTypeName)} pill className="fs-6">
                                    <i className="bi bi-droplet-fill me-1"></i> {donor.bloodTypeName}
                                  </Badge>
                                </td>
                                <td>{donor.nic}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <i className={`${getGenderIcon(donor.genderId)} me-2 text-primary`}></i>
                                    {getGenderName(donor.genderId)}
                                  </div>
                                </td>
                                <td>{donor.telephoneNo}</td>
                                <td className="text-center">
                                  <div className="d-flex justify-content-center">
                                    <Button
                                      variant="info"
                                      size="sm"
                                      className="me-2 rounded-pill px-3"
                                      onClick={() => handleViewClick(donor.id)}
                                    >
                                      <i className="bi bi-eye me-1"></i> View
                                    </Button>
                                    <Button
                                      variant="warning"
                                      size="sm"
                                      className="me-2 rounded-pill px-3"
                                      onClick={() => handleUpdateClick(donor)}
                                    >
                                      <i className="bi bi-pencil-square me-1"></i> Update
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      className="rounded-pill px-3"
                                      onClick={() => handleDeleteClick(donor.id)}
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
                      {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center p-3 border-top">
                          <div className="text-muted">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, donors.length)} of {donors.length} entries
                          </div>
                          <Pagination>
                            <Pagination.Prev
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              <i className="bi bi-chevron-left"></i>
                            </Pagination.Prev>
                            {[...Array(totalPages).keys()].map((page) => (
                              <Pagination.Item
                                key={page + 1}
                                active={page + 1 === currentPage}
                                onClick={() => handlePageChange(page + 1)}
                              >
                                {page + 1}
                              </Pagination.Item>
                            ))}
                            <Pagination.Next
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              <i className="bi bi-chevron-right"></i>
                            </Pagination.Next>
                          </Pagination>
                        </div>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            )}
          </>
        )}

        {activeTab === 'Organizers' && (
          <Card className="shadow-sm border-0" style={{ width: '1200px' }}>
            <Card.Header className="bg-white py-3">
              <h4 className="mb-0">
                <i className="bi bi-people-fill me-2"></i>Organizer Management
              </h4>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-5">
                <i className="bi bi-people-fill text-muted" style={{ fontSize: '4rem' }}></i>
                <h5 className="mt-3 text-muted">Organizer Management</h5>
                <p className="text-muted">Organizer management functionality to be implemented.</p>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Update Modal */}
        <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered size="lg" className="border-0">
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              <i className="bi bi-pencil-square me-2"></i>Update Donor Information
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
                        <i className="bi bi-person-fill"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
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
                    <Form.Label className="fw-bold">Email</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-envelope-fill"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        value={updateForm.email || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Blood Type</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-droplet-fill text-danger"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="bloodType"
                        value={updateForm.bloodType || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">NIC</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-card-text"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="nic"
                        value={updateForm.nic || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Gender</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-gender-ambiguous"></i>
                      </InputGroup.Text>
                      <Form.Select
                        name="genderId"
                        value={updateForm.genderId || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                      >
                        <option value="">Select Gender</option>
                        <option value="1">Male</option>
                        <option value="2">Female</option>
                        <option value="3">Other</option>
                      </Form.Select>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Telephone</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-telephone"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="telephoneNo"
                        value={updateForm.telephoneNo || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Address</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-geo-alt"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="address"
                        value={updateForm.address || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Date of Birth</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-calendar-event"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="date"
                        name="dateOfBirth"
                        value={updateForm.dateOfBirth || ''}
                        onChange={handleUpdateChange}
                        className="border-start-0 rounded-end"
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
              <i className="bi bi-check-circle me-1"></i> Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* View Modal */}
        <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg" className="border-0">
          <Modal.Header closeButton className="bg-info text-white">
            <Modal.Title>
              <i className="bi bi-eye me-2"></i>Donor Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {viewDonor ? (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Name</Form.Label>
                    <InputGroup>
                      {/* <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-person-fill"></i>
                      </InputGroup.Text> */}
                      <Form.Control
                        type="text"
                        value={viewDonor.name || ''}
                        readOnly
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Email</Form.Label>
                    <InputGroup>
                      {/* <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-envelope-fill"></i>
                      </InputGroup.Text> */}
                      <Form.Control
                        type="email"
                        value={viewDonor.email || ''}
                        readOnly
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                {/* <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Blood Type</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-droplet-fill text-danger"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        value={viewDonor.bloodTypeName || ''}
                        readOnly
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col> */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">NIC</Form.Label>
                    <InputGroup>
                      {/* <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-card-text"></i>
                      </InputGroup.Text> */}
                      <Form.Control
                        type="text"
                        value={viewDonor.nic || ''}
                        readOnly
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Gender</Form.Label>
                    <InputGroup>
                      {/* <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-gender-ambiguous"></i>
                      </InputGroup.Text> */}
                      <Form.Control
                        type="text"
                        value={getGenderName(viewDonor.genderId) || ''}
                        readOnly
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Telephone</Form.Label>
                    <InputGroup>
                      {/* <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-telephone"></i>
                      </InputGroup.Text> */}
                      <Form.Control
                        type="text"
                        value={viewDonor.telephoneNo || ''}
                        readOnly
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Address</Form.Label>
                    <InputGroup>
                      {/* <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-geo-alt"></i>
                      </InputGroup.Text> */}
                      <Form.Control
                        type="text"
                        value={viewDonor.address || ''}
                        readOnly
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Date of Birth</Form.Label>
                    <InputGroup>
                      {/* <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-calendar-event"></i>
                      </InputGroup.Text> */}
                      <Form.Control
                        type="date"
                        value={viewDonor.dateOfBirth || ''}
                        readOnly
                        className="border-start-0 rounded-end"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            ) : (
              <Alert variant="info">
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-3 fs-4"></i>
                  <div>
                    <h5 className="mb-1">No donor data</h5>
                    <p className="mb-0">Unable to load donor details.</p>
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
      </div>
      <style jsx>{`
        .userManage-dashboard {
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
        .pagination .page-link {
          border-radius: 5px;
          margin: 0 2px;
          color: #0d6efd;
        }
        .pagination .page-item.active .page-link {
          background-color: #0d6efd;
          border-color: #0d6efd;
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

export default DonorManagement;