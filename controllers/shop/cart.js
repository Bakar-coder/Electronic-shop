const { Product } = require('../../models/Product');

exports.getCart = async (req, res, next) => {
  try {
    if (!req.user) res.redirect('/users/login');
    const user = await req.user.populate('cart.items.productId').execPopulate();
    const products = user.cart.items;
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products,
      user
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCart = async (req, res, next) => {
  if (!req.user) res.redirect('users/login');
  try {
    const prodId = req.body.productId;
    const product = await Product.findById(prodId);
    await req.user.addToCart(product);
    console.log(result);
    res.redirect('/cart');
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteCart = async (req, res, next) => {
  const prodId = req.body.productId;

  try {
    await req.user.removeFromCart(prodId);
    res.redirect('/cart');
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
