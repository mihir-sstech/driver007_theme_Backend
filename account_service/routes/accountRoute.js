const express = require("express");
const route = express.Router();
const formidable = require("formidable");
const { isEmpty } = require("common-service/utils/utils");
const { signinRequire } = require("common-service/middleware/authMiddleware");
const { checkPermission } = require("common-service/helper/checkPermission");
const { accountValidation } = require("common-service/helper/validations");
const { accountAddOrEdit, accountDelete, accountList, accountdetail, accountDropdown, changeStatus } = require("../controller/accountController");

route.post("/add-or-edit", signinRequire, checkPermission,
    async (req, res, next) => {
        const form = new formidable.IncomingForm()
        form.multiples = false; // Set the multiples option to false
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
            req.logo = (!isEmpty(files)) ? files.logo[0] : {}
            next()
        })
    },
    accountValidation, accountAddOrEdit);

route.put("/add-or-edit", signinRequire, checkPermission,
    async (req, res, next) => {
        const form = new formidable.IncomingForm()
        form.multiples = false; // Set the multiples option to false
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
            req.logo = (!isEmpty(files)) ? files.logo[0] : {}
            next()
        })
    },
    accountAddOrEdit);

route.delete("/delete/:id", signinRequire, checkPermission, accountDelete);
route.get("/getall", signinRequire, checkPermission, accountList);
route.get("/get/:id", signinRequire, accountdetail);
route.get("/get-list", signinRequire, accountDropdown);
route.put("/change-status", signinRequire, changeStatus);

module.exports = route;
