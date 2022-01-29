const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const asyncErrors = require("../Middlewares/asyncErrors");

exports.processPaymnet = asyncErrors(async (req, res, next) => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    metadata: {
      company: "Eshopperz",
    },
  });

  res
    .status(200)
    .json({ success: true, client_secret: myPayment.client_secret });
});

//Sending Api key to Frontend.
exports.sendStripeApiKey = asyncErrors(async (req, res, next) => {
  res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});

