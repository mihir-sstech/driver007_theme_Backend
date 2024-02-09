const express = require("express");
const route = express.Router();
const { signinRequire } = require("common-service/middleware/authMiddleware");
// const { checkPermission } = require("common-service/helper/checkPermission");
const { moduleValidation, chngStatusValidation } = require("common-service/helper/validations");
const { moduledetail, moduleList, moduleDelete, moduleAddOrEdit } = require("../controller/moduleController");

route.post("/add", signinRequire, moduleValidation, moduleAddOrEdit);
route.put("/edit", signinRequire, moduleValidation, moduleAddOrEdit);
route.get("/getall", signinRequire, moduleList);
route.get("/get/:id", signinRequire, moduledetail);
route.delete("/delete/:id", signinRequire, moduleDelete);
// route.put("/change-status", signinRequire, chngStatusValidation, moduleAddOrEdit);

module.exports = route;