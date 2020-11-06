const express = require('express');
const mysql = require('mysql');

const nodemailer = require('nodemailer');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

var userName;
var errorMessage;


const connection = mysql.createConnection({
  host: 'us-cdbr-east-02.cleardb.com',
  user: 'bceb3653623b82',
  password: '3855c71d',
  database: 'heroku_f059415a3952eb3'
});

const transporter = nodemailer.createTransport({
  service : 'gmail',
  auth : {
    user : 'keitanaka0624@gmail.com',
    pass : 'wyoming1945AM'
  }
});


app.get('/index', (req, res) => {
  if (userName == '') {
    res.render('signup.ejs');
  } else {
    res.render('index.ejs', {userName : userName});
  }
});

app.get('/top', (req, res) => {
  res.render('top.ejs');
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.get('/signup', (req, res) => {
  res.render('signup.ejs', {errorMessage : errorMessage});
  errorMessage = '';
});

app.post('/create', (req, res) => {
  connection.query(
    'SELECT name FROM users WHERE mail = ?',
    [req.body.email],
    (error, results) => {
      if(results == false) {
          connection.query(
            'INSERT INTO users (mail, pass, name) VALUES (?,?,?)',
            [req.body.email, req.body.pass, req.body.name],
            (error, results) => {
              res.redirect('/index');
              console.log(req.body.email)
              userName = req.body.name;
              const mailOptions = {
                from : 'keitanaka0624@gmail.com',
                to : req.body.email,
                subject : '挨拶',
                text : 'コンドームの気持ち'
              };
              
              transporter.sendMail(mailOptions, (error, info) => {
                console.log(error);
              });
            }
          );
        
      } else {
        errorMessage = "同じパスワードが存在します";
        res.redirect('/signup');
      }
    }
  )
})
  

app.post('/login', (req, res) => {
  connection.query(
    'SELECT name FROM users WHERE mail = ? and pass = ?',
    [req.body.email, req.body.pass],
    (error, results) => {
      console.log(results);
      if(results == false) {
        res.redirect('/top');
      } else {
        userName = results[0]['name'];
        res.redirect('/index');
      }
    }
  );
});

app.post('/delete/:id', (req, res) => {
  connection.query(
    'DELETE FROM users WHERE id = ?',
    [req.params.id],
    (error, results) => {
      res.redirect('/index');
    }
  );
});



app.listen(process.env.PORT || 3000);


