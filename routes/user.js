const express = require('express');
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');

const { userById, read, update, purchaseHistory, 
createTimesheet, updateTimesheet, addCollectiontoOwner } = require('../controllers/user');

router.get('/secret', requireSignin, (req, res) => {
    res.json({
        user: 'got here yay'
    });
});

router.post('/createTimesheet', createTimesheet);
router.put('/timesheet/updatetime', updateTimesheet);
router.put('/collectionpoint/pushtoowner', addCollectiontoOwner);
router.get('/user/:userId', requireSignin, isAuth, read);
router.put('/user/:userId', requireSignin, isAuth, update);
router.get('/orders/by/user/:userId', requireSignin, isAuth, purchaseHistory);

router.param('userId', userById);

module.exports = router;
