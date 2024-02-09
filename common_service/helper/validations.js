const { check, body, validationResult } = require("express-validator");

const superAdminValidation = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Name field is require")
    .trim()
    .escape()
    .isLength({ max: 80 })
    .withMessage("Name must not be more than 80 character"),
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email field is require")
    .isEmail()
    .withMessage("Please enter valid email")
    .trim()
    .escape(),
  check("password")
    .not()
    .isEmpty()
    .withMessage("Password field is require")
    .trim(),
  check("company_id")
    .not()
    .isEmpty()
    .withMessage("Company field is require")
    .trim(),
  // check("confirm_password").not().isEmpty().withMessage("Confirm password field is require").custom((value, { req }) => value === req.body.password).withMessage("The passwords do not match"),
];
const superAdminUpdateValidation = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Name field is require")
    .trim()
    .escape()
    .isLength({ max: 80 })
    .withMessage("Name must not be more than 80 character"),
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email field is require")
    .isEmail()
    .withMessage("Please enter valid email")
    .trim()
    .escape(),
];

const userValidation = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Name field is require")
    .trim()
    .escape()
    .isLength({ max: 80 })
    .withMessage("Name must not be more than 80 character"),
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email field is require")
    .isEmail()
    .withMessage("Please enter valid email")
    .trim()
    .escape(),
  check("time_zone")
    .not()
    .isEmpty()
    .withMessage("Time Zone field is require")
    .trim(),
  check("password")
    .not()
    .isEmpty()
    .withMessage("Password field is require")
    .trim(),
  check("building_name")
    .not()
    .isEmpty()
    .withMessage("Building Name field is require")
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage("Building must not be more than 100 character"),
  check("street_address").trim(),
  check("zipcode")
    .not()
    .isEmpty()
    .withMessage("Post Code is required")
    .trim()
    .escape()
    .isLength({ max: 10 })
    .withMessage("Post Code be not more than 10 character"),
  check("contact_no")
    .not()
    .isEmpty()
    .withMessage("Contact no is required")
    .trim()
    .isLength({ max: 20 })
    .withMessage("Contact no be not more than 20 character"),
  check("city")
    .not()
    .isEmpty()
    .withMessage("City field is require")
    .trim()
    .escape(),
  check("state")
    .not()
    .isEmpty()
    .withMessage("State field is require")
    .trim()
    .escape(),
  check("country")
    .not()
    .isEmpty()
    .withMessage("Country field is require")
    .trim()
    .escape(),
  check("user_type_id")
    .not()
    .isEmpty()
    .withMessage("User type field is require")
    .trim()
    .toInt(),
  check("role_id")
    .not()
    .isEmpty()
    .withMessage("User role field is require")
    .trim()
    .toInt(),
  // check("confirm_password").not().isEmpty().withMessage("Confirm password field is require").custom((value, { req }) => value === req.body.password).withMessage("The passwords do not match"),
];
const userUpdateValidation = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Name field is require")
    .trim()
    .escape()
    .isLength({ max: 80 })
    .withMessage("Name must not be more than 80 character"),
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email field is require")
    .isEmail()
    .withMessage("Please enter valid email")
    .trim()
    .escape(),
  check("country")
    .not()
    .isEmpty()
    .withMessage("Country field is require")
    .trim()
    .escape(),
  check("time_zone")
    .not()
    .isEmpty()
    .withMessage("Time Zone field is require")
    .trim(),
  check("building_name")
    .not()
    .isEmpty()
    .withMessage("Building Name field is require")
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage("Building must not be more than 100 character"),
  check("street_address").trim(),
  check("zipcode")
    .not()
    .isEmpty()
    .withMessage("Post Code is required")
    .trim()
    .escape()
    .isLength({ max: 10 })
    .withMessage("Post Code be not more than 10 character"),
  check("contact_no")
    .not()
    .isEmpty()
    .withMessage("Contact no is required")
    .trim()
    .isLength({ max: 20 })
    .withMessage("Contact no be not more than 20 character"),
  check("city")
    .not()
    .isEmpty()
    .withMessage("City field is require")
    .trim()
    .escape(),
  check("state")
    .not()
    .isEmpty()
    .withMessage("State field is require")
    .trim()
    .escape(),
  check("country")
    .not()
    .isEmpty()
    .withMessage("Country field is require")
    .trim()
    .escape(),
  check("user_type_id")
    .not()
    .isEmpty()
    .withMessage("User type field is require")
    .trim()
    .toInt(),
  check("role_id")
    .not()
    .isEmpty()
    .withMessage("User role field is require")
    .trim()
    .toInt(),
];

