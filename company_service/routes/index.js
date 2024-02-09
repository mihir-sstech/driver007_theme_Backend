const express = require("express");
const company = require("./companyRoute");
const router = express.Router();

router.use("/company", company);
module.exports = router;
