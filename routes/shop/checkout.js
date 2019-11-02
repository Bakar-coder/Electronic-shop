const router = require("express").Router();
const { getCheckout } = require('../../controllers/shop/checkout');

router.route("/").get(getCheckout);

module.exports = router;