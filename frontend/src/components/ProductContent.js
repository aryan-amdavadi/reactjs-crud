import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";
import axios from "axios";


function ProductContent(props) {
  const user_id = localStorage.getItem("user_id");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [inspectPageOpen, setInspectPageOpen] = useState(false);
  const [id, setId] = useState();
  const [price, setPrice] = useState("");
  const [data, setData] = useState([]);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [productData, setProductData] = useState({});
  const [postOwner, setPostOwner] = useState({
    First_Name: "",
    Last_Name: "",
    Email: "",
    Phone_No: "",
    Image: "",
  });
  useEffect(() => {
    if (props.show) {
      axios
        .get("http://localhost:8081/products")
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [props.show]);

  const handleEdit = (data) => {
    setId(data.id);
    setProductData(data);
    setPrice(data.price);
    setDescription(data.description);
    setTitle(data.title);
    setImage(data.image);
  };
  const handleDelete = (data) => {
    setProductData(data);
  };
  const handleDeleteContent = () => {
    const DataObject = {
      id: productData.id,
    };
    axios
      .delete("http://localhost:8081/api/deleteproduct", {
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
      .get("http://localhost:8081/products")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    setModalDeleteOpen(false);
  };
  const handleInspect = (data) => {
    const dataObject = {
      user_id: user_id,
    };
    axios
      .post("http://localhost:8081/postowner", dataObject)
      .then((res) => {
        setPostOwner(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    setProductData(data);
    setPrice(data.price);
    setDescription(data.description);
    setTitle(data.title);
    setImage(data.image);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("id", id);
    axios
      .post("http://localhost:8081/api/editproduct", formData)
      .then((responce) => {
        console.log("Responce :", responce.data);
      })
      .catch((error) => {
        console.log(error);
      });

    axios
      .get("http://localhost:8081/products")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    setModalOpen(false);
  };
  const handleImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
      document.getElementById("initialImage").style.display = "none";
      document.getElementById("changedImage").style.display = "block";
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
                        setProductData(data);
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
                  src={`http://localhost:8081/images/${productData.image}`}
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
              <div className="mb-3">
                <label htmlFor="Title" className="form-label">
                  Price
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  name="price"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                  }}
                  placeholder="Price"
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
                  <div
                    className="card info-card d-flex"
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h3>Title</h3>
                      <p>{title}</p>
                      <h3>Price</h3>
                      <p>{price}</p>
                      <h3>Description</h3>
                      <p>{description}</p>
                    </div>
                    <div>
                      <img
                        src={`http://localhost:8081/images/${image}`}
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
                      <h3>Email</h3>
                      <p>{postOwner.Email}</p>
                      <h3>Phone Number</h3>
                      <p>{postOwner.Phone_No}</p>
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
