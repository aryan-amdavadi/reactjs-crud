import React from "react";
import { useEffect } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("user_id") === null) {
      navigate("/");
    }
  }, [navigate]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const pass1 = formData.get("password1");
    const pass2 = formData.get("password2");
    if (pass1 === pass2) {
        const dataObject = {
            password:pass1,
            email:email
        }
      axios
        .post("http://localhost:8081/api/changepassword", dataObject)
        .then((responce) => {
          console.log("Responce :", responce.data);
          alert("password Changed")
          navigate("/")
        })
        .catch((error) => {
          console.log(error);
          alert("Error")
        });
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit} className="auth-form" id="forgotPassword">
        <div className="auth-wrapper">
          <div
            className="d-flex"
            style={{ flexDirection: "row-reverse", cursor: "pointer" }}
          ></div>
          <div className="auth-card">
            <div className="mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label mx-2"
              >
                New Password
              </label>
              <input
                type="password"
                className="form-control mb-3"
                id="password1"
                name="password1"
                placeholder="Create Password"
                required
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label mx-2"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                className="form-control mb-3"
                id="password2"
                name="password2"
                placeholder="Confirm Your Password"
                required
              />
            </div>
            <div style={{ alignSelf: "center" }}>
              <button className="btn btn-outline-success" type="submit">
                Change
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ResetPassword;
