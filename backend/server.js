const express = require("express");
require("dotenv").config();
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const { isDate } = require("util");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "student_db",
});

db.connect((err) => {
  if (err) {
    return console.error("MySQL Error:", err);
  }
  console.log("Connected to MySQL.");
});

app.use("/images", express.static(path.join(__dirname, "public/images")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images"),
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => res.json("From Backend"));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extname: ".hbs",
      defaultLayout: false,
    },
    viewPath: path.resolve(__dirname, "template"),
    extName: ".hbs",
  })
);

async function sendResetPasswordMail(toEmail) {
  const resetLink = `http://localhost:3000/resetpassword?email=${toEmail}`;

  const mailOptions = {
    from: process.env.EMAIL,
    to: toEmail,
    subject: "Reset Password for Tabster",
    template: "resetPassword",
    context: { resetLink, year: new Date().getFullYear() },
  };
  await transporter.sendMail(mailOptions);
}

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    await sendResetPasswordMail(email);
    res.status(200).json({ message: "Password reset mail sent!" });
  } catch (error) {
    console.error("Error sending reset mail:", error);
    res.status(500).json({ message: "Error sending mail", error });
  }
});

app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount < 100) {
    // ❗ Return here to stop execution
    return res.status(400).send({
      error: "Amount must be at least ₹1 (100 paise) to create payment intent.",
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).send({ error: err.message });
  }
});

app.post("/create-refund-intent", async (req, res) => {
  const { payment_intent_id, amount } = req.body;

  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment_intent_id,
      amount: Math.round(amount * 100),
    });

    res.json({ success: true, refund });
  } catch (error) {
    console.error("Refund error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/save-payment-intent", (req, res) => {
  const { order_id, payment_intent_id, amount_paid, refund_amount } = req.body;

  const query = `INSERT INTO order_payments (order_id, payment_id, amount, refunded_amount) VALUES(?,?,?,?)`;

  db.query(
    query,
    [order_id, payment_intent_id, amount_paid, refund_amount],
    (err, result) => {
      if (err) {
        console.error("Error saving intent ID:", err);
        return res.status(500).json({ success: false, message: "DB error" });
      }
      res.json({ success: true, message: "Payment intent saved" });
    }
  );
});

// Get users
app.get("/users", (req, res) => {
  const sql = "select * from emp";
  db.query(sql, (error, data) =>
    error ? res.status(500).json(error) : res.json(data)
  );
});

// Get posts
app.get("/posts", (req, res) => {
  const sql = "select * from posts";
  db.query(sql, (error, data) =>
    error ? res.status(500).json(error) : res.json(data)
  );
});

// Get comments
app.get("/comments", (req, res) => {
  const sql = "select * from comments";
  db.query(sql, (error, data) =>
    error ? res.status(500).json(error) : res.json(data)
  );
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM emp WHERE Email = ? AND password = ?";
  db.query(sql, [email, password], (error, results) => {
    if (error) return res.status(500).json({ error });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });
    res.status(200).json(results[0]);
  });
});

//using Emp_Id
app.post("/postowner", (req, res) => {
  const user_id = req.body.user_id;
  const sql = `SELECT * FROM emp WHERE Emp_Id = ${user_id}`;
  db.query(sql, (error, results) => {
    if (error) return res.status(500).json({ error });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });
    res.status(200).json(results[0]);
  });
});

//Get Cart
app.post("/carts", (req, res) => {
  const user_id = req.body.user_id;
  const sql = `select * from carts where user_id = ${user_id}`;
  db.query(sql, (error, data) =>
    error ? res.status(500).json(error) : res.json(data)
  );
});

//Get Products
app.get("/products", (req, res) => {
  const sql = "select * from products";
  db.query(sql, (error, data) =>
    error ? res.status(500).json(error) : res.json(data)
  );
});

//Get Shipping Address
app.get("/shipping", (req, res) => {
  const sql = "select * from shipping_locations";
  db.query(sql, (error, data) =>
    error ? res.status(500).json(error) : res.json(data)
  );
});

//Get Discounts
app.get("/discounts", (req, res) => {
  const sql = "select * from discounts";
  db.query(sql, (error, data) =>
    error ? res.status(500).json(error) : res.json(data)
  );
});

//Get Gift Card
app.get("/giftcard", (req, res) => {
  const sql = "select * from gift_card";
  db.query(sql, (error, data) =>
    error ? res.status(500).json(error) : res.json(data)
  );
});

