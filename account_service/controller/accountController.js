const { validationResult } = require("express-validator");
const { accountAddOrEdit, accountDelete, accountList, accountdetail, accountDropdown, changeStatus } = require("../services/accountService");

/******* Account - Add or Edit ******/
exports.accountAddOrEdit = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(500).json({
            type: "Error",
            message: validationResult(req).errors[0].msg,
         });
      }
      const { statusCode, message, type, data } = await accountAddOrEdit(req);
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

/******* Account - Delete ******/
exports.accountDelete = async (req, res, next) => {
   try {

      const { statusCode, message, type } = await accountDelete(req);
      return res.status(statusCode).json({
         type,
         message,
      });
   } catch (error) {
      console.log(error);
      return res.status(401).json({
         type: "error",
         message: error,
      });
   }
};

/******* Account - View all ******/
exports.accountList = async (req, res, next) => {
   try {

      const { statusCode, message, type, data } = await accountList(req);
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

/******* Account - View by ID ******/
exports.accountdetail = async (req, res, next) => {
   try {
      const { statusCode, message, type, data } = await accountdetail(req);
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

/******* Account - list for dropdown ******/
exports.accountDropdown = async (req, res, next) => {
   try {

      const { statusCode, message, type, data } = await accountDropdown(req);
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

/******* Account - Status change ******/
exports.changeStatus = async (req, res, next) => {
   try {
      const { statusCode, message, type, data } = await changeStatus(req);
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