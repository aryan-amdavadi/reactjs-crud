import React, { useState, useEffect } from "react";
import NewsContent from "./UserContent";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import Navbar from "../Content/Navbar"
import { useNavigate } from 'react-router-dom';

function NewsLayout() {
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("user_id") === null) {
      navigate("/");
    } else if (localStorage.getItem("role") === "user") {
      navigate("/posts");
    }
  }, [navigate]);
  let [image, setImage] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(true);

  const handleImage = (e) => {
    document.getElementById("imagePreview").style.display = "block";
    setImage(URL.createObjectURL(e.target.files[0]));
    document.getElementById("imageDiv").style.display = "none";
  };

  const handleSubmit = async (event) => {
    setTableOpen(false);
    event.preventDefault();
    var Hby = document.querySelector("#Hobbies");

    var HobbyObject = Array.from(Hby.options)
      .filter((option) => option.selected)
      .map((option) => option.value);

    var hobbies = JSON.stringify(HobbyObject);
    const formData = new FormData(event.target);
    formData.append("hobbies", hobbies);

    axios
      .post("http://localhost:8081/api/addemployee", formData)
      .then((responce) => {
        console.log("Responce :", responce.data);
      })
      .catch((error) => {
        console.log(error);
      });
    setModalOpen(false);
    setTimeout(() => {
      setTableOpen(true);
    }, 1);
  };

  const handleOpen = () => {
    setModalOpen(true);
  };
  const handleClose = () => {
    setModalOpen(false);
  };
  return (
    <>
    <Navbar />
      <div>
        <div className="container-xl" style={{margin:0, width:"100%",maxWidth:"100%"}}>
          <div className="table-responsive" style={{ overflowX: "visible" }}>
            <div className="table-wrapper" style={{width:"100%", maxWidth:"100%"}}>
              <div className="table-title" style={{width:"100%", maxWidth:"100%"}}>
                <div className="row my-3" style={{width:"100%", maxWidth:"100%"}}>
                  <div className="col-sm-6">
                    <h2>
                      Manage <b>Users</b>
                    </h2>
                  </div>
                  <div
                    className="col-sm-6 d-flex"
                    style={{ flexDirection: "row-reverse" }}
                  >
                    <button
                      to="addemployee"
                      style={{ width:"145px" }}
                      className="btn btn-success mx-3"
                      onClick={handleOpen}
                      data-toggle="modal"
                    >
                      <i className="material-icons"></i>
                      <span>Add New Users</span>
                    </button>
                  </div>
                </div>
              </div>
              {<NewsContent show={tableOpen} />}
              {modalOpen && (
                <Modal show={true}>
                  <Modal.Header>
                    <div>Enter The Details To Add.</div>
                    <div>
                      <button
                        type="button"
                        to="/"
                        onClick={handleClose}
                        className="btn btn-light"
                      >
                        X
                      </button>
                    </div>
                  </Modal.Header>
                  <form onSubmit={handleSubmit} encType="multipart/form-data" id="details">
                    <Modal.Body>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          First Name
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          className="form-control"
                          id="First_Name"
                          placeholder="First Name"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="Last_Name"
                          name="last_name"
                          placeholder="Last Name"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="Email"
                          name="email"
                          placeholder="Email Address"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Phone Number
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="Phone_No"
                          name="phone_number"
                          placeholder="Phone Number"
                          required
                        />
                      </div>
                      <div className="my-2">
                        <div>
                          <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label my-1"
                          >
                            Gender
                          </label>
                        </div>
                        <div className="d-flex">
                          <div className="form-check mx-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              value={"Male"}
                              name="gender"
                              id="Gender"
                              required
                            />
                            <label
                              className="form-check-label"
                              htmlFor="radioDefault1"
                            >
                              Male
                            </label>
                          </div>
                          <div className="form-check mx-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              value={"Female"}
                              name="gender"
                              id="Gender"
                              required
                            />
                            <label
                              className="form-check-label"
                              htmlFor="radioDefault1"
                            >
                              Female
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="exampleDataList" className="form-label">
                          Hobbies
                        </label>
                        <br />
                        <select
                          className="form-select"
                          id="Hobbies"
                          multiple
                          aria-label="Multiple select example"
                          required
                          style={{ width: "100%" }}
                        >
                          <option value="Swimming">Swimming</option>
                          <option value="Coding">Coding</option>
                          <option value="Jogging">Jogging</option>
                          <option value="Gaming">Gaming</option>
                          <option value="Surfing">Surfing</option>
                          <option value="Running">Running</option>
                        </select>
                        <br />
                      </div>
                      <div className="my-2">
                        <div>
                          <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label my-1"
                          >
                            Status
                          </label>
                        </div>
                        <div className="d-flex">
                          <div className="form-check mx-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              value={"Active"}
                              name="status"
                              id="Status"
                              required
                            />
                            <label
                              className="form-check-label"
                              htmlFor="radioDefault1"
                            >
                              Active
                            </label>
                          </div>
                          <div className="form-check mx-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              value={"UnActive"}
                              name="status"
                              id="Status"
                              required
                            />
                            <label
                              className="form-check-label"
                              htmlFor="radioDefault1"
                            >
                              UnActive
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3 my-3" id="imageDiv">
                        <label htmlFor="formFile" className="form-label">
                          Image
                        </label>
                        <input
                          className="form-control"
                          style={{ padding: "6px", height: "100%" }}
                          type="file"
                          id="Image"
                          name="image"
                          onChange={handleImage}
                          required
                        />
                      </div>
                      <div
                        className="mb-3 my-3"
                        id="imagePreview"
                        style={{ display: "none" }}
                      >
                        <p>Preview</p>
                        <img
                          src={image}
                          alt="Preview"
                          height={200}
                          width={200}
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

export default NewsLayout;
