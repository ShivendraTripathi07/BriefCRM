const express = require("express");
const {
  userSignUp,
  UserSignIn,
  userDetail,
  userLogout,
} = require("./../controllers/authenticationController");
const authToken = require("./../middleware/auth");

const router = express.Router();
router.post("/signup", userSignUp);
router.post("/login", UserSignIn);
router.get("/user-detail", authToken, userDetail);
router.post("/logout-user", authToken, userLogout);

module.exports = router;