const accountValidation = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Name field is require")
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage("Name must not be more than 50 character"),
  check("country")
    .not()
    .isEmpty()
    .withMessage("Country field is require")
    .trim()
    .escape(),
  check("state")
    .not()
    .isEmpty()
    .withMessage("State field is require")
    .trim()
    .escape(),
  check("suburb")
    .not()
    .isEmpty()
    .withMessage("Suburb field is require")
    .trim()
    .escape(),
  check("building_name")
    .not()
    .isEmpty()
    .withMessage("Building Name field is require")
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage("Building must not be more than 100 character"),
  check("street_address").trim(),
  check("pincode")
    .not()
    .isEmpty()
    .withMessage("Post Code is required")
    .trim()
    .escape()
    .isLength({ max: 10 })
    .withMessage("Post Code be not more than 10 character"),
  check("contact_no")
    .not()
    .isEmpty()
    .withMessage("Contact no is required")
    .trim()
    .isLength({ max: 20 })
    .withMessage("Contact no be not more than 20 character"),
];

const vehicleCatValidation = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Name field is require")
    .trim()
    .isLength({ max: 150 })
    .withMessage("Name must not be more than 150 character"),
  check("toll_category").trim().escape(),
];
const vehicleValidation = [
  check("vehicle_cat_id")
    .not()
    .isEmpty()
    .withMessage("Vehicle category field is require")
    .trim()
    .escape(),
  // check("type").not().isEmpty().withMessage("Vehicle category select type field is require").trim().escape(),
  check("make")
    .not()
    .isEmpty()
    .withMessage("Make field is require")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Make must not be more than 100 character"),
  check("model")
    .not()
    .isEmpty()
    .withMessage("Model field is require")
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage("Model must not be more than 100 character"),
];

const statusValidation = [
  check("status")
    .isBoolean()
    .withMessage("Data not acceptable")
    .trim()
    .escape()
    .isLength({ max: 80 })
    .withMessage("Data Not acceptable"),
];

const createAdminvalidation = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Name field is require")
    .trim()
    .escape()
    .isLength({ max: 80 })
    .withMessage("Name must not be more than 80 character"),
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email field is require")
    .isEmail()
    .withMessage("Please enter valid email")
    .trim()
    .escape(),
  check("country")
    .not()
    .isEmpty()
    .withMessage("Country field is require")
    .trim()
    .escape(),
  check("time_zone")
    .not()
    .isEmpty()
    .withMessage("Time Zone field is require")
    .trim(),
  check("password").not().isEmpty().withMessage("Password field is require"),
];

