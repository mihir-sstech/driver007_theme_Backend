const express = require("express");
const role_routes = require("./roleRoute");
const auth_routes = require("./authRoute");
const perm_routes = require("./permRoute");

const router = express.Router();

router.use("/auth", auth_routes);
router.use("/role", role_routes);
router.use("/permission", perm_routes);
module.exports = router;
