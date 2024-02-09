const express = require("express");
const userRoute = require("./userRoute");
const commonRoute = require("./commonRoute");
const router = express.Router();

router.use("/user", userRoute);
router.use("/common", commonRoute);
module.exports = router;
