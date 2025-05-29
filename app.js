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
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// app
const app = express();

// db
mongoose.connect(process.env.MONGO_URI).then(() => console.log('DB Connected'));

// CORS configuration for production and development
const allowedOrigins = [
  'http://localhost:3000', // Development
  'https://ecommerceweb-459909.nw.r.appspot.com', // Production
  // Add any other domains you need to allow
];

const corsOptionsDelegate = function (req, callback) {
  const origin = req.header('Origin');
  let corsOptions;
  
  if (allowedOrigins.includes(origin)) {
    corsOptions = {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true // Enable cookies if needed
    };
  } else {
    corsOptions = { origin: false }; // Disable CORS for other origins
  }
  
  callback(null, corsOptions);
};

// middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(expressValidator());

// Apply CORS middleware
app.use(cors(corsOptionsDelegate));
app.options('*', cors(corsOptionsDelegate));

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