//Get Orders
app.post("/api/orders", (req, res) => {
  const { user_id } = req.body;
  const sql = "SELECT * FROM orders WHERE user_id = ?";
  db.query(sql, [Number(user_id)], (error, results) => {
    if (error) return res.status(500).json({ error });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });
    res.status(200).json(results);
  });
});

//Get Gift Card
app.get("/giftcard", (req, res) => {
  const sql = "select * from gift_card";
  db.query(sql, (error, data) =>
    error ? res.status(500).json(error) : res.json(data)
  );
});

app.post("/discountdata", (req, res) => {
  const { user_id } = req.body;
  const sql = "SELECT * FROM order_discounts WHERE user_id = ?";
  db.query(sql, [Number(user_id)], (error, results) => {
    if (error) return res.status(500).json({ error });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });
    res.status(200).json(results);
  });
});

app.post("/orderdata", (req, res) => {
  const { order_id } = req.body;
  const sql = "SELECT * FROM order_items WHERE order_id = ?";
  db.query(sql, [Number(order_id)], (error, results) => {
    if (error) return res.status(500).json({ error });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });
    res.status(200).json(results);
  });
});

app.post("/api/getproductsbyids", (req, res) => {
  const { ids } = req.body;
  const sql = `SELECT id, title FROM products WHERE id IN (${ids})`;
  db.query(sql, (error, results) => {
    if (error) return res.status(500).json({ error });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });
    res.status(200).json(results);
  });
});

app.post("/api/getproductsname", (req, res) => {
  const { ids } = req.body;
  const sql = `SELECT id, title FROM products WHERE id = ${ids}`;
  db.query(sql, (error, results) => {
    if (error) return res.status(500).json({ error });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });
    res.status(200).json(results);
  });
});

app.post("/api/getusersbyids", (req, res) => {
  const { ids } = req.body;
  const sql = `SELECT Emp_Id, First_Name, Last_Name FROM emp WHERE Emp_Id IN (${ids})`;
  db.query(sql, (error, results) => {
    if (error) return res.status(500).json({ error });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });
    res.status(200).json(results);
  });
});

app.post("/api/getintentid", (req, res) => {
  const { order_id } = req.body;
  const sql = `SELECT payment_id FROM order_payments WHERE order_id = ${order_id}`;
  db.query(sql, (error, results) => {
    if (error) return res.status(500).json({ error });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });
    res.status(200).json(results);
  });
});

app.post("/timeframe", (req, res) => {
  const { city, post_code } = req.body;
  const sql =
    "SELECT * FROM shipping_locations WHERE city = ? AND postcode = ?";
  db.query(sql, [city, Number(post_code)], (error, results) => {
    if (error) return res.status(500).json({ error });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });
    res.status(200).json(results);
  });
});

app.post("/upload", upload.single("image"), (req, res) => {
  const image = req.file.filename;
});

