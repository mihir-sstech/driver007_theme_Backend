const _ = require("lodash");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const common = require("common-service/statics/static.json");
const constant = require("common-service/constant/constant.json");
const { generateTokens } = require("common-service/middleware/token");
const { emailSending } = require("common-service/utils/sendEmail");
const { isEmailExist } = require("common-service/helper/checkEmailExist");
const {
  createAdminActivityLog,
} = require("common-service/helper/adminActivityLogs");
const { diffChecker } = require("common-service/helper/diffChecker");
const { getNextUserCode } = require("common-service/services/commonService");
const {
  isEmpty,
  cleanQuery,
  generateUniqueFileName,
  isValidFileType,
  isValidFileSize,
} = require("common-service/utils/utils");
const {
  Users,
  UserType,
  Token,
  Company,
  Account,
  Driver,
} = require("common-service/models/index");
const logger = require("common-service/utils/logger");

// async function getNextUserCode1() {

//   var
//     req_body = {};

//   req_body.password = "123456";

//   const
//     updated_salt = Users.generateSalt();
//   console.log('updated_salt: ', updated_salt);

//   const
//     hass_pass = Users.encryptPassword(req_body.password, updated_salt);
//   console.log('hass_pass: ', hass_pass);

//   req_body.salt = updated_salt;

//   console.log('hass_pass: ', hass_pass);
//   req_body.password = hass_pass

//   req_body.updated_at

//   req_body.updated_by

//   await
//     Users.update(req_body, { where: { id: 3 } });

//   return

// }

// let a = getNextUserCode1()
// console.log('a: ', a);

exports.superAdminAddOrEdit = async (request) => {
  const { body, userProfile } = request;
  let log_type = common.admin_api_log_type.save_userinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin User API - START : ${log_type} | Request : ${JSON.stringify(
        request.body
      )}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    if (!isEmpty(body.country)) {
      body.country = parseInt(body.country);
    }

    var is_email_exist = "";
    if (request.method == "POST") {
      is_email_exist = await isEmailExist(body.email);
    } else {
      if (isEmpty(body.id)) {
        return {
          statusCode: common.response_status_code.bad_request,
          type: common.response_type.error,
          message: common.response_msg.userid_blank,
        };
      }
      is_email_exist = await isEmailExist(body.email, body.id);
    }
    if (is_email_exist) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.email_exist,
      };
    }

    const comp_data = await Company.findOne({
      where: { is_root_company: true, is_deleted: 0, enable: 1 },
      attributes: ["id"],
      raw: true,
    });
    body.company_id = comp_data.id;

    // if (isEmpty(body.user_type_id)) {
    //    return {
    //       statusCode: common.response_status_code.bad_request,
    //       type: common.response_type.error,
    //       message: common.response_msg.usertype_blank,
    //    };
    // }
    // const usertype_data = await UserType.findByPk(body.user_type_id);
    // if (isEmpty(usertype_data)) {
    //    return {
    //       statusCode: common.response_status_code.bad_request,
    //       type: common.response_type.error,
    //       message: common.response_msg.usertype_not_exist,
    //    };
    // }
    // if (usertype_data.type == "company_admin") {
    //    if (isEmpty(body.company_id)) {
    //       return {
    //          statusCode: common.response_status_code.bad_request,
    //          type: common.response_type.error,
    //          message: common.response_msg.blank_company_id,
    //       };
    //    }
    // } else if (usertype_data.type == "account") {
    //    if (isEmpty(body.account_id)) {
    //       return {
    //          statusCode: common.response_status_code.bad_request,
    //          type: common.response_type.error,
    //          message: common.response_msg.blank_account_id,
    //       };
    //    }
    // }

    if (isEmpty(body.role_id)) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.role_id_blank,
      };
    }

    if (request.method == "POST") {
      // body.created_by = userProfile.id;

      await Users.create(body);
      createAdminActivityLog(
        request,
        null,
        "add",
        common.admin_module.user_management,
        "",
        JSON.stringify(body),
        `Super Admin User "${body.name}" created`,
        common.response_status_code.success,
        common.response_type.success
      );
    } else {
      if (!isEmpty(body.password)) {
        const updated_salt = Users.generateSalt();
        const hass_pass = Users.encryptPassword(body.password, updated_salt);
        body.salt = updated_salt;
        body.password = hass_pass;
      }

      const old_data = await Users.findOne({ where: { id: body.id } });
      if (isEmpty(old_data)) {
        return {
          statusCode: common.response_status_code.not_found,
          type: common.response_type.error,
          message: common.response_msg.user_not_found,
        };
      }
      body.updated_at = Date.now();
      // body.updated_by = userProfile.id;

      let getActivity = diffChecker(old_data, body, [
        "name",
        "email",
        "country",
        "time_zone",
        "password",
        "enable",
      ]);

      const user_id = body.id;
      delete body.id;

      await Users.update(body, { where: { id: user_id } });

      createAdminActivityLog(
        request,
        null,
        "edit",
        common.admin_module.user_management,
        JSON.stringify(getActivity["oldData"]),
        JSON.stringify(getActivity["newData"]),
        `Super Admin User "${body.name}" updated`,
        common.response_status_code.success,
        common.response_type.success
      );
    }

    var msg_str = "";
    if (request.method == "POST") {
      msg_str = common.response_msg.user_created;
    } else {
      msg_str = common.response_msg.user_updated;
    }
    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: msg_str,
    };
    logger.log(
      common.logger_level.info,
      `Admin User API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Company API - ${log_type} | ${error}`
    );
    console.log(error);

    const action = request.method === "POST" ? "add" : "edit";

    createAdminActivityLog(
      request,
      null,
      action,
      common.admin_module.user_management,
      "",
      JSON.stringify(body),
      `Super Admin User "${body.name}" not ${action} as getting error: "${error}"`,
      common.response_status_code.internal_error,
      common.response_type.error
    );

    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

