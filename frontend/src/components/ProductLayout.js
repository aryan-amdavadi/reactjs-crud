import React, { useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import ProductContent from "./ProductContent";

function ProductLayout() {
  const [tableOpen, setTableOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [image, setImage] = useState();
  const handleImage = (e) => {
    document.getElementById("imagePreview").style.display = "block";
    setImage(URL.createObjectURL(e.target.files[0]));
    document.getElementById("imageDiv").style.display = "none";
  };
  const handleSubmit = (e) => {
    setTableOpen(false)
    e.preventDefault();
    const formData = new FormData(e.target);
    axios
      .post("http://localhost:8081/api/addproduct", formData)
      .then((responce) => {
        console.log("Responce :", responce.data);
        setTableOpen(true);
      })
      .catch((error) => {
        console.log(error);
      });
    setModalOpen(false);
    setTimeout(()=>{
      setTableOpen(true)
    },1)
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
                      Manage <b>Products</b>
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
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>
              </div>
              {<ProductContent show={tableOpen} />}

              {modalOpen && (
                <Modal show={true}>
                  <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <Modal.Header>
                      <div>Enter The Details Of Product</div>
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
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Price
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="price"
                          name="price"
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
              <div id="modals"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductLayout;
