import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";

function EditContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const EmployeeData = location.state?.message;
  let HobbiesArray = JSON.parse(EmployeeData.Hobbies);
  let [image, setImage] = useState({});

  setTimeout(function () {
    for (let i = 0; i < HobbiesArray.length; i++) {
      if (HobbiesArray[i] === "Swimming") {
        document.getElementById("HobbyOptions").options[0].selected = true;
      } else if (HobbiesArray[i] === "Coding") {
        document.getElementById("HobbyOptions").options[1].selected = true;
      } else if (HobbiesArray[i] === "Jogging") {
        document.getElementById("HobbyOptions").options[2].selected = true;
      } else if (HobbiesArray[i] === "Gaming") {
        document.getElementById("HobbyOptions").options[3].selected = true;
      } else if (HobbiesArray[i] === "Surfing") {
        document.getElementById("HobbyOptions").options[4].selected = true;
      } else if (HobbiesArray[i] === "Running") {
        document.getElementById("HobbyOptions").options[5].selected = true;
      }
    }
  }, 500);

  const handleSubmit = async (event) => {
    event.preventDefault();
    var Hby = document.querySelector("#HobbyOptions");
    var HobbyObject = Array.from(Hby.options)
      .filter((option) => option.selected)
      .map((option) => option.value);

    var hobbies = JSON.stringify(HobbyObject);

    const formData = new FormData(event.target);
    formData.append("hobbies", hobbies);
    formData.append("emp_id",EmployeeData.Emp_Id)

    axios
      .post("http://localhost:8081/api/editemployee", formData)
      .then((responce) => {
        console.log("Responce :", responce.data);
      })
      .catch((error) => {
        console.log(error);
      });
    navigate("/");
  };

  const handleImage = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
    document.getElementById("initialImage").style.display = "none";
    document.getElementById("changedImage").style.display = "block";
  };

  const [firstName, setFirstName] = useState(EmployeeData.First_Name);
  const [lastName, setLastName] = useState(EmployeeData.Last_Name);
  const [email, setEmail] = useState(EmployeeData.Email);
  const [phNo, setPhNo] = useState(EmployeeData.Phone_No);
  const [status, setStatus] = useState(EmployeeData.Status);
  const [gender, setGender] = useState(EmployeeData.Gender);
  return (
    <>
      <Modal show={true}>
        <Modal.Header>
          <div>Enter The Details To Update.</div>
          <div>
            <Link type="button" to="/" className="btn btn-light">
              X
            </Link>
          </div>
        </Modal.Header>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Modal.Body>
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                name="first_name"
                onChange={(e) => {
                  setFirstName(e.target.value);
                }}
                className="form-control"
                id="First_Name"
                placeholder="First Name"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                }}
                className="form-control"
                name="last_name"
                id="Last_Name"
                placeholder="Last Name"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className="form-control"
                name="email"
                id="Email"
                placeholder="Email Address"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Phone Number
              </label>
              <input
                type="int"
                value={phNo}
                onChange={(e) => {
                  setPhNo(e.target.value);
                }}
                className="form-control"
                name="phone_number"
                id="Phone_No"
                placeholder="Phone Number"
                required
              />
            </div>
            <div className="my-2">
              <div>
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label my-1"
                  required
                >
                  Gender
                </label>
              </div>
              <div className="d-flex">
                <div className="form-check mx-2">
                  <input
                    className="form-check-input Gender"
                    checked={gender === "Male" ? true : false}
                    onChange={(e) => {
                      setGender(e.target.value);
                    }}
                    type="radio"
                    value={"Male"}
                    name="gender"
                    required
                  />
                  <label className="form-check-label" htmlFor="radioDefault1">
                    Male
                  </label>
                </div>
                <div className="form-check mx-2">
                  <input
                    className="form-check-input Gender"
                    type="radio"
                    checked={gender === "Female" ? true : false}
                    onChange={(e) => {
                      setGender(e.target.value);
                    }}
                    value={"Female"}
                    name="gender"
                    id="Gender"
                    required
                  />
                  <label className="form-check-label" htmlFor="radioDefault1">
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
                id="HobbyOptions"
                multiple
                style={{ width: "100%" }}
                className="form-select"
              >
                <option value="Swimming">Swimming</option>
                <option value="Coding">Coding</option>
                <option value="Jogging">Jogging</option>
                <option value="Gaming">Gaming</option>
                <option value="Surfing">Surfing</option>
                <option value="Running">Running</option>
              </select>
            </div>
            <div className="my-2">
              <div>
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label my-1"
                  required
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
                    checked={status === "Active" ? true : false}
                    onChange={(e) => {
                      setStatus(e.target.value);
                    }}
                    name="status"
                    id="Status"
                    required
                  />
                  <label className="form-check-label" htmlFor="radioDefault1">
                    Active
                  </label>
                </div>
                <div className="form-check mx-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    value={"UnActive"}
                    checked={status === "UnActive" ? true : false}
                    onChange={(e) => {
                      setStatus(e.target.value);
                    }}
                    name="status"
                    id="Status"
                    required
                  />
                  <label className="form-check-label" htmlFor="radioDefault1">
                    UnActive
                  </label>
                </div>
              </div>
            </div>
            <div className="mb-3 my-3" id="imageDiv">
              <label htmlFor="formFile" className="form-label">
                Click To Change Image
              </label>
              <input
                className="form-control"
                style={{ padding: "6px", height: "100%" }}
                type="file"
                id="Image"
                name="image"
                onChange={handleImage}
              />
            </div>
            <div className="mb-3 my-3" id="imagePreview">
              <p>Preview</p>
              <img
                src={`http://localhost:8081/images/${EmployeeData.Image}`}
                style={{ border: "2px solid black" }}
                alt="Preview"
                height={200}
                width={200}
                id="initialImage"
              />
              <img
                src={image}
                style={{ border: "2px solid black", display: "none" }}
                alt="Preview"
                height={200}
                width={200}
                id="changedImage"
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              type="submit"
              className="btn btn-outline-success"
            >
              Submit
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}

export default EditContent;