const companyValidation = [
  check("company_code")
    .not()
    .isEmpty()
    .withMessage("Company Code field is required")
    .trim()
    .escape(),
  check("name")
    .not()
    .isEmpty()
    .withMessage("Name field is required")
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage("Name must not be more than 100 character"),
  check("email")
    .isEmail()
    .withMessage("Please enter valid email")
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage("Name must not be more than 50 character"),
  check("description").trim().escape(),
  check("logo").trim().escape(),
  check("time_zone")
    .not()
    .isEmpty()
    .withMessage("Time Zone field is required")
    .trim(),
  check("building_name")
    .not()
    .isEmpty()
    .withMessage("Building Name field is required")
    .trim()
    .escape(),
  check("country")
    .not()
    .isEmpty()
    .withMessage("Country field is required")
    .trim()
    .escape()
    .isLength({ max: 20 })
    .withMessage("Country must not be more than 20 character"),
  check("state")
    .not()
    .isEmpty()
    .withMessage("State field is required")
    .trim()
    .escape(),
  check("street_address").trim(),
  check("city")
    .not()
    .isEmpty()
    .withMessage("City field is required")
    .trim()
    .escape(),
  check("zipcode")
    .not()
    .isEmpty()
    .withMessage("Zipcode field is required")
    .trim()
    .escape()
    .isLength({ max: 10 })
    .withMessage("Zipcode must not be more than 10 character"),
  check("company_currency")
    .not()
    .isEmpty()
    .withMessage("Company Currency field is required")
    .trim()
    .escape()
    .isLength({ max: 20 })
    .withMessage("Company Currency must not be more than 20 character"),
  check("company_prefix")
    .not()
    .isEmpty()
    .withMessage("Company Prefix field is required")
    .trim()
    .escape()
    .isLength({ max: 10 })
    .withMessage("Company Prefix must not be more than 10 character"),
];

const companyUpdateValidation = [
  // check("company_code").not().isEmpty().withMessage("Company Code field is required").trim().escape(),
  check("name").trim().escape(),
  check("email").trim().escape(),
  check("description").trim().escape(),
  check("logo").trim().escape(),
  check("time_zone").trim(),
  check("country").trim().escape(),
  check("building_name").trim().escape(),
  // check("country").trim().escape(),
  // check("state").trim().escape(),
  check("street_address").trim(),
  check("city").trim().escape(),
  check("zipcode")
    .trim()
    .isLength({ max: 10 })
    .withMessage("Post Code be not more than 10 character"),
  check("company_currency").trim().escape(),
  check("company_prefix").trim().escape(),
  check("company_domain").trim().escape(),
  check("background_photo").trim().escape(),
  check("button_color").trim().escape(),
  check("button_hover_color").trim().escape(),
  check("font_color").trim().escape(),
  check("font_hover_color").trim().escape(),
  check("support").trim().escape(),
  check("apk_version").trim().escape(),
  check("t_and_c").trim().escape(),
  check("privacy_policy").trim().escape(),
  check("copy_right_text").trim().escape(),
  check("help_line_number").trim().escape(),
  check("footer_background_color").trim().escape(),
  check("contact_us_link").trim().escape(),
  check("facebook").trim().escape(),
  check("youtube").trim().escape(),
  check("instagram").trim().escape(),
  check("tiktok").trim().escape(),
  check("snapchat").trim().escape(),
  check("google_plus").trim().escape(),
  // check("address_autocomplete").trim().escape(),
];

const companyDetailValidation = [
  check("company_id")
    .not()
    .isEmpty()
    .withMessage("Company id field is required")
    .trim()
    .toInt(),
  check("account_type").trim().toInt(),
  check("per_job_charge").trim(),
  // check("notification_method_id").trim().toInt(),
  check("invoice_type").trim().toInt(),
  check("allow_driver").trim().toInt(),
  check("account_job_payment_gateway").trim().toInt(),
  check("wallet_credit_payment_gateway").trim().toInt(),
];

const addPermValidation = [
  check("module_id")
    .not()
    .isEmpty()
    .withMessage("Module id field is required")
    .trim()
    .escape(),
  check("name")
    .not()
    .isEmpty()
    .withMessage("Name field is required")
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage("Name must not be more than 50 character"),
  check("key")
    .not()
    .isEmpty()
    .withMessage("Key field is required")
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage("Key must not be more than 50 character"),
];

const settingApiValidation = [
  check("company_id")
    .not()
    .isEmpty()
    .withMessage("Company Code field is required")
    .trim()
    .escape(),
  check("api_name")
    .not()
    .isEmpty()
    .withMessage("Name field is required")
    .trim()
    .escape(),
  check("api_url")
    .not()
    .isEmpty()
    .withMessage("Api Url field is required")
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage("Api Url must not be more than 50 character"),
  check("setting").not().isEmpty().withMessage("Setting field is required"),
];

