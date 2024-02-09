const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const common = require("common-service/statics/static.json");
const constant = require("common-service/constant/constant.json");
const {
  createAdminActivityLog,
} = require("common-service/helper/adminActivityLogs");
const { diffChecker } = require("common-service/helper/diffChecker");
const {
  isEmpty,
  generateUniqueFileName,
  isValidFileType,
  isValidFileSize,
  cleanQuery,
  role_arr,
} = require("common-service/utils/utils");
const { Company, CompanyDetail } = require("common-service/models");
const logger = require("common-service/utils/logger");
const auth_arr = role_arr();

// ============= STEP - 1 :: Add/Edit company's basic details ===========
exports.companyAddOrEdit = async (request) => {
  const action = request.method == "POST" ? "add" : "edit";
  const { userProfile, logo, bg_photo } = request;
  var { body } = request;
  let log_type = common.admin_api_log_type.save_companyinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin Company API - START : ${log_type} | Request : ${JSON.stringify(
        request.body
      )}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    if (request.method == "PUT") {
      if (!body.id) {
        res_arr.message = common.response_msg.blank_company_id;
        return res_arr;
      }
    }
    if (body.name) {
      var where = { name: body.name };
      if (request.method == "PUT") {
        where.id = { [Op.ne]: body.id };
      }
      const is_company_exist = await Company.findOne({
        where: where,
        attributes: ["id"],
      });
      if (is_company_exist) {
        res_arr.message = common.response_msg.exist_name;
        return res_arr;
      }
    }
    if (body.email) {
      const emailRegexp =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegexp.test(body.email)) {
        res_arr.message = common.response_msg.invalid_email;
        return res_arr;
      }

      var where = { email: body.email };
      if (request.method == "PUT") {
        where.id = { [Op.ne]: body.id };
      }
      const is_comp_exist = await Company.findOne({
        where: where,
        attributes: ["id"],
      });
      if (is_comp_exist) {
        res_arr.message = common.response_msg.email_exist;
        return res_arr;
      }
    }
    if (body.company_prefix) {
      var where = { company_prefix: body.company_prefix };
      if (request.method == "PUT") {
        where.id = { [Op.ne]: body.id };
      }
      const is_comp_prefix_exist = await Company.findOne({
        where: where,
        attributes: ["id"],
      });
      if (is_comp_prefix_exist) {
        res_arr.message = common.response_msg.company_prefix_exist;
        return res_arr;
      }
    }
    if (!isEmpty(logo)) {
      if (!isValidFileType(logo.originalFilename)) {
        res_arr.message = common.response_msg.invalid_file;
        return res_arr;
      }
      if (!isValidFileSize(logo.size)) {
        res_arr.message = common.response_msg.exceeds_file_size;
        return res_arr;
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
          res_arr.message = common.response_msg.img_not_uploaded;
          return res_arr;
        }
      });
      body.logo = unique_filename;

      if (request.method == "PUT") {
        const old_data = await Company.findOne({
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
    if (!isEmpty(bg_photo)) {
      if (!isValidFileType(bg_photo.originalFilename)) {
        res_arr.message = common.response_msg.invalid_file;
        return res_arr;
      }
      if (!isValidFileSize(bg_photo.size)) {
        res_arr.message = common.response_msg.exceeds_file_size;
        return res_arr;
      }
      const unique_filename =
        "bg_" + generateUniqueFileName(bg_photo.originalFilename);
      let oldPath = bg_photo.filepath;
      let newPath =
        path.join(__dirname, "../", constant.IMG_UPLOAD_DIR) +
        "/" +
        unique_filename;
      let rawData = fs.readFileSync(oldPath);

      fs.writeFile(newPath, rawData, function (err) {
        if (err) {
          res_arr.message = common.response_msg.bg_img_not_uploaded;
          return res_arr;
        }
      });
      body.background_photo = unique_filename;

      if (request.method == "PUT") {
        const old_data = await Company.findOne({
          where: { id: body.id },
          attributes: ["id", "background_photo"],
        });
        if (!isEmpty(old_data.background_photo)) {
          let prev_bg_path =
            path.join(__dirname, "../", constant.IMG_UPLOAD_DIR) +
            "/" +
            old_data.background_photo;
          if (fs.existsSync(prev_bg_path)) {
            fs.unlinkSync(prev_bg_path);
          }
        }
      }
    }

    if (!isEmpty(body.country)) {
      body.country = parseInt(body.country);
    }
    if (!isEmpty(body.state)) {
      body.state = parseInt(body.state);
    }

    let getActivity, last_insert_id, msg_str = "";
    if (request.method == "POST") {
      body.created_by = userProfile.id;
      const inserted_data = await Company.create(body);
      last_insert_id = inserted_data.id;
      msg_str = common.response_msg.company_created;
    } else {
      const old_data = await Company.findOne({ where: { id: body.id } });
      if (isEmpty(old_data)) {
        return {
          statusCode: common.response_status_code.not_found,
          type: common.response_type.error,
          message: common.response_msg.company_not_found,
        };
      }
      body.updated_at = Date.now();
      body.updated_by = userProfile.id;

      getActivity = diffChecker(old_data, body, [
        "name",
        "description",
        "email",
        "time_zone",
        "building_name",
        "street_address",
        "country",
        "state",
        "zipcode",
        "city",
        "contact_no",
        "email",
        "company_domain",
        "button_color",
        "button_hover_color",
        "font_color",
        "font_hover_color",
        "support",
        "apk_version",
        "t_and_c",
        "privacy_policy",
        "copy_right_text",
        "help_line_number",
        "footer_background_color",
        "contact_us_link",
        "faq",
        "facebook",
        "google_plus",
        "instagram",
        "youtube",
        "snapchat",
        "tiktok",
        "footer_copyright",
        "company_currency",
        "company_prefix",
        "address_autocomplete",
        "enable",
      ]);

      const comp_id = body.id;
      delete body.id;
      await Company.update(body, { where: { id: comp_id } });

      msg_str = common.response_msg.company_updated;
    }

    res_arr = { statusCode: common.response_status_code.success, type: common.response_type.success, message: msg_str, data: { last_insert_id: last_insert_id }, };

    createAdminActivityLog(
      request,
      res_arr,
      action,
      common.admin_module.company_management,
      (getActivity) ? JSON.stringify(getActivity["oldData"]) : "",
      (getActivity) ? JSON.stringify(getActivity["newData"]) : "",
      `Company "${body.name}" ${action}ed by "${userProfile.name}"`,
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
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Company API - ${log_type} | ${error}`
    );
    console.log(error);

    createAdminActivityLog(
      request,
      error,
      action,
      common.admin_module.company_management,
      "",
      "",
      `Company "${body.name}" not ${action}ed by "${userProfile.name}" as getting error: "${error}"`,
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

// ============= STEP - 2 :: Add/Edit company's billing details ===========
exports.companyBillingAddOrEdit = async (request) => {
  const { userProfile, body } = request;
  let log_type = common.admin_api_log_type.get_companyinfo_via_admin;

  // var res_arr = { statusCode: common.response_status_code.bad_request, type: common.response_type.error };
  // if (isEmpty(body.company_id)) { res_arr.message = common.response_msg.blank_company_id; return res_arr; }

  const comp_basic_data = await Company.findOne({
    where: { id: body.company_id },
    attributes: ["id", "name"],
  });
  try {
    logger.log(
      common.logger_level.info,
      `Admin Company API - START : ${log_type} | Request : ${JSON.stringify(
        request.body
      )}`
    );
    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    if (!isEmpty(body.default_credit_value)) {
      body.balance = body.default_credit_value;
    }
    const old_data = await CompanyDetail.findOne({
      where: { company_id: body.company_id },
    });

    var getActivity, msg_str = "";
    if (isEmpty(old_data)) {
      body.created_by = userProfile.id;
      await CompanyDetail.create(body);

      msg_str = common.response_msg.details_updated;
    } else {
      body.updated_at = Date.now();
      body.updated_by = userProfile.id;

      getActivity = diffChecker(old_data, body, [
        "company_id",
        "token",
        "notification_method_id",
        "account_type",
        "default_credit_value",
        "balance",
        "per_job_charges",
        "credit_date",
        "invoice_type",
        "allow_driver",
        "fare_setting_id",
        "radius",
        "account_job_payment_gateway",
        "wallet_credit_payment_gateway",
        "company_payment_mode",
        "individual_payment_mode",
        "test_driver007_accountid",
        "live_driver007_accountid",
      ]);

      const tbl_id = body.company_id;
      delete body.company_id;
      await CompanyDetail.update(body, { where: { company_id: tbl_id } });

      msg_str = common.response_msg.details_updated;
    }
    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: msg_str,
    };
    createAdminActivityLog(
      request,
      res_arr,
      "edit",
      common.admin_module.company_management,
      (getActivity) ? JSON.stringify(getActivity["oldData"]) : "",
      (getActivity) ? JSON.stringify(getActivity["newData"]) : "",
      `Billing details for company "${comp_basic_data.name}" has been updated by "${userProfile.name}"`,
      common.response_status_code.success,
      common.response_type.success
    );
    logger.log(
      common.logger_level.info,
      `Admin Company API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    console.log(error);
    createAdminActivityLog(
      request,
      error,
      "edit",
      common.admin_module.company_management,
      "",
      "",
      `Billing details for company "${comp_basic_data.name}" has not been updated by "${userProfile.name}" as getting error: "${error}"`,
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

// ============= Get company's BASIC, BILLING & BALANCE details ===========
exports.companyDetail = async (request) => {
  const { id } = request.params;
  const { type } = request.query;
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
    var data = {};
    if (type === "basic_detail") {
      data = await Company.findOne({
        where: { id: id, is_deleted: 0 },
        attributes: {
          exclude: [
            "created_by",
            "updated_by",
            "deleted_by",
            "created_at",
            "updated_at",
            "deleted_at",
            "is_deleted",
          ],
        },
      });
    } else if (type === "billing_detail") {
      data = await CompanyDetail.findOne({
        where: { company_id: id, is_deleted: 0 },
        attributes: {
          exclude: [
            "notification_method_id",
            "token",
            "credit_date",
            "created_by",
            "updated_by",
            "deleted_by",
            "created_at",
            "updated_at",
            "deleted_at",
            "is_deleted",
          ],
        },
        include: [
          {
            model: Company,
            as: "company_basic_detail",
            attributes: ["company_currency"],
          },
        ],
        raw: true, nest: true,
      });
    } else if (type === "balance_detail") {
      qry_res = await CompanyDetail.findOne({
        where: { company_id: id, is_deleted: 0 },
        attributes: ["balance"],
        include: [
          {
            model: Company,
            as: "company_basic_detail",
            attributes: ["company_currency"],
          },
        ],
      });

      data.balance = `${qry_res.balance} ${qry_res.company_basic_detail.company_currency}`;
    }
    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.company_detail,
      data: !isEmpty(data) ? data : {},
    };
    createAdminActivityLog(
      request,
      res_arr,
      "get",
      common.admin_module.company_management,
      "",
      "",
      `Company details has been fetched by "${request.userProfile.name}"`,
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
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Company API - ${log_type} | ${error}`
    );
    console.log(error);
    createAdminActivityLog(
      request,
      error,
      "get",
      common.admin_module.company_management,
      "",
      "",
      `Company details has not been fetched by "${request.userProfile.name}" as getting error: "${error}"`,
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

exports.getNextCompanyCode = async (request) => {
  const { userProfile } = request;
  let log_type = common.admin_api_log_type.get_companyinfo_via_admin;

  var company_code = "D00700000001";
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
    const maxCompanyCode = await Company.max("company_code");
    if (!isEmpty(maxCompanyCode)) {
      let result = maxCompanyCode.replace("D007", "");
      const incrementValue1 = parseInt(result) + 1;
      const nextCompanyCode = `D007${String(incrementValue1).padStart(
        result.length,
        "0"
      )}`;
      company_code = nextCompanyCode;
    }
    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.company_code_created,
      data: { next_company_code: company_code },
    };
    createAdminActivityLog(
      request,
      res_arr,
      "get",
      common.admin_module.company_management,
      "",
      "",
      `Company code  has been fetched by "${request.userProfile.name}"`,
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
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Company API - ${log_type} | ${error}`
    );
    console.log(error);
    createAdminActivityLog(
      request,
      error,
      "get",
      common.admin_module.company_management,
      "",
      "",
      `Company code has not been fetched by "${userProfile.name}" as getting error: "${error}"`,
      res_arr.statusCode,
      res_arr.type
    );
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.allCompanyList = async (request) => {
  const { userProfile } = request;
  var { page, limit, search, sortby, order_type } = request.query;
  var query = request.query;
  let log_type = common.admin_api_log_type.get_companyinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin Company API - START : ${log_type} | Request : ${JSON.stringify(
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
          { email: { [Op.iLike]: `%${search}%` } },
          { company_code: { [Op.iLike]: `%${search}%` } },
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
    if (auth_arr.includes(userProfile.role.role_name)) {
      query.id = userProfile.company_id;
    }
    //=================================================
    const compData = await Company.findAndCountAll({
      attributes: [
        "id",
        "name",
        "company_code",
        "email",
        "logo",
        "enable",
        "updated_at",
        "is_root_company",
      ],
      where: query,
      ...options,
    });

    const totalPages = Math.ceil(compData.count / limit);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    compData.company_details = compData.rows;
    compData.limit = limit;
    compData.current_page = page;
    compData.total_pages = totalPages;
    compData.total_records = compData.count;

    delete compData.count;
    delete compData.rows;

    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.company_lists,
      data: compData,
    };
    createAdminActivityLog(
      request,
      res_arr,
      "get",
      common.admin_module.company_management,
      "",
      "",
      `All company details has been fetched by "${request.userProfile.name}"`,
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
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Company API - ${log_type} | ${error}`
    );
    console.log(error);
    createAdminActivityLog(
      request,
      error,
      "get",
      common.admin_module.company_management,
      "",
      "",
      `Company details has not been fetched by "${request.userProfile.name}" as getting error: "${error}"`,
      res_arr.statusCode,
      res_arr.type
    );

    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.companyDelete = async (request) => {
  const { userProfile } = request;
  const { id } = request.params;
  let log_type = common.admin_api_log_type.delete_companyinfo_via_admin;

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
    if (!id) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.blank_company_id,
      };
    }
    const old_data = await Company.findOne({
      where: { id: id, is_deleted: 0 },
      attributes: ["id", "name"],
    });
    if (isEmpty(old_data)) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.company_not_found,
        data: [],
      };
    }

    var update_data = {};
    update_data.deleted_at = Date.now();
    update_data.deleted_by = userProfile.id;
    update_data.is_deleted = 1;

    await Company.update(update_data, { where: { id: id } });

    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.company_deleted,
    };
    createAdminActivityLog(
      request,
      res_arr,
      "delete",
      common.admin_module.company_management,
      "",
      "",
      `Company "${old_data.name}" deleted by "${userProfile.name}"`,
      common.response_status_code.success,
      common.response_type.success
    );

    logger.log(
      common.logger_level.info,
      `Admin Company API - END : ${log_type} | Response : ${JSON.stringify(
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

    createAdminActivityLog(
      request,
      error,
      "delete",
      common.admin_module.company_management,
      "",
      "",
      `Company id="${id}" not deleted by "${userProfile.name}" as getting error: "${error}"`,
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

exports.getCompanyDropdown = async (request) => {
  let log_type = common.admin_api_log_type.get_companyinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin Company API - START : ${log_type}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    var data = [];
    const where_str = { enable: 1, is_deleted: 0 };
    //================================================
    if (auth_arr.includes(request.userProfile.role.role_name)) {
      where_str.id = request.userProfile.company_id;
    }
    //================================================

    data = await Company.findAll({
      where: where_str,
      attributes: ["id", "name"],
      raw: true,
    });

    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.company_lists,
      data: data,
    };
    createAdminActivityLog(
      request,
      res_arr,
      "get",
      common.admin_module.company_management,
      "",
      "",
      `Company List has been fetched by "${request.userProfile.name}"`,
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
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Company API - ${log_type} | ${error}`
    );
    console.log(error);
    createAdminActivityLog(
      request,
      error,
      "get",
      common.admin_module.company_management,
      "",
      "",
      `Company List has not been fetched by "${request.userProfile.name}" as getting error: "${error}"`,
      res_arr.statusCode,
      res_arr.type
    );
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
  let log_type = common.admin_api_log_type.edit_companystatus_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin Company API - START : ${log_type} | Request : ${JSON.stringify(
        request.body
      )}`
    );
    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    const old_data = await Company.findOne({
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

    const comp_id = body.id;
    delete body.id;

    await Company.update(body, { where: { id: comp_id } });
    await CompanyDetail.update(body, { where: { company_id: comp_id } });

    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.status_updated,
      data: {},
    };
    createAdminActivityLog(
      request,
      res_arr,
      "edit",
      common.admin_module.company_management,
      JSON.stringify(getActivity["oldData"]),
      JSON.stringify(getActivity["newData"]),
      `Status for company "${old_data.name}" updated by "${userProfile.name}"`,
      common.response_status_code.success,
      common.response_type.success
    );


    logger.log(
      common.logger_level.info,
      `Admin Company API - END : ${log_type} | Response : ${JSON.stringify(
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
    createAdminActivityLog(
      request,
      error,
      "edit",
      common.admin_module.company_management,
      "",
      "",
      `Company status not updated by "${userProfile.name}" as getting error: "${error}"`,
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
