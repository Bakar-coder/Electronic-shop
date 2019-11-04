const { Product, validateProduct } = require('../../models/Product');

exports.getAdminAddProduct = (req, res) => {
  const { isAuth, user } = req.session;
  const path = '/admin/add-product';
  if (user && user.isAdmin)
    res.render('admin/add-product', {
      pageTitle: 'Add Product',
      isAuth,
      user,
      path
    });
  else res.redirect('/');
};

exports.getAdminProducts = async (req, res) => {
  const { isAuth, user } = req.session;
  const path = '/admin/admin-products';
  const products = await Product.find();
  if (user && user.isAdmin)
    res.render('admin/add-product', {
      pageTitle: 'Add Product',
      isAuth,
      user,
      path,
      products
    });
  else res.redirect('/');
};

exports.getAdminEditProduct = async (req, res) => {
  const { isAuth, user } = req.session;
  const product = await Product.findById({ _id: req.params.id });
  if (user && user.isAdmin)
    res.render('admin/add-product', {
      pageTitle: 'Add Product',
      isAuth,
      user,
      product
    });
  else res.redirect('/');
};

exports.postAdminAddProduct = async (req, res) => {
  const { user } = req.session;
  const { title, description, price } = req.body;
  const { image } = req.files;

  /* ===============================================================
     validate image upload
   =================================================================*/
  if (!image) return res.json({ msg: 'Product image is required.' });
  const maxSize = 1024 * 1024;
  if (image.size > maxSize)
    return res.json({
      msg: "File size too big. it shouldn't be greater than 1mb."
    });
  const { mimetype } = image;
  if (
    mimetype !== 'image/jpg' &&
    mimetype !== 'image/png' &&
    mimetype !== 'image/jpeg'
  )
    return res.json({ msg: 'Unsupported file type, upload only image files.' });

  let product = await Product.findOne({ title });
  if (product)
    return res.json({ msg: 'Product with that title already exists.' });

  /* ===============================================================
     add product
   =================================================================*/
  if (user && user.isAdmin) {
    await image.mv(`./uploads/products/${image.name}`);
    product = new Product({
      user: user._id,
      title,
      description,
      price,
      image: image.name
    });
    await product.save();
    return res.redirect('/products');
  } else return res.json({ msg: 'Access denied! - access to admins only.' });
};

exports.postAdminEditProduct = async (req, res) => {
  const { user } = req.session;
  const { title, description, price } = req.body;
  const { image } = req.files;
  const productFields = {};
  if (title) productFields.title = title;
  if (description) productFields.description = description;
  if (price) productFields.price = price;

  /* ===============================================================
     validate image upload
  =================================================================*/
  if (!image) return res.json({ msg: 'Product image is required.' });
  const maxSize = 1024 * 1024;
  if (image.size > maxSize)
    return res.json({
      msg: "File size too big. it shouldn't be greater than 1mb."
    });
  const { mimetype } = image;
  if (
    mimetype !== 'image/jpg' &&
    mimetype !== 'image/png' &&
    mimetype !== 'image/jpeg'
  )
    return res.json({ msg: 'Unsupported file type, upload only image files.' });

  const product = await Product.findById(req.params.id);
  if (!product) return res.json({ msg: 'No such product found.' });
  if (product.user !== user.id)
    return res.json({ msg: 'Product does not belong to you.' });
  if (image) productFields.image = image.name;

  /* ===============================================================
   update product
=================================================================*/
  if (user && user.isAdmin) {
    await image.mv(`./uploads/products/${image.name}`);
    await Product.findByIdAndUpdate(
      req.params.id,
      { $set: productFields },
      { new: true }
    );
  } else return res.json({ msg: 'Access denied! - access to admins only.' });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save().then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return next(new Error('Product not found.'));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.status(200).json({ message: 'Success!' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Deleting product failed.' });
    });
};