app.post("/api/adddiscount", (req, res) => {
  const {
    discountCode,
    discountType,
    discountValue,
    applicableProducts,
    eligibleUsers,
    requirementType,
    requirementValue,
    startDate,
    endDate,
    usageLimit,
    onePerCustomer,
    newCustomersOnly,
    enabled,
  } = req.body;

  const productScope = Array.isArray(applicableProducts) ? "specific" : "all";
  const userScope =
    Array.isArray(eligibleUsers) && eligibleUsers.length > 0
      ? "specific"
      : "everyone";

  const product_ids =
    productScope === "specific" ? JSON.stringify(applicableProducts) : null;

  const user_ids =
    userScope === "specific" ? JSON.stringify(eligibleUsers) : null;

  const sql = `
    INSERT INTO discounts (
      code,
      type,
      value,
      product_scope,
      product_ids,
      user_scope,
      user_ids,
      requirement_type,
      requirement_value,
      start_date,
      end_date,
      usage_limit,
      one_per_customer,
      new_customers_only,
      enabled
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    discountCode,
    discountType,
    discountValue,
    productScope,
    product_ids,
    userScope,
    user_ids,
    requirementType,
    requirementValue,
    startDate,
    endDate || null,
    usageLimit || null,
    onePerCustomer,
    newCustomersOnly,
    enabled,
  ];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting discount:", err);
      return res.status(500).json({ error: "Failed to insert discount." });
    }
    res.json({
      message: "Discount created successfully.",
      discountId: result.insertId,
    });
  });
});

app.post("/api/addemployee", upload.single("image"), (req, res) => {
  //req.file => Image Details
  //req.body => Body Details
  const FirstName = req.body.first_name;
  const LastName = req.body.last_name;
  const Email = req.body.email;
  const PhoneNo = Number(req.body.phone_number);
  const Gender = req.body.gender;
  const Hobbies = req.body.hobbies;
  const Image = req.file.filename;
  const password = req.body.password;
  const addQuery = `insert into emp (First_Name, Last_Name, Email, Phone_No, Gender, Hobbies, Image,password) values('${FirstName}','${LastName}','${Email}',${PhoneNo},'${Gender}',
    '${Hobbies}','${Image}','${password}')`;
  db.query(addQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.post("/api/addpost", upload.single("image"), (req, res) => {
  //req.file => Image Details
  //req.body => Body Details
  const user_id = req.body.user_id;
  const title = req.body.title;
  const description = req.body.description;
  const image = req.file.filename;
  const emp_id = req.body.emp_id;
  const addQuery = `insert into posts (user_id,emp_id, title, description, image) values(${user_id},${emp_id},'${title}','${description}','${image}')`;
  db.query(addQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.post("/api/addcomment", (req, res) => {
  const comment = req.body.comment;
  const post_id = req.body.post_id;
  const user_id = req.body.user_id;
  const addQuery = `insert into comments (post_id , user_id , comment , date) values(${post_id},${user_id},'${comment}', NOW())`;
  db.query(addQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.post("/addgiftcard", (req, res) => {
  const code = req.body.code;
  const value = req.body.amount;
  const user_id = req.body.user_id;
  const addQuery = `INSERT INTO gift_card(code, value, user_id, expiry_date, enabled) VALUES('${code}',${value},'${user_id}',DATE_ADD(NOW(), INTERVAL 3 YEAR),1)`;
  db.query(addQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.post("/api/addproduct", upload.single("image"), (req, res) => {
  //req.file => Image Details
  //req.body => Body Details
  const title = req.body.title;
  const description = req.body.description;
  const image = req.file.filename;
  const price = req.body.price;
  const addQuery = `insert into products (title, description,price, image) values('${title}','${description}',${price},'${image}')`;
  db.query(addQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.post("/api/addshipping", (req, res) => {
  //req.file => Image Details
  //req.body => Body Details
  const name = req.body.name;
  const city = req.body.city;
  const post_code = Number(req.body.postCode);
  const state = req.body.state;
  const threshold = Number(req.body.threshold);
  const shipping_fee = Number(req.body.shippingFee);
  const addQuery = `insert into shipping_locations (name, city, postcode, state,shipping_threshold, shipping_cost) values('${name}','${city}',${post_code},'${state}',${threshold}, ${shipping_fee})`;
  db.query(addQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.post("/api/addcart", (req, res) => {
  //req.file => Image Details
  //req.body => Body Details
  const user_id = req.body.user_id;
  const product_id = req.body.id || req.body.product_id;
  const quantity = req.body.quantity;
  const price = req.body.price;
  const checkQuery =
    "SELECT * FROM carts WHERE user_id = ? AND giftcard_id IS NOT null";
  db.query(checkQuery, [user_id], (error, result) => {
    if (error) return res.status(500).json({ error: "DB error" });
    if (result.length === 0) {
      const addQuery = `insert into carts (user_id, product_id,price, quantity) values(${user_id},${product_id},${price},${quantity})`;
      db.query(addQuery, (error, data) => {
        if (error) return res.json(error);
        else return res.json(data);
      });
    }else {
      return res.status(200).json({
        message: "Clear the cart of Gift Card first.",
        items: "card",
      });
    }
  });
});

app.post("/api/addcredits", (req, res) => {
  const { code, user_id } = req.body;

  const searchQuery = `
    SELECT * FROM gift_card
    WHERE code = ? AND (expiry_date IS NULL OR expiry_date > NOW()) AND enabled = 1
  `;

  db.query(searchQuery, [code], (error, data) => {
    if (error) return res.status(500).json({ error: "DB error" });

    const giftCard = data[0];
    if (!giftCard)
      return res.status(404).json({ error: "Invalid or expired code" });

    const usersList = JSON.parse(giftCard.user_id || "[]");
    if (usersList.length > 0 && !usersList.includes(Number(user_id))) {
      return res
        .status(403)
        .json({ error: "You are not authorized to use this card." });
    }

    const updateCreditsQuery = `
      UPDATE emp SET credits = credits + ? WHERE Emp_Id = ?
    `;

    db.query(updateCreditsQuery, [giftCard.value, user_id], (err) => {
      if (err) return res.status(500).json({ error: "Credits not updated." });
      return res.json({ success: true, value: giftCard.value });
    });
  });
});

app.post("/api/giftcardcart", (req, res) => {
  const { giftCard, user_id } = req.body;

  const checkQuery =
    "SELECT * FROM carts WHERE user_id = ? AND product_id IS NOT NULL";
  db.query(checkQuery, [user_id], (error, result) => {
    if (error) return res.status(500).json({ error: "DB error" });

    if (result.length === 0) {
      const addGiftCardQuery = `
        INSERT INTO carts (user_id, giftcard_id, price, quantity)
        VALUES (?, ?, ?, ?)
      `;
      db.query(
        addGiftCardQuery,
        [user_id, giftCard.id, giftCard.value, 1],
        (insertErr) => {
          if (insertErr) return res.status(500).json({ error: insertErr });
          return res.status(200).json({ message: "Gift card added to cart." });
        }
      );
    } else {
      return res.status(200).json({
        message: "Clear the cart of products first.",
        items: "products",
      });
    }
  });
});

app.post("/api/addorder", (req, res) => {
  const {
    user_id,
    user_details,
    orderData,
    discount_code,
    discount_amount,
    amount_paid,
    time_frame,
    shipping_cost,
    notes,
    product_price,
  } = req.body;

  const addOrderQuery = `
    INSERT INTO orders (user_id, shipping_address, delivery_notes, shipping_method, shipping_cost, product_price, amount_paid)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    addOrderQuery,
    [
      user_id,
      user_details,
      notes,
      time_frame,
      shipping_cost,
      product_price,
      amount_paid,
    ],
    (error, result) => {
      if (error) return res.status(500).json({ error });

      const insertedOrderId = result.insertId;

      // If a discount was applied, insert and update usage count
      if (discount_code) {
        const discountQuery = `
          INSERT INTO order_discounts (order_id, user_id, code, amount)
          VALUES (?, ?, ?, ?)
        `;
        db.query(
          discountQuery,
          [insertedOrderId, user_id, discount_code, discount_amount],
          (error) => {
            if (error) {
              return res.status(500).json({
                error: "Failed to insert discount",
                detail: error,
              });
            }

            // Only update usage count if the discount has a limit
            const updateDiscountQuery = `
              UPDATE discounts 
              SET usage_count = usage_count + 1 
              WHERE code = ? AND usage_limit IS NOT NULL
            `;
            db.query(updateDiscountQuery, [discount_code], (err) => {
              if (err) {
                return res.status(500).json({
                  error: "Failed to update discount usage count",
                  detail: err,
                });
              }
            });
          }
        );
      }

      // Proceed to insert order items
      let completedInserts = 0;
      let hasError = false;

      if (orderData.length === 0) {
        return res.json({
          message: "Order inserted (no items)",
          order_id: insertedOrderId,
        });
      }

      for (let i = 0; i < orderData.length; i++) {
        const item = orderData[i];
        const orderItemsQuery = `
          INSERT INTO order_items (order_id, product_id, price, quantity)
          VALUES (?, ?, ?, ?)
        `;
        db.query(
          orderItemsQuery,
          [insertedOrderId, item.product_id, item.price, item.quantity],
          (err) => {
            if (hasError) return;
            if (err) {
              hasError = true;
              return res.status(500).json({
                error: "Failed to insert order items",
                detail: err,
              });
            }
            completedInserts++;
            if (completedInserts === orderData.length) {
              const clearCartQuery = `DELETE FROM carts WHERE user_id = ?`;
              db.query(clearCartQuery, [user_id], (clearErr) => {
                if (clearErr) {
                  return res.status(500).json({
                    success: false,
                    error: "Failed to clear cart",
                    detail: clearErr,
                  });
                }
                return res.json({
                  message: "Order and items inserted successfully",
                  order_id: insertedOrderId,
                  total_items: completedInserts,
                });
              });
            }
          }
        );
      }
    }
  );
});

