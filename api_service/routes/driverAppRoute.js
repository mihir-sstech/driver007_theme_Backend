const express = require("express");
const route = express.Router();
const formidable = require("formidable");
const multer = require('multer');
const path = require('path');
const constant = require("common-service/constant/constant.json")
const { isEmpty } = require("common-service/utils/utils");
const { isDriverLoggedin } = require("common-service/middleware/authMiddleware");
const retailerValid = require("common-service/helper/retailerAppValidations");
const driverValid = require("common-service/helper/driverAppValidations");
const driverCntrler = require("../controller/driverAppController");
const { response_msg, response_status_code, response_type, response_success } = require("common-service/statics/static.json");

// -------------------------------------------------------------
const upload = multer({
    storage: multer.diskStorage({
        // destination: './uploads/document',
        destination: path.join(__dirname, '../../', "driver_service", "uploads/document"),
        filename: (req, file, cb) => {

            const randomString = Math.random().toString(36).substring(2, 15);
            // Rename the image file
            const newFilename = `${Date.now()}_${randomString}${path.extname(file.originalname)}`;
            cb(null, newFilename);
        },
    }),
    limits: {
        fileSize: constant.DOC_MAX_SIZE, // 5 MB
    },
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        ext = ext.toLowerCase();
        const doc_allowed_types = constant.DOC_ALLOWED_TYPES;
        if (doc_allowed_types.includes(ext)) {
            cb(null, true); // Accept the file
        } else {
            return cb(new Error(response_msg.invalid_multi_file), false); // Reject file with error msg
        }
    },
});

const multerErrorHandler = (err, req, res, next) => {
    console.log('Multer Err---------------: ', err);
    const statusCode = response_status_code.bad_request;

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(statusCode).json({ success: response_success.false, type: response_type.error, message: response_msg.exceeds_multi_file_size });
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(statusCode).json({ success: response_success.false, type: response_type.error, message: response_msg.invalid_multi_file });
        }
        return res.status(statusCode).json({ success: response_success.false, type: response_type.error, message: response_msg.img_not_uploaded });
    }
    if (err) { // Handle other errors
        return res.status(statusCode).json({ success: response_success.false, type: response_type.error, message: err.message });
    }
    next();
};

// -------------------------------------------------------------
route.post("/test-route-new", upload.any(), multerErrorHandler, driverCntrler.testFunctionNew);
route.post("/test-route",
    async (req, res, next) => {
        console.log('req: ', req);
        console.log("*************** 1 **************");

        const form = new formidable.IncomingForm()
        form.multiples = true;  // To allow multiple imgd set option to FALSE // false; 
        form.parse(req, async (err, fields, files) => {
            console.log('fields:********************* ', fields);
            if (err) {
                console.log('err: ', err);

                return res.status(500).json({ type: 'Error', message: 'Something went wrong HETVI' })
            }
            for (const field in fields) {
                if (Array.isArray(fields[field]) && fields[field].length === 1) {
                    fields[field] = fields[field][0];
                }
            }
            req.body = fields
            req.licence_img_front = (!isEmpty(files) && files.licence_img_front) ? files.licence_img_front : {}
            req.licence_img_back = (!isEmpty(files) && files.licence_img_back) ? files.licence_img_back : {}

            console.log('licence_img_back: ', req.licence_img_back);
            console.log('licence_img_front: ', req.licence_img_front);
            console.log("body---------", req.body);

            next()
        })
    },
    driverCntrler.testFunction);


/* *************** START: GUEST ROUTES ****************** */
route.get("/country-list", driverCntrler.getCountryList);
route.post("/state-list", driverCntrler.getStateList);
// route.get("/state-list/:id", driverCntrler.getStateList);

route.post("/registration", driverValid.regValidation, driverCntrler.register);
route.post("/forgot-password", driverCntrler.forgotPassword);
route.post("/resend-otp", retailerValid.resendOtpValidation, driverCntrler.resendOtp); // email_verif & forgot_pass
route.post("/otp-verify", retailerValid.otpVerifyValidation, driverCntrler.otpVerify); // email_verif & forgot_pass
route.post("/change-password", retailerValid.changePassValidation, driverCntrler.changePassword);
route.post("/login", retailerValid.loginValidation, driverCntrler.login);
/* *************** END: GUEST ROUTES ****************** */

