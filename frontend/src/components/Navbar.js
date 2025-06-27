import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";

function BasicExample() {
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
        <Link className="logo" to="/" style={{textDecoration:'none'}}>Tabster</Link>
        <div className="nav-actions">
          <button
            className="nav-btn"
            disabled={localStorage.getItem("user_id") === null ? true : false}
            style={{cursor:localStorage.getItem("user_id") === null?"not-allowed":"pointer"}}
          >
            🛒 Cart
          </button>
          <Link className="nav-btn" to="/login-signup">
            Sign In
          </Link>
        </div>
      </nav>
    </>
  );
}

export default BasicExample;
