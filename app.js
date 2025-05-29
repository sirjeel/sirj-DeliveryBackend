const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
const expressValidator = require('express-validator');
// import routes
const optimize = require('./routes/optimize');
const maps = require('./routes/maps');
const deliveryRoutes = require('./routes/route');
const oilproduct = require('./routes/oilproduct');
const oilcategoryRoutes = require('./routes/oilcategory');
// const oilorderRoutes = require('./routes/oilorder');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// app
const app = express();


// db

mongoose.connect(process.env.MONGO_URI).then(() => console.log('DB Connected'));

//below option are set for google cloud run server running in to cors errors
const corsOptions = {
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false 
  };

// middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(expressValidator());

// this handles preflight OPTIONS requests (very important!)
//below option are set for google cloud run server running in to cors errors

// below has done to remove cookier in front end while signout but google error and this has to be understood well
const allowedOrigins = [  'https://ecommerceweb-459909.nw.r.appspot.com'];
const corsOptionsDelegate = function (req, callback) {
  const origin = req.header('Origin');
  if (allowedOrigins.includes(origin)) {
    callback(null, {
      origin,
      credentials: true, // ✅ ENABLE COOKIES
    });
  } else {
    callback(null, {
      origin: false, // ❌ Block all others for now
    });
  }
};

app.use(cors(corsOptionsDelegate));
app.options('*', cors(corsOptionsDelegate));
/*
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
*/
// routes middleware
app.use(optimize);
app.use(maps);
app.use(deliveryRoutes);
app.use(oilproduct);
app.use(oilcategoryRoutes);
app.use(authRoutes);
app.use(userRoutes);


const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



