const express = require('express');
const mysql = require('mysql');
// express-session読み込み
const session = require('express-session');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'progate',
  password: 'password',
  database: 'blog'
});

// express-sessionを使うために必要な情報を貼り付け
app.use(
  session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,
  })
)

// app.useを作成
app.use((req, res, next) => {
  if (req.session.userID === undefined) {
    console.log('ログインしていません');
    // res.localsにゲストを代入
    res.locals.username ='ゲスト';
    res.locals.isLoggedIn = false;
  } else {
    console.log('ログインしています');
    // res.localsにセッションに保存されたユーザ名を代入
    res.locals.username = req.session.username;
    res.locals.isLoggedIn = true;
  }
  next();
});

app.get('/', (req, res) => {
  res.render('top.ejs');
});

app.get('/list', (req, res) => {
  connection.query(
    'SELECT * FROM articles',
    (error, results) => {
      res.render('list.ejs', { articles: results });
    }
  );
});

app.get('/article/:id', (req, res) => {
  const id = req.params.id;
  connection.query(
    'SELECT * FROM articles WHERE id = ?',
    [id],
    (error, results) => {
      res.render('article.ejs', { article: results[0] });
    }
  );
});

// ログイン画面を表示するルーティングを作成してください
app.get('/login', (req, res) => {
  res.render('login.ejs');
});

//ログインするルーティングを作成
app.post('/login', (req, res) => {
  //フォームから送信されたメールアドレスを定数emailに代入
  const email = req.body.email;
  //ユーザ情報を取得するコードを貼り付け
  connection.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (error, results) => {
      if (results.length > 0) {
        if (req.body.password === results[0].password){
          req.session.userID = results[0].id;
          // ユーザめいをセッション情報に保存
          req.session.username = results[0].username;
          res.redirect('/list');
        } else {
          res.redirect('/login');
        }
      } else {
        res.redirect('/login');
      }
    }
  );
});

// ログアウトするルーティング
app.get('/logout', (req, res) => {
  req.session.destroy(error => {
    res.redirect('/list');
  });
});

app.listen(3000);