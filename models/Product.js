const mongoose = require('mongoose'),
  Joi = require('joi'),
  Schema = mongoose.Schema,
  productSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    date: { type: Date, default: Date.now() }
  });

const validateProduct = product => {
  const schema = {
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required()
  };

  return Joi.validate(product, schema);
};

exports.Product = mongoose.model('Product', productSchema);
exports.validateProduct = validateProduct;
