import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";

function Products() {
  const [data, setData] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [loadData, setLoadData] = useState(0);
  const [openCart,setOpenCart] = useState(false)
  useEffect(() => {
    axios
      .get("http://localhost:8081/products")
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));

    const userId = localStorage.getItem("user_id");

    if (userId) {
      const userObject = {
        user_id:userId
      }
      axios
        .post("http://localhost:8081/carts", userObject)
        .then((res) => {

          setCartData(res.data)
        })
        .catch((err) => console.log(err));
    } else {
      const guestCart = JSON.parse(localStorage.getItem("cart")) || {};
      setCartData(Object.values(guestCart));
    }
  }, [loadData]);

  const handleAddCart = (data) => {
    setOpenCart(false)
    if (localStorage.getItem("user_id") === null) {
      let cart = JSON.parse(localStorage.getItem("cart")) || {};

      if (cart[data.id]) {
        cart[data.id].quantity += 1;
      } else {
        cart[data.id] = {
          product_id: data.id,
          title: data.title,
          quantity: 1,
          price: data.price,
        };
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      setCartData(Object.values(cart)); 
      setLoadData((prev) => prev + 1);
      setOpenCart(true)
      return; // Stop here, don't call the backend
    }
    const dataObject = { ...data };
    dataObject.user_id = localStorage.getItem("user_id");
    dataObject.quantity = 1;
    const userId = localStorage.getItem("user_id");
    axios
      .post("http://localhost:8081/api/addcart", dataObject)
      .then((response) => {
        setLoadData((prev) => prev + 1);
        setOpenCart(true)
      })
      .catch((error) => {
        console.log(error);
      });
    if (userId) {
      const userObject = {
        user_id:userId
      }
      axios
        .post("http://localhost:8081/carts", userObject)
        .then((res) => {
          setCartData(res.data)
          setOpenCart(true)
        })
        .catch((err) => console.log(err));
    }
  };
  const handleQuantity = (product_id, quantity) => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      let cart = JSON.parse(localStorage.getItem("cart")) || {};

      if (cart[product_id]) {
        cart[product_id].quantity += quantity;
        if (cart[product_id].quantity <= 0) {
          delete cart[product_id];
        }
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      setCartData(Object.values(cart));
      setLoadData((prev) => prev + 1);
      return;
    }
    const dataObject = {
      product_id: product_id,
      quantity: quantity,
      user_id: localStorage.getItem("user_id"),
    };
    axios
      .post("http://localhost:8081/api/quantity", dataObject)
      .then((responce) => {
        console.log("Responce :", responce.data);
        setLoadData((prev) => prev + 1);
      })
      .catch((error) => {
        console.log(error);
      });
    if (userId) {
      const userObject = {
        user_id:userId
      }
      axios
        .post("http://localhost:8081/carts", userObject)
        .then((res) => {

          setCartData(res.data)
        })
        .catch((err) => console.log(err));
    }
  };
  return (
    <>
      <Navbar loadData={loadData} setLoadData={setLoadData} openCart={openCart} />
      <div className="container">
        {data.map((data, i) => (
          <div className="card" key={i}>
            <div className="card-img">
              <h5>{data.title}</h5>
              <img
                src={`http://localhost:8081/images/${data.image}`}
                alt="Product"
                height={100}
                width={100}
              />
              {/* <span className="badge">Sale</span> */}
            </div>
            <h3>{data.description}</h3>
            <div className="nutrition"></div>
            <p className="price">${data.price}</p>
            <button
              className="btn"
              style={{
                display:
                  cartData.find(
                    (product) =>
                      product.product_id === data.id &&
                      cartData.find(
                        (product) =>
                          product.quantity !== 0 &&
                          product.product_id === data.id
                      )
                  ) || localStorage.getItem("role") === "admin"
                    ? "none"
                    : "block",
                height: "55.19px",
              }}
              onClick={() => {
                handleAddCart(data);
              }}
            >
              🛒 ADD TO CART
            </button>
            <div
              style={{
                display:
                  cartData.find(
                    (product) =>
                      product.product_id === data.id &&
                      cartData.find(
                        (product) =>
                          product.quantity !== 0 &&
                          product.product_id === data.id
                      )
                  )
                    ? "flex"
                    : "none",
                backgroundColor: "#a3d9b1",
                borderRadius: "10px",
                justifyContent: "space-between",
              }}
              role="group"
              aria-label="Default button group"
            >
              <button
                type="button"
                className="btn"
                onClick={() => {
                  handleQuantity(data.id, -1);
                }}
              >
                <i className="fa-solid fa-minus"></i>
              </button>
              {(() => {
                const product = cartData.find(
                  (product) => product.product_id === data.id
                );
                return (
                  <strong
                    type="button"
                    className="price"
                    style={{ width: "250px" }}
                  >
                    {product ? product.quantity : "0"}
                  </strong>
                );
              })()}
              <button
                type="button"
                className="btn"
                onClick={() => {
                  handleQuantity(data.id, +1);
                }}
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Products;
