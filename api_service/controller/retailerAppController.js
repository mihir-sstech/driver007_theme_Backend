const { validationResult } = require("express-validator");
const common = require("common-service/statics/static.json");
const { replaceNullWithEmptyString } = require("common-service/helper/general");
const { getCountryList, getStateList, getCityList, getPackageDetailsById } = require("common-service/services/commonService");
const retailerService = require("../services/retailerAppService");
const generalJobService = require("../services/generalJobService");
const app_type = "Retailer";

/******* Login ******/
exports.login = async (req, res, next) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return res.status(400).json({
        success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {},
      });
    }
    var { success, statusCode, message, type, data } = await retailerService.login(req);
    data = await replaceNullWithEmptyString(data);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* FCM token - Add or Edit or Delete ******/
exports.fcmAddEditDelete = async (req, res, next) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return res.status(400).json({
        success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {},
      });
    }
    const { success, statusCode, message, type, data } = await retailerService.fcmAddEditDelete(req, app_type);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* User details - Edit or Get ******/
exports.userAction = async (req, res, next) => {
  try {
    const user_type = "retailer";
    if (validationResult(req).errors.length > 0) {
      return res.status(400).json({
        success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {},
      });
    }
    let { success, statusCode, message, type, data } = await retailerService.userAction(req, app_type, user_type);
    data = await replaceNullWithEmptyString(data);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* Vehicle - List ******/
exports.getVehicleList = async (req, res, next) => {
  try {
    const { success, statusCode, message, type, data } = await retailerService.getVehicleList(req, app_type);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* Forgot password email send ******/
exports.forgotPassword = async (req, res, next) => {
  try {
    const { success, statusCode, message, type, data } = await retailerService.forgotPassword(req, app_type);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* Function for OTP verification ******/
exports.otpVerify = async (req, res, next) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return res.status(400).json({
        success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {},
      });
    }
    const { success, statusCode, message, type, data } = await retailerService.otpVerify(req, app_type);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* Function for change password ******/
exports.changePassword = async (req, res, next) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return res.status(400).json({
        success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {},
      });
    }
    const { success, statusCode, message, type, data } = await retailerService.changePassword(req, app_type);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* Function for get country list for dropdown ******/
exports.getCountryList = async (req, res, next) => {
  try {
    const { success, statusCode, message, type, data } = await getCountryList(
      req
    );
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* Function for get country-wise state list for dropdown ******/
exports.getStateList = async (req, res) => {
  try {
    const { success, statusCode, message, type, data } = await getStateList(
      req
    );
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* Function for get state-wise city list for dropdown ******/
exports.getCityList = async (req, res) => {
  try {
    const { success, statusCode, message, type, data } = await getCityList(req);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* Function for get company's allow driver type for dropdown ******/
exports.getAllowDriver = async (req, res) => {
  try {
    const { success, statusCode, message, type, data } = await retailerService.getAllowDriver(req);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* Address detail - Edit or Get ******/
exports.addressBookAction = async (req, res, next) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return res.status(400).json({
        success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {},
      });
    }
    const { success, statusCode, message, type, data } = await retailerService.addressBookAction(req);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* Package list for dropdown ******/
exports.packageDropdown = async (req, res) => {
  try {
    const { success, statusCode, message, type, data } = await retailerService.packageDropdown(req);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* Get company driver list ******/
exports.getCompanyDriver = async (req, res) => {
  try {
    const { success, statusCode, message, type, data } = await retailerService.getCompanyDriver(req);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* Get driver details by passing driver id ******/
exports.getDriverDetails = async (req, res) => {
  try {
    let { success, statusCode, message, type, data } = await retailerService.getDriverDetails(req);
    data = await replaceNullWithEmptyString(data);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* Get company credit details ******/
exports.getCompCreditDetails = async (req, res) => {
  try {
    let { success, statusCode, message, type, data } = await retailerService.getCompCreditDetails(req);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* Update user notification setting ******/
exports.editNotificationSett = async (req, res) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return res.status(400).json({
        success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {},
      });
    }
    const { success, statusCode, message, type, data } = await retailerService.editNotificationSett(req);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

/******* Address detail - Edit or Get ******/
exports.saveJobAddress = async (req, res, next) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return res.status(400).json({
        success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {},
      });
    }
    const { success, statusCode, message, type, data } = await generalJobService.saveJobAddress(req, app_type);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

exports.getFareEstimate = async (req, res, next) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return res.status(400).json({
        success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {},
      });
    }
    const { success, statusCode, message, type, data } = await generalJobService.getFareEstimate(req, app_type);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};

// Get list of near by drivers list
exports.getNearByDrivers = async (req, res, next) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return res.status(400).json({
        success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {},
      });
    }
    const { success, statusCode, message, type, data } = await generalJobService.getNearByDrivers(req, app_type);
    return res.status(statusCode).json({ success, type, message, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
  }
};
