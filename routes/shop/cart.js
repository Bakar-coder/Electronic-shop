const router = require('express').Router();
const {
  getCart,
  postCart,
  deleteCart
} = require('../../controllers/shop/cart');

router
  .route('/')
  .get(getCart)
  .post(postCart)
  .delete(deleteCart);

module.exports = router;
