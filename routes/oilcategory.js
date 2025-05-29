

const express = require("express");
const router = express.Router();

const { create, remove, list } = require('../controllers/oilcategory');


router.post('/oil/category/create', create);

router.delete('/oil/category/remove', remove);
router.get('/oil/categories', list);



module.exports = router;
