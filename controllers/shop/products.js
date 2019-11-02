const { Product } = require('../../models/Product');
const ITEMS_PER_PAGE = 6;

exports.getProducts = async (req, res) => {
  const { isAuth, user } = req.session;
  const path = '/products' || null;
  const numProducts = await Product.find().countDocuments();
  const page = +req.query.page || 1;
  const totalItems = numProducts;
  const products = await Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);

  if (products)
    res.render('shop/products', {
      pageTitle: 'Products',
      isAuth,
      user,
      path,
      products,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
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

exports.getIndex = async (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  try {
    const numProducts = await Product.find().countDocuments();
    totalItems = numProducts;
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.render('index', {
      prods: products,
      pageTitle: 'Online-Shop',
      path: '/',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
