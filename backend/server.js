const express = require('express');
require('dotenv').config();
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'student_db',
});

db.connect((err) => {
  if (err) {
    return console.error('MySQL Error:', err);
  }
  console.log('Connected to MySQL.');
});

app.use('/images', express.static(path.join(__dirname, 'public/images')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images'),
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.get('/', (req, res) => res.json('From Backend'));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,     
    pass: process.env.PASSWORD,  
  },
});

transporter.use(
  'compile',
  hbs({
    viewEngine: {
      extname: '.hbs',
      defaultLayout: false,
    },
    viewPath: path.resolve(__dirname, 'template'),
    extName: '.hbs',
  })
);

async function sendResetPasswordMail(toEmail) {
  const resetLink = `http://localhost:3000/resetpassword?email=${toEmail}`; 

  const mailOptions = {
    from: process.env.EMAIL,
    to: toEmail,
    subject: 'Reset Password for Tabster',
    template: 'resetPassword', 
    context: { resetLink, year: new Date().getFullYear() },
  };
  await transporter.sendMail(mailOptions);
}

app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    await sendResetPasswordMail(email);
    res.status(200).json({ message: 'Password reset mail sent!' });
  } catch (error) {
    console.error('Error sending reset mail:', error);
    res.status(500).json({ message: 'Error sending mail', error });
  }
});

// Get users
app.get('/users', (req, res) => {
  const sql = 'select * from emp';
  db.query(sql, (error, data) => (error ? res.status(500).json(error) : res.json(data)));
});

// Get posts
app.get('/posts', (req, res) => {
  const sql = 'select * from posts';
  db.query(sql, (error, data) => (error ? res.status(500).json(error) : res.json(data)));
});

// Get comments
app.get('/comments', (req, res) => {
  const sql = 'select * from comments';
  db.query(sql, (error, data) => (error ? res.status(500).json(error) : res.json(data)));
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM emp WHERE Email = ? AND password = ?';
  db.query(sql, [email, password], (error, results) => {
    if (error) return res.status(500).json({ error });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    res.status(200).json(results[0]);
  });
});

//using Emp_Id
app.post('/postowner', (req, res) => {
  const user_id = req.body.user_id
  const sql = `SELECT * FROM emp WHERE Emp_Id = ${user_id}`;
  db.query(sql, (error, results) => {
    if (error) return res.status(500).json({ error });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    res.status(200).json(results[0]);
  });
});


//Get Products
app.get('/products', (req, res) => {
  const sql = 'select * from products';
  db.query(sql, (error, data) => (error ? res.status(500).json(error) : res.json(data)));
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

app.post("/api/editproduct", upload.single("image"), (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const price = req.body.price;
  const id = req.body.id
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

app.post("/api/changepassword", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const editQuery = `update emp set password='${password}' where Email = '${email}'`;
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

app.listen(8081, () => {
  console.log('Server listening on port 8081');
});