app.post("/api/addcardorder", (req, res) => {
  const {
    user_id,
    orderData,
    amount_paid,
    card_price,
  } = req.body;

  const addOrderQuery = `
    INSERT INTO orders (user_id, product_price, amount_paid)
    VALUES (?, ?, ?)
  `;

  db.query(
    addOrderQuery,
    [
      user_id,
      card_price,
      amount_paid,
    ],
    (error, result) => {
      if (error) return res.status(500).json({ error });

      const insertedOrderId = result.insertId;

      let completedInserts = 0;
      let hasError = false;

      if (orderData.length === 0) {
        return res.json({
          message: "Order inserted (no items)",
          order_id: insertedOrderId,
        });
      }

      for (let i = 0; i < orderData.length; i++) {
        const item = orderData[i];
        const orderItemsQuery = `
          INSERT INTO order_items (order_id, card_id, price, quantity)
          VALUES (?, ?, ?, ?)
        `;
        db.query(
          orderItemsQuery,
          [insertedOrderId, item.giftcard_id, item.price, item.quantity],
          (err) => {
            if (hasError) return;
            if (err) {
              hasError = true;
              return res.status(500).json({
                error: "Failed to insert order items",
                detail: err,
              });
            }
            completedInserts++;
            if (completedInserts === orderData.length) {
              const clearCartQuery = `DELETE FROM carts WHERE user_id = ?`;
              db.query(clearCartQuery, [user_id], (clearErr) => {
                if (clearErr) {
                  return res.status(500).json({
                    success: false,
                    error: "Failed to clear cart",
                    detail: clearErr,
                  });
                }
                return res.json({
                  message: "Order and items inserted successfully",
                  order_id: insertedOrderId,
                  total_items: completedInserts,
                });
              });
            }
          }
        );
      }
    }
  );
});

