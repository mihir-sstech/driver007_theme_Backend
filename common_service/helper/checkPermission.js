const common = require("../statics/static.json");
const constant = require("../constant/constant.json");
const { isEmpty } = require("../utils/utils");


exports.checkPermission = async (req, res, next) => {
  const role = req.userProfile.role.role_name;

  if (role === common.roles.SUPER_ADMIN) {
    // If the role is "super_admin," allow access without checking permissions
    return next();
  }
  if (isEmpty(req.headers.action)) {
    return res.status(common.response_status_code.bad_request).json({
      type: common.response_type.error,
      message: common.response_msg.blank_action_key,
    });
  }

  const loggedin_user_perm = req.userProfile.permissions;
  if (!loggedin_user_perm.includes(req.headers.action)) {
    return res.status(common.response_status_code.unauthorized).json({
      type: common.response_type.error,
      message: common.response_msg.unauthorized_action,
    });
  }
  next();
};

exports.addCompUserPerm = async (req, res, next) => {
  const loggedin_user_perm = req.userProfile.permissions;
  if (!loggedin_user_perm.includes("add_company_user")) {
    return res.status(common.response_status_code.unauthorized).json({
      type: common.response_type.error,
      message: common.response_msg.unauthorized_action,
    });
  }
  next();
};

exports.updateCompUserPerm = async (req, res, next) => {
  const loggedin_user_perm = req.userProfile.permissions;
  if (!loggedin_user_perm.includes("edit_company_user")) {
    return res.status(common.response_status_code.unauthorized).json({
      type: common.response_type.error,
      message: common.response_msg.unauthorized_action,
    });
  }
  next();
};

exports.addAccPerm = async (req, res, next) => {
  const loggedin_user_perm = req.userProfile.permissions;

  if (!loggedin_user_perm.includes("add_account")) {
    return res.status(common.response_status_code.unauthorized).json({
      type: common.response_type.error,
      message: common.response_msg.unauthorized_action,
    });
  }
  next();
};

exports.updateAccPerm = async (req, res, next) => {
  const loggedin_user_perm = req.userProfile.permissions;
  if (!loggedin_user_perm.includes("edit_account")) {
    return res.status(common.response_status_code.unauthorized).json({
      type: common.response_type.error,
      message: common.response_msg.unauthorized_action,
    });
  }
  next();
};

exports.addCompPerm = async (req, res, next) => {
  const loggedin_user_perm = req.userProfile.permissions;
  if (!loggedin_user_perm.includes("company_add")) {
    return res.status(common.response_status_code.unauthorized).json({
      type: common.response_type.error,
      message: common.response_msg.unauthorized_action,
    });
  }
  next();
};

// exports.updateCompanyPermission = async (req, res, next) => {
//   const permission = await Permission.findOne({ user: req.userProfile._id });

//   if (!permission.route_permission.update_company) {
//     return res.status(401).json({
//       type: "Error",
//       message: "You are unauthorized for update company",
//     });
//   }
//   next();
// };

// exports.updateRetailerPermission = async (req, res, next) => {
//   const permission = await Permission.findOne({ user: req.loginUser.user._id });

//   if (!permission.route_permission.update_retailer) {
//     return res.status(401).json({
//       type: "Error",
//       message: "You are unauthorized for update retailer",
//     });
//   }
//   next();
// };
// exports.addRetailerPermission = async (req, res, next) => {
//   try {
//     const permission = await Permission.findOne({
//       user: req.loginUser.user._id,
//     });

//     if (!permission.route_permission.add_retailer) {
//       throw "You are unauthorized for add retailer";
//     }

//     next();
//   } catch (error) {
//     return res.status(401).json({
//       type: "Error",
//       message: Error,
//     });
//   }
// };
