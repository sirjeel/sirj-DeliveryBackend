/*
const { OilOrder, OilCartItem } = require('../models/oilorder');
const { errorHandler } = require('../helpers/dbErrorHandler');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(`${process.env.SENDGRID_API}`);

exports.orderById = async (req, res, next, id) => {
    try {
        const order = await OilOrder.findById(id)
            .populate('products.product', 'name price')
            .exec();
        if (!order) {
            return res.status(400).json({
                error: 'Order not found'
            });
        }
        req.order = order;
        next();
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Server Error' });
    }
};

exports.create = async (req, res) => {
    try {
        console.log('CREATE ORDER: ', req.body);
        req.body.order.user = req.profile;
        const order = new OilOrder(req.body.order);
        const data = await order.save();
        const emailData = {
            to: 'zunairullah@gmail.com',
            from: 'noreply@ecommerce.com',
            subject: `A new order is received`,
            html: `
            <p>Customer name:</p>
            <p>Total products: ${order.products.length}</p>
            <p>Total cost: ${order.amount}</p>
            <p>Login to dashboard to the order in detail.</p>
        `
        };
        sgMail.send(emailData);
        res.json(data);
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ error: errorHandler(err) });
    }
};

exports.listOrders = async (req, res) => {
    try {
        const orders = await OilOrder.find()
            .populate('user', '_id name address')
            .sort('-created')
            .exec();
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ error: errorHandler(err) });
    }
};

exports.getStatusValues = (req, res) => {
    res.json(OilOrder.schema.path('status').enumValues);
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await OilOrder.updateOne({ _id: req.body.orderId }, { $set: { status: req.body.status } }).exec();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ error: errorHandler(err) });
    }
};
*/