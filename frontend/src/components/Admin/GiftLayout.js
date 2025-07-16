
import React, { useState } from "react";
import Navbar from "../Content/Navbar";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import GiftContent from "./GiftContent";


function GiftLayout() {
  const [tableOpen, setTableOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [cardData, setCardData] = useState({
      code: "",
      enabled: "",
      expiry_date: "",
      user_id: "",
      value: "",
    });
    const [userQuery, setUserQuery] = useState("");
      const [searchUserData, setSearchUserData] = useState([]);
      const [selectedUsers, setSelectedUsers] = useState([]);
  const handleSubmit = (e) => {
    setTableOpen(false)
    e.preventDefault();
    const empIds = selectedUsers.map(emp => emp.Emp_Id);
    
    axios
      .post("http://localhost:8081/api/addcard", {...cardData, user_id:JSON.stringify(empIds)})
      .then((responce) => {
        console.log("Responce :", responce.data);
        setTableOpen(true);
      })
      .catch((error) => {
        console.log(error);
      });
    setModalOpen(false);
    setTimeout(()=>{
      setCardData({
      code: "",
      enabled: "",
      expiry_date: "",
      user_id: "",
      value: "",
    })
    selectedUsers([])
      setTableOpen(true)
    },1)
  };
  const handleUserSelect = (user) => {
    const exists = selectedUsers.find((u) => u.Emp_Id === user.Emp_Id);
    if (!exists) {
      setSelectedUsers((prev) => [...prev, user]);
    }

    setUserQuery("");
    setSearchUserData([]);
  };
  const handleUserChange = (e) => {
    const value = e.target.value;
    setUserQuery(value);
    if (!value) return setSearchUserData([]);

    axios
      .post("http://localhost:8081/api/searchuser", { keyword: value })
      .then((res) => {
        setSearchUserData(res.data);
      })
      .catch((err) => console.error("User Search Error:", err));
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
                      Manage <b>Gift Card</b>
                    </h2>
                  </div>
                  <div
                    className="col-sm-6 d-flex"
                    style={{ flexDirection: "row-reverse" }}
                  >
                    <button
                      style={{ width:"145px" }}
                      className="btn btn-success mx-3"
                      onClick={() => {
                        setModalOpen(true);
                      }}
                      data-toggle="modal"
                    >
                      <i className="material-icons"></i>
                      <span>Add Gift Card</span>
                    </button>
                  </div>
                </div>
              </div>
              {<GiftContent show={tableOpen} />}

              {modalOpen && (
          <Modal show={true}>
            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              id="details"
            >
            <Modal.Header>
                      <div>Enter The Details Of Gift Card</div>
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
                  Code
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="code"
                  name="code"
                  value={cardData.code}
                  onChange={(e)=>{
                    setCardData({...cardData,code:e.target.value})
                  }}
                  placeholder="Code"
                  required
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  Value
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="value"
                  name="value"
                  value={cardData.value}
                  onChange={(e) => {
                    setCardData({ ...cardData, value: e.target.value });
                  }}
                  placeholder="Value"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="Title" className="form-label">
                  Expiry Date
                </label>
                <input
                  type="Date"
                  className="form-control"
                  id="expiry_date"
                  name="expiry_date"
                  value={cardData.expiry_date.split("T")[0]}
                  onChange={(e) => {
                    setCardData({ ...cardData, expiry_date: e.target.value });
                  }}
                  placeholder="ExpiryDate"
                  required
                />
              </div>
              <div
                className="tabster-autocomplete my-5"
                style={{ marginTop: "14px" }}
              >
                <div className="search-wrapper">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userQuery}
                    onChange={handleUserChange}
                  />
                  <span className="search-icon">
                    <i className="fas fa-search" />
                  </span>
                </div>
                <ul className="suggestion-box">
                  {searchUserData.map((user, index) => (
                    <li
                      key={
                        user.id ||
                        `${user.First_Name}-${user.Last_Name}-${index}`
                      }
                      className="suggestion-item"
                      onClick={() => handleUserSelect(user)}
                    >
                      {user.First_Name} {user.Last_Name}
                    </li>
                  ))}
                </ul>

                {selectedUsers.length > 0 && (
                  <div className="selected-user-list">
                    {selectedUsers.map((user, index) => (
                      <div
                        key={
                          user.Emp_Id ||
                          `${user.First_Name}-${user.Last_Name}-${index}`
                        }
                        className="selected-user"
                      >
                        <span>
                          {user.First_Name} {user.Last_Name}
                        </span>
                        <button
                          className="remove-btn"
                          onClick={() =>
                            setSelectedUsers((prev) =>
                              prev.filter((u) => u.Emp_Id !== user.Emp_Id)
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="tabster-toggle">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={cardData.enabled}
                    onChange={() => {
                      setCardData({
                        ...cardData,
                        enabled: cardData.enabled === 1 ? 0 : 1,
                      });
                    }}
                  />
                  <span className="slider round" />
                </label>
                <span className="toggle-label">Enable Gift Card</span>
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

export default GiftLayout;
