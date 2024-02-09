const { validationResult } = require("express-validator");
const cmsService = require("../services/cmsService");

/******* Company - Add or Edit ******/
exports.companyAddOrEdit = async (req, res, next) => {
   try {
      if (validationResult(req).errors.length > 0) {
         return res.status(500).json({
            type: "Error",
            message: validationResult(req).errors[0].msg,
         });
      }
      const { statusCode, message, type, data } = await cmsService.companyAddOrEdit(req);
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

      const { statusCode, message, type, data } = await cmsService.getNextCompanyCode(req);
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

      const { statusCode, message, type, data } = await cmsService.allCompanyList(req);
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

      const { statusCode, message, type, data } = await cmsService.companyDetail(req);
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
      const { statusCode, message, type, data } = await cmsService.companyDelete(req);
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

      const { statusCode, message, type, data } = await cmsService.getCompanyDropdown(req);
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
      const { statusCode, message, type, data } = await cmsService.companyBillingAddOrEdit(req);
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
      const { statusCode, message, type, data } = await cmsService.changeStatus(req);
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

const { Op } = require("sequelize");
const Model = require("common-service/models/driver007/cms");
const CMSModel = require("common-service/models/driver007/cms");
const { STATUS_CODE, MESSAGES } = require("../constant/index");
const universalFunction = require("../utils//universal-function");

class Cms {
   addCms = async (req, res, next) => {
      try {
         const { name } = req.body;

         const createSlug = (name) => {
            return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
         };

         const slug = createSlug(name);
         const criteria = { slug };

         // Log the criteria for debugging

         // Check if a record with the given criteria already exists
         const cmsCount = await Model.count({ where: criteria });

         // Log the count for debugging

         if (cmsCount > 0) {
            return universalFunction.sendErrorResponse(req, res, STATUS_CODE.BAD_REQUEST, MESSAGES.CMS_ALREADY_EXIST, MESSAGES.CMS_ALREADY_EXIST);
         }

         // Add the slug to the request body
         req.body.slug = slug;

         // Create a new record using Model.create
         const cms = await Model.create(req.body);

         if (cms) {
            return universalFunction.sendResponse(req, res, STATUS_CODE.SUCCESS, MESSAGES.CMS_CREATE, cms);
         } else {
            return universalFunction.sendErrorResponse(req, res, STATUS_CODE.BAD_REQUEST, MESSAGES.SOMETHING_WRONG);
         }
      } catch (error) {
         // Handle errors appropriately
         next(error);
      }
   };

   getAllCms = async (req, res, next) => {
      try {
         const { page, limit, status, search } = req.body;
         const criteria = {};

         if (status !== null && status !== undefined) {
            // Ensure status is converted to integer
            criteria.active = status ? 1 : 0;
         }

         if (search !== undefined && search !== null) {
            criteria.name = {
               [Op.iLike]: `%${search}%`
            };
         }
         criteria.is_deleted = 0
         const currentPage = parseInt(page, 10) || 1;
         const validLimit = parseInt(limit, 10) || 10; // Assuming a default limit of 10 if not provided
         const offset = (currentPage - 1) * validLimit;
         const cms = await Model.findAll({
            where: criteria,
            offset: offset,
            limit: limit,
            order: [['created_at', 'DESC']]
         });
         const totalRecords = await Model.count({
            where: criteria
         });

         const responsePayload = {
            page: currentPage,
            limit: limit,
            status: status,
            totalRecords: totalRecords,
            cms: cms,
         };

         if (!cms || cms.length === 0) {
            return universalFunction.sendErrorResponse(req, res, STATUS_CODE.BAD_REQUEST, MESSAGES.NOT_FOUND, MESSAGES.NOT_FOUND);
         }

         return universalFunction.sendResponse(req, res, STATUS_CODE.SUCCESS, MESSAGES.SUCCESS, responsePayload);
      } catch (error) {
         next(error);
      }
   };

   getCmsById = async (req, res, next) => {
      try {
         const criteria = { id: req.body.id, active: 1, is_deleted: 0 };
         const cms = await Model.findOne({ where: criteria });
         if (!cms || cms.length == 0) {
            return universalFunction.sendErrorResponse(req, res, STATUS_CODE.BAD_REQUEST, MESSAGES.NOT_FOUND, MESSAGES.NOT_FOUND);
         }
         return universalFunction.sendResponse(req, res, STATUS_CODE.SUCCESS, MESSAGES.SUCCESS, cms);
      } catch (error) {
         next(error);
      }
   };

   editCms = async (req, res, next) => {
      try {
         const { name } = req.body;
         const [updatedRowsCount, [updatedCms]] = await Model.update(req.body, {
            where: { id: req.body.id, active: 1 },
            returning: true,
         });

         if (updatedRowsCount === 0 || !updatedCms) {
            throw new Error(MESSAGES.NOT_FOUND);
         }

         return universalFunction.sendResponse(req, res, STATUS_CODE.SUCCESS, MESSAGES.CMS_EDIT, updatedCms);
      } catch (error) {
         next(error);
      }
   };

   activeInactiveCms = async (req, res, next) => {
      try {
         const criteria = { id: req.body.id };
         const updateData = { active: req.body.status ? 1 : 0 };

         const [updatedRowsCount, updatedRows] = await Model.update(updateData, {
            where: criteria,
            returning: true, // This ensures that the updated rows are returned
         });

         if (updatedRowsCount === 0 || !updatedRows || updatedRows.length === 0) {
            return universalFunction.sendErrorResponse(req, res, STATUS_CODE.NOT_FOUND, MESSAGES.NOT_FOUND, MESSAGES.NOT_FOUND);
         } else {
            const msg = req.body.status ? MESSAGES.CMS_ACTIVATED_SUCCESSFULLY : MESSAGES.CMS_DEACTIVATED_SUCCESSFULLY;
            return universalFunction.sendResponse(req, res, STATUS_CODE.SUCCESS, msg, updatedRows[0]);
         }
      } catch (error) {
         next(error);
      }
   };

   deleteCms = async (req, res, next) => {
      try {
         const criteria = { id: req.body.id };
         const updateData = { is_deleted: 1 };

         const [updatedRowsCount, [updatedCms]] = await Model.update(updateData, {
            where: criteria,
            returning: true,
         });

         if (updatedRowsCount === 0 || !updatedCms) {
            return universalFunction.sendErrorResponse(req, res, STATUS_CODE.NOT_FOUND, MESSAGES.NOT_FOUND, MESSAGES.NOT_FOUND);
         } else {
            const msg = MESSAGES.CMS_DELETED_SUCCESSFULLY;
            return universalFunction.sendResponse(req, res, STATUS_CODE.SUCCESS, msg, updatedCms);
         }
      } catch (error) {
         next(error);
      }
   };

}
module.exports = new Cms();