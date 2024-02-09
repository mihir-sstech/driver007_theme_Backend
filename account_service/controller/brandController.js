const { validationResult } = require("express-validator");
const { brandAddOrEdit,brandList,brandDetails,brandDelete,brandStatus, brandDropdown } = require("../services/brandService");

/******* Brand - Add or Edit ******/
exports.brandAddOrEdit = async (req, res, next) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return res.status(500).json({
        type: "Error",
        message: validationResult(req).errors[0].msg,
      });
    }
    const { statusCode, message, type, data } = await brandAddOrEdit(req);
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

/******* Account - View all ******/
exports.brandList = async (req, res, next) => {
  try {

     const { statusCode, message, type, data } = await brandList(req);
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

/******* Brand - get by id ******/
exports.brandDetails = async (req, res, next) => {
  try {
     const { statusCode, message, type, data } = await brandDetails(req);
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

/******* Brand - Delete ******/
exports.brandDelete = async (req, res, next) => {
  try {

     const { statusCode, message, type } = await brandDelete(req);
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

/******* Brand - Status change ******/
exports.brandStatus = async (req, res, next) => {
   try {
      const { statusCode, message, type, data } = await brandStatus(req);
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

/******* Brand - list for dropdown ******/
exports.brandDropdown = async (req, res, next) => {
   try {

      const { statusCode, message, type, data } = await brandDropdown(req);
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