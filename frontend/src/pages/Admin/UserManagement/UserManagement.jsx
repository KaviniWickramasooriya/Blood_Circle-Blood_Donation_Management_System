import React, { useState, useEffect } from 'react';
import SuperAdminNavBar from '../../../components/Navbar/SuperAdminNavBar';
import { Button, Form, Card, Row, Col, InputGroup, Spinner, Alert, Modal, Pagination, Badge, Table } from 'react-bootstrap';
import api from '../../../services/api';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function UserManagement() {
  const [activeTab, setActiveTab] = useState('Donors');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    bloodType: '',
    nic: '',
    gender: ''
  });
  const [donors, setDonors] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updateForm, setUpdateForm] = useState({});
  const [viewUser, setViewUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [bloodTypes, setBloodTypes] = useState([]);
  const itemsPerPage = 10;

  // Fetch blood types on component mount
  useEffect(() => {
    const fetchBloodTypes = async () => {
      try {
        const response = await api.get('/api/blood/v1');
        setBloodTypes(response.data || []);
      } catch (error) {
        console.error('Failed to fetch blood types:', error);
      }
    };
    if (activeTab === 'Donors') {
      fetchBloodTypes();
    }
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowTable(false);
    setDonors([]);
    setOrganizers([]);
    setFilters({ name: '', email: '', bloodType: '', nic: '', gender: '' });
    setNoResults(false);
    setCurrentPage(1);
  };

  // Get Blood Type by ID
  const getBloodTypeByID = async (id) => {
    const response = await api.get(`/api/blood/v1/${id}`);
    return response.data.type;
  };

  const getAllBloodTypes = async () => {
    const response = await api.get('/api/blood/v1');
    return response.data;
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleClearFilters = () => {
    setFilters({ name: '', email: '', bloodType: '', nic: '', gender: '' });
    setShowTable(false);
    setDonors([]);
    setOrganizers([]);
    setNoResults(false);
    setCurrentPage(1);
  };

  const handleSearch = async () => {
    setLoading(true);
    setNoResults(false);

    try {
      let response;
      let filteredData = [];

      if (activeTab === 'Donors') {
        response = await api.get('/api/users/donor');
        const allDonors = response.data.data || [];

        const isEmptyFilters = Object.values(filters).every(value => value === '');

        filteredData = isEmptyFilters ? allDonors : allDonors.filter(donor => {
          const nameMatch = filters.name
            ? donor.name.toLowerCase().includes(filters.name.toLowerCase())
            : true;
          const emailMatch = filters.email
            ? donor.email.toLowerCase().includes(filters.email.toLowerCase())
            : true;
          const bloodTypeMatch = filters.bloodType
            ? donor.bloodTypeName === filters.bloodType
            : true;
          const nicMatch = filters.nic
            ? donor.nic.toLowerCase().includes(filters.nic.toLowerCase())
            : true;
          const genderMatch = filters.gender
            ? donor.genderId.toString() === filters.gender
            : true;

          return nameMatch && emailMatch && bloodTypeMatch && nicMatch && genderMatch;
        });

        setDonors(filteredData);
      } else if (activeTab === 'Organizers') {
        response = await api.get('/api/users/eventOrganisor/all');
        const allOrganizers = response.data.data || [];

        const isEmptyFilters = Object.values(filters).every(value => value === '');

        filteredData = isEmptyFilters ? allOrganizers : allOrganizers.filter(organizer => {
          const nameMatch = filters.name
            ? organizer.name.toLowerCase().includes(filters.name.toLowerCase())
            : true;
          const emailMatch = filters.email
            ? organizer.email.toLowerCase().includes(filters.email.toLowerCase())
            : true;
          const nicMatch = filters.nic
            ? organizer.nic.toLowerCase().includes(filters.nic.toLowerCase())
            : true;

          return nameMatch && emailMatch && nicMatch;
        });

        setOrganizers(filteredData);
      }

      setShowTable(true);
      setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
      setCurrentPage(1);
      if (filteredData.length === 0) {
        setNoResults(true);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || `Failed to fetch ${activeTab.toLowerCase()}`,
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = async (id) => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'Donors' ? `/api/users/donor/${id}` : `/api/users/eventOrganisor/${id}`;
      const response = await api.get(endpoint);
      setViewUser(response.data.data || null);
      setShowViewModal(true);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || `Failed to fetch ${activeTab.toLowerCase()} details`,
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (user) => {
    setSelectedUser(user);
    setUpdateForm({
      name: user.name,
      email: user.email,
      nic: user.nic,
      address: user.address,
      telephoneNo: user.telephoneNo,
      ...(activeTab === 'Organizers' && { roleId: user.roleId }),
      ...(activeTab === 'Donors' && {
        bloodType: user.bloodTypeName,
        genderId: user.genderId,
        dateOfBirth: user.dateOfBirth
      })
    });
    setShowUpdateModal(true);
  };

  const handleUpdateChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async () => {
    try {
      const endpoint = activeTab === 'Donors' ? `/api/users/donor/${selectedUser.id}` : `/api/users/eventOrganisor/${selectedUser.id}`;
      const formData = { ...updateForm };
      if (activeTab === 'Donors') {
        delete formData.bloodType; // Remove bloodType from formData as it's read-only
      }
      await api.put(endpoint, formData);
      setShowUpdateModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `${activeTab.slice(0, -1)} updated successfully`,
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true
      });
      handleSearch();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || `Failed to update ${activeTab.toLowerCase()}`,
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
          const endpoint = activeTab === 'Donors' ? `/api/users/donor/${id}` : `/api/users/eventOrganisor/${id}`;
          await api.delete(endpoint);
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: `${activeTab.slice(0, -1)} has been deleted.`,
            confirmButtonText: 'OK',
            timer: 3000,
            timerProgressBar: true
          });
          handleSearch();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.error || `Failed to delete ${activeTab.toLowerCase()}`,
            confirmButtonText: 'OK'
          });
        }
      }
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedData = activeTab === 'Donors'
    ? donors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : organizers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    <div className="userManage-dashboard p-4 bg-light min-vh-100" style={{ marginTop: '50px' }}>
      <SuperAdminNavBar />
      <div className="container-fluid mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-primary">
            <i className="bi bi-heart-pulse-fill me-2"></i>User Management
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

        <Card className="shadow-sm mb-4 border-0" style={{ width: '1200px' }}>
          <Card.Header className="bg-primary text-white py-3">
            <h4 className="mb-0">
              <i className="bi bi-funnel me-2"></i>{activeTab} Search Filters
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
                {activeTab === 'Donors' && (
                  <>
                    <Col md={4} sm={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="fw-bold">Blood Type</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-end-0">
                            <i className="bi bi-droplet-fill text-danger"></i>
                          </InputGroup.Text>
                          <Form.Select
                            name="bloodType"
                            value={filters.bloodType}
                            onChange={handleFilterChange}
                            className="border-start-0 rounded-end"
                          >
                            <option value="">Select Blood Type</option>
                            {bloodTypes.map((bloodType) => (
                              <option key={bloodType.id} value={bloodType.type}>
                                {bloodType.type}
                              </option>
                            ))}
                          </Form.Select>
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
                  </>
                )}
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

        {showTable && (
          <Card className="shadow-sm border-0" style={{ width: '1200px' }}>
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
              <h4 className="mb-0">
                <i className="bi bi-table me-2"></i>{activeTab} Results
              </h4>
              <Badge bg="secondary" pill className="fs-6">
                <i className="bi bi-people-fill me-1"></i> {activeTab === 'Donors' ? donors.length : organizers.length} {activeTab.toLowerCase()} found
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
                      <h5 className="mb-1">No {activeTab.toLowerCase()} found</h5>
                      <p className="mb-0">No {activeTab.toLowerCase()} match your search criteria. Please try different filters.</p>
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
                          {activeTab === 'Donors' && <th>Blood Type</th>}
                          <th>NIC</th>
                          {activeTab === 'Donors' && <th>Gender</th>}
                          <th>Telephone</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map((user, index) => (
                          <tr key={user.id} className="align-middle">
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2"
                                     style={{ width: '36px', height: '36px' }}>
                                  <i className="bi bi-person-fill text-primary"></i>
                                </div>
                                <strong>{user.name}</strong>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            {activeTab === 'Donors' && (
                              <td>
                                <Badge bg={getBloodTypeColor(user.bloodTypeName)} pill className="fs-6">
                                  <i className="bi bi-droplet-fill me-1"></i> {user.bloodTypeName}
                                </Badge>
                              </td>
                            )}
                            <td>{user.nic}</td>
                            {activeTab === 'Donors' && (
                              <td>
                                <div className="d-flex align-items-center">
                                  <i className={`${getGenderIcon(user.genderId)} me-2 text-primary`}></i>
                                  {getGenderName(user.genderId)}
                                </div>
                              </td>
                            )}
                            <td>{user.telephoneNo}</td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center">
                                <Button
                                  variant="info"
                                  size="sm"
                                  className="me-2 rounded-pill px-3"
                                  onClick={() => handleViewClick(user.id)}
                                >
                                  <i className="bi bi-eye me-1"></i> View
                                </Button>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  className="me-2 rounded-pill px-3"
                                  onClick={() => handleUpdateClick(user)}
                                >
                                  <i className="bi bi-pencil-square me-1"></i> Update
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="rounded-pill px-3"
                                  onClick={() => handleDeleteClick(user.id)}
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
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, activeTab === 'Donors' ? donors.length : organizers.length)} of {activeTab === 'Donors' ? donors.length : organizers.length} entries
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

        {/* Update Modal */}
        <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered size="lg" className="border-0">
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              <i className="bi bi-pencil-square me-2"></i>Update {activeTab.slice(0, -1)} Information
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
                {activeTab === 'Donors' && (
                  <>
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
                  </>
                )}
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
                {activeTab === 'Donors' && (
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
                )}
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
              <i className="bi bi-eye me-2"></i>{activeTab.slice(0, -1)} Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {viewUser ? (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={viewUser.name || ''}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={viewUser.email || ''}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                {activeTab === 'Donors' && (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Blood Type</Form.Label>
                      <Form.Control
                        type="text"
                        value={viewUser.bloodTypeName || ''}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                )}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">NIC</Form.Label>
                    <Form.Control
                      type="text"
                      value={viewUser.nic || ''}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                {activeTab === 'Donors' && (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Gender</Form.Label>
                      <Form.Control
                        type="text"
                        value={getGenderName(viewUser.genderId) || ''}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                )}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Telephone</Form.Label>
                    <Form.Control
                      type="text"
                      value={viewUser.telephoneNo || ''}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={viewUser.address || ''}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                {activeTab === 'Donors' && (
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        value={viewUser.dateOfBirth || ''}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                )}
              </Row>
            ) : (
              <Alert variant="info">
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-3 fs-4"></i>
                  <div>
                    <h5 className="mb-1">No {activeTab.toLowerCase()} data</h5>
                    <p className="mb-0">Unable to load {activeTab.toLowerCase()} details.</p>
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

export default UserManagement;