/* *************** START: INITIAL ROUTES ****************** */
route.post("/update-password", isDriverLoggedin, retailerValid.updatePassValidation, driverCntrler.changePassword);
route.post("/fcm-token", isDriverLoggedin, retailerValid.addFCMValidation, driverCntrler.fcmAddEditDelete);
route.post("/fcm-token/remove", isDriverLoggedin, retailerValid.logoutValidation, driverCntrler.fcmAddEditDelete);
route.delete("/profile-delete", isDriverLoggedin, driverCntrler.userAction);
route.put("/profile-update", isDriverLoggedin,
    async (req, res, next) => {
        const form = new formidable.IncomingForm()
        form.multiples = true;  // To allow multiple imgd set option to FALSE // false; 
        form.parse(req, async (err, fields, files) => {
            if (err) { return res.status(500).json({ type: 'Error', message: 'Something went wrong' }) }
            for (const field in fields) {
                if (Array.isArray(fields[field]) && fields[field].length === 1) {
                    fields[field] = fields[field][0];
                }
            }
            req.body = fields
            req.profile_pic = (!isEmpty(files) && files.profile_pic) ? files.profile_pic : {}
            next()
        })
    }, retailerValid.profileUpdateValidation, driverCntrler.userAction);
route.get("/profile-get", isDriverLoggedin, driverCntrler.userAction);
/* *************** END: INITIAL ROUTES ****************** */

/* *************** START: DRIVER RELATED ROUTES ****************** */
route.get("/profile-completion", isDriverLoggedin, driverCntrler.getProfileProgress);
route.post("/get-dynamic-fields", isDriverLoggedin, driverValid.dynamicFieldValidation, driverCntrler.getDynamicFields);
route.get("/get-details", isDriverLoggedin, driverCntrler.getDriverDetail); //get driver's licence|bank|vehicle info
route.put("/update-licence-data", isDriverLoggedin, upload.any(), multerErrorHandler, driverCntrler.updateLicenceData);
route.post("/update-bankacc-info", isDriverLoggedin, driverCntrler.updateBankAccInfo);

/* *************** END: DRIVER RELATED ROUTES ****************** */

/* ************************** START: VEHICLE RELATED ROUTES ************************* */
route.get("/weightunit-list", isDriverLoggedin, driverCntrler.getWeightUnits);
route.get("/package-list", isDriverLoggedin, driverCntrler.getPackageList);
route.get("/vehicle-list", isDriverLoggedin, driverCntrler.getVehicleList);

route.post("/addoredit-document", isDriverLoggedin, upload.any(), multerErrorHandler, driverCntrler.vehDocOperations);
route.post("/get-document", isDriverLoggedin, driverValid.getVehDocValidation, driverCntrler.vehDocOperations);
route.post("/delete-document", isDriverLoggedin, driverValid.getVehDocValidation, driverCntrler.vehDocOperations);

route.post("/addoredit-vehicle", isDriverLoggedin, upload.any(), multerErrorHandler, driverCntrler.vehicleOperation);
route.post("/get-veh-by-vehicleid", isDriverLoggedin, driverValid.getVehValidation, driverCntrler.vehicleOperation);
route.post("/delete-vehicle", isDriverLoggedin, driverValid.getVehValidation, driverCntrler.vehicleOperation);

route.post("/remove-veh-attachment", isDriverLoggedin, driverValid.delVehAttachValid, driverCntrler.removeVehAttachment);
route.post("/change-vehicle-status", isDriverLoggedin, driverValid.changeVehStatValid, driverCntrler.changeVehicleStatus);

/* ************************** END: VEHICLE RELATED ROUTES ************************* */


// ******************* Commented routes for BKP ************************
/*
route.put("/update-licence-data", isDriverLoggedin,
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
            req.licence_img_front = (!isEmpty(files) && files.licence_img_front) ? files.licence_img_front : {}
            req.licence_img_back = (!isEmpty(files) && files.licence_img_back) ? files.licence_img_back : {}
            next()
        })
    },
    driverValid.licenceValidation, driverCntrler.updateLicenceData);
route.post("/addoredit-document", isDriverLoggedin,
    async (req, res, next) => {
        const form = new formidable.IncomingForm()
        form.multiples = true; // Set the multiple file upload option to TRUE
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
            req.body = fields;
            req.attachment = (!isEmpty(files) && files.attachment) ? files.attachment : {}
            // req.attachment = (!isEmpty(files)) ? Object.values(files)[0] : {}
            next()
        })
    },
    driverValid.vehDocValidation, driverCntrler.vehDocOperations);
route.post("/addoredit-vehicle", isDriverLoggedin,
    async (req, res, next) => {
        const form = new formidable.IncomingForm()
        form.multiples = true; // Set the multiple file upload option to TRUE
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
            req.body = fields;
            req.attachment = (!isEmpty(files) && files.attachment) ? files.attachment : {}
            // req.attachment = (!isEmpty(files)) ? Object.values(files)[0] : {}
            next()
        })
    },
    driverValid.updateVehValidation, driverCntrler.vehicleOperation);
*/
// ******************* Commented routes for BKP ************************



module.exports = route;