app.post("/api/validatecoupon", (req, res) => {
  const { code, user_id, total, cartData } = req.body;
  if (code === undefined) {
    return res.send(null);
  }
  db.query(
    `SELECT * FROM discounts WHERE code = '${code}' AND enabled = 1`,
    (err, results) => {
      if (err)
        return res.status(500).send({ valid: false, message: "Server error" });
      if (results.length === 0)
        return res.send({ valid: false, message: "Invalid coupon code" });

      const coupon = results[0];

      if (
        coupon.usage_limit !== null &&
        coupon.usage_limit > 0 &&
        coupon.usage_count >= coupon.usage_limit
      ) {
        return res.send({
          valid: false,
          message: "Coupon usage limit reached",
        });
      }

      if (coupon.user_scope === "specific") {
        const userIds = JSON.parse(coupon.user_ids || "[]");
        if (!userIds.includes(parseInt(user_id))) {
          return res.send({
            valid: false,
            message: "You are not eligible for this coupon",
          });
        }
      }
      if (coupon.new_customers_only === 1) {
        db.query(
          "SELECT COUNT(*) as order_count FROM orders WHERE user_id = ?",
          [user_id],
          (orderErr, orderResult) => {
            if (orderErr)
              return res
                .status(500)
                .send({ valid: false, message: "Server error" });
            if (orderResult[0].order_count > 0) {
              return res.send({
                valid: false,
                message: "Only new users can use this coupon",
              });
            }
            validateDateAndRequirement();
          }
        );
        return;
      }
      if (coupon.one_per_customer === 1) {
        db.query(
          "SELECT * FROM order_discounts WHERE user_id = ?",
          [user_id],
          (Err, Result) => {
            if (Err)
              return res
                .status(500)
                .send({ valid: false, message: "Server error" });
            if (Result.length !== 0) {
              return res.send({
                valid: false,
                message: "You have already used this coupoun.",
              });
            }
            validateDateAndRequirement();
          }
        );
        return;
      }

      validateDateAndRequirement();

      function validateDateAndRequirement() {
        const now = new Date();
        const start = new Date(coupon.start_date);
        const end = coupon.end_date ? new Date(coupon.end_date) : null;

        if (now < start) {
          return res.send({ valid: false, message: "Coupon not active yet" });
        }

        if (end && now > end) {
          return res.send({ valid: false, message: "Coupon has expired" });
        }

        if (
          coupon.requirement_type === "minPurchase" &&
          total < coupon.requirement_value
        ) {
          return res.send({
            valid: false,
            message: `Minimum purchase amount must be ₹${coupon.requirement_value}`,
          });
        }
        if (
          coupon.requirement_type === "minQty" &&
          Array.isArray(cartData) &&
          cartData.reduce((acc, item) => acc + (item.quantity || 0), 0) <
            coupon.requirement_value
        ) {
          return res.send({
            valid: false,
            message: `Minimum quantity required is ${coupon.requirement_value}`,
          });
        }

        if (coupon.product_scope === "specific") {
          let allowedIds = [];
          try {
            allowedIds = JSON.parse(coupon.product_ids || "[]").map(String);
          } catch (err) {
            console.error("Invalid product_ids JSON:", coupon.product_ids);
            return res.status(500).send({
              valid: false,
              message: "Server error: Invalid product list",
            });
          }

          const cartProductIds = Array.isArray(cartData)
            ? cartData.map((item) => String(item.product_id))
            : [];
          const hasAllowedProduct = cartProductIds.some((id) =>
            allowedIds.includes(id)
          );

          if (!hasAllowedProduct) {
            return res.send({
              valid: false,
              message:
                "This coupon is not applicable to the products in your cart",
            });
          }
        }

        return res.send({
          valid: true,
          type: coupon.type,
          value: coupon.value,
        });
      }
    }
  );
});

