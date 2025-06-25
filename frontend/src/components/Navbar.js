import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";

function BasicExample() {
  return (
    <div>
    <Navbar
      expand="lg"
      className="bg-body-primary"
      style={{ paddingLeft: "0", paddingRight: "0", background:"transparent" }}
    >
      <Container style={{ margin: "15px" }}>
        <Link className="btn btn-light mx-2" style={{fontSize:"larger", background:"transparent" }}>MyStudents Data</Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link  className="btn btn-light mx-2" to="/users">Users</Link>
          </Nav>
          <Nav className="me-auto">
            <Link  className="btn btn-light mx-2" to="/posts">Post</Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </div>
  );
}

export default BasicExample;
