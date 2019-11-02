const router = require('express').Router(),
  {
    getRegister,
    getLogin,
    postRegister,
    postLogin,
    postLogout,
    getReset,
    postReset,
    getNewPassword
  } = require('../controllers/users');

router
  .route('/register')
  .get(getRegister)
  .post(postRegister);

router
  .route('/login')
  .get(getLogin)
  .post(postLogin);

router.route('/logout').post(postLogout);

router
  .route('/reset')
  .get(getReset)
  .post(postReset);

router.route('/rest/:token').get(getNewPassword);

module.exports = router;
