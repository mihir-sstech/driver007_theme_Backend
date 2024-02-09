const express = require("express");
const retailerAppRoute = require("./retailerAppRoute");
const driverAppRoute = require("./driverAppRoute");
const router = express.Router();

router.use("/retailer", retailerAppRoute);
router.use("/driver", driverAppRoute);
module.exports = router;