app.post("/api/editemployee", upload.single("image"), (req, res) => {
  const EmpId = req.body.emp_id;
  const FirstName = req.body.first_name;
  const LastName = req.body.last_name;
  const Email = req.body.email;
  const PhoneNo = Number(req.body.phone_number);
  const Gender = req.body.gender;
  const Hobbies = req.body.hobbies;
  const password = req.body.password;
  try {
    const Image = req.file.filename;
    const editQuery = `update emp set First_Name='${FirstName}', Last_Name='${LastName}', Email='${Email}', Phone_No='${PhoneNo}', Gender='${Gender}', Hobbies='${Hobbies}', Image='${Image}', password='${password}' where Emp_Id = ${EmpId}`;
    db.query(editQuery, (error, data) => {
      if (error) return res.json(error);
      else return res.json(data);
    });
  } catch (error) {
    const editQuery = `update emp set First_Name='${FirstName}', Last_Name='${LastName}', Email='${Email}', Phone_No='${PhoneNo}', Gender='${Gender}', Hobbies='${Hobbies}', password='${password}' where Emp_Id = ${EmpId}`;
    db.query(editQuery, (error, data) => {
      if (error) return res.json(error);
      else return res.json(data);
    });
  }
});

app.post("/api/editpost", upload.single("image"), (req, res) => {
  const id = req.body.id;
  const user_id = req.body.user_id;
  const title = req.body.title;
  const description = req.body.description;
  try {
    const image = req.file.filename;
    const editQuery = `update posts set user_id='${user_id}', title='${title}', description='${description}', image='${image}' where id = ${id}`;
    db.query(editQuery, (error, data) => {
      if (error) return res.json(error);
      else return res.json(data);
    });
  } catch (error) {
    const editQuery = `update posts set user_id='${user_id}', title='${title}', description='${description}' where id = ${id}`;
    db.query(editQuery, (error, data) => {
      if (error) return res.json(error);
      else return res.json(data);
    });
  }
});

