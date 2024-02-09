const { validationResult } = require("express-validator");
const companyService = require("../services/companyService");

/******* Company - Add or Edit ******/
exports.companyAddOrEdit = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(500).json({
            type: "Error",
            message: validationResult(req).errors[0].msg,
         });
      }
      const { statusCode, message, type, data } = await companyService.companyAddOrEdit(req);
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

/******* Company - Get next company code ******/
exports.getNextCompanyCode = async (req, res, next) => {
   try {

      const { statusCode, message, type, data } = await companyService.getNextCompanyCode(req);
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

/******* Company - View all ******/
exports.allCompanyList = async (req, res, next) => {
   try {

      const { statusCode, message, type, data } = await companyService.allCompanyList(req);
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

/******* Company - View by ID ******/
exports.companyDetail = async (req, res, next) => {
   try {

      const { statusCode, message, type, data } = await companyService.companyDetail(req);
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

/******* Company - Delete ******/
exports.companyDelete = async (req, res, next) => {
   try {
      const { statusCode, message, type, data } = await companyService.companyDelete(req);
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

/******* Company - List for dropdown ******/
exports.getCompanyDropdown = async (req, res, next) => {
   try {

      const { statusCode, message, type, data } = await companyService.getCompanyDropdown(req);
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

/******* Company Billing - Add or Edit ******/
exports.companyBillingAddOrEdit = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(500).json({
            type: "Error",
            message: validationResult(req).errors[0].msg,
         });
      }
      const { statusCode, message, type, data } = await companyService.companyBillingAddOrEdit(req);
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

/******* Change status ******/
exports.changeStatus = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(500).json({
            type: "Error",
            message: validationResult(req).errors[0].msg,
         });
      }
      const { statusCode, message, type, data } = await companyService.changeStatus(req);
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