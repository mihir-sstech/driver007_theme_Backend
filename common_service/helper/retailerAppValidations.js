const { check, body, validationResult } = require("express-validator");

const loginValidation = [
  check('email').not().isEmpty().withMessage('Email field is require').isEmail().withMessage('Please enter valid email').trim().escape(),
  check('password').not().isEmpty().withMessage('Password field is require'),
  // check('company_id').not().isEmpty().withMessage('Company field is require'),
];

const addFCMValidation = [
  check('device_type').not().isEmpty().withMessage('Device Type is require').trim(),
  check('fcm_token').not().isEmpty().withMessage('FCM Token field is require').trim(),
  check('device_id').not().isEmpty().withMessage('Device Unique Id field is require').trim(),
];

const logoutValidation = [
  check('action_type').not().isEmpty().withMessage('Action Type is require').trim(),
];

const profileUpdateValidation = [
  check('name').not().isEmpty().withMessage('Name field is require').trim().escape().isLength({ max: 80 }).withMessage('Name must not be more than 80 character'),
  // check('email').optional().isEmail().withMessage('Please enter valid email').trim().escape(),
  check('email').not().isEmpty().withMessage('Email field is require').isEmail().withMessage('Please enter valid email').trim().escape(),
  check("building_name").not().isEmpty().withMessage("Building Name field is require").trim().escape().isLength({ max: 100 }).withMessage("Building must not be more than 100 character"),
  check("street_address").optional().trim(),
  check("contact_no").not().isEmpty().withMessage("Contact no is required").trim().isLength({ max: 20 }).withMessage("Contact no be not more than 20 character"),
  check("zipcode").not().isEmpty().withMessage("Post code is required").trim().escape().isLength({ max: 10 }).withMessage("Post Code be not more than 10 character"),
  check("city").not().isEmpty().withMessage("City field is require").trim().escape(),
  check("state").not().isEmpty().withMessage("State field is require").trim().toInt(),
  check('country').not().isEmpty().withMessage('Country field is require').trim().toInt(),
];

const changePassValidation = [
  check('action_type').not().isEmpty().withMessage('Action type key is require').trim(),
  check('email').not().isEmpty().withMessage('Email field is require').isEmail().withMessage('Please enter valid email').trim(),
  check('password').not().isEmpty().withMessage('Password field is require').trim(),
  check("confirm_password").not().isEmpty().withMessage("Confirm password field is require").custom((value, { req }) => value === req.body.password).withMessage("The password does not match"),
];

const updatePassValidation = [
  check('action_type').not().isEmpty().withMessage('Action type key is require').trim(),
  check('old_password').not().isEmpty().withMessage('Old password field is require').trim(),
  check('new_password').not().isEmpty().withMessage('New password field is require').trim(),
];

const resendOtpValidation = [
  check('action_type').not().isEmpty().withMessage('Action type key is require').trim(),
  check('email').not().isEmpty().withMessage('Email field is require').isEmail().withMessage('Please enter valid email').trim(),
];

const addressValidation = [
  check("title").not().isEmpty().withMessage("Title field is require").trim().escape().isLength({ max: 50 }).withMessage("Building must not be more than 50 character"),
  check("building_name").not().isEmpty().withMessage("Building Name field is require").trim().escape().isLength({ max: 100 }).withMessage("Building must not be more than 100 character"),
  check("street_address").optional().trim(),
  check("zipcode").not().isEmpty().withMessage("Post code is required").trim().escape().isLength({ max: 10 }).withMessage("Post Code be not more than 10 character"),
  check("city").not().isEmpty().withMessage("City field is require").trim(),
  check("state").not().isEmpty().withMessage("State field is require").trim(),
  check('country').not().isEmpty().withMessage('Country field is require').trim(),
];

const userNotifSettValidation = [
  check("allow_notification").not().isEmpty().withMessage("Missing required field").trim().toInt(),
];

const otpVerifyValidation = [
  check('email').not().isEmpty().withMessage('Email field is require').isEmail().withMessage('Please enter valid email').trim(),
  check('otp').isLength({ min: 4, max: 4 }).withMessage('OTP must be a 4-digit number').matches(/^\d{4}$/).withMessage('OTP must be numeric'),
  check('action_type').not().isEmpty().withMessage('Action Type is require').trim(),
];

const getNearByDrivers = [
  check("company_id").not().isEmpty().withMessage("Please select company").trim(),
  check("driver_type").not().isEmpty().withMessage("Driver type field is missing").trim(),
  check("country_code").not().isEmpty().withMessage("Pickup country is missing").trim(),
  check("state_code").not().isEmpty().withMessage("Pickup state is missing").trim(),
  check("city").not().isEmpty().withMessage("Pickup city is missing").trim(),
  check("pickup_lat").not().isEmpty().withMessage("Pickup latitude is missing").trim(),
  check("pickup_long").not().isEmpty().withMessage("Pickup longitude is missing").trim(),
];

module.exports = {
  loginValidation, addFCMValidation, logoutValidation, profileUpdateValidation, changePassValidation, updatePassValidation, resendOtpValidation, addressValidation, userNotifSettValidation, otpVerifyValidation, getNearByDrivers,
};
