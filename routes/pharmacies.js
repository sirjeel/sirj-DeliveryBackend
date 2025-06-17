

const express = require("express");
const router = express.Router();

const { create, update, list } = require('../controllers/pharmacies');


router.post('/pharmacies/create', create);

router.put('/pharmacies/update', update);
router.get('/pharmacies', list);



module.exports = router;
