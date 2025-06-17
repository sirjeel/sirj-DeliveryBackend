

const express = require("express");
const router = express.Router();

const { create, list } = require('../controllers/roles');


router.post('/roles/create', create);

router.get('/roles', list);



module.exports = router;
