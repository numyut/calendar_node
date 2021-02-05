const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

//mysqlとのコネクション作成
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'schedules'
});

//mysqlへ接続できない時のエラー表示
connection.connect((err) => {
  if (err) {
    console.log('error schedules connecting: ' + err.stack);
    return;
  }
  console.log('success schedules');
});

const connection1 = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'users'
});

//mysqlへ接続できない時のエラー表示
connection1.connect((err) => {
  if (err) {
    console.log('error users connecting: ' + err.stack);
    return;
  }
  console.log('success users');
});

//セッションの設定
app.use(
  session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);

//ログイン、ログアウトの判別、ログイン時のユーザ名の引き渡し
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

app.get('/list1', (req, res) => {
  connection.query(
    'SELECT * FROM articles',
    (error, results) => {
      res.render('list1.ejs', { articles: results });
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
  connection1.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (error, results) => {
      if (results.length > 0) {
        if (req.body.password === results[0].password){
          req.session.userID = results[0].id;
          // ユーザ名をセッション情報に保存
          req.session.username = results[0].username;
          res.redirect('/list1');
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
    res.redirect('/list1');
  });
});

//ユーザー登録画面を表示するルーティング
app.get('/signup', (req, res) => {
  res.render('signup.ejs');
});

//ユーザーを実際に登録するルーティングを作成
app.post('/signup', (req, res) => {
  const username = req.body.username;
  const date = req.body.date;
  const time = req.body.time;
  const title = req.body.title;
  const contents = req.body.contents;
  const usr_id = 3;
  console.log(username);
  console.log(date);
  console.log(time);
  console.log(title);
  console.log(contents);
  console.log(usr_id);
  connection.query(
    //INSERT INTO schedules (username, date, time, title, contents, usr_id) VALUES ('ヌマンサタバサ', '2021-01-30', '13:00', '予定', '予定',1);
    'INSERT INTO schedules (username, date, time, title, contents, usr_id) VALUES (?, ?, ?, ?, ?, ?)',
    [username, date, time, title, contents, usr_id],
    (error, results) => {
      res.redirect('/list1');
    }
  )
});

//スケジュールの表示
app.get('/flcalendar',(req, res) => {
  res.render('flcalendar.ejs',{});
});

app.listen(3000);
