import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function BasicExample() {
  const [logeedIn, setLoggedIn] = useState(
    localStorage.getItem("user_id") !== null
  );
  const [profiledata,setProfileData] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);
  useEffect(() => {
    const dataObject = {
      user_id:localStorage.getItem("user_id")
    }
      axios
      .post("http://localhost:8081/postowner", dataObject)
      .then((res) => {
        setProfileData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    }, []);
  return (
    <>
      <div
        style={{
          display: localStorage.getItem("role") === "admin" ? "flex" : "none",
        }}
      >
        <Navbar
          expand="lg"
          className="bg-body-primary"
          style={{
            paddingLeft: "0",
            paddingRight: "0",
            background: "transparent",
            width: "100%",
          }}
        >
          <Container style={{ margin: "15px", padding: 0 }}>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Link className="btn btn-light mx-2" to="/">
                  Home
                </Link>
              </Nav>
              <Nav className="me-auto">
                <Link className="btn btn-light mx-2" to="/menu">
                  Shopping
                </Link>
              </Nav>
              <Nav className="me-auto">
                <Link className="btn btn-light mx-2" to="/users">
                  Users
                </Link>
              </Nav>
              <Nav className="me-auto">
                <Link className="btn btn-light mx-2" to="/posts">
                  Post
                </Link>
              </Nav>
              <Nav className="me-auto">
                <Link className="btn btn-light mx-2" to="/products">
                  Products
                </Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>
      <nav
        className="navbar"
        style={{
          display:
            localStorage.getItem("role") === "user" ||
            localStorage.getItem("role") === null
              ? "flex"
              : "none",
        }}
      >
        <Link className="logo" to="/" style={{ textDecoration: "none" }}>
          Tabster
        </Link>
        <div className="nav-actions">
          <button
            className="nav-btn"
            disabled={localStorage.getItem("user_id") === null}
            style={{
              cursor:
                localStorage.getItem("user_id") === null
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            🛒 Cart
          </button>
          <Link
            className="nav-btn"
            to="/login-signup"
            style={{ display: logeedIn ? "none" : "block" }}
          >
            Sign In
          </Link>
          <div
          style={{ display: logeedIn ? "block" : "none" }}
            className="nav-btn profile-dropdown-wrapper"
            onClick={toggleDropdown}
            onMouseLeave={closeDropdown}
          >
            <i className="fa-solid fa-user"></i> Profile
            <div className={`profile-dropdown ${dropdownOpen ? "show" : ""}`}>
              <div className="profile-info">
                <strong>
                  {profiledata.First_Name + profiledata.Last_Name || "..."}
                </strong>
                <small>
                  {profiledata.Email || "..."}
                </small>
                <small>
                  {profiledata.Phone_No || "..."}
                </small>
              </div>
              <hr />
              <button
                className="logout-btn"
                onClick={() => {
                  localStorage.clear();
                  setLoggedIn(false)
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default BasicExample;
