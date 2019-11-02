const router = require("express").Router(),
    { Product } = require('../models/Product');

router.route("/").get(async (req, res) => {
  const { isAuth, user } = req.session;
  const path = '/';
  const products = await Product.find().limit(4).sort({ date: -1});
  res.render('index', { pageTitle: 'Online-Shop', isAuth, user, path, products })
});

module.exports = router;
