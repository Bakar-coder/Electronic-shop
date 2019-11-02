const express = require('express'),
  config = require('config'),
  csrf = require('csurf'),
  db = require('./utils/db').mongoURI,
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  flash = require('connect-flash'),
  fileUpload = require('express-fileupload'),
  fs = require('fs'),
  helmet = require('helmet'),
  compression = require('compression'),
  sessions = require('express-session'),
  sessionStorage = require('connect-mongodb-session')(sessions),
  path = require('path'),
  port = process.env.PORT || 80,
  app = express();

if (!config.get('jwtPrivateKey')) {
  console.log('No Private Key Provided!');
  process.exit(1);
}

// create a log sream file
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

// set session store
const sessionStore = new sessionStorage({
  uri: db,
  collection: 'sessions'
});

const csrfProtection = csrf();

app.use(
  sessions({
    name: 'SID',
    secret: config.get('jwtPrivateKey'),
    resave: false,
    saveUninitialized: false,
    store: sessionStore
  })
);
app.use(flash());

// set global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.info_msg = req.flash('info_msg');
  res.locals.error = req.flash('error');
  res.locals.isAuth = req.session.isAuth;
  next();
});

app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

// import app routes
const Home = require('./routes'),
  Users = require('./routes/users'),
  Admin = require('./routes/admin/admin'),
  Products = require('./routes/shop/products');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(fileUpload());
app.use('/', Home);
app.use('/users', Users);
app.use('/admin', Admin);
app.use('/products', Products);
app.use((req, res, next) => {
  const { isAuth, user } = req.session;
  const path = '/page-not-found';
  res.render('404', { pageTitle: '404', isAuth, user, path });
  next();
});

mongoose
  .connect(db, { useCreateIndex: true, useNewUrlParser: true })
  .then(() => console.log('connected to mongodb database'))
  .catch(ex => console.error('Database Connection Error! --', ex));

app.listen(port, () => console.log(`Serving app on port: ${port}`));
