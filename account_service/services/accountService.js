const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const common = require("common-service/statics/static.json");
const constant = require("common-service/constant/constant.json");
const {
  isEmpty,
  generateUniqueFileName,
  isValidFileType,
  isValidFileSize,
  idGenerator,
  cleanQuery,
} = require("common-service/utils/utils");
const {
  createAdminActivityLog,
} = require("common-service/helper/adminActivityLogs");
const { diffChecker } = require("common-service/helper/diffChecker");
const { Company, Account } = require("common-service/models");
const logger = require("common-service/utils/logger");

exports.accountAddOrEdit = async (request) => {
  const { userProfile, logo } = request;
  var { body } = request;
  let log_type = common.admin_api_log_type.save_accountinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin Account API - START : ${log_type} | Request : ${JSON.stringify(
        request.body
      )}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    // body.logo = "";
    let company_id = body.company_id;
    if (userProfile.role.role_name == common.roles.COMPANY_ADMIN) {
      company_id = userProfile.company_id;
    }
    if (!company_id) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.company_blank,
      };
    }
    if (body.name) {
      // var where = { name: body.name, company_id: company_id, is_deleted: 0 };
      var where = { name: body.name };
      if (request.method == "PUT") {
        where.id = { [Op.ne]: body.id };
      }
      const is_account_exist = await Account.findOne({
        where: where,
        attributes: ["id"],
      });
      if (is_account_exist) {
        return {
          statusCode: common.response_status_code.bad_request,
          type: common.response_type.error,
          message: common.response_msg.exist_name,
        };
      }
    }
    if (body.email) {
      const emailRegexp =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegexp.test(body.email)) {
        return {
          statusCode: common.response_status_code.bad_request,
          type: common.response_type.error,
          message: common.response_msg.invalid_email,
        };
      }
      // var where = { email: body.email, company_id: company_id, is_deleted: 0 };
      var where = { email: body.email };
      if (request.method == "PUT") {
        where.id = { [Op.ne]: body.id };
      }
      const is_account_exist = await Account.findOne({
        where: where,
        attributes: ["id"],
      });
      if (is_account_exist) {
        return {
          statusCode: common.response_status_code.bad_request,
          type: common.response_type.error,
          message: common.response_msg.email_exist,
        };
      }
    }
    if (!isEmpty(logo)) {
      if (!isValidFileType(logo.originalFilename)) {
        return {
          statusCode: common.response_status_code.bad_request,
          type: common.response_type.error,
          message: common.response_msg.invalid_file,
        };
      }
      if (!isValidFileSize(logo.size)) {
        return {
          statusCode: common.response_status_code.bad_request,
          type: common.response_type.error,
          message: common.response_msg.exceeds_file_size,
        };
      }
      const unique_filename = generateUniqueFileName(logo.originalFilename);
      let oldPath = logo.filepath;
      let newPath =
        path.join(__dirname, "../", constant.IMG_UPLOAD_DIR) +
        "/" +
        unique_filename;
      let rawData = fs.readFileSync(oldPath);

      fs.writeFile(newPath, rawData, function (err) {
        if (err) {
          return {
            statusCode: common.response_status_code.internal_error,
            type: common.response_type.error,
            message: common.response_msg.img_not_uploaded,
          };
        }
      });
      body.logo = unique_filename;

      if (request.method == "PUT") {
        const old_data = await Account.findOne({
          where: { id: body.id },
          attributes: ["id", "logo"],
        });
        if (!isEmpty(old_data.logo)) {
          let prev_logo_path =
            path.join(__dirname, "../", constant.IMG_UPLOAD_DIR) +
            "/" +
            old_data.logo;
          if (fs.existsSync(prev_logo_path)) {
            fs.unlinkSync(prev_logo_path);
          }
        }
      }
    }

    var last_insert_id = "";
    if (request.method == "POST") {
      let iscodeuniq = false;
      do {
        let code = idGenerator();
        const isCodeExist = await Account.findOne({
          where: { account_code: code },
        });
        if (isCodeExist == null) {
          body.account_code = code;
          iscodeuniq = true;
        }
      } while (!iscodeuniq);

      body.created_by = userProfile.id;
      const inserted_data = await Account.create(body);
      last_insert_id = inserted_data.id;
      createAdminActivityLog(
        request,
        null,
        "add",
        common.admin_module.account_management,
        "",
        JSON.stringify(body),
        `Account "${body.name}" added by "${userProfile.name}"`,
        common.response_status_code.success,
        common.response_type.success
      );
    } else {
      const old_data = await Account.findOne({ where: { id: body.id } });
      if (isEmpty(old_data)) {
        return {
          statusCode: common.response_status_code.not_found,
          type: common.response_type.error,
          message: common.response_msg.account_not_found,
        };
      }
      body.updated_at = Date.now();
      body.updated_by = userProfile.id;

      let getActivity = diffChecker(old_data, body, [
        "name",
        "description",
        "company_id",
        "building_name",
        "country",
        "street_address",
        "state",
        "pincode",
        "suburb",
        "contact_no",
        "email",
        "custom_domain_name",
        "site_url",
        "cost_center_name",
        "facebook_url",
        "twitter_url",
        "googleplus_url",
        "instagram_url",
        "youtube_url",
        "snapchat_url",
        "tiktok_url",
        "footer_copyright",
      ]);

      const acc_id = body.id;
      delete body.id;
      await Account.update(body, { where: { id: acc_id } });

      createAdminActivityLog(
        request,
        null,
        "edit",
        common.admin_module.account_management,
        JSON.stringify(getActivity["oldData"]),
        JSON.stringify(getActivity["newData"]),
        `Account "${body.name}" updated by "${userProfile.name}"`,
        common.response_status_code.success,
        common.response_type.success
      );
    }

    var msg_str = "";
    if (request.method == "POST") {
      msg_str = common.response_msg.account_created;
    } else {
      msg_str = common.response_msg.account_updated;
    }
    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: msg_str,
      data: {
        last_insert_id: last_insert_id,
        company_id: parseInt(company_id),
      },
    };
    logger.log(
      common.logger_level.info,
      `Admin Account API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Account API - ${log_type} | ${error}`
    );
    console.log(error);
    const action = request.method == "POST" ? "add" : "edit";

    createAdminActivityLog(
      request,
      null,
      action,
      common.admin_module.account_management,
      "",
      JSON.stringify(body),
      `Account "${body.name}" not ${action} by "${userProfile.name}" as getting error: "${error}"`,
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

exports.accountDelete = async (request) => {
  const { userProfile } = request;
  const { id } = request.params;
  let log_type = common.admin_api_log_type.delete_accountinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin Account API - START : ${log_type} | Request : ${JSON.stringify(
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
        message: common.response_msg.blank_account_id,
      };
    }
    const old_data = await Account.findOne({
      where: { id: id, is_deleted: 0 },
      attributes: ["id", "name"],
    });
    if (isEmpty(old_data)) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.account_not_found,
        data: [],
      };
    }
    // if (!isEmpty(old_data.logo)) {
    //    let prev_logo_path = path.join(__dirname, '../', constant.IMG_UPLOAD_DIR) + '/' + old_data.logo;
    //    if (fs.existsSync(prev_logo_path)) {
    //       fs.unlinkSync(prev_logo_path);
    //    }
    // }

    var update_data = {};
    update_data.deleted_at = Date.now();
    update_data.deleted_by = userProfile.id;
    update_data.is_deleted = 1;

    await Account.update(update_data, { where: { id: id } });

    createAdminActivityLog(
      request,
      null,
      "delete",
      common.admin_module.account_management,
      "",
      "",
      `Account "${old_data.name}" deleted by "${userProfile.name}"`,
      common.response_status_code.success,
      common.response_type.success
    );

    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.account_deleted,
    };
    logger.log(
      common.logger_level.info,
      `Admin Account API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Account API - ${log_type} | ${error}`
    );
    console.log(error);

    createAdminActivityLog(
      request,
      null,
      "delete",
      common.admin_module.account_management,
      "",
      JSON.stringify({ id: id }),
      `Account id="${id}" not deleted by "${userProfile.name}" as getting error: "${error}"`,
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

exports.accountList = async (request) => {
  const { userProfile } = request;
  var { page, limit, search, sortby, order_type } = request.query;
  var query = request.query;
  let log_type = common.admin_api_log_type.get_companyinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin Account API - START : ${log_type} | Request : ${JSON.stringify(
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

    delete query.page;
    delete query.limit;
    delete query.search;
    delete query.sortby;
    delete query.order_type;

    if (search) {
      query = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { "$company_detail.name$": { [Op.iLike]: `%${search}%` } },
        ],
        ...query,
      };
      // query = {name: { [Op.iLike]: `%${search}%` },...query,}
    }

    let options = {
      offset: (page - 1) * limit,
      limit: limit,
      order: [[sortby.toLowerCase(), order_type.toLowerCase()]],
    };

    //================================================
    if (userProfile.role.role_name === common.roles.COMPANY_ADMIN) {
      query.company_id = userProfile.company_id;
    } else if (
      userProfile.role.role_name === common.roles.ACCOUNT_ADMIN ||
      userProfile.role.role_name === common.roles.ACCOUNT_STANDARD ||
      userProfile.role.role_name === common.roles.COMPANY_STANDARD
    ) {
      query.id = userProfile.account_id;
    }
    //=================================================

    const accData = await Account.findAndCountAll({
      attributes: [
        "id",
        "name",
        "account_code",
        "company_id",
        "email",
        "logo",
        "status",
        "updated_at",
      ],
      include: [{ model: Company, as: "company_detail", attributes: ["name"] }],
      where: query,
      ...options,
    });

    const totalPages = Math.ceil(accData.count / limit);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    accData.account_details = accData.rows;
    accData.limit = limit;
    accData.current_page = page;
    accData.total_pages = totalPages;
    accData.total_records = accData.count;

    delete accData.count;
    delete accData.rows;

    // createAdminActivityLog(request, null, "view", common.admin_module.account_management, "", "", `Account lists viewed by "${userProfile.name}"`, common.response_status_code.success, common.response_type.success);

    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.account_lists,
      data: accData,
    };
    createAdminActivityLog(
      request,
      null,
      "get",
      common.admin_module.account_management,
      "",
      JSON.stringify(request.query),
      `All account details has been fetched by "${request.userProfile.name}"`,
      res_arr.statusCode,
      res_arr.type
    );
    logger.log(
      common.logger_level.info,
      `Admin Account API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Account API - ${log_type} | ${error}`
    );
    console.log(error);

    // createAdminActivityLog(request, null, "view", common.admin_module.account_management, "", "", `Account lists not viewed by "${userProfile.name}" as getting error: "${error}"`, common.response_status_code.internal_error, common.response_type.error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.accountdetail = async (request) => {
  const { id } = request.params;
  let log_type = common.admin_api_log_type.get_companyinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin Company API - START : ${log_type} | Request : ${JSON.stringify(
        request.params
      )}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    const accData = await Account.findOne({ where: { id: id, is_deleted: 0 } });
    if (!isEmpty(accData)) {
      res_arr = {
        statusCode: common.response_status_code.success,
        type: common.response_type.success,
        message: common.response_msg.account_detail,
        data: accData,
      };
      createAdminActivityLog(
        request,
        null,
        "get",
        common.admin_module.account_management,
        "",
        JSON.stringify(request.params),
        `Account details has been fetched by "${request.userProfile.name}"`,
        res_arr.statusCode,
        res_arr.type
      );
      logger.log(
        common.logger_level.info,
        `Admin Company API - END : ${log_type} | Response : ${JSON.stringify(
          res_arr
        )}`
      );
      return res_arr;
    } else {
      return {
        statusCode: common.response_status_code.not_found,
        type: common.response_type.error,
        message: common.response_msg.account_not_found,
        data: [],
      };
    }
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Account API - ${log_type} | ${error}`
    );
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.accountDropdown = async (request) => {
  let log_type = common.admin_api_log_type.get_accountinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin Account API - START : ${log_type}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    const { userProfile } = request;
    var data = [];
    const where_str = { status: 1, is_deleted: 0 };
    if (userProfile.role.role_name === common.roles.COMPANY_ADMIN) {
      where_str.company_id = userProfile.company_id;
    } else if (
      userProfile.role.role_name === common.roles.ACCOUNT_ADMIN ||
      userProfile.role.role_name === common.roles.ACCOUNT_STANDARD ||
      userProfile.role.role_name === common.roles.COMPANY_STANDARD
    ) {
      where_str.id = userProfile.account_id;
    }

    data = await Account.findAll({
      where: where_str,
      attributes: ["id", "name"],
      raw: true,
    });
    createAdminActivityLog(
      request,
      null,
      "get",
      common.admin_module.account_management,
      "",
      JSON.stringify(""),
      `Account List has been fetched by "${request.userProfile.name}"`,
      res_arr.statusCode,
      res_arr.type
    );
    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.account_lists,
      data: data,
    };
    logger.log(
      common.logger_level.info,
      `Admin Account API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Account API - ${log_type} | ${error}`
    );
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.changeStatus = async (request) => {
  const { userProfile, body } = request;
  let log_type = common.admin_api_log_type.save_accountstatus_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin Account API - START : ${log_type} | Request : ${JSON.stringify(
        request.body
      )}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    if (isEmpty(body.id) || isEmpty(body.status)) {
      res_arr.message = common.response_msg.required_details;
      return res_arr;
    }

    const old_data = await Account.findOne({
      where: { id: body.id, is_deleted: 0 },
      attributes: ["id", "name"],
    });
    if (isEmpty(old_data)) {
      res_arr.message = common.response_msg.account_not_found;
      return res_arr;
    }

    body.updated_at = Date.now();
    body.updated_by = userProfile.id;

    let getActivity = diffChecker(old_data, body, ["name", "status"]);

    const acc_id = body.id;
    delete body.id;
    await Account.update(body, { where: { id: acc_id } });

    createAdminActivityLog(
      request,
      null,
      "edit",
      common.admin_module.account_management,
      JSON.stringify(getActivity["oldData"]),
      JSON.stringify(getActivity["newData"]),
      `Status for account "${old_data.name}" updated by "${userProfile.name}"`,
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
      `Admin Account API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Account API - ${log_type} | ${error}`
    );
    console.log(error);
    createAdminActivityLog(
      request,
      error,
      "edit",
      common.admin_module.account_management,
      "",
      "",
      `Account status not updated by "${userProfile.name}" as getting error: "${error}"`,
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
