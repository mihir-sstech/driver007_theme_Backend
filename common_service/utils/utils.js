const { toLower } = require("lodash");
const path = require("path")
const constant = require("../constant/constant.json");
const { roles } = require("../statics/static.json");


// check {},"",undefined,null
exports.isEmpty = (data) => {
  if (data === null || data === undefined || data === "") {
    return true;
  }
  if (typeof data === "string" && data.trim().length === 0) {
    return true;
  }
  if (Array.isArray(data) && data.length === 0) {
    return true;
  }
  if (typeof data === "object" && Object.keys(data).length === 0) {
    return true;
  }

  return false;
};

// rename img name
exports.generateUniqueFileName = (originalFilename) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalFilename);
  return `${timestamp}_${randomString}${extension}`;
};

// check valid file type
exports.isValidFileType = (filepath, mediatype = "img") => {

  var allowed_types = "";
  if (mediatype === "doc") { allowed_types = constant.DOC_ALLOWED_TYPES } else { allowed_types = constant.IMG_ALLOWED_TYPES }
  if (typeof filepath == "object") {
    const invalid_img = [];
    for (const image of filepath) {
      var extension = path.extname(image);
      extension = extension.toLowerCase();
      if (allowed_types.includes(extension) == false) { invalid_img.push(image); }
    }
    return invalid_img;
  } else {
    var extension = path.extname(filepath);
    extension = extension.toLowerCase();
    return allowed_types.includes(extension);
  }
};

// check valid file size
exports.isValidFileSize = (filesize, mediatype = "img") => {

  var max_file_size = "";
  if (mediatype === "doc") { max_file_size = constant.DOC_MAX_SIZE } else { max_file_size = constant.IMG_MAX_SIZE }

  if (typeof filesize == "object") {
    const exceed_size = [];
    for (const image of filesize) { if (image > max_file_size) { exceed_size.push(image); } }
    return exceed_size;
  } else {
    return filesize <= max_file_size;
  }
};

// generate unique code
exports.idGenerator = (length = 6) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

// Function to clean request query data
exports.cleanQuery = (data) => {
  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  // Iterate through the object properties
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // Remove properties with null, "", {}, or undefined values
      if (
        data[key] === null ||
        data[key] === '' ||
        (typeof data[key] === 'object' && Object.keys(data[key]).length === 0) ||
        data[key] === undefined
      ) {
        delete data[key];
      }
    }
  }

  return data;
};

// Function to sort permissions object keys
exports.transformedPermData_orig = (perm_data) => {
  var transformed_data = {};
  perm_data.forEach(item => {
    var { module_name, name, key } = item;
    module_name = module_name.toLowerCase()
    module_name = module_name.replaceAll(" ", "_")
    if (!transformed_data[module_name]) {
      transformed_data[module_name] = {};
    }
    transformed_data[module_name][name.toLowerCase()] = key;
  });

  const permissionOrder = ["add", "edit", "delete", "view"];
  const sortedPermissions = {};

  for (const module in transformed_data) {
    if (transformed_data.hasOwnProperty(module)) {
      const modulePermissions = transformed_data[module];
      const sortedModulePermissions = {};

      permissionOrder.forEach((permission) => {
        if (modulePermissions.hasOwnProperty(permission)) {
          sortedModulePermissions[permission] = modulePermissions[permission];
        }
      });

      sortedPermissions[module] = sortedModulePermissions;
    }
  }

  return sortedPermissions;
};

// Function to sort permissions object keys
exports.transformedPermData = (perm_data, sort = "") => {

  // Define the desired order of action keys
  const actionOrder = ['add', 'edit', 'delete', 'view'];

  // Convert the input array to the desired structure with sorted action keys
  const transformedData = perm_data.reduce((result, item) => {
    const { name, key, ...rest } = item;
    const module_name = item.admin_module.name;
    var formattedModuleName = module_name.replace(/\s+/g, '_').toLowerCase();
    const actionKey = name.toLowerCase();
    if (!result[formattedModuleName]) {
      result[formattedModuleName] = {};
    }
    result[formattedModuleName][actionKey] = key;

    if (sort) {
      const sortedPermissions = {};
      for (const module in result) {
        if (result.hasOwnProperty(module)) {
          const modulePermissions = result[module];
          const sortedModulePermissions = {};

          actionOrder.forEach((permission) => {
            if (modulePermissions.hasOwnProperty(permission)) {
              sortedModulePermissions[permission] = modulePermissions[permission];
            }
          });

          sortedPermissions[module] = sortedModulePermissions;
        }
      }
      result = sortedPermissions;
    }

    return result;
  }, {});

  return transformedData;
};

// Function to generate random numeric string for OTP
exports.generateOTP = () => {
  const otpLength = 4; // Define the length of the OTP (e.g., 6 digits)

  // Generate a random number within the range 100000 to 999999
  const min = Math.pow(10, otpLength - 1);
  const max = Math.pow(10, otpLength) - 1;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  // const otp = otp.toString();  // Convert the OTP to a string (if needed)

  return otp;
}

// Function to generate random password string for driver login
exports.generateRandomPassword = (length) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
}

exports.role_arr = () => {
  const auth_arr = [roles.COMPANY_ADMIN, roles.ACCOUNT_ADMIN, roles.COMPANY_STANDARD, roles.ACCOUNT_STANDARD];
  return auth_arr;
}