const packageValidation = [
  check("package_name")
    .not()
    .isEmpty()
    .withMessage("Package name field is required")
    .trim()
    .escape(),
  check("length")
    .not()
    .isEmpty()
    .withMessage("Length field is required")
    .trim()
    .escape()
    .trim()
    .escape()
    .isLength({ max: 50 }),
  check("width")
    .not()
    .isEmpty()
    .withMessage("Width field is required")
    .trim()
    .escape()
    .isLength({ max: 50 }),
  check("height")
    .not()
    .isEmpty()
    .withMessage("Height field is required")
    .trim()
    .escape()
    .isLength({ max: 50 }),
  check("weight")
    .not()
    .isEmpty()
    .withMessage("Weight field is required")
    .trim()
    .escape()
    .isLength({ max: 50 }),
  check("description").trim().escape().isLength({ max: 500 }),
];

const settingEmailValidation = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Name field is required")
    .trim()
    .escape()
    .isLength({ max: 200 })
    .withMessage("Name must not be more than 200 character"),
  check("company_id")
    .not()
    .isEmpty()
    .withMessage("Company field is required")
    .trim()
    .escape()
    .trim()
    .escape(),
  check("template_id")
    .not()
    .isEmpty()
    .withMessage("Template Type field is required")
    .trim()
    .escape(),
  check("email_subject")
    .not()
    .isEmpty()
    .withMessage("Email Subject field is required")
    .trim()
    .escape()
    .isLength({ max: 250 })
    .withMessage("Email Subject must not be more than 250 character"),
  check("email_body")
    .not()
    .isEmpty()
    .withMessage("Email Body field is required")
    .trim()
    .escape(),
];

const settingSmtpValidation = [
  check("smtp_host")
    .not()
    .isEmpty()
    .withMessage("Smtp Host field is required")
    .trim()
    .escape()
    .isLength({ max: 300 })
    .withMessage("Smtp Host must not be more than 300 character"),
  check("smtp_port").not().isEmpty().withMessage("Smtp Port field is required"),
  check("encryption")
    .not()
    .isEmpty()
    .withMessage("encryption Type field is required")
    .trim()
    .escape(),
  check("smtp_email")
    .not()
    .isEmpty()
    .withMessage("Smtp Email field is required")
    .trim()
    .escape()
    .isLength({ max: 250 })
    .withMessage("Smtp Email must not be more than 250 character"),
  check("smtp_password")
    .not()
    .isEmpty()
    .withMessage("Smtp Password field is required")
    .trim()
    .escape()
    .isLength({ max: 250 })
    .withMessage("Smtp Password must not be more than 250 character"),
  check("from_email")
    .not()
    .isEmpty()
    .withMessage("From Email field is required")
    .trim()
    .escape()
    .isLength({ max: 250 })
    .withMessage("From Email must not be more than 250 character"),
];

