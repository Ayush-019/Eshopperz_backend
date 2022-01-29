const express = require('express');
const app = express();
const ErrorMiddleWare = require('./Middlewares/error');
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload")
const path = require("path");

//env path
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config();
}


app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());

// Importing Routes
const productRoute = require('./routes/productRoute');
const userRoute = require("./routes/userRoute");
const orderRoute = require("./routes/orderRoute");
const paymentRoute = require("./routes/paymentRoute");



app.use("/api/v1",productRoute);
app.use("/api/v1",userRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", paymentRoute);

// app.use("/",(req,res)=>{
//     res.send("working!");
// });


// app.use(express.static(path.join(__dirname,"../frontend/build")));

// app.get("*",(req,res)=>{
//     res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
// })

// MiddleWare for ErrorHandling
app.use(ErrorMiddleWare);

module.exports = app;