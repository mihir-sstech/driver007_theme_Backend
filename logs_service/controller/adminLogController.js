const { adminLogList, adminLogDetail, apiLogList, apiLogDetail, getAddressBookList, addressDelete, addressDropdown } = require("../services/logsService");
const common = require("common-service/statics/static.json");


/******* get All Admin logs - View all ******/
exports.getAllAdminlogs = async (req, res, next) => {
   try {

      const { statusCode, message, type, data } = await adminLogList(req);
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

/******* get All Api logs - View all ******/
exports.getAllApilogs = async (req, res, next) => {
   try {

      const { statusCode, message, type, data } = await apiLogList(req);
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

/******* admin Log detail - View by ID ******/
exports.adminLogDetail = async (req, res, next) => {
   try {
      const { statusCode, message, type, data } = await adminLogDetail(req);
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

/******* api Log detail - View by ID ******/
exports.apiLogdetail = async (req, res, next) => {
   try {
      const { statusCode, message, type, data } = await apiLogDetail(req);
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

/******* admin list of address book ******/
exports.getAddressBookList = async (req, res, next) => {
   try {
      const { statusCode, message, type, data } = await getAddressBookList(req);
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

/******* address - Delete ******/
exports.addressDelete = async (req, res, next) => {
   try {

      const { statusCode, message, type } = await addressDelete(req);
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

/******* address - Dropdown ******/
exports.addressDropdown = async (req, res, next) => {
   try {

      const { statusCode, message, type, data } = await addressDropdown(req);
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