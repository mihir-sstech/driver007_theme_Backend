const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { isEmpty, transformedPermData } = require("../utils/utils");
const logger = require("../utils/logger");
const common = require("../statics/static.json");
const { driver_api_log_type } = require("../statics/driverStatic.json");
const { app_api_log_type } = require("../statics/retailerStatic.json");
const constant = require("../constant/constant.json");
const { Users, Role, Token, Permission, RolePermission } = require("../models/index");

// --------------- Curently not in used -------------------
/*
exports.isAdmin = async (req, res, next) => {
   try {
      let token = req.headers.authorization.split(" ")[1];

      const authority = ["SUPER_ADMIN", "COMPANY_ADMIN"];

      let isUserLogin = await Token.findOne({ token }).populate("user");

      if (!isUserLogin) {
         return res.status(500).json({
            type: "error",
            message: "Please Login first",
         });
      }

      jwt.verify(token, `${constant.ADMIN_JWT_SECRET}`, (err) => {
         if (err)
            return res.status(500).json({
               type: "error",
               message: "Token Expired",
            });
      });

      if (!authority.includes(isUserLogin.user.role)) {
         return res.status(500).json({
            type: "error",
            message: "You are not authorized for this action",
         });
      }

      if (isUserLogin.user.role == "COMPANY_ADMIN") {
         if (String(req.profile._id) != String(isUserLogin.user.company)) {
            return res.status(500).json({
               type: "error",
               message: "You are not authorized for this action",
            });
         }
      }
      req.loginUser = isUserLogin;
      req.userProfile = isUserLogin.user;
      next();
   } catch (error) {
      return res.status(401).json({
         type: "error",
         message: "You are unauthorized",
      });
   }
};

exports.isCompany = async (req, res, next) => {
   try {
      let token = req.headers.authorization.split(" ")[1];

      const authority = ["SUPER_ADMIN", "COMPANY_ADMIN", "RETAILER_ADMIN"];

      let isUserLogin = await Token.findOne({ token }).populate(
         "user",
         "_id role company retailer"
      );

      if (!isUserLogin) {
         return res.status(500).json({
            type: "error",
            message: "Please Login first",
         });
      }

      jwt.verify(token, `${constant.ADMIN_JWT_SECRET}`, (err) => {
         if (err)
            return res.status(500).json({
               type: "error",
               message: "Token Expired",
            });
      });

      if (!authority.includes(isUserLogin.user.role)) {
         return res.status(500).json({
            type: "error",
            message: "You are not authorized for this action",
         });
      }
      req.loginUser = isUserLogin;
      next();
   } catch (error) {
      return res.status(401).json({
         type: "error",
         message: "You are unauthorized",
      });
   }
};

// exports.signinRequire = async (req, res, next) =>
// {
//     try {
//         const token = req.headers.authorization.replace("Bearer ", "")
//         const isUserLogin = await Token.findOne({ token })
//             .populate('user', "_id role retailer company name email")

//         if (!isUserLogin) throw "Please Login"

//         req.userProfile = isUserLogin.user
//         next()
//     } catch (error) {
//         return res.status(401).json({
//             type: "error",
//             message: error
//         })
//     }
// }

exports.isAppUser = async (req, res, next) => {
   try {

      if (!req.headers.authorization) throw "Token required";
      const token = req.headers.authorization.replace("Bearer ", "");
      if (!token) throw "Invalid token";

      const isUserLogin = await Token.findOne({
         where: { token: token },
         attributes: ["id", "user_id"],
      });
      if (!isUserLogin) throw "Please Login";

      var user_details = await Users.findOne({
         where: { id: isUserLogin.user_id },
         attributes: [
            "id",
            "name",
            "email",
            "country",
            "time_zone",
            "role_id",
            "company_id",
            "account_id",
            "last_login",
            "enable",
         ],
         raw: true,
      });

      if (!isEmpty(user_details.role_id)) {
         const user_role = await Role.findOne({
            where: { id: user_details.role_id, enable: 1 },
            attributes: ["role_name", "enable"],
            raw: true,
         });
         if (!user_role) throw "User role is disabled";

         user_details.role = user_role;
      }

      req.appUserProfile = user_details;
      next();

   } catch (error) {
      return res.status(401).json({
         type: "error",
         message: "You are unauthorized",
      });
   }
};
*/

