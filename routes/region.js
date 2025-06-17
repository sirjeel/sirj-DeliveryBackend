

const express = require("express");
const router = express.Router();

const { create, update, list } = require('../controllers/region');


router.post('/region/create', create);

router.put('/region/update', update);
router.get('/region', list);



module.exports = router;