const settingFareValidation = [
  check("category_name")
    .not()
    .isEmpty()
    .withMessage("Category Name field is required")
    .trim()
    .escape()
    .isLength({ max: 250 })
    .withMessage("Category Name must not be more than 200 character"),
  check("company_id").not().isEmpty().withMessage("Company field is required"),
  check("country_id").not().isEmpty().withMessage("Country field is required"),
  check("currency_id")
    .not()
    .isEmpty()
    .withMessage("Currency field is required"),
  // check("state_id").trim(),
  check("city").trim(),
  // check("vehicle_id").trim(),
  check("description")
    .trim()
    .escape()
    .isLength({ max: 250 })
    .withMessage("Description must not be more than 250 character"),
  check("size")
    .isLength({ max: 250 })
    .withMessage("Size must not be more than 250 character"),

  check("fareprice_details.*.delivery_type")
    .not()
    .isEmpty()
    .withMessage("Delivery Type field is required")
    .trim()
    .escape()
    .isLength({ max: 250 })
    .withMessage("Delivery Type must not be more than 250 character"),
  check("fareprice_details.*.base_price")
    .not()
    .isEmpty()
    .withMessage("Base Price field is required"),
  check("fareprice_details.*.per_km_charge")
    .not()
    .isEmpty()
    .withMessage("Per km Charge field is required"),
  // check("fareprice_details.*.per_km_time").not().isEmpty().withMessage("Per km Time field is required"),
  check("fareprice_details.*.min_charge")
    .not()
    .isEmpty()
    .withMessage("Min. Charge field is required"),

  check("fareprice_commissions.*.commission_title")
    .not()
    .isEmpty()
    .withMessage("Commission Label field is required")
    .trim()
    .escape()
    .isLength({ max: 250 })
    .withMessage("Commission Label must not be more than 250 character"),
  check("fareprice_commissions.*.amount")
    .not()
    .isEmpty()
    .withMessage("Amount field is required"),
  check("fareprice_commissions.*.type")
    .not()
    .isEmpty()
    .withMessage("Type field is required"),

  check("fareprice_taxes.*.amount").trim(),
  check("fareprice_taxes.*.type").trim(),
  check("fareprice_taxes.*.tax_label")
    .trim()
    .escape()
    .isLength({ max: 250 })
    .withMessage("Tax Label must not be more than 250 character"),
];

const driverBasicDetailValidation = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Name field is require")
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage("Name must not be more than 100 character"),
  check("licence_no")
    .not()
    .isEmpty()
    .withMessage("Licence no field is require")
    .trim()
    .escape(),
  check("licence_expire_at")
    .not()
    .isEmpty()
    .withMessage("Licence expiry date field is require")
    .trim(),
  check("country_id").optional().trim().toInt(),
  check("currency_id").optional().trim(),
  // check("dynamic_licence_field").optional().trim().toArray(),
];

// const driverVehicleValidation = [
//   check("driver_id").not().isEmpty().withMessage("Driver id field is require").trim().toInt(),
//   check("driver_vehicles.*.vehicle_id").not().isEmpty().withMessage("Name field is require").trim().toInt(),
//   check("driver_vehicles.*.package_id").not().isEmpty().withMessage("Package field is require").trim(),
//   check("driver_vehicles.*.vehicle_img").not().isEmpty().withMessage("Vehicle image field is require").trim(),
// ];

const driverVehicleValidation = [
  check("vehicle_id")
    .not()
    .isEmpty()
    .withMessage("Vehicle id field is require")
    .trim()
    .toInt(),
  check("driver_id")
    .not()
    .isEmpty()
    .withMessage("Driver id field is require")
    .trim()
    .toInt(),
  check("type").not().isEmpty().withMessage("Type field is require").trim(),
  // check("document_id").not().isEmpty().withMessage("Document id field is require").trim().toInt(),
  // check("img.*").not().isEmpty().withMessage("Vehicle attachment is require").trim(),
];

const delDriVehiOrDocsValidation = [
  check("driver_id")
    .not()
    .isEmpty()
    .withMessage("Driver id field is require")
    .trim()
    .toInt(),
  check("id").not().isEmpty().withMessage("Id field is require").trim().toInt(),
  check("type")
    .not()
    .isEmpty()
    .withMessage("Type field is required")
    .trim()
    .escape(),
];

const licenceFieldsValidation = [
  check("type").not().isEmpty().withMessage("Type field is require").trim(),
  check("country_id")
    .not()
    .isEmpty()
    .withMessage("Country field is require")
    .trim()
    .toInt(),
  check("fieldlist.*.field_label")
    .not()
    .isEmpty()
    .withMessage("Label field is require")
    .trim(),
  check("fieldlist.*.field_type")
    .not()
    .isEmpty()
    .withMessage("Type field is require")
    .trim(),
];

const docTypesValidation = [
  check("country_id")
    .not()
    .isEmpty()
    .withMessage("Country field is require")
    .trim()
    .toInt(),
  check("fieldlist.*.name")
    .not()
    .isEmpty()
    .withMessage("document name field is require")
    .trim(),
];

