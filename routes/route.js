const express = require("express");
const router = express.Router();
const {create, updateStop, updateStatus, updateGeolocation, deleteStop, deleteMany, 
deleteOneroute, fetchAllRoutesByDateRange, fetchRouteById } = require("../controllers/route");
//below changes made now it shoudl update

router.post("/route/fetchroutebetweenDates", fetchAllRoutesByDateRange);
router.get('/route/:routeId', fetchRouteById);
router.post("/route/create", create);
router.put('/route/addstop', updateStop);
router.put('/route/updatestatus', updateStatus);
router.patch('/route/updategeolocation', updateGeolocation);
router.delete('/route/deletestop', deleteStop);
router.delete('/route/deleteOneroute', deleteOneroute);
router.delete('/route/deleteMany', deleteMany);





module.exports = router;


