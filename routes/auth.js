const express = require("express");
const router = express.Router();

const {
    signup,
    signin,
    signout,
    requireSignin
} = require("../controllers/auth");
const { userSignupValidator } = require("../validator");

router.post("/signup", userSignupValidator, signup);
router.post("/oil/signin", signin);
router.get("/oil/signout", signout);

module.exports = router;