// ==================== User type listing =====================
exports.getUserTypeList = async (request) => {
  const { id } = request.params;
  const { type } = request.query;
  const { userProfile } = request;
  let log_type = common.admin_api_log_type.get_userinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin User API - START : ${log_type} | Request : ${JSON.stringify(
        request.query
      )}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    var user_type_data = [];
    if (type === "forgetbyid" && !isEmpty(id)) {
      user_type_data = await UserType.findOne({
        where: { id: id },
        attributes: ["id", "type", "enable"],
        raw: true,
      });
    } else if (
      type === "forlistingpage" &&
      userProfile.role.role_name === common.roles.SUPER_ADMIN
    ) {
      user_type_data = await UserType.findAll({
        where: { is_deleted: 0 },
        attributes: ["id", "type", "enable"],
        order: [["type", "ASC"]],
        raw: true,
      });
    } else if (type === "fordropdown") {
      let where = "";
      if (userProfile.role.role_name === common.roles.SUPER_ADMIN) {
        where = { is_deleted: 0, enable: 1 };
      } else if (userProfile.role.role_name === common.roles.COMPANY_ADMIN) {
        where = {
          is_deleted: 0,
          enable: 1,
          type: {
            [Op.notIn]: [common.roles.COMPANY_ADMIN, common.roles.SUPER_ADMIN],
          },
        };
      } else if (userProfile.role.role_name === common.roles.ACCOUNT_ADMIN) {
        where = {
          is_deleted: 0,
          enable: 1,
          type: {
            [Op.in]: [
              common.roles.ACCOUNT_STANDARD,
              common.roles.DRIVER,
              common.roles.CUSTOMER,
            ],
          },
        };
      }
      if (!isEmpty(where)) {
        user_type_data = await UserType.findAll({
          where: where,
          attributes: ["id", "type", "enable"],
          order: [["type", "ASC"]],
          raw: true,
        });
      }
    }

    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.usertype_get,
      data: user_type_data || [],
    };
    createAdminActivityLog(
      request,
      null,
      "get",
      common.admin_module.user_management,
      "",
      JSON.stringify(request.query),
      `All User details has been fetched by "${request.userProfile.name}"`,
      res_arr.statusCode,
      res_arr.type
    );
    logger.log(
      common.logger_level.info,
      `Admin User API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin User API - ${log_type} | ${error}`
    );
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

