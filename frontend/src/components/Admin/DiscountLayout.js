import React from "react";
import Navbar from "../Content/Navbar";
import DiscountContent from "./DiscountContent";
import { useNavigate } from "react-router-dom";

function DiscountLayout() {
  const navigate = useNavigate();
  ;
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
                      Manage <b>Discounts</b>
                    </h2>
                  </div>
                  <div
                    className="col-sm-6 d-flex"
                    style={{ flexDirection: "row-reverse" }}
                  >
                    <button
                      style={{ width: "200px" }}
                      className="btn btn-success mx-3"
                      onClick={() => {
                        navigate("/adddiscount")
                      }}
                      data-toggle="modal"
                    >
                      <i className="material-icons"></i>
                      <span>Create Discount</span>
                    </button>
                  </div>
                </div>
              </div>
              {<DiscountContent />}

              <div id="modals"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DiscountLayout;
