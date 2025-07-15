import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import axios from "axios";

function GiftContent(props) {
  const user_id = localStorage.getItem("user_id");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [id, setId] = useState();
  const [data, setData] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [searchUserData, setSearchUserData] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  //   const [price, setPrice] = useState("");
  //   const [description, setDescription] = useState("");
  //   const [title, setTitle] = useState("");
  const [cardData, setCardData] = useState({
    code: "",
    enabled: "",
    expiry_date: "",
    id: "",
    user_id: "",
    value: "",
  });
  useEffect(() => {
    if (props.show) {
      axios
        .get("http://localhost:8081/giftcard")
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [props.show]);
  const handleUserSelect = (user) => {
    const exists = selectedUsers.find((u) => u.Emp_Id === user.Emp_Id);
    if (!exists) {
      setSelectedUsers((prev) => [...prev, user]);
    }

    setUserQuery("");
    setSearchUserData([]);
  };
  const handleEdit = (card) => {
    loadUsersByIds(JSON.parse(card.user_id));
    setCardData({
      code: card.code || "",
      enabled: card.enabled || "",
      expiry_date: card.expiry_date || "",
      id: card.id || "",
      user_id: card.user_id || "",
      value: card.value || "",
    });
  };

  const handleDelete = (data) => {
    setId(data.id);
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
  const handleDeleteContent = () => {
    const DataObject = {
      id: cardData.id,
    };
    axios
      .delete("http://localhost:8081/api/deletecard", {
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
      .get("http://localhost:8081/giftcard")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    setModalDeleteOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const empIds = selectedUsers.map(emp => emp.Emp_Id);
    axios
      .post("http://localhost:8081/api/editcard", {...cardData,user_id:JSON.stringify(empIds)})
      .then((responce) => {
        console.log("Responce :", responce.data);
      })
      .catch((error) => {
        console.log(error);
      });

    axios
      .get("http://localhost:8081/giftcard")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    setModalOpen(false);
  };
  const loadUsersByIds = async (userIds) => {
    try {
      const res = await axios.post("http://localhost:8081/api/getusersbyids", {
        ids: userIds,
      });
      setSelectedUsers(res.data);
    } catch (error) {
      console.error("Failed to load users by IDs:", error);
    }
  };
  return (
    <>
      <table
        className="table table-striped table-hover table-animated"
        style={!props.show ? { display: "none" } : { display: "inline-table" }}
      >
        <thead>
          <tr>
            <th width="100px">Id</th>
            <th width="200px">Code</th>
            <th width="200px">Value</th>
            <th width="200px">User Id's</th>
            <th width="150px">Expiry Date</th>
            <th width="150px">Enabled</th>
            <th width="200px">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((data, i) => (
            <tr key={i}>
              <td>{data.id}</td>
              <td>{data.code}</td>
              <td>{data.value}</td>
              <td>
                {data.user_id === null
                  ? "N/A"
                  : JSON.parse(data.user_id).map((value) => value + ", ")}
              </td>
              <td>{new Date(data.expiry_date).toLocaleDateString("en-GB")}</td>
              <td>
                {data.enabled === 1 ? (
                  <i className="fa-solid fa-check"></i>
                ) : (
                  <i className="fa-solid fa-xmark"></i>
                )}
              </td>
              <td>
                <div className="d-flex">
                  <div
                    style={{
                      display:
                        data.emp_id ===
                          Number(localStorage.getItem("user_id")) ||
                        localStorage.getItem("role") === "admin"
                          ? "block"
                          : "none",
                    }}
                  >
                    <button
                      id={data.id}
                      state={{ message: data }}
                      style={{ border: "none", background: "transparent" }}
                      href="#editpostModal"
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
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            id="details"
          >
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

export default GiftContent;
