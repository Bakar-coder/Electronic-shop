const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  user: {
    email: {
      type: String,
      required: true
    },
    id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  }
});

exports.Order = mongoose.model('Order', orderSchema);