const chngStatusValidation = [
  check("id").not().isEmpty().withMessage("Id field is require").trim().toInt(),
  check("enable")
    .not()
    .isEmpty()
    .withMessage("Status field is require")
    .trim()
    .toInt(),
];

const editDocStatValidation = [
  check("status")
    .not()
    .isEmpty()
    .withMessage("Status field is require")
    .trim()
    .toInt(),
  check("note").trim(),
  check("driver_id")
    .not()
    .isEmpty()
    .withMessage("Driver field is require")
    .trim()
    .toInt(),
  check("type").not().isEmpty().withMessage("Type field is require").trim(),
  check("vehicle_id").trim().toInt(),
  check("document_id").trim().toInt(),
];

const searchAddr = [
  check("country")
    .not()
    .isEmpty()
    .withMessage("Country field is require")
    .trim(),
  check("search")
    .not()
    .isEmpty()
    .withMessage("Search string field is require")
    .trim(),
  check("search_type")
    .not()
    .isEmpty()
    .withMessage("Search type field is require")
    .trim(),
  check("search_field")
    .not()
    .isEmpty()
    .withMessage("Search text is require")
    .trim(),
];

const saveJobBasicInfo = [
  check("company_id")
    .not()
    .isEmpty()
    .withMessage("Company field is require")
    .trim()
    .toInt(),
  check("payment_mode")
    .not()
    .isEmpty()
    .withMessage("Payment mode field is require")
    .trim()
    .toInt(),
];

const saveJobAddr = [
  check("job_id")
    .not()
    .isEmpty()
    .withMessage("Job id field is require")
    .trim()
    .toInt(),
  check("pickup_addr_title")
    .not()
    .isEmpty()
    .withMessage("Pickup address title field is require")
    .trim(),
  check("pickup_contact_person")
    .not()
    .isEmpty()
    .withMessage("Name field is require")
    .trim(),
  check("pickup_email")
    .not()
    .isEmpty()
    .withMessage("Pickup email field is require")
    .isEmail()
    .withMessage("Please enter valid email")
    .trim(),
  check("pickup_building_name")
    .not()
    .isEmpty()
    .withMessage("Pickup building bame field is require")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Building must not be more than 100 character"),
  check("pickup_street_address").trim(),
  check("pickup_postcode")
    .not()
    .isEmpty()
    .withMessage("Pickup post code is required")
    .trim()
    .isLength({ max: 10 })
    .withMessage("Post Code be not more than 10 character"),
  check("pickup_contact_no")
    .not()
    .isEmpty()
    .withMessage("Pickup contact no is required")
    .trim()
    .isLength({ max: 20 })
    .withMessage("Contact no be not more than 20 character"),
  check("pickup_city")
    .not()
    .isEmpty()
    .withMessage("Pickup city is require")
    .trim(),
  check("pickup_state_code")
    .not()
    .isEmpty()
    .withMessage("Pickup state is require")
    .trim(),
  check("pickup_country_code")
    .not()
    .isEmpty()
    .withMessage("Pickup country is require")
    .trim(),
  check("dropoff_addr_title")
    .not()
    .isEmpty()
    .withMessage("Dropoff address title field is require")
    .trim(),
  check("dropoff_contact_person")
    .not()
    .isEmpty()
    .withMessage("Name field is require")
    .trim(),
  check("dropoff_email")
    .not()
    .isEmpty()
    .withMessage("Dropoff email field is require")
    .isEmail()
    .withMessage("Please enter valid email")
    .trim(),
  check("dropoff_building_name")
    .not()
    .isEmpty()
    .withMessage("Dropoff building bame field is require")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Building must not be more than 100 character"),
  check("dropoff_street_address").trim(),
  check("dropoff_postcode")
    .not()
    .isEmpty()
    .withMessage("Dropoff post code is required")
    .trim()
    .isLength({ max: 10 })
    .withMessage("Post Code be not more than 10 character"),
  check("dropoff_contact_no")
    .not()
    .isEmpty()
    .withMessage("Dropoff contact no is required")
    .trim()
    .isLength({ max: 20 })
    .withMessage("Contact no be not more than 20 character"),
  check("dropoff_city")
    .not()
    .isEmpty()
    .withMessage("Dropoff city is require")
    .trim(),
  check("dropoff_state_code")
    .not()
    .isEmpty()
    .withMessage("Dropoff state is require")
    .trim(),
  check("dropoff_country_code")
    .not()
    .isEmpty()
    .withMessage("Dropoff country is require")
    .trim(),
];

