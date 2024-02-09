const express = require("express");
const route = express.Router();
const { signinRequire } = require("common-service/middleware/authMiddleware");
const { checkPermission } = require("common-service/helper/checkPermission");
const { roleAddOrEdit, getRoleList, getRoleDetail } = require("../controller/authController");

route.post("/create", signinRequire, roleAddOrEdit);
route.put("/update", signinRequire, roleAddOrEdit);
route.get("/getall", signinRequire, getRoleList);
route.get("/get/:id", signinRequire, getRoleList);
// route.get("/get/:id", signinRequire, getRoleDetail);

module.exports = route;