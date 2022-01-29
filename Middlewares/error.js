const ErrorHandler = require('../utils/errorhandler');

module.exports = (err,req,res,next) =>{
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  //To handle wrong id fetch from MongoDb
  if (err.name === "CastError") {
    const message = `Resource not found!!. Invalid. Path : ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //Duplicate Key error in mongoose for User Schema
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered!`; //${Object.keys(err.keyValue)} Speicifes which key is duplicated like email.
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, Try again `;
    err = new ErrorHandler(message, 400);
  }

  // JWT EXPIRE error
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is Expired, Try again `;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
}