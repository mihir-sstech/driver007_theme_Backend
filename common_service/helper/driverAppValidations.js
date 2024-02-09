const { check, body, validationResult } = require("express-validator");

const regValidation = [
  check('country_id').not().isEmpty().withMessage('Country field is require'),
  check('name').not().isEmpty().withMessage('Name field is require'),
  check('email').not().isEmpty().withMessage('Email field is require').isEmail().withMessage('Please enter valid email').trim().escape(),
  check("contact_no").not().isEmpty().withMessage("Contact no is required").trim().isLength({ max: 20 }).withMessage("Contact no be not more than 20 character"),
  check('password').not().isEmpty().withMessage('Password field is require').trim(),
  check("confirm_password").not().isEmpty().withMessage("Confirm password field is require").custom((value, { req }) => value === req.body.password).withMessage("The password does not match"),
];

const dynamicFieldValidation = [
  check('type').not().isEmpty().withMessage('Type field is require').trim(),
];

const licenceValidation = [
  // check("currency_id").optional().trim(),
  check("licence_no").not().isEmpty().withMessage("Licence no field is require").trim().escape(),
  check("licence_expire_at").not().isEmpty().withMessage("Licence expiry date field is require").trim(),
];

const vehDocValidation = [
  // check("driver_id").not().isEmpty().withMessage("Driver id field is require").trim().toInt(),
  check('action').not().isEmpty().withMessage('Action field is require').trim(),
  check("vehicle_id").not().isEmpty().withMessage("Vehicle field is require").trim().toInt(),
  check('document_id').not().isEmpty().withMessage('Document field is require').trim().toInt(),
  check('document_no').not().isEmpty().withMessage('Document no field is require').trim(),
  check('document_expire_at').not().isEmpty().withMessage('Document expiry date field is require').trim(),
  // check("img.*").not().isEmpty().withMessage("Vehicle attachment is require").trim(),
];

const getVehDocValidation = [
  check('action').not().isEmpty().withMessage('Action field is require').trim(),
  check("vehicle_id").not().isEmpty().withMessage("Vehicle field is require").trim().toInt(),
  check('document_id').not().isEmpty().withMessage('Document field is require').trim().toInt(),
];

const delVehAttachValid = [
  check('type').not().isEmpty().withMessage('Type field is require').trim(),
  check("vehicle_id").not().isEmpty().withMessage("Vehicle field is require").trim().toInt(),
  // check('document_id').not().isEmpty().withMessage('Document field is require').trim().toInt(),
];

const changeVehStatValid = [
  check("vehicle_id").not().isEmpty().withMessage("Vehicle field is require").trim().toInt(),
  check("enable").not().isEmpty().withMessage("Status field is require").trim().toInt(),
];

const updateVehValidation = [
  check('action').not().isEmpty().withMessage('Action field is require').trim(),
  check("vehicle_id").not().isEmpty().withMessage("Vehicle field is require").trim().toInt(),
  check('package_id').not().isEmpty().withMessage('Package field is require').trim(),
  check('vehicle_no_plate').not().isEmpty().withMessage('Vehicle no plate field is require').trim(),
];

const getVehValidation = [
  check('action').not().isEmpty().withMessage('Action field is require').trim(),
  check("vehicle_id").not().isEmpty().withMessage("Vehicle field is require").trim().toInt(),
];

module.exports = {
  regValidation, dynamicFieldValidation, licenceValidation, vehDocValidation, getVehDocValidation, delVehAttachValid, changeVehStatValid, updateVehValidation, getVehValidation,
};
