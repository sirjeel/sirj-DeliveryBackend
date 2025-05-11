const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
// import routes
const optimize = require('./routes/optimize');
const maps = require('./routes/maps');
const deliveryRoutes = require('./routes/route');
const oilproduct = require('./routes/oilproduct');

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

// this handles preflight OPTIONS requests (very important!)
//below option are set for google cloud run server running in to cors errors

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// routes middleware
app.use(optimize);
app.use(maps);
app.use(deliveryRoutes);
app.use(oilproduct);

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



