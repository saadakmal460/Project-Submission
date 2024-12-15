const express = require('express');
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const router = require('./Routes/Routes.js')
const cookieParser = require('cookie-parser');


const app = express();
dotenv.config()
app.use(cookieParser());
app.use(cors())
app.use(express.json())



app.use('/api' , router)

const PORT = process.env.PORT;
mongoose.connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to DB");
    app.listen(PORT, () => {
      console.log("App is listening to port " + PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });