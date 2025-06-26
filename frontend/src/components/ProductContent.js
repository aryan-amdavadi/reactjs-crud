import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";
import Comments from "./Comments";

function ProductContent(props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [inspectPageOpen, setInspectPageOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [data,setData] = useState({})
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("");
  const [postData, setPostData] = useState({});
  const [postOwner, setPostOwner] = useState({
    First_Name: "",
    Last_Name: "",
    Email: "",
    Phone_No: "",
    Image: "",
  });


  // Handler stubs (replace with your actual logic)
  const handleEdit = (data) => {
    setPostData(data);
    setTitle(data.title);
    setDescription(data.description);
    setUserId(data.user_id);
    setStatus(data.status);
    setImage(data.image);
  };
  const handleDelete = (data) => {
    setPostData(data);
  };
  const handleDeleteContent = () => {
    setModalDeleteOpen(false);
  };
  const handleInspect = (data) => {
    setPostData(data);
    setTitle(data.title);
    setDescription(data.description);
    setStatus(data.status);
    setUserId(data.user_id);
    setPostOwner({
      First_Name: "John",
      Last_Name: "Doe",
      Email: "john@example.com",
      Phone_No: "1234567890",
      Image: "default.jpg",
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setModalOpen(false);
  };
  const handleImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <>
      <table
        className="table table-striped table-hover"
        style={!props.show ? { display: "none" } : { display: "inline-table" }}
      >
        <thead>
          <tr>
            <th width="100px">Id</th>
            <th width="200px">Title</th>
            <th width="300px">Description</th>
            <th width="100px">Image</th>
            <th width="100px">Price</th>
            <th width="200px">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((data, i) => (
            <tr key={i}>
              <td>{data.id}</td>
              <td>{data.title}</td>
              <td>{data.description}</td>
              <td>
                <img
                  src={`http://localhost:8081/images/${data.image}`}
                  alt={`Shot Of ${data.FirstName}`}
                  style={{ border: "2px solid black", borderRadius: "10px" }}
                  height={100}
                  width={100}
                />
              </td>
              <td>{data.price}</td>
              <td>
                <div className="d-flex">
                  <div>
                    <button
                      id={data.id}
                      state={{ message: data.Emp_Id }}
                      style={{ border: "none", background: "transparent" }}
                      className="delete mx-1"
                      onClick={() => {
                        setInspectPageOpen(true);
                        handleInspect(data);
                        setPostData(data);
                      }}
                      data-toggle="modal"
                    >
                      <i
                        className="material-icons"
                        data-toggle="tooltip"
                        title="inspect"
                      >
                        <i className="fa-regular fa-eye"></i>
                      </i>
                    </button>
                  </div>
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
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <Modal.Body>
              <div className="mb-3">
                <label htmlFor="User_Id" className="form-label">
                  Post Id
                </label>
                <input
                  type="number"
                  name="user_id"
                  className="form-control"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                  }}
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
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
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
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                  name="description"
                  placeholder="Description"
                  required
                />
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
                  src={`http://localhost:8081/images/${postData.image}`}
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
      {inspectPageOpen && (
        <>
          <Modal show={true} size="lg" dialogClassName="extraLarge">
            <ModalBody width="100px">
              <div className="header-bar d-flex">
                <div className="container">
                  <span href="/" className="back fs-4">
                    {title}
                  </span>
                </div>
                <button
                  className="btn btn-outline-primary mx-3"
                  onClick={() => {
                    setInspectPageOpen(false);
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="container main">
                <div className="top-section">
                  <div className="card info-card">
                    <h3>Title</h3>
                    <p>{title}</p>
                    <h3>Description</h3>
                    <p>{description}</p>
                    <h3>Status</h3>
                    <p className="status active">{status}</p>
                  </div>

                  <div
                    className="card info-card d-flex"
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className="mx-3">
                      <h3>Name</h3>
                      <p>
                        {postOwner.First_Name} {postOwner.Last_Name}
                      </p>
                    </div>
                    <div className="mx-3" style={{ marginRight: "45px" }}>
                      <h3>Profile Picture</h3>
                      <img
                        src={`http://localhost:8081/images/${postOwner.Image}`}
                        alt={"profile Pic"}
                        height="100"
                        width="100"
                        style={{
                          border: "2px solid black",
                          borderRadius: "5px",
                        }}
                      />
                    </div>
                  </div>
                  <Comments postID={userId} />
                </div>
              </div>
            </ModalBody>
          </Modal>
        </>
      )}
    </>
  );
}

export default ProductContent;
