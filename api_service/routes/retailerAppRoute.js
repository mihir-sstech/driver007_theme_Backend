const express = require("express");
const route = express.Router();
const formidable = require("formidable");
const { isEmpty } = require("common-service/utils/utils");
const { isAppUserLoggedin } = require("common-service/middleware/authMiddleware");
const valid = require("common-service/helper/validations");
const retValid = require("common-service/helper/retailerAppValidations");
const retCntrolr = require("../controller/retailerAppController");

/* *************** START: GUEST ROUTES ****************** */
route.post("/user/login", retValid.loginValidation, retCntrolr.login);
route.post("/otp-verify", retValid.otpVerifyValidation, retCntrolr.otpVerify);
route.post("/forgot-password", retCntrolr.forgotPassword);
route.post("/change-password", retValid.changePassValidation, retCntrolr.changePassword);
/* *************** END: GUEST ROUTES ****************** */

route.post("/update-password", isAppUserLoggedin, retValid.updatePassValidation, retCntrolr.changePassword);
route.post("/user/fcm-token", isAppUserLoggedin, retValid.addFCMValidation, retCntrolr.fcmAddEditDelete);
route.post("/user/fcm-token/remove", isAppUserLoggedin, retValid.logoutValidation, retCntrolr.fcmAddEditDelete);
route.get("/user/profile-get", isAppUserLoggedin, retCntrolr.userAction);
route.delete("/user/profile-delete", isAppUserLoggedin, retCntrolr.userAction);
route.put("/user/profile-update", isAppUserLoggedin,
  async (req, res, next) => {
    const form = new formidable.IncomingForm();
    form.multiples = true; // To allow multiple imgd set option to FALSE // false;
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res
          .status(500)
          .json({ type: "Error", message: "Something went wrong" });
      }
      for (const field in fields) {
        if (Array.isArray(fields[field]) && fields[field].length === 1) {
          fields[field] = fields[field][0];
        }
      }
      req.body = fields;
      req.profile_pic =
        !isEmpty(files) && files.profile_pic ? files.profile_pic : {};
      next();
    });
  },
  retValid.profileUpdateValidation, retCntrolr.userAction
);

route.get("/vehicle-list/:company_id?", isAppUserLoggedin, retCntrolr.getVehicleList);
route.get("/country-list", isAppUserLoggedin, retCntrolr.getCountryList);
route.post("/state-list", isAppUserLoggedin, retCntrolr.getStateList);
// route.get("/state-list/:id", isAppUserLoggedin, retCntrolr.getStateList);
route.get("/city-list/:id", isAppUserLoggedin, retCntrolr.getCityList);

route.post("/add-address", isAppUserLoggedin, retValid.addressValidation, retCntrolr.addressBookAction);
route.get("/get-address-list", isAppUserLoggedin, retCntrolr.addressBookAction);
route.get("/get-allow-driver", isAppUserLoggedin, retCntrolr.getAllowDriver);
route.get("/get-package-list", isAppUserLoggedin, retCntrolr.packageDropdown);
route.get("/get-company-driver-list", isAppUserLoggedin, retCntrolr.getCompanyDriver);
route.get("/get-driver-details/:driver_id", isAppUserLoggedin, retCntrolr.getDriverDetails);
route.get("/get-company-credit", isAppUserLoggedin, retCntrolr.getCompCreditDetails);
route.post("/update-notification-setting", isAppUserLoggedin, retValid.userNotifSettValidation, retCntrolr.editNotificationSett);

/******** job address *******/
route.post("/save-job-address", isAppUserLoggedin, retCntrolr.saveJobAddress);
route.put("/edit-job-address", isAppUserLoggedin, retCntrolr.saveJobAddress);

/********** get fare estimate *********/
route.post("/get-fare-estimate", isAppUserLoggedin, valid.getFareEstimate, retCntrolr.getFareEstimate);
route.post("/get-nearby-drivers", isAppUserLoggedin, retValid.getNearByDrivers, retCntrolr.getNearByDrivers);

module.exports = route;
