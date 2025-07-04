import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ShippingContent(props) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [id, setId] = useState();
  const [shippingFee, setShippingFee] = useState("");
  const [data, setData] = useState([]);
  const [name, setName] = useState("");
  const [postCode, setPostCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [threshold, setThreshold] = useState("");
  const [productData, setProductData] = useState({});
  useEffect(() => {
    if (props.show) {
      axios
        .get("http://localhost:8081/shipping")
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
    setShippingFee(data.shipping_cost);
    setName(data.name);
    setCity(data.city);
    setPostCode(data.postcode);
    setThreshold(data.shipping_threshold);
    setState(data.state);
  };
  const handleDelete = (data) => {
    setProductData(data);
  };
  const handleDeleteContent = () => {
    const dataObject = {
      id: productData.id,
    };
    axios
      .delete("http://localhost:8081/api/deleteshipping", {
        data: dataObject,
      })
      .then((responce) => {
        console.log("Responce :", responce.data);
        navigate("/shipping");
      })
      .catch((error) => {
        console.log(error);
      });
    axios
      .get("http://localhost:8081/shipping")
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
    const formData = {
      name: e.target.name.value,
      city: e.target.city.value,
      postCode: e.target.postCode.value,
      state: e.target.state.value,
      threshold: e.target.threshold.value,
      shippingFee: e.target.shippingFee.value,
      id: id,
    };
    axios
      .post("http://localhost:8081/api/editshipping", formData)
      .then((res) => {
        console.log("Response:", res.data)
        navigate("/shipping");
    })
      .catch((err) => console.error("Error:", err));
    setModalOpen(false);
    axios
      .get("http://localhost:8081/shipping")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    
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
            <th width="300px">Name</th>
            <th width="200px">City</th>
            <th width="200px">Post Code</th>
            <th width="200px">State</th>
            <th width="200px">Threshold</th>
            <th width="200px">Shipping Fees</th>
            <th width="200px">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((data, i) => (
            <tr key={i}>
              <td>{data.id}</td>
              <td>{data.name}</td>
              <td>{data.city}</td>
              <td>{data.postcode}</td>
              <td>{data.state}</td>
              <td>{data.shipping_threshold}</td>
              <td>{data.shipping_cost}</td>
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
                        city="Edit"
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
                        city="Delete"
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
          <form onSubmit={handleSubmit} id="details">
            <Modal.Body>
              <div className="mb-3">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  name="name"
                  placeholder="name"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="city" className="form-label">
                  City
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="city"
                  name="city"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                  }}
                  placeholder="city"
                  required
                />
              </div>

              <div className="mb-3 my-3" id="postCodeDiv">
                <label htmlFor="formFile" className="form-label">
                  Postal Code
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="postCode"
                  name="postCode"
                  value={postCode}
                  onChange={(e) => {
                    setPostCode(e.target.value);
                  }}
                  placeholder="Postal Code"
                  required
                />
              </div>
              <div className="mb-3 my-3" id="postCodeDiv">
                <label htmlFor="formFile" className="form-label">
                  State
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="state"
                  name="state"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                  }}
                  placeholder="State"
                  required
                />
              </div>
              <div className="mb-3 my-3" id="postCodeDiv">
                <label htmlFor="formFile" className="form-label">
                  Shipping Address
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="threshold"
                  name="threshold"
                  value={threshold}
                  onChange={(e) => {
                    setThreshold(e.target.value);
                  }}
                  placeholder="Shipping Threshold"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="city" className="form-label">
                  shippingFee
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="shippingFee"
                  name="shippingFee"
                  value={shippingFee}
                  onChange={(e) => {
                    setShippingFee(e.target.value);
                  }}
                  placeholder="shippingFee"
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
    </>
  );
}

export default ShippingContent;
