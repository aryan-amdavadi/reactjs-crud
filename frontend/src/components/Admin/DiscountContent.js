import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DiscountContent() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [discountData, setDiscountData] = useState({});
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  useEffect(() => {
    axios
      .get("http://localhost:8081/discounts")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleDelete = (data) => {
    setDiscountData(data);
  };
  const handleDeleteContent = () => {
    axios
      .delete("http://localhost:8081/api/deletediscount", {
        data: { discount_id: discountData.id },
      })
      .then((responce) => {
        console.log("Responce :", responce.data);
      })
      .catch((error) => {
        console.log(error);
      });
    axios
      .get("http://localhost:8081/discounts")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    setModalDeleteOpen(false);
  };

  const handleInspect = (data) => {
    setDiscountData(data);
  };

  return (
    <>
      <table className="table table-striped table-hover table-animated">
        <thead>
          <tr>
            <th width="100px">Id</th>
            <th width="300px">Code</th>
            <th width="200px">State</th>
            <th width="200px">Type</th>
            <th width="200px">Value</th>
            <th width="200px">Start date</th>
            <th width="200px">End Date</th>
            <th width="200px">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((data, i) => (
            <tr key={i}>
              <td>{data.id}</td>
              <td>{data.code}</td>
              <td>
                {data.enabled === 1 ? (
                  <i className="fa-solid fa-check"></i>
                ) : (
                  <i className="fa-solid fa-xmark"></i>
                )}
              </td>
              <td>{data.type}</td>
              <td>{data.value}</td>
              <td>{new Date(data.start_date).toLocaleDateString("en-GB")}</td>
              <td>
                {data.end_date === null
                  ? "N/A"
                  : new Date(data.end_date).toLocaleDateString("en-GB")}
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
                      state={{ message: data.Emp_Id }}
                      style={{ border: "none", background: "transparent" }}
                      className="delete mx-1"
                      data-toggle="modal"
                      onClick={() => {
                        handleInspect(data);
                        setInspectModalOpen(true);
                      }}
                    >
                      <i
                        className="material-icons"
                        data-toggle="tooltip"
                        title="inspect"
                      >
                        <i className="fa-regular fa-eye"></i>
                      </i>
                    </button>
                    <button
                      id={data.id}
                      state={{ message: data }}
                      style={{ border: "none", background: "transparent" }}
                      href="#editpostModal"
                      className="edit mx-1"
                      onClick={() => {
                        navigate("/adddiscount", {
                          state: {
                            discount_data: data,
                            handle: "edit",
                          },
                        });
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
      {inspectModalOpen && (
        <>
          <Modal show={true} size="lg" dialogClassName="extraLarge">
            <Modal.Body>
              <div className="header-bar d-flex">
                <div className="container">
                  <span href="/" className="back fs-4">
                    {discountData.code}
                  </span>
                </div>
                <button
                  className="btn btn-outline-primary mx-3"
                  onClick={() => {
                    setInspectModalOpen(false);
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
                      justifyContent: "space-evenly",
                    }}
                  >
                    <div className="mx-3">
                      <h3>Code</h3>
                      <p>{discountData.code}</p>
                      <h3>Enabled</h3>
                      <p>
                        {discountData.enabled === 1 ? (
                          <i className="fa-solid fa-check"></i>
                        ) : (
                          <i className="fa-solid fa-xmark"></i>
                        )}
                      </p>
                      <h3>Discount Type</h3>
                      <p>{discountData.type}</p>
                      <h3>Usage Count</h3>
                      <p>{discountData.usage_count}</p>
                    </div>
                    <div className="mx-3" style={{ marginRight: "45px" }}>
                      <h3>Start Date</h3>
                      <p>
                        {new Date(discountData.start_date).toLocaleDateString(
                          "en-GB"
                        )}
                      </p>
                      <h3>End Date</h3>
                      <p>
                        {discountData.end_date === null
                          ? "N/A"
                          : new Date(discountData.end_date).toLocaleDateString(
                              "en-GB"
                            )}
                      </p>
                      <h3>Discount Value</h3>
                      <p>
                        {discountData.type === "percent"
                          ? discountData.value + "%"
                          : discountData.value + "₹"}
                      </p>
                      <h3>Usage Limit</h3>
                      <p>{discountData.usage_limit}</p>
                    </div>
                  </div>
                  <div
                    className="card info-card d-flex"
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <div className="mx-3">
                      <h3>New Customer Only</h3>
                      <p>
                        {discountData.new_customers_only === 1 ? (
                          <i className="fa-solid fa-check"></i>
                        ) : (
                          <i className="fa-solid fa-xmark"></i>
                        )}
                      </p>
                      <h3>One Use Per Customer</h3>
                      <p>
                        {discountData.one_per_customer === 1 ? (
                          <i className="fa-solid fa-check"></i>
                        ) : (
                          <i className="fa-solid fa-xmark"></i>
                        )}
                      </p>
                      <h3>Requirement Type</h3>
                      <p>{discountData.requirement_type}</p>
                      <h3>Requirement Value</h3>
                      <p>
                        {discountData.requirement_value === null
                          ? "N/A"
                          : discountData.requirement_value}
                      </p>
                    </div>
                    <div className="mx-3" style={{ marginRight: "45px" }}>
                      <h3>Product Scope</h3>
                      <p>{discountData.product_scope}</p>
                      <h3>Products Id's</h3>
                      <p>
                        {discountData.product_ids === null
                          ? "N/A"
                          : JSON.parse(discountData.product_ids).map(
                              (value) => value + ", "
                            )}
                      </p>
                      <h3>User Scope</h3>
                      <p>{discountData.user_scope}</p>
                      <h3>User Id's</h3>
                      <p>
                        {discountData.user_ids === null
                          ? "N/A"
                          : JSON.parse(discountData.user_ids).map(
                              (value) => value + ", "
                            )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        </>
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

export default DiscountContent;
