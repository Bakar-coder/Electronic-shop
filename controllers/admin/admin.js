const { Product, validateProduct } = require("../../models/Product");

exports.getAdminAddProduct = (req, res) => {
  const { isAuth, user } = req.session;
  const path = "/admin/add-product";
  if (user && user.isAdmin)
    res.render("admin/add-product", {
      pageTitle: "Add Product",
      isAuth,
      user,
      path
    });
  else res.redirect("/");
};

exports.getAdminProducts = async (req, res) => {
  const { isAuth, user } = req.session;
  const path = "/admin/admin-products";
  const products = await Product.find();
  if (user && user.isAdmin)
    res.render("admin/add-product", {
      pageTitle: "Add Product",
      isAuth,
      user,
      path,
      products
    });
  else res.redirect("/");
};

exports.getAdminEditProduct = async (req, res) => {
  const { isAuth, user } = req.session;
  const product = await Product.findById({ _id: req.params.id });
  if (user && user.isAdmin)
    res.render("admin/add-product", {
      pageTitle: "Add Product",
      isAuth,
      user,
      product
    });
  else res.redirect("/");
};

exports.postAdminAddProduct = async (req, res) => {
  const { user } = req.session;
  const { title, description, price } = req.body;
  const { image } = req.files;

  /* ===============================================================
     validate image upload
   =================================================================*/
  if (!image) return res.json({ msg: "Product image is required." });
  const maxSize = 1024 * 1024;
  if (image.size > maxSize)
    return res.json({
      msg: "File size too big. it shouldn't be greater than 1mb."
    });
  const { mimetype } = image;
  if (
    mimetype !== "image/jpg" &&
    mimetype !== "image/png" &&
    mimetype !== "image/jpeg"
  )
    return res.json({ msg: "Unsupported file type, upload only image files." });

  let product = await Product.findOne({ title });
  if (product)
    return res.json({ msg: "Product with that title already exists." });

  /* ===============================================================
     add product
   =================================================================*/
  if (user && user.isAdmin) {
    await image.mv(`./uploads/products/${image.name}`);
    product = new Product({
      user: user.id,
      title,
      description,
      price,
      image: image.name
    });
    await product.save();
    return res.redirect("/products");
  } else return res.json({ msg: "Access denied! - access to admins only." });
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
  if (!image) return res.json({ msg: "Product image is required." });
  const maxSize = 1024 * 1024;
  if (image.size > maxSize)
    return res.json({
      msg: "File size too big. it shouldn't be greater than 1mb."
    });
  const { mimetype } = image;
  if (
    mimetype !== "image/jpg" &&
    mimetype !== "image/png" &&
    mimetype !== "image/jpeg"
  )
    return res.json({ msg: "Unsupported file type, upload only image files." });

  const product = await Product.findById(req.params.id);
  if (!product) return res.json({ msg: "No such product found." });
  if (product.user !== user.id)
    return res.json({ msg: "Product does not belong to you." });
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
  } else return res.json({ msg: "Access denied! - access to admins only." });
};
