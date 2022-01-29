const ErrorHandler = require("../utils/errorhandler");
const asyncErrors = require("./asyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

//To check if User is still authenticated
exports.isAuthenticatedUser = asyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please Login to access!", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);
  next();
});

//To set User Roles
exports.authorisedRoles = (...roles) => {
  //...roles is used because roles is an array
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access it!!`,403));
    }
    next();   
  };
};
