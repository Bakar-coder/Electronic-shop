const { User, validateRegister, validateLogin } = require('../models/User');
const crypto = require('crypto');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        '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'
    }
  })
);

exports.getRegister = (req, res) => {
  const { isAuth, user } = req.session;
  const path = '/users/register';
  res.render('register', {
    pageTitle: 'Register Account',
    isAuth,
    user,
    path
  });
};

exports.getLogin = (req, res) => {
  const { isAuth, user } = req.session;
  const path = '/users/login';
  res.render('login', {
    pageTitle: 'login Account',
    isAuth,
    user,
    path
  });
};

exports.getReset = (req, res, next) => {
  const { isAuth, user } = req.session;
  const path = '/reset';
  res.render('auth/reset', {
    path,
    isAuth,
    user,
    pageTitle: 'Reset Password'
  });
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }
  });

  if (user)
    try {
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
};

exports.postRegister = async (req, res) => {
  const { name, username, email, password, password2 } = req.body;
  const { error } = validateRegister(req.body);
  if (error) {
    req.flash('error', error.details[0].message);
    return res.redirect('/users/register');
  }

  if (password !== password2) {
    req.flash('error_msg', "passwords don't match.");
    return res.redirect('/users/register');
  }
  let user = await User.findOne({ email });
  if (user) {
    req.flash('error_msg', 'user with same credentials already exists.');
    return res.redirect('/users/register');
  }

  const avatar = gravatar.url(email, { s: '200', r: 'retro', d: 'mm' });
  user = new User({
    name,
    username,
    email,
    password,
    avatar
  });

  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  return res.redirect('/users/login');
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const { error } = validateLogin(req.body);
  if (error) {
    req.flash('error', error.details[0].message);
    return res.redirect('/users/login');
  }
  let user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: 'Invalid Email or Password.' });
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    req.flash('error_msg', 'Invalid Email or Password.');
    return res.redirect('/users/login');
  }

  user = {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    isAdmin: user.isAdmin
  };
  req.session.user = user;
  req.session.isAuth = true;
  // req.session.cookie.samesite = true;
  // req.session.cookie.secure = true;
  // req.session.cookie.originalMaxAge = 3600;
  req.session.save(err => {
    console.log(err);
    return res.redirect('/');
  });
};

exports.postLogout = async (req, res) => {
  try {
    await req.session.destroy();
    res.redirect('/users/login');
    console.log('success');
  } catch (ex) {
    console.log(ex);
  }
};

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(() => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'shop@node-complete.com',
          subject: 'Password reset',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      res.redirect('/users/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
