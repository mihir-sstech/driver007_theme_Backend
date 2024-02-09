const { validationResult } = require("express-validator");
const { superAdminAddOrEdit, userAddorEdit, userProfileEdit, checkEmailExist, getUserTypeList, userTypeAddorEdit, userDelete, userList, userdetail, verifyUserEmail, changeStatus } = require("../services/userService");

/******* Super Admin User - Add Or Edit ******/
exports.superAdminAddOrEdit = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(500).json({
            type: "Error",
            message: validationResult(req).errors[0].msg,
         });
      }

      const { statusCode, message, type } = await superAdminAddOrEdit(req);
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

/******* User - Get user type list ******/
exports.getUserTypeList = async (req, res) => {
   try {
      const { statusCode, message, type, data } = await getUserTypeList(req);
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

/******* User - Get user type list ******/
exports.userTypeAddorEdit = async (req, res) => {
   try {
      const { statusCode, message, type } = await userTypeAddorEdit(req);
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

/******* User - Check email exist or not ******/
exports.checkEmailExist = async (req, res) => {
   try {
      const { statusCode, message, type, data } = await checkEmailExist(req);
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

/******* User - Add or Edit ******/
exports.userAddorEdit = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(500).json({
            type: "Error",
            message: validationResult(req).errors[0].msg,
         });
      }

      const { statusCode, message, type } = await userAddorEdit(req);
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

/******* User - Edit profile******/
exports.userProfileEdit = async (req, res, next) => {
   try {
      const { statusCode, message, type } = await userProfileEdit(req);
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

/******* User - Delete ******/
exports.userDelete = async (req, res, next) => {
   try {

      const { statusCode, message, type } = await userDelete(req);
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

/******* User - View all ******/
exports.userList = async (req, res, next) => {
   try {

      const { statusCode, message, type, data } = await userList(req);
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

/******* User - View by ID ******/
exports.userdetail = async (req, res, next) => {
   try {
      const { statusCode, message, type, data } = await userdetail(req);
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

/******* User - email verify via email sending******/
exports.verifyUserEmail = async (req, res, next) => {
   try {
      const { statusCode, message, type } = await verifyUserEmail(req);
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


/******* User - Status change ******/
exports.changeStatus = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(500).json({
            type: "Error",
            message: validationResult(req).errors[0].msg,
         });
      }
      const { statusCode, message, type, data } = await changeStatus(req);
      return res.status(statusCode).json({ type, message, data });
   } catch (error) {
      console.log(error);
      return res.status(401).json({ type: "error", message: error, });
   }
};


