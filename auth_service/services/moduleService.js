const { Op } = require("sequelize");
const _ = require("lodash");
const common = require("common-service/statics/static.json");
const { isEmpty, cleanQuery } = require("common-service/utils/utils");
const { createAdminActivityLog } = require("common-service/helper/adminActivityLogs");
const { diffChecker } = require("common-service/helper/diffChecker")
const { AdminModules, Permission } = require("common-service/models/index");
const logger = require("common-service/utils/logger");
const { response_msg, response_status_code, response_type, admin_module, logger_level, admin_api_log_type } = require("common-service/statics/static.json");

/* ************* START : module CRUD functions ************* */
exports.moduleAddOrEdit = async (request) => {

   const { userProfile, body } = request;
   let log_type = admin_api_log_type.add_edit_module;
   try {
      logger.log(logger_level.info, `Add-Edit Module API - START : ${log_type} | Request : ${JSON.stringify(body)}`);
      const user_id = userProfile.id;
      const existing_data = await AdminModules.findOne({
         where: {
            name: {
               [Op.iLike]: body.name,
            },
            is_deleted: 0
         }
      })

      if (request.method == "POST") {
         if (existing_data) {
            return { statusCode: common.response_status_code.bad_request, type: common.response_type.error, message: common.response_msg.module_duplicate, };
         }
         body.created_by = user_id;
         body.created_at = Date.now();
         const create_module = await AdminModules.create(body);
         const module_id = await create_module.dataValues.id;

         const perm_array = [
            { name: "Add" },
            { name: "View" },
            { name: "Edit" },
            { name: "Delete" }
         ];

         const perm_data = [];
         for (let i = 0; i < perm_array.length; i++) {
            let data = {};
            const name = body.name.split(/\s+/);
            const first_name = name.length > 0 ? name[0].toLowerCase() : null;

            var key = perm_array[i].name.toLowerCase() + "_" + first_name;

            data["module_name"] = body.name;
            data["name"] = perm_array[i].name;
            data["key"] = key;
            data["module_id"] = module_id;
            data["enable"] = body.enable;
            data["superadmin_access"] = body.superadmin_access;
            data["created_by"] = user_id;
            data["created_at"] = Date.now();
            perm_data.push(data);
         };

         const permission = await Permission.bulkCreate(perm_data);

         createAdminActivityLog(request, null, "add", common.admin_module.setting, "", JSON.stringify(body), `module model "${body.name}" added by "${userProfile.name}"`, common.response_status_code.success, common.response_type.success);
         var msg_str = common.response_msg.module_created;
      } else {
         if (isEmpty(body.id)) {
            return { statusCode: common.response_status_code.bad_request, type: common.response_type.error, message: common.response_msg.blank_module_id };
         }

         if (existing_data && existing_data.dataValues.id != body.id) {
            console.log('body.id: ', body.id);
            console.log('existing_data.dataValues.id: ', existing_data.dataValues.id);
            return { statusCode: common.response_status_code.bad_request, type: common.response_type.error, message: common.response_msg.module_duplicate, };
         }

         body.updated_by = user_id;
         body.updated_at = Date.now();

         const old_data = await AdminModules.findOne({ where: { id: body.id, is_deleted: 0 } })
         if (isEmpty(old_data)) {
            return { statusCode: common.response_status_code.not_found, type: common.response_type.error, message: common.response_msg.not_found, };
         }

         let getActivity = diffChecker(old_data, body, ["name", "enable"])
         const id = body.id;
         delete body.id;

         const updated_module = await AdminModules.update(body, { where: { id: id } }, { new: true });

         if (updated_module) {
            const perm_db = await Permission.findAll({
               where: {
                  module_id: id,
               },
            });

            // Convert Sequelize instances to plain objects
            const perm_db_data = perm_db.map((permission) => permission.get({ plain: true }));

            const perm_data = [];
            for (let i = 0; i < perm_db_data.length; i++) {
               let data = {};
               const name = body.name.split(/\s+/);
               const first_name = name.length > 0 ? name[0].toLowerCase() : null;

               var key = perm_db_data[i].name.toLowerCase() + "_" + first_name;

               data["module_name"] = body.name;
               data["name"] = perm_db_data[i].name;
               data["key"] = key;
               data["module_id"] = id;
               data["enable"] = body.enable;
               data["superadmin_access"] = body.superadmin_access;
               data["updated_by"] = user_id;
               data["updated_at"] = Date.now();

               perm_data.push(data);
               await Permission.update(data, { where: { id: perm_db_data[i].id } });
            }
         }

         createAdminActivityLog(request, null, "edit", common.admin_module.setting, JSON.stringify(getActivity['oldData']), JSON.stringify(getActivity['newData']), `Module "${old_data.name}" updated by "${userProfile.name}"`, common.response_status_code.success, common.response_type.success);
         var msg_str = common.response_msg.module_updated;
      }
      let res_arr = { statusCode: common.response_status_code.success, type: common.response_type.success, message: msg_str }
      logger.log(logger_level.info, `Add-Edit Module API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);

      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `Add-Edit Module API - ${log_type} | ${error}`);

      if (request.method == "POST") {
         createAdminActivityLog(request, null, "add", common.admin_module.setting, "", JSON.stringify(body), `module "${body.name || body.id}" not added by "${userProfile.name}" as getting error: "${error}"`, common.response_status_code.internal_error, common.response_type.error);
      } else {
         createAdminActivityLog(request, null, "edit", common.admin_module.setting, "", JSON.stringify(body), `module "${body.name || body.id}" not updated by "${userProfile.name}" as getting error: "${error}"`, common.response_status_code.internal_error, common.response_type.error);
      }
      return {
         statusCode: common.response_status_code.internal_error,
         type: common.response_type.error,
         message: common.response_msg.catch_error,
      };
   }
};

exports.moduleList = async (request) => {
   // const { userProfile } = request;
   var { page, limit, search, sortby, order_type } = request.query;
   var query = request.query;
   let log_type = admin_api_log_type.get_module_list;
   try {
      logger.log(logger_level.info, `Get Module List API - START : ${log_type} | Request : ${JSON.stringify(query)}`);

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
            ...query,
            name: {
               [Op.iLike]: `%${search}%`,
            },

         }
      }


      let options = {
         offset: (page - 1) * limit,
         limit: limit,
         order: [[sortby.toLowerCase(), order_type.toLowerCase()]]
      };

      const data = await AdminModules.findAndCountAll({
         attributes: ["id", "name", "superadmin_access", "enable"],
         where: query,
         ...options
      });

      const totalPages = Math.ceil(data.count / limit);
      const prevPage = page > 1 ? page - 1 : null;
      const nextPage = page < totalPages ? page + 1 : null;

      data.module_details = data.rows;
      data.limit = limit;
      data.current_page = page;
      data.total_pages = totalPages;
      data.total_records = data.count;

      delete data.count;
      delete data.rows;

      let res_arr = {
         statusCode: common.response_status_code.success,
         type: common.response_type.success,
         message: common.response_msg.module_lists,
         data: data
      };
      logger.log(logger_level.info, `Get Module List API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      // createAdminActivityLog(request, null, "get", admin_module.module, "", JSON.stringify(query), `Module List has been fetched by "${userProfile.name}"`, res_arr.statusCode, res_arr.type);
      createAdminActivityLog(request, null, "get", admin_module.module, "", JSON.stringify(query), `Module List has been fetched by "${request.userProfile.name}"`, res_arr.statusCode, res_arr.type);

      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `Get Module List API - ${log_type} | ${error}`);
      createAdminActivityLog(request, null, "get", admin_module.module, "", JSON.stringify(request.query), `Could not fetch Module List by "${request.userProfile.name}" as getting error: "${error}"`, response_status_code.internal_error, response_type.error);

      console.log(error);
      return {
         statusCode: common.response_status_code.internal_error,
         type: common.response_type.error,
         message: common.response_msg.catch_error,
      };
   }
};

