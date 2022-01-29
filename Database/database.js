const mongoose = require("mongoose");
const Db = process.env.DB_URL;

const connectDatabse = () => {
  mongoose
    .connect(Db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true,
    })
    .then((data) => {
      console.log(`Connected with database : ${data.connection.host}`);
    })

};

module.exports = connectDatabse;    