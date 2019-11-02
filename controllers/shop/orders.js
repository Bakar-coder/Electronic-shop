const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const { Order } = require('../../models/Order');

exports.getOrders = async (req, res, next) => {
  const { user } = req.session;
  try {
    const orders = await Order.find({ 'user.id': req.user.id });
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders,
      user
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getInvoice = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    if (!order) {
      return next(new Error('No order found.'));
    }
    if (order.user.id.toString() !== req.user._id.toString()) {
      return next(new Error('Unauthorized'));
    }
    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);

    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="' + invoiceName + '"'
    );
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text('Invoice', {
      underline: true
    });
    pdfDoc.text('-----------------------');
    let totalPrice = 0;
    order.products.forEach(prod => {
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc
        .fontSize(16)
        .text(
          prod.product.title +
            ' - ' +
            prod.quantity +
            ' x ' +
            '$' +
            prod.product.price
        );
    });
    pdfDoc.text('---');
    pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);
    pdfDoc.end();

    const order = await Order.findById(orderId);
  } catch (err) {
    err => next(err);
  }
};

exports.postOrder = async (req, res, next) => {
  // Token is created using Checkout or Elements!
  // Get the payment token ID submitted by the form:
  const token = req.body.stripeToken; // Using Express
  let totalSum = 0;

  try {
    const user = await req.user.populate('cart.items.productId').execPopulate();
    user.cart.items.forEach(p => {
      totalSum += p.quantity * p.productId.price;
    });

    const products = user.cart.items.map(i => {
      return { quantity: i.quantity, product: { ...i.productId._doc } };
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user
      },
      products: products
    });
    await order.save();

    const charge = stripe.charges.create({
      amount: totalSum * 100,
      currency: 'usd',
      description: 'Demo Order',
      source: token,
      metadata: { order_id: result._id.toString() }
    });
    await req.user.clearCart();

    res.redirect('/orders');
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