// ==================== User type add or edit =====================
exports.userTypeAddorEdit = async (request) => {
  const { body, userProfile } = request;
  let log_type = common.admin_api_log_type.save_userinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin User API - START : ${log_type} | Request : ${JSON.stringify(
        request.body
      )}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
    };
    var msg_str = "";
    var where = {};
    if (request.method == "POST") {
      where = { type: body.type };
    } else {
      where = { type: body.type, id: { [Op.ne]: body.id } };
    }
    const is_type_exist = await UserType.findOne({
      where: where,
      attributes: ["id", "type"],
    });
    if (!isEmpty(is_type_exist)) {
      res_arr.message = common.response_msg.usertype_exist;
      return res_arr;
    }
    if (request.method == "POST") {
      body.created_by = userProfile.id;
      await UserType.create(body);
      msg_str = common.response_msg.usertype_created;

      createAdminActivityLog(
        request,
        null,
        "add",
        common.admin_module.user_management,
        "",
        JSON.stringify(body),
        `User Type "${body.type}" created by "${userProfile.name}"`,
        common.response_status_code.success,
        common.response_type.success
      );
    } else {
      if (isEmpty(body.id)) {
        res_arr.message = common.response_msg.usertype_blank;
        return res_arr;
      }
      const old_data = await UserType.findByPk(body.id, {
        attributes: ["id", "type"],
      });
      if (isEmpty(old_data)) {
        res_arr.message = common.response_msg.usertype_not_exist;
        return res_arr;
      }
      body.updated_at = Date.now();
      body.updated_by = userProfile.id;
      const usertype_id = body.id;
      delete body.id;
      await UserType.update(body, { where: { id: usertype_id } });

      msg_str = common.response_msg.usertype_updated;

      let getActivity = diffChecker(old_data, body, ["type"]);
      createAdminActivityLog(
        request,
        null,
        "edit",
        common.admin_module.user_management,
        JSON.stringify(getActivity["oldData"]),
        JSON.stringify(getActivity["newData"]),
        `User Type "${body.type}" updated by "${userProfile.name}"`,
        common.response_status_code.success,
        common.response_type.success
      );
    }

    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: msg_str,
    };
    logger.log(
      common.logger_level.info,
      `Admin User API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin User API - ${log_type} | ${error}`
    );
    console.log(error);
    const action = request.method === "POST" ? "add" : "edit";

    createAdminActivityLog(
      request,
      null,
      action,
      common.admin_module.user_management,
      "",
      JSON.stringify(body),
      `User Type "${body.type}" not ${action} by "${userProfile.name}" as getting error: "${error}"`,
      common.response_status_code.internal_error,
      common.response_type.error
    );
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

