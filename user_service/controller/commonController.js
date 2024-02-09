const commonService = require("common-service/services/commonService");

// get country list for dropdowns
exports.getCountryList = async (req, res) => {
   try {
      const { statusCode, message, type, data } = await commonService.getCountryList(req);
      return res.status(statusCode).json({
         type,
         message,
         data
      });
   } catch (error) {
      console.log(error);
      return res.status(401).json({
         type: "error",
         message: error,
      });
   }
};

// get state list for dropdowns
exports.getStateList = async (req, res) => {
   try {
      const { statusCode, message, type, data } = await commonService.getStateList(req);
      return res.status(statusCode).json({
         type,
         message,
         data
      });
   } catch (error) {
      console.log(error);
      return res.status(401).json({
         type: "error",
         message: error,
      });
   }
};

// get currency list for dropdowns
exports.getCurrencyDropdown = async (req, res) => {
   try {
      const { statusCode, message, type, data } = await commonService.getCurrencyDropdown(req);
      return res.status(statusCode).json({
         type,
         message,
         data
      });
   } catch (error) {
      console.log(error);
      return res.status(401).json({
         type: "error",
         message: error,
      });
   }
};

// get Weight Units for dropdowns
exports.getWeightUnits = async (req, res) => {
   try {
      const { statusCode, message, type, data } = await commonService.getWeightUnits(req);
      return res.status(statusCode).json({
         type,
         message,
         data
      });
   } catch (error) {
      console.log(error);
      return res.status(401).json({
         type: "error",
         message: error,
      });
   }
};

// get Input field types for dropdowns
exports.getInputFieldTypes = async (req, res) => {
   try {
      const { statusCode, message, type, data } = await commonService.getInputFieldTypes(req);
      return res.status(statusCode).json({
         type,
         message,
         data
      });
   } catch (error) {
      console.log(error);
      return res.status(401).json({
         type: "error",
         message: error,
      });
   }
};

// get Vehicle Docs List for dropdowns
exports.getVehicleDocsList = async (req, res) => {
   try {
      const { statusCode, message, type, data } = await commonService.getVehicleDocsList(req);
      return res.status(statusCode).json({
         type,
         message,
         data
      });
   } catch (error) {
      console.log(error);
      return res.status(401).json({
         type: "error",
         message: error,
      });
   }
};