const moduleValidation = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Module Name field is require")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Name must not be more than 100 character"),
];

const getFareEstimate = [
  check("vehicle_id").not().isEmpty().withMessage("Vehicle is require").trim(),
  check("job_address_id")
    .not()
    .isEmpty()
    .withMessage("Job address id is require")
    .trim(),
];

const saveJobAddressValidation = [
  check("pickup_email")
    .not()
    .isEmpty()
    .withMessage("Pickup email field is require")
    .isEmail()
    .withMessage("Please enter valid email")
    .trim(),
  check("pickup_building_name")
    .not()
    .isEmpty()
    .withMessage("Pickup building bame field is require")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Building must not be more than 100 character"),
  check("pickup_street_address")
    .not()
    .isEmpty()
    .withMessage("Pickup street address is required")
    .trim(),
  check("pickup_postcode")
    .not()
    .isEmpty()
    .withMessage("Pickup post code is required")
    .trim()
    .isLength({ max: 10 })
    .withMessage("Post Code be not more than 10 character"),
  check("pickup_contact_no")
    .not()
    .isEmpty()
    .withMessage("Pickup contact no is required")
    .trim()
    .isLength({ max: 20 })
    .withMessage("Contact no be not more than 20 character"),
  check("pickup_city")
    .not()
    .isEmpty()
    .withMessage("Pickup city is required")
    .trim(),
  check("pickup_state_code")
    .not()
    .isEmpty()
    .withMessage("Pickup state is required")
    .trim(),
  check("pickup_country_code")
    .not()
    .isEmpty()
    .withMessage("Pickup country is required")
    .trim(),
  check("pickup_latitude")
    .not()
    .isEmpty()
    .withMessage("Pickup latitude is required")
    .trim(),
  check("pickup_longitude")
    .not()
    .isEmpty()
    .withMessage("Pickup longitude is required")
    .trim(),
  check("dropoff_email")
    .not()
    .isEmpty()
    .withMessage("Dropoff email field is require")
    .isEmail()
    .withMessage("Please enter valid email")
    .trim(),
  check("dropoff_building_name")
    .not()
    .isEmpty()
    .withMessage("Dropoff building name field is required")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Building must not be more than 100 character"),
  check("dropoff_street_address")
    .not()
    .isEmpty()
    .withMessage("Dropoff street address is required")
    .trim(),
  check("dropoff_postcode")
    .not()
    .isEmpty()
    .withMessage("Dropoff post code is required")
    .trim()
    .isLength({ max: 10 })
    .withMessage("Post Code be not more than 10 character"),
  check("dropoff_contact_no")
    .not()
    .isEmpty()
    .withMessage("Dropoff contact no is required")
    .trim()
    .isLength({ max: 20 })
    .withMessage("Contact no be not more than 20 character"),
  check("dropoff_city")
    .not()
    .isEmpty()
    .withMessage("Dropoff city is require")
    .trim(),
  check("dropoff_state_code")
    .not()
    .isEmpty()
    .withMessage("Dropoff state is required")
    .trim(),
  check("dropoff_country_code")
    .not()
    .isEmpty()
    .withMessage("Dropoff country is required")
    .trim(),
  check("dropoff_country_code")
    .not()
    .isEmpty()
    .withMessage("Dropoff country is required")
    .trim(),
  check("dropoff_latitude")
    .not()
    .isEmpty()
    .withMessage("Dropoff latitude is required")
    .trim(),
  check("dropoff_longitude")
    .not()
    .isEmpty()
    .withMessage("Dropoff longitude is required")
    .trim(),
];

