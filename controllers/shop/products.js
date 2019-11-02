const { Product } = require('../../models/Product');

exports.getProducts = async (req, res) => {
  const { isAuth, user } = req.session;
  const path = '/products' || null;
  const products = await Product.find();
  res.render('shop/products', {
    pageTitle: 'Products',
    isAuth,
    user,
    path,
    products
  });
};

exports.getProduct = async (req, res) => {
  const { isAuth, user } = req.session;
  const product = await Product.findById(req.params.id);
  res.render('shop/product', {
    pageTitle: 'Product Details',
    isAuth,
    user,
    path,
    product
  });
};