// ==================== Check user email exist or not =====================
exports.checkEmailExist = async (request) => {
  const { email } = request.body;
  try {
    if (isEmpty(email)) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.blank_email,
      };
    }
    const is_exist = await isEmailExist(email);
    return {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.email_check_success,
      data: { is_exist: is_exist },
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

// ==================== User add or edit =====================
exports.userAddorEdit = async (request) => {
  const { body, userProfile, profile_pic } = request;
  let log_type = common.admin_api_log_type.save_userinfo_via_admin;

  var res_arr = {
    statusCode: common.response_status_code.bad_request,
    type: common.response_type.error,
    message: "",
  };

  try {
    logger.log(
      common.logger_level.info,
      `Admin User API - START : ${log_type} | Request : ${JSON.stringify(
        request.body
      )}`
    );
    if (!isEmpty(body.country)) {
      body.country = parseInt(body.country);
    }

    var is_email_exist = "";
    if (request.method == "POST") {
      is_email_exist = await isEmailExist(body.email);
    } else {
      if (isEmpty(body.id)) {
        res_arr.message = common.response_msg.userid_blank;
        return res_arr;
      }
      is_email_exist = await isEmailExist(body.email, body.id);
    }
    if (is_email_exist) {
      res_arr.message = common.response_msg.email_exist;
      return res_arr;
    }

    const usertype_data = await UserType.findByPk(body.user_type_id);
    if (isEmpty(usertype_data)) {
      res_arr.message = common.response_msg.usertype_not_exist;
      return res_arr;
    }

    const comp_data = await Company.findOne({
      where: { is_root_company: true, is_deleted: 0, enable: 1 },
      attributes: ["id"],
      raw: true,
    });

    if (
      usertype_data.type == "company_admin" ||
      usertype_data.type == "company_standard"
    ) {
      if (isEmpty(body.company_id)) {
        res_arr.message = common.response_msg.blank_company_id;
        return res_arr;
      }
    } else if (
      usertype_data.type == "account_admin" ||
      usertype_data.type == "account_standard"
    ) {
      if (isEmpty(body.account_id)) {
        res_arr.message = common.response_msg.blank_account_id;
        return res_arr;
      }
      const acc_data = await Account.findByPk(body.account_id, {
        attributes: ["id", "company_id"],
        raw: true,
      });
      body.company_id = acc_data.company_id;
    } else if (usertype_data.type == "driver") {
      if (isEmpty(body.driver_id)) {
        res_arr.message = common.response_msg.blank_driver_id;
        return res_arr;
      }
      const driver_data = await Driver.findOne({
        where: { id: body.driver_id, is_deleted: 0 },
        attributes: ["id", "company_id"],
        raw: true,
      });
      if (driver_data && !isEmpty(driver_data?.company_id)) {
        body.company_id = driver_data?.company_id || null;
      } else {
        body.company_id = comp_data ? comp_data?.id : null;
      }
    } else if (usertype_data.type == "super_admin") {
      body.company_id = comp_data ? comp_data?.id : null;
    }

    if (!isEmpty(profile_pic)) {
      if (!isValidFileType(profile_pic.originalFilename)) {
        res_arr.message = common.response_msg.invalid_file;
        return res_arr;
      }
      if (!isValidFileSize(profile_pic.size)) {
        res_arr.message = common.response_msg.exceeds_file_size;
        return res_arr;
      }
      const unique_filename = generateUniqueFileName(
        profile_pic.originalFilename
      );
      let oldPath = profile_pic.filepath;
      let newPath =
        path.join(__dirname, "../", constant.IMG_UPLOAD_DIR) +
        "/" +
        unique_filename;
      let rawData = fs.readFileSync(oldPath);

      fs.writeFile(newPath, rawData, function (err) {
        if (err) {
          res_arr.statusCode = common.response_status_code.internal_error;
          res_arr.message = common.response_msg.img_not_uploaded;
          return res_arr;
        }
      });
      body.profile_pic = unique_filename;

      if (request.method == "PUT") {
        const old_data = await Users.findOne({
          where: { id: body.id },
          attributes: ["id", "profile_pic"],
        });
        if (!isEmpty(old_data.profile_pic)) {
          let prev_img_path =
            path.join(__dirname, "../", constant.IMG_UPLOAD_DIR) +
            "/" +
            old_data.profile_pic;
          if (fs.existsSync(prev_img_path)) {
            fs.unlinkSync(prev_img_path);
          }
        }
      }
    }

    var last_insert_id = "";
    var msg_str = "";
    if (request.method == "POST") {
      body.created_by = userProfile.id;
      body.user_code = await getNextUserCode();
      await Users.create(body);

      // ------------------------------------------
      const token = await generateTokens("admin", "user-verify", body);
      const template_id = common.email_template.email_verify;
      let replacements = {
        VERIFICATIONURL: `<a href='${constant.CLIENT_URL}/user-verify?uid=${token}'><b>here</b></a>`,
      };
      await emailSending(
        body.email,
        body.company_id || 1,
        template_id,
        replacements
      );

      msg_str = common.response_msg.verify_email_sent;
      // ------------------------------------------
      // msg_str = common.response_msg.user_created;
      createAdminActivityLog(
        request,
        null,
        "add",
        common.admin_module.user_management,
        "",
        JSON.stringify(body),
        `User "${body.name}" created by "${userProfile.name}"`,
        common.response_status_code.success,
        common.response_type.success
      );
    } else {
      if (!isEmpty(body.password)) {
        const updated_salt = Users.generateSalt();
        const hass_pass = Users.encryptPassword(body.password, updated_salt);
        body.salt = updated_salt;
        body.password = hass_pass;
      }

      const old_data = await Users.findOne({ where: { id: body.id } });
      if (isEmpty(old_data)) {
        return {
          statusCode: common.response_status_code.not_found,
          type: common.response_type.error,
          message: common.response_msg.user_not_found,
        };
      }
      body.updated_at = Date.now();
      body.updated_by = userProfile.id;

      let getActivity = diffChecker(old_data, body, [
        "name",
        "email",
        "country",
        "time_zone",
        "password",
        "enable",
      ]);

      const user_id = body.id;
      delete body.id;
      await Users.update(body, { where: { id: user_id } });

      createAdminActivityLog(
        request,
        null,
        "edit",
        common.admin_module.user_management,
        JSON.stringify(getActivity["oldData"]),
        JSON.stringify(getActivity["newData"]),
        `User "${body.name}" updated by "${userProfile.name}"`,
        common.response_status_code.success,
        common.response_type.success
      );

      msg_str = common.response_msg.user_updated;
    }

    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: msg_str,
    };
    logger.log(
      common.logger_level.info,
      `Admin User API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin User API - ${log_type} | ${error}`
    );
    console.log(error);
    const action = request.method === "POST" ? "add" : "edit";

    createAdminActivityLog(
      request,
      null,
      action,
      common.admin_module.user_management,
      "",
      JSON.stringify(body),
      `User "${body.name}" not ${action} by "${userProfile.name}" as getting error: "${error}"`,
      common.response_status_code.internal_error,
      common.response_type.error
    );
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};
// ==================== User profile edit =====================
exports.userProfileEdit = async (request) => {
  const { body, userProfile } = request;
  let log_type = common.admin_api_log_type.save_userinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin User API - START : ${log_type} | Request : ${JSON.stringify(
        request.body
      )}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    if (body.password && isEmpty(body.password)) {
      delete body.password;
    }
    if (!isEmpty(body.password)) {
      const updated_salt = Users.generateSalt();
      const hass_pass = Users.encryptPassword(body.password, updated_salt);
      body.salt = updated_salt;
      body.password = hass_pass;
    }

    body.updated_at = Date.now();
    body.updated_by = userProfile.id;

    await Users.update(body, { where: { id: userProfile.id } });

    createAdminActivityLog(
      request,
      null,
      "edit",
      common.admin_module.user_management,
      "",
      "",
      `User profile "${body.name}" updated by "${userProfile.name}"`,
      common.response_status_code.success,
      common.response_type.success
    );

    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.user_updated,
    };
    logger.log(
      common.logger_level.info,
      `Admin User API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin User API - ${log_type} | ${error}`
    );
    console.log(error);
    const action = request.method == "POST" ? "add" : "edit";

    createAdminActivityLog(
      request,
      null,
      action,
      common.admin_module.user_management,
      "",
      JSON.stringify(body),
      `User "${body.name}" not ${action} by "${userProfile.name}" as getting error: "${error}"`,
      common.response_status_code.internal_error,
      common.response_type.error
    );

    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

// ==================== User delete =====================
exports.userDelete = async (request) => {
  const { userProfile } = request;
  const { id } = request.params;
  let log_type = common.admin_api_log_type.delete_userinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin User API - START : ${log_type} | Request : ${JSON.stringify(
        request.params
      )}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    if (!id) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.userid_blank,
      };
    }
    const old_data = await Users.findOne({
      where: { id: id, is_deleted: 0 },
      attributes: ["id", "name"],
    });
    if (isEmpty(old_data)) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.user_not_found,
        data: [],
      };
    }
    var update_data = {};
    update_data.deleted_at = Date.now();
    update_data.deleted_by = userProfile.id;
    update_data.is_deleted = 1;

    await Users.update(update_data, { where: { id: id } });
    await Token.destroy({ where: { user_id: id } });

    createAdminActivityLog(
      request,
      null,
      "delete",
      common.admin_module.user_management,
      "",
      "",
      `User "${old_data.name}" deleted by "${userProfile.name}"`,
      common.response_status_code.success,
      common.response_type.success
    );

    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.user_deleted,
    };
    logger.log(
      common.logger_level.info,
      `Admin User API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    console.log(error);

    createAdminActivityLog(
      request,
      null,
      "delete",
      common.admin_module.user_management,
      "",
      JSON.stringify({ id: id }),
      `User id="${id}" not deleted by "${userProfile.name}" as getting error: "${error}"`,
      common.response_status_code.internal_error,
      common.response_type.error
    );
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

// ==================== User listing get =====================
exports.userList = async (request) => {
  const { userProfile } = request;
  var { page, limit, search, sortby, order_type } = request.query;
  var query = request.query;
  let log_type = common.admin_api_log_type.get_userinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin User API - START : ${log_type} | Request : ${JSON.stringify(
        request.query
      )}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    query = cleanQuery(query);
    sortby = sortby || "created_at";
    order_type = order_type || "DESC";
    query.is_deleted = 0;
    query.role_id = { [Op.ne]: 1 };

    delete query.page;
    delete query.limit;
    delete query.search;
    delete query.sortby;
    delete query.order_type;

    if (search) {
      query = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { "$company_detail.name$": { [Op.iLike]: `%${search}%` } },
          { "$account_detail.name$": { [Op.iLike]: `%${search}%` } },
        ],
        ...query,
      };
    }

    let options = {
      offset: (page - 1) * limit,
      limit: limit,
      order: [[sortby.toLowerCase(), order_type.toLowerCase()]],
    };

    //================================================
    if (
      userProfile.role.role_name === common.roles.COMPANY_ADMIN ||
      userProfile.role.role_name === common.roles.COMPANY_STANDARD
    ) {
      query.company_id = userProfile.company_id;
    } else if (
      userProfile.role.role_name === common.roles.ACCOUNT_ADMIN ||
      userProfile.role.role_name === common.roles.ACCOUNT_STANDARD
    ) {
      query.account_id = userProfile.account_id;
    }
    //=================================================

    const data = await Users.findAndCountAll({
      attributes: [
        "id",
        "name",
        "email",
        "enable",
        "company_id",
        "account_id",
        "profile_pic",
        "updated_at",
        "last_login",
      ],
      where: query,
      include: [
        {
          model: Company,
          as: "company_detail",
          attributes: ["id", "name"],
        },
        {
          model: Account,
          as: "account_detail",
          attributes: ["id", "name"],
        },
      ],
      ...options,
    });

    const totalPages = Math.ceil(data.count / limit);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    data.user_details = data.rows;
    data.limit = limit;
    data.current_page = page;
    data.total_pages = totalPages;
    data.total_records = data.count;

    delete data.count;
    delete data.rows;

    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.user_lists,
      data: data,
    };
    createAdminActivityLog(
      request,
      null,
      "get",
      common.admin_module.user_management,
      "",
      JSON.stringify(request.query),
      `All User details has been fetched by "${request.userProfile.name}"`,
      res_arr.statusCode,
      res_arr.type
    );
    logger.log(
      common.logger_level.info,
      `Admin User API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin User API - ${log_type} | ${error}`
    );
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

// ==================== User detail get =====================
exports.userdetail = async (request) => {
  const { id } = request.params;
  let log_type = common.admin_api_log_type.get_userinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin User API - START : ${log_type} | Request : ${JSON.stringify(
        request.params
      )}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    const data = await Users.findOne({
      where: { id: id, is_deleted: 0 },
      attributes: [
        "id",
        "name",
        "email",
        "enable",
        "company_id",
        "account_id",
        "driver_id",
        "country",
        "role_id",
        "user_type_id",
        "time_zone",
        "building_name",
        "street_address",
        "state",
        "city",
        "zipcode",
        "contact_no",
        "profile_pic",
      ],
    });
    if (!isEmpty(data)) {
      res_arr = {
        statusCode: common.response_status_code.success,
        type: common.response_type.success,
        message: common.response_msg.user_detail,
        data: data,
      };
      createAdminActivityLog(
        request,
        null,
        "get",
        common.admin_module.user_management,
        "",
        JSON.stringify(request.query),
        `User details has been fetched by "${request.userProfile.name}"`,
        res_arr.statusCode,
        res_arr.type
      );
      logger.log(
        common.logger_level.info,
        `Admin User API - END : ${log_type} | Response : ${JSON.stringify(
          res_arr
        )}`
      );
      return res_arr;
    } else {
      return {
        statusCode: common.response_status_code.not_found,
        type: common.response_type.error,
        message: common.response_msg.user_not_found,
        data: [],
      };
    }
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin User API - ${log_type} | ${error}`
    );
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