exports.moduledetail = async (request) => {
   const { id } = request.params;
   let log_type = admin_api_log_type.get_module_detail;
   try {
      logger.log(logger_level.info, `Get Module Detail API - START : ${log_type} | Request : ${JSON.stringify(request.params)}`);

      const data = await AdminModules.findOne({
         where: { id: id, is_deleted: 0 },
         attributes: ["id", "name", "superadmin_access", "enable"]
      })
      if (!isEmpty(data)) {
         var res_arr = {
            statusCode: common.response_status_code.success,
            type: common.response_type.success,
            message: common.response_msg.module_detail,
            data: data
         };
      } else {
         var res_arr = {
            statusCode: common.response_status_code.not_found,
            type: common.response_type.error,
            message: common.response_msg.module_not_found,
            data: []
         };
      }
      logger.log(logger_level.info, `Get Module Detail API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      // createAdminActivityLog(request, null, "get", admin_module.module, "", JSON.stringify(params), `Module Detail has been fetched by "${userProfile.name}"`, res_arr.statusCode, res_arr.type);
      createAdminActivityLog(request, null, "get", admin_module.module, "", JSON.stringify(request.params), `Module Detail has been fetched by "${request.userProfile.name}"`, res_arr.statusCode, res_arr.type)
      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `Get Module Detail API - ${log_type} | ${error}`);

      console.log(error);
      createAdminActivityLog(request, null, "get", admin_module.module, "", JSON.stringify(request.params), `Could not fetch Module Detail by "${request.userProfile.name}" as getting error: "${error}"`, response_status_code.internal_error, response_type.error);

      return {
         statusCode: common.response_status_code.internal_error,
         type: common.response_type.error,
         message: common.response_msg.catch_error,
      };
   }
};

exports.moduleDelete = async (request) => {

   const { userProfile } = request;
   const { id } = request.params;
   let log_type = admin_api_log_type.get_module_delete;

   try {
      logger.log(logger_level.info, `Get Module Delete API - START : ${log_type} | Request : ${JSON.stringify(request.params)}`);

      if (!id) {
         return {
            statusCode: common.response_status_code.bad_request,
            type: common.response_type.error,
            message: common.response_msg.blank_module_id,
         };
      }
      const old_data = await AdminModules.findOne({ where: { id: id, is_deleted: 0 }, attributes: ["id", "name", "superadmin_access", "enable"] })
      if (isEmpty(old_data)) {
         return {
            statusCode: common.response_status_code.bad_request,
            type: common.response_type.error,
            message: common.response_msg.module_not_found,
            data: []
         };
      }

      var update_data = {};
      update_data.deleted_at = Date.now();
      update_data.deleted_by = userProfile.id;
      update_data.is_deleted = 1;

      const updated_admin_data = await AdminModules.update(update_data, { where: { id: id } });
      console.log('updated_admin_data: ', updated_admin_data);
      if (updated_admin_data) {
         await Permission.update(update_data, {
            where: { module_id: id },
         }).then((result) => {
            console.log(result); // Number of rows affected
         }).catch((error) => {
            console.error(error);
         });
      }


      createAdminActivityLog(request, null, "delete", common.admin_module.setting, "", "", `Module model "${old_data.model}" deleted by "${userProfile.name}"`, common.response_status_code.success, common.response_type.success);

      let res_arr = {
         statusCode: common.response_status_code.success,
         type: common.response_type.success,
         message: common.response_msg.module_deleted
      };
      logger.log(logger_level.info, `Get Module Delete API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);

      return res_arr;
   } catch (error) {
      console.log(error);
      logger.log(logger_level.error, `Get Module Delete API - ${log_type} | ${error}`);

      createAdminActivityLog(request, null, "delete", common.admin_module.setting, "", JSON.stringify({ id: id }), `Module id="${id}" not deleted by "${userProfile.name}" as getting error: "${error}"`, common.response_status_code.internal_error, common.response_type.error);
      return {
         statusCode: common.response_status_code.internal_error,
         type: common.response_type.error,
         message: common.response_msg.catch_error,
      };
   }
};

/* ************* END : module CRUD functions ************* */