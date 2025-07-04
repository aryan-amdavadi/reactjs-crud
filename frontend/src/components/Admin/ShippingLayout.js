import React, { useState } from "react";
import Navbar from "../Content/Navbar";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import ShippingContent from "./ShippingContent";

function ShippingLayout() {
  const [tableOpen, setTableOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const handleSubmit = (e) => {
    setTableOpen(false);
    e.preventDefault();
    const formData = {
      name: e.target.name.value,
      city: e.target.city.value,
      postCode: e.target.postCode.value,
      state: e.target.state.value,
      threshold: e.target.threshold.value,
      shippingFee: e.target.shippingFee.value,
    };
    axios
      .post("http://localhost:8081/api/addshipping", formData)
      .then((responce) => {
        console.log("Responce :", responce.data);
        setTableOpen(true);
      })
      .catch((error) => {
        console.log(error);
      });
    setModalOpen(false);
    setTimeout(() => {
      setTableOpen(true);
    }, 1);
  };
  return (
    <>
      <Navbar />
      <div>
        <div
          className="container-xl"
          style={{ margin: 0, width: "100%", maxWidth: "100%" }}
        >
          <div className="table-responsive" style={{ overflowX: "visible" }}>
            <div
              className="table-wrapper"
              style={{ width: "100%", maxWidth: "100%" }}
            >
              <div
                className="table-title"
                style={{ width: "100%", maxWidth: "100%" }}
              >
                <div
                  className="row my-3"
                  style={{ width: "100%", maxWidth: "100%" }}
                >
                  <div
                    className="col-sm-6"
                    style={{ width: "100%", maxWidth: "100%" }}
                  >
                    <h2>
                      Manage <b>Shipping Address</b>
                    </h2>
                  </div>
                  <div
                    className="col-sm-6 d-flex"
                    style={{ flexDirection: "row-reverse" }}
                  >
                    <button
                      style={{ width: "200px" }}
                      className="btn btn-success mx-3"
                      onClick={() => {
                        setModalOpen(true);
                      }}
                      data-toggle="modal"
                    >
                      <i className="material-icons"></i>
                      <span>Add Shipping Address</span>
                    </button>
                  </div>
                </div>
              </div>
              {<ShippingContent show={tableOpen} />}

              {modalOpen && (
                <Modal show={true}>
                  <form onSubmit={handleSubmit} id="details">
                    <Modal.Header>
                      <div>Enter The Shipping Details</div>
                      <div>
                        <button
                          type="button"
                          to="/"
                          onClick={() => {
                            setModalOpen(false);
                          }}
                          className="btn btn-light"
                        >
                          <i className="fa-solid fa-x"></i>
                        </button>
                      </div>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="mb-3">
                        <label htmlFor="Title" className="form-label">
                          Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          placeholder="Name"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          City
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="city"
                          name="city"
                          placeholder="City"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Postal Code
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="postCode"
                          name="postCode"
                          placeholder="Postal Code"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          State
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="state"
                          name="state"
                          placeholder="State"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Shipping Threshold
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="threshold"
                          name="threshold"
                          placeholder="Threshold"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Shipping Fee
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="shippingFee"
                          name="shippingFee"
                          placeholder="Shipping Fee"
                          required
                        />
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <button type="submit" className="btn btn-outline-success">
                        Submit
                      </button>
                    </Modal.Footer>
                  </form>
                </Modal>
              )}
              <div id="modals"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ShippingLayout;
