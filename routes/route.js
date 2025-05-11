const express = require("express");
const router = express.Router();
const {create, updateStop, updateStatus, deleteStop, deleteMany, deleteOneroute, fetchRoutesByDateRange} = require("../controllers/route");
//below changes made now it shoudl update

router.post("/route/fetchroutebetweenDates", fetchRoutesByDateRange);
router.post("/route/create", create);
router.put('/route/addstop', updateStop);
router.put('/route/updatestatus', updateStatus);
router.delete('/route/deletestop', deleteStop);
router.delete('/route/deleteOneroute', deleteOneroute);
router.delete('/route/deleteMany', deleteMany);





module.exports = router;


