const router = require('express').Router();
const { getOrders, getInvoice } = require('../../controllers/shop/orders');

router.route('/').get(getOrders);
router.route('/:id').get(getInvoice);

module.exports = router;
