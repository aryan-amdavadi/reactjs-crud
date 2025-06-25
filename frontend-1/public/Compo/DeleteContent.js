import React from 'react'
import Modal from "react-bootstrap/Modal";
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from "axios";

function DeleteContent() {
  const location = useLocation();
  const EmployeeId = location.state?.message;
  const handleDeleteContent = () => {
    const DataObject = {
      Emp_Id:EmployeeId
    }
    console.log(DataObject)
    axios
    .delete("http://localhost:8081/api/deleteemployee", {
      data:DataObject
    })
    .then((responce) => {
      console.log("Responce :", responce.data);
    })
    .catch((error) => {
      console.log(error);
    });
  }
  return (
    <Modal show={true}>
      <Modal.Header>
          <div>
            Delete Data.
          </div>
          <div>
            <Link type="button" to='/' className="btn btn-light">X</Link>
          </div>
      </Modal.Header>
      <Modal.Body>
        Remember It Cannot Be Backuped.
      </Modal.Body>
      <Modal.Footer>
        <Link type="button" to="/" onClick={handleDeleteContent} className="btn btn-outline-danger">Delete</Link>
      </Modal.Footer>
    </Modal>
  )
}

export default DeleteContent