const savePackage = [
  check("job_id")
    .not()
    .isEmpty()
    .withMessage("Job id field is require")
    .trim()
    .toInt(),
  check("job_address_id")
    .not()
    .isEmpty()
    .withMessage("Job address id is require")
    .trim(),
  check("vehicle_id")
    .not()
    .isEmpty()
    .withMessage("Vehicle is require")
    .trim()
    .toInt(),
  check("driver_type")
    .not()
    .isEmpty()
    .withMessage("Driver type field is require")
    .trim()
    .toInt(),
  check("driver_id")
    .not()
    .isEmpty()
    .withMessage("Please select at least one driver")
    .trim(),
  check("package_info.*.package_id")
    .not()
    .isEmpty()
    .withMessage("Please select package type")
    .trim()
    .toInt(),
  check("package_info.*.units")
    .not()
    .isEmpty()
    .withMessage("Please select units")
    .trim()
    .toInt(),
  check("package_info.*.length")
    .not()
    .isEmpty()
    .withMessage("Package length is require")
    .trim(),
  check("package_info.*.width")
    .not()
    .isEmpty()
    .withMessage("Package width is require")
    .trim(),
  check("package_info.*.height")
    .not()
    .isEmpty()
    .withMessage("Package height is require")
    .trim(),
  check("package_info.*.weight")
    .not()
    .isEmpty()
    .withMessage("Package weight is require")
    .trim(),
];

const settingPaymentValidation = [
  check("company_id").not().isEmpty().withMessage("Company field is required"),
  check("payment_settings.*.api")
    .not()
    .isEmpty()
    .withMessage("Api field is required"),
  check("payment_settings.*.country_id")
    .not()
    .isEmpty()
    .withMessage("Country field is required"),
  check("payment_settings.*.name")
    .not()
    .isEmpty()
    .withMessage("Name field is require")
    .trim()
    .escape()
    .isLength({ max: 80 })
    .withMessage("Name must not be more than 80 character"),
  check("payment_settings.*.api_url")
    .not()
    .isEmpty()
    .withMessage("Api Url field is required")
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage("Api Url must not be more than 50 character"),
  check("payment_settings.*.payment_key_setting.*.key_id")
    .not()
    .isEmpty()
    .withMessage("Key Id field is required"),
  check("payment_settings.*.payment_key_setting.*.key_value")
    .not()
    .isEmpty()
    .withMessage("Key Value field is require")
    .trim()
    .escape(),
];

const getNearByDrivers = [
  check("company_id")
    .not()
    .isEmpty()
    .withMessage("Please select company")
    .trim(),
  check("job_address_id")
    .not()
    .isEmpty()
    .withMessage("Job address is required")
    .trim(),
  check("driver_type")
    .not()
    .isEmpty()
    .withMessage("Driver type field is missing")
    .trim(),
  check("vehicle_id")
    .not()
    .isEmpty()
    .withMessage("Vehicle Id is required")
    .trim(),
];
module.exports = {
  superAdminValidation,
  superAdminUpdateValidation,
  userValidation,
  userUpdateValidation,
  accountValidation,
  vehicleCatValidation,
  vehicleValidation,
  statusValidation,
  companyValidation,
  companyUpdateValidation,
  companyDetailValidation,
  createAdminvalidation,
  addPermValidation,
  settingApiValidation,
  packageValidation,
  settingEmailValidation,
  settingFareValidation,
  driverBasicDetailValidation,
  driverVehicleValidation,
  delDriVehiOrDocsValidation,
  settingSmtpValidation,
  licenceFieldsValidation,
  docTypesValidation,
  chngStatusValidation,
  editDocStatValidation,
  searchAddr,
  saveJobBasicInfo,
  saveJobAddr,
  moduleValidation,
  getFareEstimate,
  savePackage,
  settingPaymentValidation,
  getNearByDrivers,
};
