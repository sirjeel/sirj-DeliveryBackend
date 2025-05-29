

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
 /*
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.get("/product/:productId", read);
*/

router.post("/oil/ecom/create", create);
router.get("/oil/products", list);
router.get("/oil/products/by/search", listBySearch);
router.get("/oil/products/search", listSearch);
router.put('/oil/products/updateActive', updateActive);
router.put("/oil/product/updateProduct", update);
router.delete("/oil/product/remove", remove);
/*


router.get("/products/search", listSearch);
router.get("/products/related/:productId", listRelated);
router.get("/products/categories", listCategories);
router.get("/products/by/search", listBySearch);
router.get("/product/photo/:productId", photo);

router.param("userId", userById);
router.param("productId", productById);
*/


module.exports = router;


