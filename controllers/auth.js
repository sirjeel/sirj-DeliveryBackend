const User = require('../models/user');
const jwt = require('jsonwebtoken'); // to generate signed token
const expressJwt = require('express-jwt'); // for authorization check
const { errorHandler } = require('../helpers/dbErrorHandler');
require('dotenv').config();

exports.signup = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({ user });
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ error: 'Email is taken' });
    }
};

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and populate references
        const user = await User.findOne({ email })
            .populate('role')
            .populate('region')
            .populate('collectionpoint');

        if (!user) {
            return res.status(400).json({
                error: 'User with that email does not exist. Please signup'
            });
        }

        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: 'Email and password dont match'
            });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.cookie('t', token, { expire: new Date() + 9999 });

        const { _id, name, role, region, collectionpoint } = user;

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                token,
                user: {
                    _id,
                    email,
                    name,
                    role,           // Now populated with full role documents
                    region,         // Now populated with full region documents
                    collectionpoint // Now populated with full collectionpoint documents
                }
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.signinB = async (req, res) => {
    try {
        const { name, password } = req.body;

        // Find user and populate references
        const user = await User.findOne({ name })
            .populate('role')
            .populate('region')
            .populate('collectionpoint');

        if (!user) {
            return res.status(400).json({
                error: 'User with that name does not exist. Please signup'
            });
        }

        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: 'Name and password dont match'
            });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.cookie('t', token, { expire: new Date() + 9999 });

        return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: {
                    token,
                    user: {
                        _id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        region: user.region,
                        collectionpoint: user.collectionpoint
                    }
                        }
                    });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


/* 
// below signin processs for more secure way to save token in http cookie on client side

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User with that email does not exist. Please signup.' });
        }

        if (!user.authenticate(password)) {
            return res.status(401).json({ success: false, message: 'Email and password do not match.' });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        // Set cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',    // process.env.NODE_ENV === 'production', // set "false" for local development enviroment
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };

        res.cookie('token', token, cookieOptions);

        const { _id, name, role } = user;
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: { _id, email, name, role },
        });
    } catch (err) {
        console.error('Signin Error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

*/

/*
// below signin processs for more secure way to save token in http cookie on client side
exports.signout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/', // ✅ important
    });

    return res.status(200).json({ success: true, message: 'Signout success' });
};
*/

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"], // added later
    userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!user) {
        return res.status(403).json({
            error: 'Access denied'
        });
    }
    next();
};

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: 'Admin resourse! Access denied'
        });
    }
    next();
};

exports.signout = (req, res) => {
    res.clearCookie('t');
    res.json({ message: 'Signout success' });
};