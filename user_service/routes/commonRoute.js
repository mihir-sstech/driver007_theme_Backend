const express = require("express");
const route = express.Router();

const { signinRequire } = require("common-service/middleware/authMiddleware");
const commonController = require("../controller/commonController");

route.get("/get-country", signinRequire, commonController.getCountryList);
route.post("/get-state", signinRequire, commonController.getStateList);
// route.get("/get-state/:id", signinRequire, commonController.getStateList);

route.get("/get-currency", signinRequire, commonController.getCurrencyDropdown);
route.get("/get-weightunits", signinRequire, commonController.getWeightUnits);
route.get("/get-inputfieldtypes", signinRequire, commonController.getInputFieldTypes);
// route.get("/get-vehicledocs", signinRequire, commonController.getVehicleDocsList);


module.exports = route;
