

const express = require("express");
const router = express.Router();


const {
    create,
    list,
    updateActive,
    update,
    remove, 
    listBySearch,
    listSearch,
} = require("../controllers/oilproduct");


router.post("/oil/ecom/create", create);
router.get("/oil/products", list);
router.get("/oil/products/by/search", listBySearch);
router.get("/oil/products/search", listSearch);
router.put('/oil/products/updateActive', updateActive);
router.put("/oil/product/updateProduct", update);
router.delete("/oil/product/remove", remove);



module.exports = router;


