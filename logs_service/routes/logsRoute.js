const express = require("express");
const route = express.Router();
const { signinRequire } = require("common-service/middleware/authMiddleware");
const { checkPermission } = require("common-service/helper/checkPermission");
const { addressDropdown, addressDelete, getAllAdminlogs, adminLogDetail, getAllApilogs, apiLogdetail, getAddressBookList } = require("../controller/adminLogController");

route.get("/getall-adminlogs", signinRequire, checkPermission, getAllAdminlogs);
route.get("/get-adminlog/:id", signinRequire, checkPermission, adminLogDetail);
route.get("/getall-apilogs", signinRequire, checkPermission, getAllApilogs);
route.get("/get-apilog/:id", signinRequire, checkPermission, apiLogdetail);

route.get("/getall-addressbook", signinRequire, checkPermission, getAddressBookList);
route.delete("/delete-address/:id", signinRequire, checkPermission, addressDelete);
route.get("/get-address-dropdown", signinRequire, checkPermission, addressDropdown);


module.exports = route;
