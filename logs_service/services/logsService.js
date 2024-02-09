const he = require('he');
const { Op } = require("sequelize");
const common = require("common-service/statics/static.json");
const { isEmpty, cleanQuery } = require("common-service/utils/utils");
// const admin = require("common-service/models/logshub/adminActivityLogsModel");
// const api = require("common-service/models/logshub/appApiLogsModel");
const { api, admin, AddressBook, Users, Country, State } = require("common-service/models/index");
const { response_msg, response_status_code, response_type, admin_module, logger_level, admin_api_log_type } = require("common-service/statics/static.json");
const logger = require("common-service/utils/logger");
const { createAdminActivityLog } = require("common-service/helper/adminActivityLogs");


exports.adminLogList = async (request) => {
   // const { userProfile } = request;
   var { page, limit, search, sortby, order_type } = request.query;
   var query = request.query;
   try {
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      query = cleanQuery(query);
      sortby = sortby || "created_at";
      order_type = order_type || "DESC";

      delete query.page;
      delete query.limit;
      delete query.search;
      delete query.sortby;
      delete query.order_type;

      if (search) {
         query = {
            [Op.or]: [
               { res_type: { [Op.iLike]: `%${search}%` } },
            ],
            ...query,
         }
      }

      let options = {
         offset: (page - 1) * limit,
         limit: limit,
         order: [[sortby.toLowerCase(), order_type.toLowerCase()]]
      };

      const data = await admin.findAndCountAll({
         attributes: ["id", "user_id", "type", "module", "old_values", "new_values", "description", "res_body", "res_type", "status_code", "created_at"],
         where: query,
         ...options
      });

      const totalPages = Math.ceil(data.count / limit);
      const prevPage = page > 1 ? page - 1 : null;
      const nextPage = page < totalPages ? page + 1 : null;

      data.log_details = data.rows;
      data.limit = limit;
      data.current_page = page;
      data.total_pages = totalPages;
      data.total_records = data.count;

      delete data.count;
      delete data.rows;
      return {
         statusCode: common.response_status_code.success,
         type: common.response_type.success,
         message: common.response_msg.log_lists,
         data: data
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

exports.adminLogDetail = async (request) => {
   const { id } = request.params;
   try {
      const data = await admin.findOne({
         where: { id: id },
         attributes: ["id", "user_id", "type", "module", "old_values", "new_values", "description", "res_body", "res_type", "status_code", "created_at"],
      })
      if (!isEmpty(data)) {
         return {
            statusCode: common.response_status_code.success,
            type: common.response_type.success,
            message: common.response_msg.log_detail,
            data: data
         };
      } else {
         return {
            statusCode: common.response_status_code.not_found,
            type: common.response_type.error,
            message: common.response_msg.log_not_found,
            data: []
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

exports.apiLogList = async (request) => {
   // const { userProfile } = request;
   var { page, limit, search, sortby, order_type } = request.query;
   var query = request.query;
   try {
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      query = cleanQuery(query);
      sortby = sortby || "created_at";
      order_type = order_type || "DESC";

      delete query.page;
      delete query.limit;
      delete query.search;
      delete query.sortby;
      delete query.order_type;

      if (search) {
         query = {
            [Op.or]: [
               { status: { [Op.iLike]: `%${search}%` } },
            ],
            ...query,
         }
      }

      let options = {
         offset: (page - 1) * limit,
         limit: limit,
         order: [[sortby.toLowerCase(), order_type.toLowerCase()]]
      };

      const data = await api.findAndCountAll({
         attributes: ["id", "method", "url", "type", "request_headers", "request_body", "request_param", "request_query", "requested_ip", "requested_by", "response_body", "message", "status_code", "status", "created_at"],
         where: query,
         ...options
      });

      const totalPages = Math.ceil(data.count / limit);
      const prevPage = page > 1 ? page - 1 : null;
      const nextPage = page < totalPages ? page + 1 : null;

      data.log_details = data.rows;
      data.limit = limit;
      data.current_page = page;
      data.total_pages = totalPages;
      data.total_records = data.count;

      delete data.count;
      delete data.rows;
      return {
         statusCode: common.response_status_code.success,
         type: common.response_type.success,
         message: common.response_msg.log_lists,
         data: data
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

exports.apiLogDetail = async (request) => {
   const { id } = request.params;
   try {
      const data = await api.findOne({
         where: { id: id },
         attributes: ["id", "method", "url", "type", "request_headers", "request_body", "request_param", "request_query", "requested_ip", "requested_by", "response_body", "message", "status_code", "status", "created_at"],
      })
      if (!isEmpty(data)) {
         return {
            statusCode: common.response_status_code.success,
            type: common.response_type.success,
            message: common.response_msg.log_detail,
            data: data
         };
      } else {
         return {
            statusCode: common.response_status_code.not_found,
            type: common.response_type.error,
            message: common.response_msg.log_not_found,
            data: []
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

/* ************* END : Logs functions ************* */

exports.getAddressBookList = async (request) => {
   try {
      const { userProfile } = request;
      var query = request.query;
      var { page, limit, search, sortby, order_type } = request.query;

      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      query = cleanQuery(query);
      sortby = sortby || "created_at";
      order_type = order_type || "DESC";

      delete query.page;
      delete query.limit;
      delete query.search;
      delete query.sortby;
      delete query.order_type;

      if (userProfile.role.role_name != "super_admin") {
         query.user_id = userProfile.id
      }

      if (search) {
         query = {
            [Op.or]: [
               { title: { [Op.iLike]: `%${search}%` } },
               { building_name: { [Op.iLike]: `%${search}%` } },
               { street_address: { [Op.iLike]: `%${search}%` } },
               { country: { [Op.iLike]: `%${search}%` } },
               { state: { [Op.iLike]: `%${search}%` } },
               { city: { [Op.iLike]: `%${search}%` } },
               { zipcode: { [Op.iLike]: `%${search}%` } },
               // { '$user_detail.name$': { [Op.iLike]: `%${search}%` } },
            ],
            ...query,
         }
      }

      let options = {
         offset: (page - 1) * limit, limit: limit, order: [[sortby.toLowerCase(), order_type.toLowerCase()]]
      };

      query.is_deleted = 0;
      const data = await AddressBook.findAndCountAll({
         attributes: ["id", "user_id", "title", "building_name", "street_address", "country", "state", "city", "zipcode", "latittude", "longitude", "enable", "created_at"],
         include: [{ model: Users, as: "user_detail", attributes: ["name"], raw: true }],
         raw: true, nest: true,
         where: query,
         ...options,
      });
      if (data && data.rows) {
         const addr_data = data.rows;
         // console.log('addr_data: ', addr_data);
         for (const addr of addr_data) {
            const country_db = await Country.findOne({
               where: { code: addr.country },
               attributes: ['id', 'name'],
               raw: true,
            });
            addr.country = country_db?.name;
            const country_id = country_db?.id;

            const state_where = { state_code: addr.state };
            if (country_id) {
               state_where.country_id = country_id
            }
            const state_db = await State.findOne({
               where: state_where,
               attributes: ['name'],
               raw: true,
            });
            addr.state = state_db?.name;
         }
      }

      const totalPages = Math.ceil(data.count / limit);
      data.addressbook_details = data.rows;
      data.limit = limit;
      data.current_page = page;
      data.total_pages = totalPages;
      data.total_records = data.count;

      delete data.count;
      delete data.rows;
      return {
         statusCode: common.response_status_code.success,
         type: common.response_type.success,
         message: common.response_msg.details_get,
         data: data || []
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

exports.addressDelete = async (request) => {

   const { userProfile } = request;
   const { id } = request.params;
   let log_type = admin_api_log_type.get_address_delete;

   try {
      logger.log(logger_level.info, `Get Address Delete API - START : ${log_type} | Request : ${JSON.stringify({})}`);

      if (!id) {
         return {
            statusCode: common.response_status_code.bad_request,
            type: common.response_type.error,
            message: common.response_msg.blank_address_id,
         };
      }
      const old_data = await AddressBook.findOne({
         where: { id: id, is_deleted: 0 },
         attributes: ["id", "user_id", "title", "building_name", "street_address", "country", "state", "city", "zipcode", "latittude", "longitude", "enable", "created_at"],
      })
      if (isEmpty(old_data)) {
         return {
            statusCode: common.response_status_code.bad_request,
            type: common.response_type.error,
            message: common.response_msg.address_not_found,
            data: []
         };
      }

      var update_data = {};
      update_data.deleted_at = Date.now();
      update_data.deleted_by = userProfile.id;
      update_data.is_deleted = 1;

      const updated_admin_data = await AddressBook.update(update_data, { where: { id: id } });
      if (updated_admin_data) {
         var res_arr = {
            statusCode: common.response_status_code.success,
            type: common.response_type.success,
            message: common.response_msg.address_deleted
         };
      } else {
         var res_arr = {
            statusCode: common.response_status_code.bad_request,
            type: common.response_type.error,
            message: common.response_msg.cant_update_address
         };
      }

      createAdminActivityLog(request, null, "delete", common.admin_module.address, "", "", `Address model "${old_data.model}" deleted by "${userProfile.name}"`, common.response_status_code.success, common.response_type.success);

      logger.log(logger_level.info, `Get Address Delete API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      return res_arr;
   } catch (error) {
      console.log(error);
      logger.log(logger_level.error, `Get Address Delete API - ${log_type} | ${error}`);

      createAdminActivityLog(request, null, "delete", common.admin_module.address, "", JSON.stringify({ id: id }), `Address id="${id}" not deleted by "${userProfile.name}" as getting error: "${error}"`, common.response_status_code.internal_error, common.response_type.error);
      return {
         statusCode: common.response_status_code.internal_error,
         type: common.response_type.error,
         message: common.response_msg.catch_error,
      };
   }
};

exports.addressDropdown = async (request) => {

   let log_type = admin_api_log_type.get_module_detail;
   try {
      logger.log(logger_level.info, `Get Address Dropdown API - START : ${log_type} | Request : ${JSON.stringify({})}`);

      const data = await AddressBook.findAll({
         where: { is_deleted: 0 },
         include: [{ model: Users, as: "user_detail", attributes: ["name"], raw: true }],
         attributes: ["user_id"],
         raw: true, nest: true,
         group: ['user_id', 'user_detail.name'],
      })
      if (!isEmpty(data)) {
         var res_arr = {
            statusCode: common.response_status_code.success,
            type: common.response_type.success,
            message: common.response_msg.address_dropdown,
            data: data
         };
         console.log('res_arr: ', res_arr);
      } else {
         var res_arr = {
            statusCode: common.response_status_code.not_found,
            type: common.response_type.error,
            message: common.response_msg.module_not_found,
            data: []
         };
      }
      logger.log(logger_level.info, `Get Address Dropdown API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);

      createAdminActivityLog(request, null, "get", admin_module.address, "", JSON.stringify({}), `Address Dropdown has been fetched by "${request.userProfile.name}"`, res_arr.statusCode, res_arr.type)
      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `Get Address Dropdown API - ${log_type} | ${error}`);

      console.log(error);
      createAdminActivityLog(request, null, "get", admin_module.address, "", JSON.stringify({}), `Could not fetch Address Dropdown by "${request.userProfile.name}" as getting error: "${error}"`, response_status_code.internal_error, response_type.error);

      return {
         statusCode: common.response_status_code.internal_error,
         type: common.response_type.error,
         message: common.response_msg.catch_error,
      };
   }
};
