const express = require("express");
const route = express.Router();
const formidable = require("formidable");
const { isEmpty } = require("common-service/utils/utils");
const { signinRequire } = require("common-service/middleware/authMiddleware");
const { checkPermission } = require("common-service/helper/checkPermission");
const { companyValidation, companyUpdateValidation, companyDetailValidation, chngStatusValidation } = require("common-service/helper/validations");
const companyController = require("../controller/companyController");

route.post("/add-or-edit", signinRequire, checkPermission,
    async (req, res, next) => {
        const form = new formidable.IncomingForm()
        form.multiples = true; // Set the multiples option to false
        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({
                    type: 'Error',
                    message: 'Something went wrong'
                })
            }
            for (const field in fields) {
                if (Array.isArray(fields[field]) && fields[field].length === 1) {
                    fields[field] = fields[field][0];
                }
            }
            req.body = fields
            req.logo = (!isEmpty(files) && files.logo) ? files.logo[0] : {}
            req.bg_photo = (!isEmpty(files) && files.bg_photo) ? files.bg_photo[0] : {}
            next()
        })
    },
    companyValidation, companyController.companyAddOrEdit);
route.put("/add-or-edit", signinRequire, checkPermission,
    async (req, res, next) => {
        const form = new formidable.IncomingForm()
        form.multiples = true; // Set the multiples option to false
        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({
                    type: 'Error',
                    message: 'Something went wrong'
                })
            }
            for (const field in fields) {
                if (Array.isArray(fields[field]) && fields[field].length === 1) {
                    fields[field] = fields[field][0];
                }
            }
            req.body = fields
            req.logo = (!isEmpty(files) && files.logo) ? files.logo[0] : {}
            req.bg_photo = (!isEmpty(files) && files.bg_photo) ? files.bg_photo[0] : {}
            next()
        })
    },
    companyController.companyAddOrEdit);
route.get("/get-next-company-code", signinRequire, companyController.getNextCompanyCode);
route.delete("/delete/:id", signinRequire, checkPermission, companyController.companyDelete);
route.get("/getall", signinRequire, checkPermission, companyController.allCompanyList);
route.get("/get/:id", signinRequire, companyController.companyDetail);
route.get("/get-company-list", signinRequire, companyController.getCompanyDropdown);

route.put("/change-status", signinRequire, chngStatusValidation, companyController.changeStatus);

// *********************** START : Company billing detail routes ***********************
route.post("/edit-billing", signinRequire, checkPermission, companyDetailValidation, companyController.companyBillingAddOrEdit);

module.exports = route;
