const _ = require("lodash");
const { Op } = require("sequelize");
const common = require("common-service/statics/static.json");
const constant = require("common-service/constant/constant.json");
const { isEmpty, cleanQuery, role_arr } = require("common-service/utils/utils");
const {
  createAdminActivityLog,
} = require("common-service/helper/adminActivityLogs");
const { diffChecker } = require("common-service/helper/diffChecker");
const { Brand, Company } = require("common-service/models");
const { imgUploading } = require("common-service/helper/general");
const logger = require("common-service/utils/logger");

exports.brandAddOrEdit = async (request) => {
  const { userProfile, brand_logo, brand_image } = request;
  var { body } = request;
  let log_type = common.admin_api_log_type.save_brandinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin Brand API - START : ${log_type} | Request : ${JSON.stringify(
        request.body
      )}`
    );
    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      message: "",
      data: {},
    };

    if (!body.company_id) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.company_blank,
      };
    }

    if (request.method == "POST" && isEmpty(brand_logo)) {
      res_arr.message = common.response_msg.blank_brand_logo;
      return res_arr;
    }
    if (body.name) {
      var where = { name: body.name };
      if (request.method == "PUT") {
        where.id = { [Op.ne]: body.id };
      }
      const is_brand_exist = await Brand.findOne({
        where: where,
        attributes: ["id"],
      });
      if (is_brand_exist) {
        return {
          statusCode: common.response_status_code.bad_request,
          type: common.response_type.error,
          message: common.response_msg.exist_name,
        };
      }
    }
    /* Brand Logo & Brand Image Add/Edit code  */
    const service_name = "account_service";
    var imgs_arr = {};
    var old_data = "";
    if (request.method == "PUT") {
      old_data = await Brand.findOne({
        where: { id: body.id },
        attributes: ["id", "brand_logo", "brand_image"],
      });
    }

    if (!isEmpty(brand_logo)) {
      imgs_arr.brand_logo = {
        media: brand_logo,
        media_type: "img",
        upload_path: constant.BRAND_IMG_UPLOAD_DIR,
        curr_img: old_data.brand_logo || "",
      };
    }

    if (!isEmpty(brand_image)) {
      imgs_arr.brand_image = {
        media: brand_image,
        media_type: "img",
        upload_path: constant.BRAND_IMG_UPLOAD_DIR,
        curr_img: old_data?.brand_image || "",
      };
    }

    const img_upload_res = await imgUploading(imgs_arr, service_name, body);
    if (!isEmpty(img_upload_res) && img_upload_res.statusCode !== 200)
      return img_upload_res;

    var last_insert_id = "";

    if (request.method == "POST") {
      const is_brand_exist = await Brand.findOne({
        where: { name: body.name }, // Adjust this condition based on your needs
        attributes: ["name"],
      });
      if (is_brand_exist) {
        return {
          statusCode: common.response_status_code.bad_request,
          type: common.response_type.error,
          message: common.response_msg.exist_name,
        };
      }
      body.created_by = userProfile.id;
      const inserted_data = await Brand.create(body);
      last_insert_id = inserted_data.id;
    } else {
      const old_data = await Brand.findOne({ where: { id: body.id } });
      if (isEmpty(old_data)) {
        return {
          statusCode: common.response_status_code.not_found,
          type: common.response_type.error,
          message: common.response_msg.brand_not_exist,
        };
      }
      body.updated_at = Date.now();
      body.updated_by = userProfile.id;

      let getActivity = diffChecker(old_data, body, [
        "company_id",
        "name",
        "max_width",
        "brand_logo",
        "brand_image",
      ]);

      const acc_id = body.id;
      delete body.id;
      await Brand.update(body, { where: { id: acc_id } });

      createAdminActivityLog(
        request,
        null,
        "edit",
        common.admin_module.brand_management,
        JSON.stringify(getActivity["oldData"]),
        JSON.stringify(getActivity["newData"]),
        `Brand "${body.name}" updated by "${userProfile.name}"`,
        common.response_status_code.success,
        common.response_type.success
      );
    }

    var msg_str = "";
    if (request.method == "POST") {
      msg_str = common.response_msg.brand_created;
    } else {
      msg_str = common.response_msg.brand_updated;
    }
    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: msg_str,
      data: { last_insert_id: last_insert_id },
    };
    logger.log(
      common.logger_level.info,
      `Admin Brand API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Brand API - ${log_type} | ${error}`
    );
    console.log(error);
    const action = request.method == "POST" ? "add" : "edit";

    createAdminActivityLog(
      request,
      null,
      action,
      common.admin_module.brand_management,
      "",
      JSON.stringify(body),
      `Brand "${body.name}" not ${action} by "${userProfile.name}" as getting error: "${error}"`,
      common.response_status_code.internal_error,
      common.response_type.error
    );
  }
};
exports.brandList = async (request) => {
  const { userProfile } = request;
  var { page, limit, search, sortby, order_type } = request.query;
  var query = request.query;
  let log_type = common.admin_api_log_type.get_brandinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin Brand API - START : ${log_type} | Request : ${JSON.stringify(
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

    const auth_arr = role_arr();

    if (auth_arr.includes(userProfile.role.role_name)) {
      query.company_id = userProfile.company_id;
    }
    if (search) {
      query = {
        [Op.and]: [
          {
            [Op.or]: [
              { name: { [Op.iLike]: `%${search}%` } },
              { "$company_detail.name$": { [Op.iLike]: `%${search}%` } },
            ],
          },
        ],
        ...query,
      };
    }

    let options = {
      offset: (page - 1) * limit,
      limit: limit,
      order: [[sortby.toLowerCase(), order_type.toLowerCase()]],
    };
    const brandData = await Brand.findAndCountAll({
      attributes: [
        "id",
        "company_id",
        "name",
        "brand_logo",
        "created_at",
        "updated_at",
        "enable",
      ],
      include: [{ model: Company, as: "company_detail", attributes: ["name"] }],
      where: query,
      ...options,
    });
    const totalPages = Math.ceil(brandData.count / limit);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    brandData.brand_details = brandData.rows;
    brandData.limit = limit;
    brandData.current_page = page;
    brandData.total_pages = totalPages;
    brandData.total_records = brandData.count;

    delete brandData.count;
    delete brandData.rows;

    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.brand_lists,
      data: brandData,
    };
    createAdminActivityLog(
      request,
      null,
      "get",
      common.admin_module.brand_management,
      "",
      JSON.stringify(request.query),
      `All Brand details has been fetched by "${request.userProfile.name}"`,
      res_arr.statusCode,
      res_arr.type
    );
    logger.log(
      common.logger_level.info,
      `Admin Brand API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Brand API - ${log_type} | ${error}`
    );
    c;
    console.log(error);

    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};
exports.brandDetails = async (request) => {
  const { id } = request.params;
  let log_type = common.admin_api_log_type.get_brandinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin Brand API - START : ${log_type} | Request : ${JSON.stringify(
        request.params
      )}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    const brandData = await Brand.findOne({ where: { id: id, is_deleted: 0 } });
    if (!isEmpty(brandData)) {
      res_arr = {
        statusCode: common.response_status_code.success,
        type: common.response_type.success,
        message: common.response_msg.brand_detail,
        data: brandData,
      };
      createAdminActivityLog(
        request,
        null,
        "get",
        common.admin_module.brand_management,
        "",
        JSON.stringify(request.params),
        `Brand details has been fetched by "${request.userProfile.name}"`,
        res_arr.statusCode,
        res_arr.type
      );
      logger.log(
        common.logger_level.info,
        `Admin Brand API - END : ${log_type} | Response : ${JSON.stringify(
          res_arr
        )}`
      );
      return res_arr;
    } else {
      return {
        statusCode: common.response_status_code.not_found,
        type: common.response_type.error,
        message: common.response_msg.brand_not_exist,
        data: [],
      };
    }
  } catch (error) {
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};
exports.brandDelete = async (request) => {
  const { userProfile } = request;
  const { id } = request.params;
  let log_type = common.admin_api_log_type.delete_brandinfo_via_admin;

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
        message: common.response_msg.blank_brand_id,
      };
    }
    const old_data = await Brand.findOne({
      where: { id: id, is_deleted: 0 },
      attributes: ["id", "name"],
    });
    if (isEmpty(old_data)) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.brand_not_exist,
        data: [],
      };
    }

    var update_data = {};
    update_data.deleted_at = Date.now();
    update_data.deleted_by = userProfile.id;
    update_data.is_deleted = 1;

    await Brand.update(update_data, { where: { id: id } });

    createAdminActivityLog(
      request,
      null,
      "delete",
      common.admin_module.brand_management,
      "",
      "",
      `Brand "${old_data.name}" deleted by "${userProfile.name}"`,
      common.response_status_code.success,
      common.response_type.success
    );

    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.brand_deleted,
    };
    logger.log(
      common.logger_level.info,
      `Admin Brand API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Brand API - ${log_type} | ${error}`
    );
    console.log(error);

    createAdminActivityLog(
      request,
      null,
      "delete",
      common.admin_module.brand_management,
      "",
      JSON.stringify({ id: id }),
      `Brand id="${id}" not deleted by "${userProfile.name}" as getting error: "${error}"`,
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
exports.brandStatus = async (request) => {
  const { userProfile, body } = request;
  let log_type = common.admin_api_log_type.save_brandstatus_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin Brand API - START : ${log_type} | Request : ${JSON.stringify(
        request.body
      )}`
    );
    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      message: "",
      data: {},
    };
    const old_data = await Brand.findOne({
      where: { id: body.id, is_deleted: 0 },
      attributes: ["id", "name", "enable"],
      raw: true,
    });
    if (isEmpty(old_data)) {
      return {
        statusCode: common.response_status_code.not_found,
        type: common.response_type.error,
        message: common.response_msg.brand_not_exist,
      };
    }
    body.updated_at = Date.now();
    body.updated_by = userProfile.id;

    let getActivity = diffChecker(old_data, body, ["name", "enable"]);

    const id = body.id;
    delete body.id;

    await Brand.update(body, { where: { id: id } });
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

    res_arr= {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.status_updated,
      data: {},
    };
    logger.log(
      common.logger_level.info,
      `Admin Brand API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Brand API - ${log_type} | ${error}`
    );
    console.log(error);
    createAdminActivityLog(
      request,
      null,
      "edit",
      common.admin_module.brand_management,
      "",
      JSON.stringify(body),
      `brand status not updated by "${userProfile.name}" as getting error: "${error}"`,
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
exports.brandDropdown = async (request) => {
  let log_type = common.admin_api_log_type.get_brandinfo_via_admin;

  try {
    logger.log(
      common.logger_level.info,
      `Admin Brand API - START : ${log_type}`
    );

    var res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    var data = [];
    const where_str = { enable: 1, is_deleted: 0 };

    data = await Brand.findAll({
      where: where_str,
      attributes: ["id", "name"],
      raw: true,
    });
    createAdminActivityLog(
      request,
      null,
      "get",
      common.admin_module.brand_management,
      "",
      JSON.stringify(""),
      `Brand List has been fetched by "${request.userProfile.name}"`,
      res_arr.statusCode,
      res_arr.type
    );
    res_arr = {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.brand_lists,
      data: data,
    };
    logger.log(
      common.logger_level.info,
      `Admin Brand API - END : ${log_type} | Response : ${JSON.stringify(
        res_arr
      )}`
    );
    return res_arr;
  } catch (error) {
    logger.log(
      common.logger_level.error,
      `Admin Brand API - ${log_type} | ${error}`
    );
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};
