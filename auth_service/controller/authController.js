const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { signin, forgotPassword, resetPassword, logout, loginUserData, roleAddOrEdit, getRoleDetail, getPermRoleWise, editPermRoleWise, getRoleList, permissionGetAll, permissionAdd, test } = require("../services/authService");

exports.signin = async (req, res, next) => {

   const { statusCode, message, type, data } = await signin(req);
   return res.status(statusCode).json({
      type,
      message,
      data,
   });
};

exports.forgotPassword = async (req, res, next) => {
   const { statusCode, message, type } = await forgotPassword(req.body);

   return res.status(statusCode).json({
      type,
      message,
   });
};

exports.resetPassword = async (req, res, next) => {
   const { statusCode, message, type } = await resetPassword(req);

   return res.status(statusCode).json({
      type,
      message,
   });
};

exports.logout = async (req, res, next) => {
   if (!req.headers.authorization) throw "Token required";
   const token = req.headers.authorization.replace("Bearer ", "");
   if (!token) throw "Invalid token";
   const { statusCode, message, type } = await logout(token, req);

   return res.status(statusCode).json({
      type,
      message,
   });
};

exports.loginUserData = async (req, res) => {
   try {
      const { statusCode, message, type, user_details } = await loginUserData(
         req.userProfile
      );
      return res.status(statusCode).json({
         type,
         message,
         user_details,
      });
   } catch (error) {
      console.log(error);
      return res.status(401).json({
         type: "error",
         message: error,
      });
   }
};

exports.test = async (req, res, next) => {
   console.log(req.userProfile);
   return res.status(200).json(req.userProfile);
};

exports.roleAddOrEdit = async (req, res) => {
   try {
      const { statusCode, message, type, role_details } = await roleAddOrEdit(req);
      return res.status(statusCode).json({
         type,
         message,
         role_details,
      });
   } catch (error) {
      console.log(error);
      return res.status(401).json({
         type: "error",
         message: error,
      });
   }
};

exports.getRoleDetail = async (req, res) => {
   try {
      const { statusCode, message, type, data } = await getRoleDetail(req);
      return res.status(statusCode).json({
         type,
         message,
         data,
      });
   } catch (error) {
      console.log(error);
      return res.status(401).json({
         type: "error",
         message: error,
      });
   }
};

exports.getRoleList = async (req, res) => {
   try {
      const { statusCode, message, type, data } = await getRoleList(req);
      return res.status(statusCode).json({
         type,
         message,
         data,
      });
   } catch (error) {
      console.log(error);
      return res.status(401).json({
         type: "error",
         message: error,
      });
   }
};

exports.getPermRoleWise = async (req, res) => {
   try {
      const { statusCode, message, type, data } = await getPermRoleWise(req);
      return res.status(statusCode).json({
         type,
         message,
         data,
      });
   } catch (error) {
      console.log(error);
      return res.status(401).json({
         type: "error",
         message: error,
      });
   }
};

exports.editPermRoleWise = async (req, res) => {
   try {
      const { statusCode, message, type } = await editPermRoleWise(req);

      return res.status(statusCode).json({
         type,
         message
      });
   } catch (error) {
      console.log(error);
      return res.status(401).json({
         type: "error",
         message: error,
      });
   }
};

exports.permissionAdd = async (req, res) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(500).json({
            type: "Error",
            message: validationResult(req).errors[0].msg,
         });
      }
      const { statusCode, message, type } = await permissionAdd(req);

      return res.status(statusCode).json({
         type,
         message
      });
   } catch (error) {
      console.log(error);
      return res.status(401).json({
         type: "error",
         message: error,
      });
   }
};

exports.permissionGetAll = async (req, res) => {
   try {
      const { statusCode, message, type, data } = await permissionGetAll(req);

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
