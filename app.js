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
const pharmacies = require('./routes/pharmacies');
const region = require('./routes/region');
const roles = require('./routes/roles');

// app
const app = express();

// db
mongoose.connect(process.env.MONGO_URI).then(() => console.log('DB Connected'));



const corsOptions = {
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  };

// middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(expressValidator());

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// routes middleware
app.use(optimize);
app.use(maps);
app.use(deliveryRoutes);
app.use(oilproduct);
app.use(oilcategoryRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(pharmacies);
app.use(region);
app.use(roles);

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});