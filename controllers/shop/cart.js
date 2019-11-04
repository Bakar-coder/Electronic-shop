const { Product } = require('../../models/Product');

exports.getCart = async (req, res, next) => {
  if (!req.user) res.redirect('/users/login');

  try {
    const user = await req.user.populate('cart.items.productId').execPopulate();
    const products = user.cart.items;
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: products
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCart = async (req, res, next) => {
  if (!req.user) return res.redirect('/users/login');

  try {
    const prodId = req.body.productId;
    const product = await Product.findById(prodId);
    await req.user.addToCart(product);
    res.redirect('/cart');
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteCart = async (req, res, next) => {
  try {
    const prodId = await req.body.productId;
    await req.user.removeFromCart(prodId);
    res.redirect('/cart');
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
