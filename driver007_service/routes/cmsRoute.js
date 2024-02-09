const express = require("express");
const route = express.Router();
const formidable = require("formidable");
const { isEmpty } = require("common-service/utils/utils");
const { signinRequire } = require("common-service/middleware/authMiddleware");
const { checkPermission } = require("common-service/helper/checkPermission");
const { companyValidation, companyUpdateValidation, companyDetailValidation, chngStatusValidation } = require("common-service/helper/validations");
const cmsController = require("../controller/cmsController");

// route.post("/add-or-edit", signinRequire, checkPermission,
//     async (req, res, next) => {
//         const form = new formidable.IncomingForm()
//         form.multiples = true; // Set the multiples option to false
//         form.parse(req, async (err, fields, files) => {
//             if (err) {
//                 return res.status(500).json({
//                     type: 'Error',
//                     message: 'Something went wrong'
//                 })
//             }
//             for (const field in fields) {
//                 if (Array.isArray(fields[field]) && fields[field].length === 1) {
//                     fields[field] = fields[field][0];
//                 }
//             }
//             req.body = fields
//             req.logo = (!isEmpty(files) && files.logo) ? files.logo[0] : {}
//             req.bg_photo = (!isEmpty(files) && files.bg_photo) ? files.bg_photo[0] : {}
//             next()
//         })
//     },
//     companyValidation, cmsController.companyAddOrEdit);
// route.put("/add-or-edit", signinRequire, checkPermission,
//     async (req, res, next) => {
//         const form = new formidable.IncomingForm()
//         form.multiples = true; // Set the multiples option to false
//         form.parse(req, async (err, fields, files) => {
//             if (err) {
//                 return res.status(500).json({
//                     type: 'Error',
//                     message: 'Something went wrong'
//                 })
//             }
//             for (const field in fields) {
//                 if (Array.isArray(fields[field]) && fields[field].length === 1) {
//                     fields[field] = fields[field][0];
//                 }
//             }
//             req.body = fields
//             req.logo = (!isEmpty(files) && files.logo) ? files.logo[0] : {}
//             req.bg_photo = (!isEmpty(files) && files.bg_photo) ? files.bg_photo[0] : {}
//             next()
//         })
//     },
//     cmsController.companyAddOrEdit);
// route.get("/get-next-company-code", signinRequire, cmsController.getNextCompanyCode);
// route.delete("/delete/:id", signinRequire, checkPermission, cmsController.companyDelete);
// route.get("/getall", signinRequire, checkPermission, cmsController.allCompanyList);
// route.get("/get/:id", signinRequire, cmsController.companyDetail);
// route.get("/get-company-list", signinRequire, cmsController.getCompanyDropdown);

// route.put("/change-status", signinRequire, chngStatusValidation, cmsController.changeStatus);

// *********************** START : Company billing detail routes ***********************
// route.post("/edit-billing", signinRequire, checkPermission, companyDetailValidation, cmsController.companyBillingAddOrEdit);
route.post("/addCms", cmsController.addCms);
route.post("/getAllCms", cmsController.getAllCms);
route.post("/getCmsById", cmsController.getCmsById);
route.post("/editCms", cmsController.editCms);
route.post("/activeInactiveCms", cmsController.activeInactiveCms);
route.post("/deleteCms", cmsController.deleteCms);
module.exports = route;
