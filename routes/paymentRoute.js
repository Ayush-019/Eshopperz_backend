const express = require("express");
const router = express.Router();
const { processPaymnet, sendStripeApiKey } = require("../controllers/payment");
const { isAuthenticatedUser} = require("../Middlewares/auth");

router.route("/payment/process").post(isAuthenticatedUser,processPaymnet);
router.route("/stripeapikey").get(isAuthenticatedUser, sendStripeApiKey);


module.exports = router;