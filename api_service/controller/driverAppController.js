const { validationResult } = require("express-validator");
const common = require("common-service/statics/static.json")
const { replaceNullWithEmptyString } = require("common-service/helper/general");
const { getCountryList, getStateList, getWeightUnits } = require("common-service/services/commonService");
const driverAppService = require("../services/driverAppService");
const retailerAppService = require("../services/retailerAppService");
const app_type = "Driver";



/******* Function for testing & debugging purpose ******/
exports.testFunction = async (req, res, next) => {
   try {
      const { success, statusCode, message, type, data } = await driverAppService.testFunction(req);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};
/******* Function for testing & debugging purpose - MULTER ******/
exports.testFunctionNew = async (req, res, next) => {
   try {
      const { success, statusCode, message, type, data } = await driverAppService.testFunctionNew(req);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Function for get country list for dropdown ******/
exports.getCountryList = async (req, res, next) => {
   try {
      const { success, statusCode, message, type, data } = await getCountryList(req);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Function for get country-wise state list for dropdown ******/
exports.getStateList = async (req, res) => {
   try {
      const { success, statusCode, message, type, data } = await getStateList(req);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Driver registration ******/
exports.register = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(400).json({ success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {}, });
      }
      var { success, statusCode, message, type, data } = await driverAppService.register(req);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* OTP verification ******/
exports.otpVerify = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(400).json({ success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {}, });
      }
      const { success, statusCode, message, type, data } = await retailerAppService.otpVerify(req, app_type);
      // const { success, statusCode, message, type, data } = await driverAppService.otpVerify(req);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Driver Login ******/
exports.login = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(400).json({ success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {}, });
      }
      var { success, statusCode, message, type, data } = await driverAppService.login(req);
      data = await replaceNullWithEmptyString(data)
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
         return res.status(400).json({ success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {}, });
      }
      const { success, statusCode, message, type, data } = await retailerAppService.fcmAddEditDelete(req, app_type);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Forgot password email send ******/
exports.forgotPassword = async (req, res, next) => {
   try {
      const { success, statusCode, message, type, data } = await retailerAppService.forgotPassword(req, app_type);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Resend OTP for forgot password & email verify. ******/
exports.resendOtp = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(400).json({ success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {}, });
      }
      if (req.body?.action_type == "otp_for_forgotpass") {
         const { success, statusCode, message, type, data } = await retailerAppService.forgotPassword(req, app_type);
         return res.status(statusCode).json({ success, type, message, data });
      } else if (req.body?.action_type == "otp_for_emailverify") {
         const { success, statusCode, message, type, data } = await driverAppService.emailVerifyOtpSend(req);
         return res.status(statusCode).json({ success, type, message, data });
      } else {
         return res.status(400).json({ success: false, type: common.response_type.error, message: common.response_msg.incorrect_actiontype, data: {}, });
      }
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Function for change password ******/
exports.changePassword = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(400).json({ success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {}, });
      }
      const { success, statusCode, message, type, data } = await retailerAppService.changePassword(req, app_type);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* User details - Edit or Get ******/
exports.userAction = async (req, res, next) => {
   try {
      const user_type = "driver";
      if (validationResult(req).errors.length > 0) {
         return res.status(400).json({ success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {}, });
      }
      let { success, statusCode, message, type, data } = await retailerAppService.userAction(req, app_type, user_type);
      data = await replaceNullWithEmptyString(data)
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Get country-wise dynamic LICENCE FIELDS|VEH. DOCUMENTS|BANK ACC. fields ******/
exports.getDynamicFields = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(400).json({ success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {}, });
      }
      let { success, statusCode, message, type, data } = await driverAppService.getDynamicFields(req);
      data = await replaceNullWithEmptyString(data)
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

// ============= Get driver's LICENCE|VEHICLES|BANK ACC. detail by driver ID  =====================
exports.getDriverDetail = async (req, res, next) => {
   try {
      const { success, statusCode, message, type, data } = await driverAppService.getDriverDetail(req);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Add/Edit driver's licence details ******/
exports.updateLicenceData = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(400).json({ success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {}, });
      }
      let { success, statusCode, message, type, data } = await driverAppService.updateLicenceData(req);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Add/Edit driver's bank account details ******/
exports.updateBankAccInfo = async (req, res, next) => {
   try {
      const { success, statusCode, message, type, data } = await driverAppService.updateBankAccInfo(req);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Get Weight unit list ******/
exports.getWeightUnits = async (req, res, next) => {
   try {
      const { success, statusCode, message, type, data } = await getWeightUnits(req);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Get package types list ******/
exports.getPackageList = async (req, res, next) => {
   try {
      const { success, statusCode, message, type, data } = await driverAppService.getPackageList(req);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Vehicle - List ******/
exports.getVehicleList = async (req, res, next) => {
   try {
      const { success, statusCode, message, type, data } = await retailerAppService.getVehicleList(req, app_type);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Add/Edit/Delete/Get vehicle documents ******/
exports.vehDocOperations = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(400).json({ success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {}, });
      }
      const { success, statusCode, message, type, data } = await driverAppService.vehDocOperations(req);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Delete vehicle attachment ******/
exports.removeVehAttachment = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(400).json({ success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {}, });
      }
      const { success, statusCode, message, type, data } = await driverAppService.removeVehAttachment(req);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Change vehicle status ******/
exports.changeVehicleStatus = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(400).json({ success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {}, });
      }
      const { success, statusCode, message, type, data } = await driverAppService.changeVehicleStatus(req);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Get/Update/Get driver's vehicle details ******/
exports.vehicleOperation = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(400).json({ success: false, type: common.response_type.error, message: validationResult(req).errors[0].msg, data: {}, });
      }
      let { success, statusCode, message, type, data } = await driverAppService.vehicleOperation(req);
      data = await replaceNullWithEmptyString(data)
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};

/******* Get Driver Vehicle detail with it's document list by vehicle ID  ******/
/*exports.getVehByVehicleId = async (req, res, next) => {
   try {
      let { success, statusCode, message, type, data } = await driverAppService.getVehByVehicleId(req);
      data = await replaceNullWithEmptyString(data)
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};
*/

exports.getProfileProgress = async (req, res, next) => {
   try {
      let { success, statusCode, message, type, data } = await driverAppService.getProfileProgress(req);
      return res.status(statusCode).json({ success, type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, type: common.response_type.error, message: error, });
   }
};