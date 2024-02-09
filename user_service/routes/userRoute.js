const express = require("express");
const route = express.Router();
const formidable = require("formidable");
const { isEmpty } = require("common-service/utils/utils");
const { signinRequire } = require("common-service/middleware/authMiddleware");
const { checkPermission } = require("common-service/helper/checkPermission")
const valid = require("common-service/helper/validations");
const userController = require("../controller/userController");

// Super Admin - Routes ===========================
route.post("/superadmin-create-or-edit", valid.superAdminValidation, userController.superAdminAddOrEdit);
route.put("/superadmin-create-or-edit", valid.superAdminUpdateValidation, userController.superAdminAddOrEdit);

// User - Routes ===========================
route.put("/edit-profile", signinRequire, userController.userProfileEdit);
route.post("/check-email-exist", signinRequire, userController.checkEmailExist);
route.post("/add-or-edit", signinRequire, checkPermission, async (req, res, next) => {
    const form = new formidable.IncomingForm()
    form.multiples = false; // Set the multiples option to false
    form.parse(req, async (err, fields, files) => {
        if (err) { return res.status(500).json({ type: 'Error', message: 'Something went wrong' }) }
        for (const field in fields) {
            if (Array.isArray(fields[field]) && fields[field].length === 1) {
                fields[field] = fields[field][0];
            }
        }
        req.body = fields
        req.profile_pic = (!isEmpty(files)) ? files.profile_pic[0] : {}
        next()
    })
}, valid.userValidation, userController.userAddorEdit);
route.put("/add-or-edit", signinRequire, checkPermission, async (req, res, next) => {
    const form = new formidable.IncomingForm()
    form.multiples = false; // Set the multiples option to false
    form.parse(req, async (err, fields, files) => {
        if (err) { return res.status(500).json({ type: 'Error', message: 'Something went wrong' }) }
        for (const field in fields) {
            if (Array.isArray(fields[field]) && fields[field].length === 1) {
                fields[field] = fields[field][0];
            }
        }
        req.body = fields
        req.profile_pic = (!isEmpty(files)) ? files.profile_pic[0] : {}
        next()
    })
}, valid.userUpdateValidation, userController.userAddorEdit);
route.delete("/delete/:id", signinRequire, checkPermission, userController.userDelete);
route.get("/getall", signinRequire, checkPermission, userController.userList);
route.get("/get/:id", signinRequire, userController.userdetail);
route.post("/email-verify", userController.verifyUserEmail);
route.put("/change-status", signinRequire, valid.chngStatusValidation, userController.changeStatus);


// User Type - Routes ===========================
route.get("/usertype/getall", signinRequire, userController.getUserTypeList);
route.post("/usertype/add-or-edit", signinRequire, checkPermission, userController.userTypeAddorEdit);
route.put("/usertype/add-or-edit", signinRequire, checkPermission, userController.userTypeAddorEdit);
route.get("/usertype/get/:id", signinRequire, userController.getUserTypeList);

module.exports = route;
