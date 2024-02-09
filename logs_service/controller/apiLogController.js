const { validationResult } = require("express-validator");
const { packagedetail, packageList, packageDelete, packageAddOrEdit } = require("../services/logsService");
const common = require("common-service/statics/static.json");

/******* package - Add or Edit ******/
exports.packageAddOrEdit = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(500).json({
            type: "Error",
            message: validationResult(req).errors[0].msg,
         });
      }
      const { statusCode, message, type } = await packageAddOrEdit(req);
      console.log('type: ', type);
      console.log('message: ', message);
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

/******* package - View all ******/
exports.packageList = async (req, res, next) => {
   try {

      const { statusCode, message, type, data } = await packageList(req);
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

/******* package - View by ID ******/
exports.packagedetail = async (req, res, next) => {
   try {
      const { statusCode, message, type, data } = await packagedetail(req);
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

/******* package - Delete ******/
exports.packageDelete = async (req, res, next) => {
   try {

      const { statusCode, message, type } = await packageDelete(req);
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