// ==================== User email verify through the email sending =====================
exports.verifyUserEmail = async (request) => {
  const { token } = request.body;

  if (!token) {
    throw common.response_msg.token_not_found;
  }
  jwt.verify(token, `${constant.ADMIN_JWT_SECRET}`, (err) => {
    if (err) throw "Token Expired or Invalid";
  });

  try {
    const { sub } = jwt.decode(token);
    await Users.update(
      { enable: 1, is_email_verified: 1 },
      { where: { email: sub } }
    );
    createAdminActivityLog(
      request,
      null,
      "add",
      common.admin_module.user_management,
      "",
      JSON.stringify(request.body),
      `User "${sub}" verified successfully`,
      common.response_status_code.success,
      common.response_type.success
    );

    return {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.email_verified,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

// ============= Change status field ===========
exports.changeStatus = async (request) => {
  const { userProfile, body } = request;
  let log_type = common.admin_api_log_type.save_userstatus_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin User API - START : ${log_type} | Request : ${JSON.stringify(
        request.body
      )}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    const old_data = await Users.findOne({
      where: { id: body.id, is_deleted: 0 },
      attributes: ["id", "name", "enable"],
      raw: true,
    });
    if (isEmpty(old_data)) {
      return {
        statusCode: common.response_status_code.not_found,
        type: common.response_type.error,
        message: common.response_msg.company_not_found,
      };
    }
    body.updated_at = Date.now();
    body.updated_by = userProfile.id;

    let getActivity = diffChecker(old_data, body, ["name", "enable"]);

    const id = body.id;
    delete body.id;

    await Users.update(body, { where: { id: id } });
    createAdminActivityLog(
      request,
      null,
      "edit",
      common.admin_module.user_management,
      JSON.stringify(getActivity["oldData"]),
      JSON.stringify(getActivity["newData"]),
      `Status for user "${old_data.name}" updated by "${userProfile.name}"`,
      common.response_status_code.success,
      common.response_type.success
    );

    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.status_updated,
      data: {},
    };
    logger.log(
      common.logger_level.info,
      `Admin User API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Company API - ${log_type} | ${error}`
    );
    cons;
    createAdminActivityLog(
      request,
      null,
      "edit",
      common.admin_module.user_management,
      "",
      JSON.stringify(body),
      `user status not updated by "${userProfile.name}" as getting error: "${error}"`,
      common.response_status_code.internal_error,
      common.response_type.error
    );

    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};
