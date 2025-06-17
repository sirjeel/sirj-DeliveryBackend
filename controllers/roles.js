const Roles = require('../models/roles');
const { errorHandler } = require('../helpers/dbErrorHandler');




exports.create = async (req, res) => {
    try {
        const roles = new Roles(req.body);
        const data = await roles.save();
        res.json({ data });
    } catch (err) {
        res.status(400).json({
            error: errorHandler(err)
        });
    }
};




exports.list = async (req, res) => {
    try {
        const data = await Roles.find();
        return res.status(200).json({ success: true, roles: data });
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ success: false, error: err.message });
    }
};


