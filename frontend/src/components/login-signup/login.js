import React, { useState } from "react";

import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/esm/ModalBody";
import ModalFooter from "react-bootstrap/esm/ModalFooter";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ForgotPass from "./ForgotPass";
import Navbar from "../Content/Navbar";

const AuthForm = () => {
  localStorage.removeItem("role");
  localStorage.removeItem("user_id");
  const navigate = useNavigate();
  const [errorModalShow, setErrorModalShow] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [modalImageOpen, setModalImageOpen] = useState(false);
  const [forgotPassOpen, setForgotPassOpen] = useState(false);
  const [gender, setGender] = useState();
  let [image, setImage] = useState({});
  const handleImage = (e) => {
    document.getElementById("imagePreview").style.display = "block";
    setImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (isLogin) {
      let dataObject = {
        email: formData.get("email"),
        password: formData.get("password"),
      };
      axios
        .post("http://localhost:8081/login", dataObject)
        .then((res) => {
          localStorage.setItem("user_id", res.data.Emp_Id);
          localStorage.setItem("role", res.data.role);
          navigate("/menu", { state: res.data });
          const localCart = JSON.parse(localStorage.getItem("cart")) || {};
          let dummyCart = Object.values(localCart);
          for (let i = 0; i < dummyCart.length; i++) {
            dummyCart[i].user_id = localStorage.getItem("user_id");
            axios
              .post("http://localhost:8081/api/addcart", dummyCart[i])
              .then((response) => {
                console.log(response)
                localStorage.removeItem("cart")
              })
              .catch((error) => {
                console.log(error);
              });
          }
        })
        .catch((err) => {
          console.log(err);
          setErrorModalShow(true);
        });
    } else {
      var Hby = document.querySelector("#Hobbies");
      var HobbyObject = Array.from(Hby.options)
        .filter((option) => option.selected)
        .map((option) => option.value);

      var hobbies = JSON.stringify(HobbyObject);
      formData.append("Gender", gender);
      formData.append("hobbies", hobbies);
      axios
        .post("http://localhost:8081/api/addemployee", formData)
        .then((responce) => {
          if (responce.data.code === undefined) {
            navigate("/menu");
          } else {
            setErrorModalShow(true);
          }
        })
        .catch((error) => {
          console.log("eerr", error);
        });
    }
  };

  return (
    <>
      <Navbar />
      <Modal show={modalImageOpen} style={{ backgroundColor: "transparent" }}>
        <ModalBody style={{ backgroundColor: "#324b55" }}>
          <img src={image} alt="Preview" height={400} width={460} />
        </ModalBody>
        <ModalFooter style={{ backgroundColor: "#324b55" }}>
          <button
            className="btn btn-outline-danger"
            onClick={() => {
              setModalImageOpen(false);
            }}
          >
            Close
          </button>
        </ModalFooter>
      </Modal>
      <Modal show={errorModalShow}>
          <Modal.Header>
            <div>Error....</div>
            <div>
              <button
                type="button"
                to="/"
                onClick={() => {
                  setErrorModalShow(false);
                }}
                className="btn btn-light"
              >
                X
              </button>
            </div>
          </Modal.Header>
          <Modal.Body>Invalid Credentials.</Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              to="/"
              onClick={() => {
                  setErrorModalShow(false);
                }}
              className="btn btn-outline-danger"
            >
              Close
            </button>
          </Modal.Footer>
        </Modal>
      <ForgotPass
        show={forgotPassOpen}
        onClose={() => setForgotPassOpen(false)}
      />
      <div
        className="auth-wrapper"
        style={{ display: forgotPassOpen ? "none" : "flex" }}
      >
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`auth-tab ${!isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" id="login">
            {!isLogin && (
              <div>
                <div
                  className="d-flex"
                  style={{ justifyContent: "space-between" }}
                >
                  <div className="mb-3 " style={{ width: "235px" }}>
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
                  <div className="mb-3 " style={{ width: "235px" }}>
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
                </div>
                <div
                  className="d-flex"
                  style={{ justifyContent: "space-between" }}
                >
                  <div className="mb-3 " style={{ width: "235px" }}>
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
                  <div className="mb-3 " style={{ width: "235px" }}>
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
                </div>
                <div className="d-flex"></div>
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="Password"
                    name="password"
                    placeholder="Password"
                    required
                  />
                </div>
                <div
                  className="d-flex"
                  style={{ justifyContent: "end", flexDirection: "column" }}
                >
                  <div className="d-flex" style={{ justifyContent: "center" }}>
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label"
                    >
                      Gender
                    </label>
                  </div>
                  <div
                    style={{ display: "block" }}
                    className="btn-group mb-3 d-flex"
                    role="group"
                    aria-label="Basic radio toggle button group"
                  >
                    <input
                      type="radio"
                      className="btn-check"
                      name="gender"
                      id="male"
                      onChange={() => {}}
                      autoComplete="off"
                      style={{ display: "none" }}
                      checked={gender === "Male" ? true : false}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary mx-1"
                      htmlFor="male"
                      style={{
                        borderRadius: "5px",
                        width: "245px",
                        backgroundColor: gender === "Male" ? "green" : "",
                        color: gender === "Male" ? "white" : "",
                      }}
                      onClick={() => {
                        setGender("Male");
                      }}
                    >
                      Male
                    </button>

                    <input
                      type="radio"
                      className="btn-check"
                      name="gender"
                      onChange={() => {
                        setGender("Female");
                      }}
                      id="female"
                      autoComplete="off"
                      style={{ display: "none" }}
                      checked={gender === "Male" ? true : false}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary mx-1"
                      htmlFor="female"
                      style={{
                        borderRadius: "5px",
                        width: "245px",
                        backgroundColor: gender === "Female" ? "green" : "",
                        color: gender === "Female" ? "white" : "",
                      }}
                      onClick={() => {
                        setGender("Female");
                      }}
                    >
                      Female
                    </button>
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
                    style={{
                      width: "100%",
                      background: "transparent",
                      color: "white",
                    }}
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
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setModalImageOpen(true);
                    }}
                  >
                    Preview
                  </button>
                </div>
              </div>
            )}
            {isLogin && (
              <>
                <div className="mb-3 ">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Email Address"
                    required
                  />
                </div>
                <div style={{ margin: "2px", height:"68px" }}>
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="Password"
                    name="password"
                    placeholder="Password"
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 
                }}>
                  <div style={{display:"flex",justifyContent:"end"}}>
                    <button
                      type="button"
                      className="btn btn-outline-danger no-focus"
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        color: "red",
                      }}
                      onClick={() => {
                        setForgotPassOpen(true);
                      }}
                    >
                      Forgot Password!
                    </button>
                  </div>
                </div>
              </>
            )}
            <button type="submit" className="auth-submit">
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AuthForm;
