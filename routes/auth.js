const express = require("express");
const router = express.Router();

const {
    signup,
    signin,
    signinB,
    signout,
    requireSignin
} = require("../controllers/auth");
const { userSignupValidator } = require("../validator");

router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.post("/signinB", signinB);
router.get("/signout", signout);

module.exports = router;
