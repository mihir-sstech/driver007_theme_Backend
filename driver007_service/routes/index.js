const express = require("express");
const cms = require("./cmsRoute");
const router = express.Router();

router.use("/driver007", cms);
module.exports = router;
