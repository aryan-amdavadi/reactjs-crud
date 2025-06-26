import React, { useState, useEffect } from "react";
import PostContent from "./PostContent";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

function PostLayout() {
  const navigate = useNavigate();
  if(localStorage.getItem("user_id")===null){
    navigate("/")
  }
  const location = useLocation();
  const user_details = location.state;
  const [tableOpen, setTableOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [empData, setEmpData] = useState({});
  const [loggedIn, setLoggedIn] = useState(null);
  const [image, setImage] = useState();
  //
  //
  //
  //
  useEffect(() => {
    axios
      .get("http://localhost:8081/users")
      .then((res) => {
        setEmpData(res.data);
          for (let i = 0; i < empData.length; i++) {
            if (res.data[i].Emp_Id === user_details.Emp_Id) {
              setLoggedIn(res.data[i]);
            }
          }
      })
      .catch((err) => {
        console.log(err);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //
  //
  //
  //
  const handleSubmit = (event) => {
    setTableOpen(false);
    event.preventDefault();
    const formData = new FormData(event.target);
    console.log(user_details.emp);
    formData.append("emp_id", user_details.Emp_Id);
    axios
      .post("http://localhost:8081/api/addpost", formData)
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
    console.log(formData);
  };
  const handleImage = (e) => {
    document.getElementById("imagePreview").style.display = "block";
    setImage(URL.createObjectURL(e.target.files[0]));
    document.getElementById("imageDiv").style.display = "none";
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
                      Manage <b>Posts</b>
                    </h2>
                  </div>
                  <div
                    className="col-sm-6 d-flex"
                    style={{ flexDirection: "row-reverse" }}
                  >
                    <button
                      style={{ height: "38px" }}
                      className="btn btn-success mx-3"
                      onClick={() => {
                        setModalOpen(true);
                      }}
                      data-toggle="modal"
                    >
                      <i className="material-icons"></i>
                      <span>Post Now!!</span>
                    </button>
                  </div>
                </div>
              </div>
              {<PostContent show={tableOpen} userData={loggedIn} />}

              {modalOpen && (
                <Modal show={true}>
                  <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <Modal.Header>
                      <div>Enter The Details To Add.</div>
                      <div>
                        <button
                          type="button"
                          to="/"
                          onClick={() => {
                            setModalOpen(false);
                          }}
                          className="btn btn-light"
                        >
                          X
                        </button>
                      </div>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="mb-3">
                        <label htmlFor="User_Id" className="form-label">
                          User Id
                        </label>
                        <input
                          type="number"
                          name="user_id"
                          className="form-control"
                          id="user_id"
                          placeholder="User Id"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="Title" className="form-label">
                          Title
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="title"
                          name="title"
                          placeholder="Title"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Description
                        </label>
                        <textarea
                          type="text"
                          className="form-control"
                          id="description"
                          name="description"
                          placeholder="Description"
                          required
                        />
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

export default PostLayout;
