

const express = require("express");
const router = express.Router();

const { create, update, list } = require('../controllers/collectionpoint');


router.post('/collectionpoint/create', create);

router.put('/collectionpoint/update', update);
router.get('/collectionpoint', list);



module.exports = router;