app.post("/api/editcomment", (req, res) => {
  const comment = req.body.comment;
  const comment_id = req.body.comment_id;
  const editQuery = `update comments set comment='${comment}' where comment_id = ${comment_id}`;
  db.query(editQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.post("/api/addcard", (req, res) => {
  const { code, value, user_id, enabled, expiry_date } = req.body;
  const editQuery = `INSERT INTO gift_card(code, value, user_id, expiry_date, enabled) VALUES('${code}',${value},'${user_id}','${expiry_date}',${enabled})`;
  db.query(editQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.post("/api/editcard", (req, res) => {
  const { code, value, user_id, enabled, expiry_date, id } = req.body;
  const editQuery = `UPDATE gift_card set code = '${code}', value=${value}, user_id='${user_id}', expiry_date='${expiry_date}', enabled=${enabled} WHERE id = ${id}`;
  db.query(editQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.post("/api/editshipping", (req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  const city = req.body.city;
  const post_code = req.body.postCode;
  const state = req.body.state;
  const threshold = req.body.threshold;
  const shipping_fee = req.body.shippingFee;
  const editQuery = `update shipping_locations set name='${name}', city='${city}', postcode=${post_code}, state='${state}', shipping_threshold=${threshold}, shipping_cost=${shipping_fee} where id = ${id}`;
  db.query(editQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.post("/api/editproduct", upload.single("image"), (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const price = req.body.price;
  const id = req.body.id;
  try {
    const image = req.file.filename;
    const editQuery = `update products set  title='${title}', description='${description}', image='${image}', price=${price} where id = ${id}`;
    db.query(editQuery, (error, data) => {
      if (error) return res.json(error);
      else return res.json(data);
    });
  } catch (error) {
    const editQuery = `update products set  title='${title}', description='${description}', price=${price} where id = ${id}`;
    db.query(editQuery, (error, data) => {
      if (error) return res.json(error);
      else return res.json(data);
    });
  }
});

app.post("/api/editdiscount", (req, res) => {
  const {
    discount_id,
    discountCode,
    discountType,
    discountValue,
    applicableProducts,
    eligibleUsers,
    requirementType,
    requirementValue,
    startDate,
    endDate,
    usageLimit,
    onePerCustomer,
    newCustomersOnly,
    enabled,
  } = req.body;

  const productScope = Array.isArray(applicableProducts) ? "specific" : "all";
  const userScope =
    Array.isArray(eligibleUsers) && eligibleUsers.length > 0
      ? "specific"
      : "everyone";

  const product_ids =
    productScope === "specific" ? JSON.stringify(applicableProducts) : null;

  const user_ids =
    userScope === "specific" ? JSON.stringify(eligibleUsers) : null;

  const sql = `
    UPDATE discounts set
      code = ?,
      type= ?,
      value = ?,
      product_scope=?,
      product_ids=?,
      user_scope=?,
      user_ids=?,
      requirement_type=?,
      requirement_value=?,
      start_date=?,
      end_date=?,
      usage_limit=?,
      one_per_customer=?,
      new_customers_only=?,
      enabled=?
      WHERE id = ?
  `;

  const values = [
    discountCode,
    discountType,
    discountValue,
    productScope,
    product_ids,
    userScope,
    user_ids,
    requirementType,
    requirementValue,
    startDate,
    endDate || null,
    usageLimit || null,
    onePerCustomer,
    newCustomersOnly,
    enabled,
    discount_id,
  ];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error Updating discount:", err);
      return res.status(500).json({ error: "Failed to update discount." });
    }
    res.json({ message: "Discount updated successfully." });
  });
});

app.post("/api/updateorder", (req, res) => {
  const {
    order_id,
    items,
    shipping_method,
    product_price,
    amount_paid,
    discount_code,
    shipping_cost, //
    discountedTotal, //
    amountPaid, //
    discount_amount,
    payment_intent_id,
    type,
  } = req.body;

  if (!order_id || !items || Object.keys(items).length === 0) {
    return res.status(400).json({ error: "Missing order data" });
  }

  // Step 1: Delete existing order_items
  const deleteItemsQuery = `DELETE FROM order_items WHERE order_id = ?`;
  db.query(deleteItemsQuery, [order_id], (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Failed to delete old items", detail: err });
    }

    // Step 2: Insert new order items
    const values = Object.entries(items).map(([productId, quantity]) => [
      order_id,
      parseInt(productId),
      `select price from products where id = ${productId}`,
      quantity,
    ]);

    const insertQuery = `
      INSERT INTO order_items (order_id, product_id, price, quantity)
      VALUES ?
    `;

    db.query(insertQuery, [values], (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Failed to insert updated items", detail: err });
      }

      // Step 3: Update order meta info
      const updateOrderQuery = `
        UPDATE orders 
        SET shipping_method = ?, shipping_cost = ?, product_price = ?, amount_paid = ?
        WHERE id = ?
      `;
      db.query(
        updateOrderQuery,
        [shipping_method, shipping_cost, product_price, amount_paid, order_id],
        (err) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Failed to update order info", detail: err });
          }

          // Step 4: Optionally update discount
          if (discount_code) {
            const updateDiscountQuery = `
              UPDATE order_discounts set amount = ? WHERE order_id = ?
            `;
            db.query(
              updateDiscountQuery,
              [discount_amount, order_id],
              (err) => {
                if (err) {
                  return res.status(500).json({
                    error: "Failed to update discount",
                    detail: err,
                  });
                }
                // Step 5: Update Payment Intent ID
                if (type === "Payment") {
                  const IntentPaymentQuery = `UPDATE order_payments SET payment_id = ?, amount= ? WHERE order_id = ?`;
                  db.query(
                    IntentPaymentQuery,
                    [
                      payment_intent_id,
                      discountedTotal + shipping_cost - amountPaid,
                      order_id,
                    ],
                    (eror) => {
                      if (eror) {
                        return res.status(500).json({
                          error: "Failed to update Payment Intent Id.",
                          detail: eror,
                        });
                      }
                      return res.json({
                        success: true,
                        message: "Order updated",
                      });
                    }
                  );
                } else if (type === "Refund") {
                  const IntentRefundQuery = `UPDATE order_payments SET amount = null, refunded_amount=? WHERE order_id = ?`;
                  db.query(
                    IntentRefundQuery,
                    [discountedTotal + shipping_cost - amountPaid, order_id],
                    (eror) => {
                      if (eror) {
                        return res.status(500).json({
                          error: "Failed to update Payment Intent Id.",
                          detail: eror,
                        });
                      }
                      return res.json({
                        success: true,
                        message: "Order updated",
                      });
                    }
                  );
                }
              }
            );
          } else {
            return res.json({ success: true, message: "Order updated" });
          }
        }
      );
    });
  });
});

app.post("/api/productquantity", (req, res) => {
  const product_id = req.body.product_id;
  const quantity = req.body.quantity;
  const user_id = Number(req.body.user_id);
  const editQuery = `update carts set quantity=quantity+${quantity} where product_id = ${product_id} and user_id=${user_id}`;
  db.query(editQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
  db.query("delete from carts where quantity=0");
});

app.post("/api/cardquantity", (req, res) => {
  const card_id = req.body.card_id;
  const quantity = req.body.quantity;
  const user_id = Number(req.body.user_id);
  const editQuery = `update carts set quantity=quantity+${quantity} where giftcard_id = ${card_id} and user_id=${user_id}`;
  db.query(editQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
  db.query("delete from carts where quantity=0");
});


app.post("/api/changepassword", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const editQuery = `update emp set password='${password}' where Email = '${email}'`;
  db.query(editQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.post("/api/searchproduct", (req, res) => {
  const keyword = req.body.keyword;
  const searchQuery = `SELECT id, title FROM products WHERE title like '%${keyword}%';`;
  db.query(searchQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.post("/api/searchuser", (req, res) => {
  const keyword = req.body.keyword;
  const searchQuery = `SELECT Emp_Id, First_Name, Last_Name FROM emp WHERE CONCAT(First_Name , Last_Name) like '%${keyword}%';`;
  db.query(searchQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.delete("/api/deleteemployee", (req, res) => {
  const EmpId = req.body.Emp_Id;

  const deleteQuery = `delete from emp where Emp_Id = ${EmpId}`;
  db.query(deleteQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.delete("/api/deletepost", (req, res) => {
  const id = req.body.id;

  const deleteQuery = `delete from posts where id = ${id}`;
  db.query(deleteQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.delete("/api/deleteproduct", (req, res) => {
  const id = req.body.id;

  const deleteQuery = `delete from products where id = ${id}`;
  db.query(deleteQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.delete("/api/deletecomment", (req, res) => {
  const comment_id = req.body.comment_id;
  const deleteQuery = `delete from comments where comment_id = ${comment_id}`;
  db.query(deleteQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.delete("/api/deleteshipping", (req, res) => {
  const id = req.body.id;
  const deleteQuery = `delete from shipping_locations where id = ${id}`;
  db.query(deleteQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.delete("/api/deletegiftcart", (req, res) => {
  const id = req.body.id;
  const deleteQuery = `delete from carts where id = ${id}`;
  db.query(deleteQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.delete("/api/deletediscount", (req, res) => {
  const id = req.body.discount_id;
  const deleteQuery = `delete from discounts where id = ${id}`;
  db.query(deleteQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.delete("/api/deletecard", (req, res) => {
  const id = req.body.card_id;
  const deleteQuery = `delete from gift_card where id = ${id}`;
  db.query(deleteQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.delete("/api/clearcart", (req, res) => {
  const user_id = req.body.user_id;
  const deleteQuery = `delete from carts where user_id = ${user_id}`;
  db.query(deleteQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.delete("/api/cancelorder", (req, res) => {
  const order_id = req.body.user_id;
  const deleteQuery = `delete from orders where id = ${order_id}`;
  db.query(deleteQuery, (error, data) => {
    if (error) {
      return res.json(error);
    }
    const order_discounts_query = `delete from order_discounts where order_id = ${order_id}`;
    db.query(order_discounts_query, (err, result) => {
      if (err) {
        return res.json(err);
      }
      const order_items_query = `delete from order_items where order_id = ${order_id}`;
      db.query(order_items_query, (e, res) => {
        if (e) {
          return res.json(e);
        }
      });
    });
    // else return res.json(data);
  });
});

app.listen(8081, () => {
  console.log("Server listening on port 8081");
});
