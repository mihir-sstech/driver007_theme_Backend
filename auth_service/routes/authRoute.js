const express = require("express");
const route = express.Router();
const { signinRequire } = require("common-service/middleware/authMiddleware");
const { signin, forgotPassword, resetPassword, logout, loginUserData } = require("../controller/authController");

route.post("/signin", signin);
route.post("/forgot-password", forgotPassword);
route.post("/reset-password", resetPassword);
route.post("/logout", signinRequire, logout);
route.get("/me", signinRequire, loginUserData);

// test route
// route.post("/test", checkPermission, test);
// route.post("/test", signinRequire, test);

module.exports = route;
