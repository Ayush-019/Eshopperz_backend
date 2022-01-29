const app = require('./app');
const port = process.env.PORT;
const cloudinary = require("cloudinary");


const connectDatabse = require('./Database/database');

if(process.env.NODE_ENV!=="PRODUCTION"){
  require("dotenv").config();
}


connectDatabse();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Uncaught Exception Handling
process.on("uncaughtException",(err)=>{
    console.log(`Error : ${err.message}`);
    console.log(
      "Server shut down due to some Uncaught Exception Handling Error"
    );
    process.exit(1);
})

const server_listen = app.listen(port || 3000, ()=>{
    console.log(`Server is running on ${port}`);
})


// Unhandled Promise Rejection Error
process.on("unhandledRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log("Server shut down due to some Unhandled Promise Rejection Error");
  server_listen.close(() => {
    process.exit(1);
  });
});
