import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";

function NewsContent(props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [EmployeeData, setEmployeeData] = useState({});
  //NewsContent No Data
  const [data, setData] = useState([]);
  useEffect(() => {
    if (props.show) {
      axios
        .get("http://localhost:8081/users")
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [props.show]);
  //MewsContent No DataPuro
  //EditContent No Data
  let [image, setImage] = useState({});

  function handleEdit(data) {
    setEmployeeData(data);
    let HobbiesArray = JSON.parse(data.Hobbies);
    setTimeout(() => {
      for (let i = 0; i < HobbiesArray.length; i++) {
        if (HobbiesArray[i] === "Swimming") {
          document.getElementById("Hobbies").options[0].selected = true;
        } else if (HobbiesArray[i] === "Coding") {
          document.getElementById("Hobbies").options[1].selected = true;
        } else if (HobbiesArray[i] === "Jogging") {
          document.getElementById("Hobbies").options[2].selected = true;
        } else if (HobbiesArray[i] === "Gaming") {
          document.getElementById("Hobbies").options[3].selected = true;
        } else if (HobbiesArray[i] === "Surfing") {
          document.getElementById("Hobbies").options[4].selected = true;
        } else if (HobbiesArray[i] === "Running") {
          document.getElementById("Hobbies").options[5].selected = true;
        }
      }
    }, 1);
    setFirstName(data.First_Name);
    setLastName(data.Last_Name);
    setEmail(data.Email);
    setPhNo(data.Phone_No);
    setGender(data.Gender);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    var Hby = document.querySelector("#Hobbies");

    var HobbyObject = Array.from(Hby.options)
      .filter((option) => option.selected)
      .map((option) => option.value);

    var hobbies = JSON.stringify(HobbyObject);

    const formData = new FormData(event.target);
    formData.append("hobbies", hobbies);
    formData.append("emp_id", EmployeeData.Emp_Id);
    axios
      .post("http://localhost:8081/api/editemployee", formData)
      .then((responce) => {
        console.log("Responce :", responce.data);
      })
      .catch((error) => {
        console.log(error);
      });
    setModalOpen(false);
    axios
      .get("http://localhost:8081/users")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleImage = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
    document.getElementById("initialImage").style.display = "none";
    document.getElementById("changedImage").style.display = "block";
  };
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [email, setEmail] = useState();
  const [phNo, setPhNo] = useState();
  const [gender, setGender] = useState();

  //Edit Content NoData Puro

  let [empId, setEmpId] = useState();
  //Delete Content No Data
  function handleDelete(data) {
    setEmpId(data.Emp_Id);
  }
  const handleDeleteContent = () => {
    const DataObject = {
      Emp_Id: empId,
    };
    axios
      .delete("http://localhost:8081/api/deleteemployee", {
        data: DataObject,
      })
      .then((responce) => {
        console.log("Responce :", responce.data);
      })
      .catch((error) => {
        console.log(error);
      });
    setModalDeleteOpen(false);
    axios
      .get("http://localhost:8081/users")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  //Delete Content No Data Puro.
  return (
    <>
    <div>
      <table
        className="table table-striped table-hover table-animated"
        style={
          !props.show
            ? { display: "none", width: "100%" }
            : { display: "block", width: "100%" }
        }
      >
        <thead>
          <tr>
            <th width="200px">Id</th>
            <th width="200px">First Name</th>
            <th width="200px">Last Name</th>
            <th width="200px">Email</th>
            <th width="200px">Phone No.</th>
            <th width="200px">Gender</th>
            <th width="300px">Hobbies</th>
            <th width="200px">Image</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((data, i) => (
            <tr key={i}>
              <td>{data.Emp_Id}</td>
              <td>{data.First_Name}</td>
              <td>{data.Last_Name}</td>
              <td>{data.Email}</td>
              <td>{data.Phone_No}</td>
              <td>{data.Gender}</td>
              <td>{Object.values(JSON.parse(data.Hobbies)) + " "}</td>
              <td>
                <img
                  src={`http://localhost:8081/images/${data.Image}`}
                  alt={`Shot Of ${data.FirstName}`}
                  style={{ border: "2px solid black", borderRadius: "10px" }}
                  height={100}
                  width={100}
                />
              </td>
              <td>
                <button
                  to="editemployee"
                  id={data.id}
                  state={{ message: data }}
                  style={{ border: "none", background: "transparent" }}
                  href="#editEmployeeModal"
                  className="edit mx-1"
                  onClick={() => {
                    handleEdit(data);
                    setModalOpen(true);
                  }}
                  data-toggle="modal"
                >
                  <i
                    className="material-icons"
                    data-toggle="tooltip"
                    title="Edit"
                  >
                    &#xE254;
                  </i>
                </button>
                <button
                  to="deleteemployee"
                  id={data.id}
                  state={{ message: data.Emp_Id }}
                  style={{ border: "none", background: "transparent" }}
                  className="delete mx-1"
                  onClick={() => {
                    setModalDeleteOpen(true);
                    handleDelete(data);
                  }}
                  data-toggle="modal"
                >
                  <i
                    className="material-icons"
                    data-toggle="tooltip"
                    title="Delete"
                  >
                    &#xE872;
                  </i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {modalOpen && (
        <Modal show={true}>
          <Modal.Header>
            <div>Enter The Details To Update.</div>
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
          <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
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
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
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
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
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
                  id="Hobbies"
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
              <button type="submit" className="btn btn-outline-success">
                Submit
              </button>
            </Modal.Footer>
          </form>
        </Modal>
      )}
      {modalDeleteOpen && (
        <Modal show={true}>
          <Modal.Header>
            <div>Delete Data.</div>
            <div>
              <button
                type="button"
                to="/"
                onClick={() => {
                  setModalDeleteOpen(false);
                }}
                className="btn btn-light"
              >
                X
              </button>
            </div>
          </Modal.Header>
          <Modal.Body>Remember It Cannot Be Backuped.</Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              to="/"
              onClick={handleDeleteContent}
              className="btn btn-outline-danger"
            >
              Delete
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}

export default NewsContent;
