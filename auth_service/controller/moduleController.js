const { validationResult } = require("express-validator");
const { moduledetail, moduleList, moduleDelete, moduleAddOrEdit, moduleDropdown } = require("../services/moduleService");
const common = require("common-service/statics/static.json");

/******* module - Add or Edit ******/
exports.moduleAddOrEdit = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(500).json({
            type: "Error",
            message: validationResult(req).errors[0].msg,
         });
      }
      const { statusCode, message, type } = await moduleAddOrEdit(req);
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

/******* module - View all ******/
exports.moduleList = async (req, res, next) => {
   try {

      const { statusCode, message, type, data } = await moduleList(req);
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

/******* module - View by ID ******/
exports.moduledetail = async (req, res, next) => {
   try {
      const { statusCode, message, type, data } = await moduledetail(req);
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

/******* module - Delete ******/
exports.moduleDelete = async (req, res, next) => {
   try {

      const { statusCode, message, type } = await moduleDelete(req);
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