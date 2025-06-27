import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";

function Products() {
  const [data, setData] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:8081/products")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <>
    
      <Navbar />
      <div className="container">
        {data.map((data, i) => (
          <div className="card">
            <div className="card-img">
              <h5>{data.title}</h5>
              <img
                src={`http://localhost:8081/images/${data.image}`}
                alt="Butter Caramel Pecan"
                height={100}
                width={100}
              />
              <span className="badge">Sale</span>
            </div>
            <br />
            <h3>{data.description}</h3>
            <div className="nutrition"></div>
            <p className="price">${data.price}</p>
            <button className="btn">🛒 ADD TO CART</button>
          </div>
        ))}
      </div>
    </>
  );
}

export default Products;
