const router = require("express").Router(),
    {getAdminAddProduct, postAdminAddProduct} = require('../../controllers/admin/admin');

router
    .route("/add-product")
    .get(getAdminAddProduct)
    .post(postAdminAddProduct);



module.exports = router;