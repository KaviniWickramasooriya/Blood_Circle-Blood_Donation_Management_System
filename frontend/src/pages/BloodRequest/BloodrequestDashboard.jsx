import React, { useEffect, useRef, useState } from "react";

import BloodCountCard from "./Dashboard/BloodCountCard";
import "./Dashboard/BloodrequestDashboard.css";
import HomeNavBar from "../../components/Navbar/HomeNavBar";
import { Modal } from "bootstrap";
import {
  getBloodData,
  createBloodRequest,
} from "./Dashboard/api-gateway/gateway-service.js";

const BloodRequest = () => {
  const [bloodData, setBloodData] = useState([]); // state to store fetched blood records
  const modalRef = useRef(null);

  //Fetch blood data from backend
  useEffect(() => {
    const fetchBloodData = async () => {
      try {
        const data = await getBloodData();
        console.log("Fetched blood data:", data);

        const mappedData = data.map((item) => ({
          bloodType: item.type,
          quantity: item.quantity,
          unit: "ml",
        }));

        setBloodData(mappedData);
      } catch (error) {
        console.error("Error fetching blood data:", error);
      }
    };

    fetchBloodData();
  }, []);

  const openModal = () => {
    const modal = new Modal(modalRef.current);
    modal.show();
  };

  return (
    <div className="request-blood-container">
      <HomeNavBar />

      <div className="dashboard">
        <div className="button-wrapper">
          <button className="request-btn" onClick={openModal}>
            Request Now
          </button>
        </div>

        <div className="card-container">
          {bloodData.map((data, index) => (
            <BloodCountCard
              key={index}
              bloodType={data.bloodType}
              count={data.quantity} // use the quantity from state
              unit={data.unit}
            />
          ))}
        </div>
      </div>

      {/* Bootstrap Modal */}
      <div
        className="modal fade"
        id="requestModal"
        tabIndex="-1"
        aria-labelledby="requestModalLabel"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="requestModalLabel">
                Blood Request Form
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Blood Type</label>
                  <select className="form-select" required>
                    <option value="">Select</option>
                    <option>O+</option>
                    <option>O-</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Quantity (ml)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Hospital Name/Personal Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter hospital name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter contact number"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">E-mail</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter email"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-danger w-100">
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodRequest;