// AUTH middeleware for ADMIN user
exports.signinRequire = async (req, res, next) => {
   try {
      const authority = [common.roles.COMPANY_ADMIN, common.roles.ACCOUNT_ADMIN, common.roles.SUPER_ADMIN];

      if (!req.headers.authorization) throw "Token required";
      const token = req.headers.authorization.replace("Bearer ", "");
      if (!token) throw "Invalid token";

      jwt.verify(token, `${constant.ADMIN_JWT_SECRET}`, (err) => {
         if (err) throw "Token expired or invalid";
      });
      const isUserLogin = await Token.findOne({
         where: { token: token },
         attributes: ["id", "user_id"],
      });
      if (!isUserLogin) throw "User not found";

      var user_details = await Users.findOne({
         where: { id: isUserLogin.user_id, enable: 1, is_deleted: 0 },
         attributes: ["id", "name", "email", "country", "time_zone", "role_id", "company_id", "account_id", "last_login", "enable", "is_email_verified", "contact_no"], raw: true,
      });
      if (user_details && user_details.is_email_verified === false) throw "Email not verified";
      if (!user_details) throw "User not found";
      if (!isEmpty(user_details.role_id)) {
         const user_role = await Role.findOne({
            where: { id: user_details.role_id, enable: 1 },
            attributes: ["role_name", "enable"],
            raw: true,
         });
         if (!user_role) throw "You are not authorized for this action";
         if (!authority.includes(user_role.role_name)) { throw "You are not authorized for this action"; }
         user_details.role = user_role;
      }
      const user_perm = await RolePermission.findOne({
         where: { role_id: user_details.role_id },
         attributes: ["permissions"],
         raw: true,
      });

      user_details.permissions = [];
      if (!isEmpty(user_perm) && !isEmpty(user_perm.permissions)) {
         user_details.permissions = user_perm.permissions;
      }

      req.userProfile = user_details;
      next();
   } catch (error) {
      logger.log(common.logger_level.error, `${common.admin_api_log_type.admin_auth} | ${error}`);
      console.log(error);
      return res.status(401).json({
         type: "Error",
         message: error,
      });
   }
};

// AUTH middeleware for RETAILER app user
exports.isAppUserLoggedin = async (req, res, next) => {
   try {
      // const authority = [common.roles.COMPANY_ADMIN, common.roles.COMPANY_STANDARD, common.roles.ACCOUNT_STANDARD, common.roles.ACCOUNT_ADMIN];
      const authority = [common.roles.COMPANY_STANDARD, common.roles.ACCOUNT_STANDARD];

      if (!req.headers.authorization) throw "Token required";
      const token = req.headers.authorization.replace("Bearer ", "");
      if (!token) throw "Invalid token";

      jwt.verify(token, `${constant.APP_JWT_SECRET}`, (err) => {
         if (err) throw "Token expired or invalid";
      });

      const isUserLogin = await Token.findOne({ where: { token: token }, attributes: ["id", "user_id"], raw: true });
      if (!isUserLogin) throw "User not found";

      const userrole = await Role.findAll({
         where: { role_name: { [Op.in]: authority } }, attributes: ["id"], raw: true
      }).then(userrole => userrole.map(role_val => role_val.id));
      if (userrole?.length <= 0) { throw "You are not authorized for this action"; }

      var user_details = await Users.findOne({
         where: { id: isUserLogin.user_id, is_deleted: 0, enable: 1, role_id: { [Op.in]: userrole } },
         attributes: ["id", "name", "email", "user_code", "country", "time_zone", "user_type_id", "role_id", "company_id", "account_id", "driver_id", "last_login", "enable", "is_email_verified", "contact_no"],
         include: [{ model: Role, as: "role", attributes: ["role_name", "enable"], where: { enable: 1 } }],
         raw: true, nest: true,
      });
      if (!user_details) throw "User not found";
      if (user_details && user_details.is_email_verified === false) throw "Email not verified";
      if (!authority.includes(user_details.role.role_name)) { throw "You are not authorized for this action"; }
      req.appUserProfile = user_details;
      next();

   } catch (error) {
      logger.log(common.logger_level.error, `${app_api_log_type.retailer_auth} | ${error}`);
      console.log("AUTH_MIDDELWARE : catch error--------", error);
      return res.status(401).json({
         success: false,
         type: "error",
         message: error || "You are unauthorized",
      });
   }
};

// AUTH middeleware for DRIVER app user
exports.isDriverLoggedin = async (req, res, next) => {
   try {
      const authority = [common.roles.DRIVER];

      if (!req.headers.authorization) throw "Token required";
      const token = req.headers.authorization.replace("Bearer ", "");
      if (!token) throw "Invalid token";

      jwt.verify(token, `${constant.APP_JWT_SECRET}`, (err) => {
         if (err) throw "Token expired or invalid";
      });

      const isUserLogin = await Token.findOne({ where: { token: token }, attributes: ["id", "user_id"], raw: true });
      if (!isUserLogin) throw "User not found";

      const userrole = await Role.findAll({ where: { role_name: { [Op.in]: authority } }, attributes: ["id"], raw: true }).then(userrole => userrole.map(role_val => role_val.id));

      var user_details = await Users.findOne({
         where: { id: isUserLogin.user_id, is_deleted: 0, role_id: { [Op.in]: userrole } },
         attributes: ["id", "name", "email", "user_code", "country", "time_zone", "user_type_id", "role_id", "company_id", "account_id", "driver_id", "last_login", "enable", "is_email_verified", "contact_no"],
         include: [{ model: Role, as: "role", attributes: ["role_name", "enable"], where: { enable: 1 } }],
         raw: true, nest: true,
      });

      if (!user_details) throw "User not found";
      if (user_details && user_details.is_email_verified === false) throw "Email not verified";
      req.appUserProfile = user_details;
      next();

   } catch (error) {
      logger.log(common.logger_level.error, `${driver_api_log_type.driver_auth} | ${error}`);
      console.log("AUTH_MIDDELWARE : catch error--------", error);
      return res.status(401).json({
         success: false,
         type: "error",
         message: error || "You are unauthorized",
      });
   }
};