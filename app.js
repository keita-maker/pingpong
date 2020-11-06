const express = require('express');
const mysql = require('mysql');

const nodemailer = require('nodemailer');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

var createErrorMessage;
var loginErrorMessage;
var connection;
function handleDisconnect(){
  connection = mysql.createConnection({
    host: 'us-cdbr-east-02.cleardb.com',
    user: 'bceb3653623b82',
    password: '3855c71d',
    database: 'heroku_f059415a3952eb3'
  });
  connection.connect((error) => {
    if (error) {
      setTimeout(handleDisconnect, 2000);
    }
  });
  connection.on('error', (error) => {
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw error;
    }
  });
}

var userData = { userMail: '', userPass: '', userName: ''};

var mailOptions = {
  from : 'cguc1054@mail4.doshisha.ac.jp',
  to : '',
  subject : 'アカウント登録',
  text : ''
};




var transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com", 
  secureConnection: false, 
  port: 587, 
  tls: {
     ciphers:'SSLv3'
  },
  auth: {
      user: 'cguc1054@mail4.doshisha.ac.jp',
      pass: 'Ikuya198'
  }
});


handleDisconnect();

app.get('/index', (req, res) => {
  if (userData['userName'] == '') {
    res.redirect('/signup');
  } else {
    res.render('index.ejs', {userName : userData['userName']});
  }
});

app.get('/account', (req, res) => {
  if (userData['userName'] == '') {
    res.redirect('/login');
  } else {
    res.render('account.ejs', {userName : userData['userName'], userMail : userData['userMail']});
  }
});

app.get('/', (req, res) => {
  res.render('top.ejs');
  userData = { userMail: '', userPass: '', userName: ''};
});

app.get('/login', (req, res) => {
  res.render('login.ejs', {loginErrorMessage : loginErrorMessage});
  loginErrorMassage = '';
  userData = { userMail: '', userPass: '', userName: ''};
});

app.get('/signup', (req, res) => {
  res.render('signup.ejs', {createErrorMessage : createErrorMessage});
  createErrorMessage = '';
  userData = { userMail: '', userPass: '', userName: ''};
});

app.post('/create', (req, res) => {
  connection.query(
    'SELECT * FROM users WHERE mail = ?',
    [req.body.email],
    (error, results) => {
      if(results == false) {
        connection.query(
          'INSERT INTO users (mail, pass, name) VALUES (?,?,?)',
          [req.body.email, req.body.pass, req.body.name],
          (error, results) => {
            
            createError = '';
            userData = { userMail: req.body.email, userPass: req.body.pass, userName: req.body.name};
            mailOptions['to'] = userData['userMail'];
            mailOptions['text'] = userData['userName'] + 'さんのアカウントが登録されました。\n下記urlからログインしてください。\n' +
            'https://mighty-earth-10826.herokuapp.com/index';
            transporter.sendMail(mailOptions, (error, info) => {
              console.log(error);
            });
            res.redirect('/index');
          }
        );
        
      } else {
        createErrorMessage = "同じメールアドレスが存在します";
        res.redirect('/signup');
      }
    }
  )
})
  

app.post('/login', (req, res) => {
  connection.query(
    'SELECT name FROM users WHERE mail = ?;',
    [req.body.email],
    (error, results) => {
      if(results == false) {
        loginErrorMessage = "メールアドレスが異なります";
        res.redirect('/login');
      }else{
        connection.query(
          'SELECT * FROM users WHERE mail = ? and pass = ?;',
          [req.body.email, req.body.pass],
          (error, results) => {
            if(results == false) {
              loginErrorMessage = "パスワードが異なります";
              res.redirect('/login');
            } else {
              userData = {userMail : results[0]['mail'], userPass : results[0]['pass'], userName : results[0]['name']};
              res.redirect('/index');
            }
          }
        );
      }
    }
  );
});

app.post('/delete', (req, res) => {
  connection.query(
    'DELETE FROM users WHERE name = ? and mail = ? and pass = ?;',
    [userData['userName'], userData['userMail'], userData['userPass']],
    (error, results) => {
      res.redirect('/');
    }
  );
});



app.listen(process.env.PORT || 3000);


