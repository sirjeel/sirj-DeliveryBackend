const User = require('../models/user');
const Timesheet = require('../models/timsheet');
const { Order } = require('../models/oilorder');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.userById = async (req, res, next, id) => {
    try {
        const user = await User.findById(id).exec();
        if (!user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        req.profile = user;
        next();
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Server Error' });
    }
};

exports.read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
};

exports.update = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await User.findOne({ _id: req.profile._id }).exec();
        if (!user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        if (!name) {
            return res.status(400).json({
                error: 'Name is required'
            });
        } else {
            user.name = name;
        }

        if (password && password.length < 6) {
            return res.status(400).json({
                error: 'Password should be min 6 characters long'
            });
        } else {
            user.password = password;
        }

        if (email) {
            user.email = email;
        }

        const updatedUser = await user.save();
        updatedUser.hashed_password = undefined;
        updatedUser.salt = undefined;
        res.json(updatedUser);
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ error: 'User update failed' });
    }
};

exports.addOrderToUserHistory = async (req, res, next) => {
    try {
        let history = [];

        req.body.order.products.forEach(item => {
            history.push({
                _id: item._id,
                name: item.name,
                description: item.description,
                category: item.category,
                quantity: item.count,
                transaction_id: req.body.order.transaction_id,
                amount: req.body.order.amount
            });
        });

        const updatedUser = await User.findOneAndUpdate({ _id: req.profile._id }, { $push: { history: history } }, { new: true }).exec();
        next();
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ error: 'Could not update user purchase history' });
    }
};

exports.purchaseHistory = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.profile._id })
            .populate('user', '_id name')
            .sort('-created')
            .exec();
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ error: errorHandler(err) });
    }
};


exports.createTimesheet = async (req, res) => {
    try {
        const timesheet = new Timesheet(req.body);
        await timesheet.save();
        return res.status(200).json({ 
        success: true, 
        message: "timesheet has been created successfully."
    });
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ error: 'Timessheet not created' });
    }
};




exports.updateTimesheet = async (req, res) => {
  try {
    const { userId, time } = req.body;

    if (!userId || !time) {
      return res.status(400).json({ error: "userId and time are required." });
    }

   let update;

     if (typeof time === 'object') {
      // Handle single stop object
      update = { $push: { timeRecord: time } };
    } else {
      return res.status(400).json({ error: "Invalid time data format." });
    }

   
   const result = await Timesheet.findOneAndUpdate(
    { user: userId },  // match by user field
     update,
      { new: false }         // return old doc before update (optional)
     );


    if (!result) {
      return res.status(404).json({ error: "User not found." });
    }

    // ✅ Return only a success confirmation
    return res.status(200).json({ success: true, message: "Time record updated successfully." });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: errorHandler(err) || "Internal Server Error" });
  }
};