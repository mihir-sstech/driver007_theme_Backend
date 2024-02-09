const express = require("express");
const route = express.Router();
const { signinRequire } = require("common-service/middleware/authMiddleware");
const { checkPermission } = require("common-service/helper/checkPermission");
const { addPermValidation } = require("common-service/helper/validations");
const { getPermRoleWise, editPermRoleWise, permissionGetAll, permissionAdd } = require("../controller/authController");

route.get("/get-role-perm", signinRequire, getPermRoleWise);
route.put("/edit-role-perm", signinRequire, editPermRoleWise);

route.get("/get-all-perm", signinRequire, permissionGetAll);
route.post("/add-perm", signinRequire, addPermValidation, permissionAdd);

module.exports = route;