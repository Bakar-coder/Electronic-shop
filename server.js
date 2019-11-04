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
  { User } = require('./models/User'),
  path = require('path'),
  port = process.env.PORT || 80,
  app = express();

if (!config.get('jwtPrivateKey')) {
  console.log('No Private Key Provided!');
  process.exit(1);
}

// create a log stream file
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
// import app routes
const Home = require('./routes'),
  Users = require('./routes/users'),
  Admin = require('./routes/admin/admin'),
  Products = require('./routes/shop/products'),
  Checkout = require('./routes/shop/checkout'),
  Cart = require('./routes/shop/cart'),
  Orders = require('./routes/shop/orders');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(
  sessions({
    name: 'SID',
    secret: config.get('jwtPrivateKey'),
    resave: false,
    saveUninitialized: false,
    store: sessionStore
  })
);
app.use(fileUpload());
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(flash());

app.use(csrfProtection);

app.use(async (req, res, next) => {
  if (!req.session.user) return next();
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) return next();
    req.user = user;
    next();
  } catch (err) {
    next(new Error(err));
  }
});

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.user = req.session.user;
  res.locals.isAuth = req.session.isAuth;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.info_msg = req.flash('info_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', Home);
app.use('/users', Users);
app.use('/admin', Admin);
app.use('/products', Products);
app.use('/checkout', Checkout);
app.use('/cart', Cart);
app.use('/Orders', Orders);
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
