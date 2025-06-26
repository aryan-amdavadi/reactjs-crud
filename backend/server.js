const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { log } = require("console");
const nodemailer = require('nodemailer')
const { v4: uuidv4 } = require('uuid')

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

//connection with mysql
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "student_db",
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected.");
  }
});

app.use("/images", express.static(path.join(__dirname, "public/images")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

app.get("/", (req, res) => {
  return res.json("From Backend");
});

//Getting Mysql Data For Users.
app.get("/users", (req, res) => {
  const mysql = "select * from emp";
  db.query(mysql, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

//Getting Mysql Data For Posts.
app.get("/posts", (req, res) => {
  const mysql = "select * from posts";
  db.query(mysql, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

//Getting MySql Data For Comments.
app.get("/comments", (req, res) => {
  const mysql = "select * from comments";
  db.query(mysql, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM emp WHERE Email = ? AND password = ?";
  db.query(sql, [email, password], (error, results) => {
    if (error) {
      return res.status(500).json({ error }); 
    }
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Return the first matched user
    return res.status(200).json(results[0]);
  });
});

app.post("/upload", upload.single("image"), (req, res) => {
  const image = req.file.filename;
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
  const Status = req.body.status;
  const Image = req.file.filename;
  const password = req.body.password;
  const addQuery = `insert into emp (First_Name, Last_Name, Email, Phone_No, Gender, Hobbies, Status, Image,password) values('${FirstName}','${LastName}','${Email}',${PhoneNo},'${Gender}',
    '${Hobbies}','${Status}','${Image}','${password}')`;
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
  const status = req.body.status;
  const emp_id = req.body.emp_id;
  const addQuery = `insert into posts (user_id,emp_id, title, description, image, status) values(${user_id},${emp_id},'${title}','${description}','${image}','${status}')`;
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

app.post("/api/editemployee", upload.single("image"), (req, res) => {
  const EmpId = req.body.emp_id;
  const FirstName = req.body.first_name;
  const LastName = req.body.last_name;
  const Email = req.body.email;
  const PhoneNo = Number(req.body.phone_number);
  const Gender = req.body.gender;
  const Hobbies = req.body.hobbies;
  const Status = req.body.status;
  try {
    const Image = req.file.filename;
    const editQuery = `update emp set First_Name='${FirstName}', Last_Name='${LastName}', Email='${Email}', Phone_No='${PhoneNo}', Gender='${Gender}', Hobbies='${Hobbies}', Status='${Status}', Image='${Image}' where Emp_Id = ${EmpId}`;
    db.query(editQuery, (error, data) => {
      if (error) return res.json(error);
      else return res.json(data);
    });
  } catch (error) {
    const editQuery = `update emp set First_Name='${FirstName}', Last_Name='${LastName}', Email='${Email}', Phone_No='${PhoneNo}', Gender='${Gender}', Hobbies='${Hobbies}', Status='${Status}' where Emp_Id = ${EmpId}`;
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
  const status = req.body.status;
  try {
    const image = req.file.filename;
    const editQuery = `update posts set user_id='${user_id}', title='${title}', description='${description}', image='${image}', status='${status}' where id = ${id}`;
    db.query(editQuery, (error, data) => {
      if (error) return res.json(error);
      else return res.json(data);
    });
  } catch (error) {
    const editQuery = `update posts set user_id='${user_id}', title='${title}', description='${description}', status='${status}' where id = ${id}`;
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

app.delete("/api/deleteemployee", (req, res) => {
  const EmpId = req.body.Emp_Id;

  // console.log(req);

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

app.delete("/api/deletecomment", (req, res) => {
  const comment_id = req.body.comment_id;
  const deleteQuery = `delete from comments where comment_id = ${comment_id}`;
  db.query(deleteQuery, (error, data) => {
    if (error) return res.json(error);
    else return res.json(data);
  });
});

app.listen(8081, () => {
  console.log("listnening");
});
