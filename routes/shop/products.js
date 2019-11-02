const router = require('express').Router();
const { getProducts, getProduct } = require('../../controllers/shop/products');

router.route('/').get(getProducts);
router.route('/:id').get(getProduct);

module.exports = router;
