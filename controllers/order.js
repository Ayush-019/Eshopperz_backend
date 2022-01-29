const Order = require("../models/orderModel");
const Product = require("../models/productmodel");
const ErrorHandler = require("../utils/errorhandler");
const asyncErrors = require("../Middlewares/asyncErrors");

//New order
exports.newOrder = asyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidOn: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

//Get single Order Details
exports.getSingleOrder = asyncErrors(async (req, res, next) => {
  //populate will use user(id) in order database and then use user database to access its name and email and return them.
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(
      new ErrorHandler(`No order exist for the Id:${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    order,
  });
});

//Get all Orders of logined user
exports.myOrders = asyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({    
    success: true,
    orders,
  });
});

//Get all  Orders  -->Admin accessible Only
exports.getAllOrders = asyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

//Update Order status  -->Admin accessible Only
exports.updateOrderStatus = asyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorHandler(`No order exist for the Id:${req.params.id}`, 404)
    );
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("Product already Delivered", 404));
  }

  if(req.body.status === "Shipped"){
    order.orderItems.forEach(async (ord) => {
      await updateStock(ord.product, ord.quantity);
    });
  }

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredOn = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.Stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

//Delete Order
exports.deleteOrder = asyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorHandler(`No order exist for the Id:${req.params.id}`, 404)
    );
  }

  await order.remove();
  res.status(200).json({
    success: true,
  });
});
