module.exports = (req, res, next) => {
  if (!req.session.isAuth) return res.redirect('/users/login');
  next();
};
