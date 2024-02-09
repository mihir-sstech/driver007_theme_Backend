const _ = require('lodash');
const fs = require("fs")
const path = require('path');
const { Op } = require("sequelize");
const logger = require("common-service/utils/logger");
const constant = require("common-service/constant/constant.json");
const { generateTokens } = require("common-service/middleware/token");
const { emailSending } = require("common-service/utils/sendEmail");
const { createAPILog } = require("common-service/helper/apiLog");
const { imgUploading } = require("common-service/helper/general");
const { isEmpty, generateOTP } = require("common-service/utils/utils");
const { getNextDriverCode, getNextUserCode } = require("common-service/services/commonService");
const { driver_api_res_msg, driver_api_log_type } = require("common-service/statics/driverStatic.json");
const { response_msg, response_status_code, response_type, response_success, roles, email_template, logger_level } = require("common-service/statics/static.json");
const { Users, Company, Role, UserType, Token, LicenceFields, BankAccountFields, VehicleDocuments, Currency, Country, Driver, DriverLicenceDetail, DriverVehicles, DriverVehicleDocs, DriverVehicleAttachment, UserBankDetail, UserOtherBankDetail, package, Vehicle, WeightUnits } = require("common-service/models/index");
const access_auth = [roles.DRIVER];
const service_name = "driver_service";


async function unlinkImgs(old_img_arr) {

   old_img_arr.map(async (old_file) => {
      let prev_img_path = path.join(__dirname, '../../', service_name, constant.DOC_UPLOAD_DIR, old_file);
      console.log('prev_img_path: ', prev_img_path);
      if (fs.existsSync(prev_img_path)) { fs.unlinkSync(prev_img_path); }
   });
}

/******* Driver registration ******/
exports.register = async (request) => {
   const log_type = driver_api_log_type.register;
   try {
      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);

      const { body } = request;

      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };
      // ------------------------------ 
      const comp_data = await Company.findOne({ where: { is_root_company: true, is_deleted: 0, enable: 1 }, attributes: ["id"], raw: true });
      if (!isEmpty(body?.company_id)) { body.company_id = body.company_id || null; } else { body.company_id = comp_data?.id || null; }

      const mob_exist = await Users.findOne({ where: { contact_no: body.contact_no }, attributes: ["id"], raw: true });
      const email_exist = await Users.findOne({ where: { email: { [Op.iLike]: body.email } }, attributes: ["id", "is_email_verified"], raw: true });

      if (!isEmpty(mob_exist)) { res_arr.message = driver_api_res_msg.phoneno_exist; return res_arr; }
      res_arr.data = { is_email_verified: email_exist?.is_email_verified };
      if (email_exist && email_exist.is_email_verified == true) {
         res_arr.message = driver_api_res_msg.email_exist; return res_arr;
      } else if (email_exist && email_exist.is_email_verified == false) {
         const otp_str = generateOTP();
         const template_id = email_template.driver_email_verification_front;
         let replacements = { DRIVERNAME: body.name || "", OTP: `<b>${otp_str}</b>` };
         await emailSending(body.email, body.company_id, template_id, replacements);
         await Users.update({ otp: otp_str }, { where: { id: email_exist.id } });

         res_arr.message = driver_api_res_msg.registered_but_not_verified; return res_arr;
      }
      // ------------------------------

      const cnt_data = await Country.findOne({ where: { id: body.country_id }, attributes: ["currency_code"], raw: true });
      const curr_data = await Currency.findOne({ where: { currency_code: cnt_data.currency_code }, attributes: ["id"], raw: true });
      body.user_code = await getNextUserCode();
      const driver_code = await getNextDriverCode();

      const new_driver = await Driver.create({ currency_id: curr_data.id, country_id: body.country_id, company_id: body.company_id, driver_code: driver_code, name: body.name });
      body.driver_id = new_driver?.id || null;
      body.country = body.country_id || null

      const userrole = await Role.findOne({ where: { role_name: access_auth[0] }, attributes: ["id"], raw: true });
      const usertype = await UserType.findOne({ where: { type: access_auth[0] }, attributes: ["id"], raw: true });
      body.role_id = userrole.id || null;
      body.user_type_id = usertype.id || null;

      const new_user = await Users.create(body);

      const otp_str = generateOTP();
      const template_id = email_template.driver_email_verification_front;
      let replacements = { DRIVERNAME: body.name || "", OTP: `<b>${otp_str}</b>` };
      await emailSending(body.email, body.company_id, template_id, replacements);
      await Users.update({ otp: otp_str }, { where: { id: new_user.id } });

      const user_data = await Users.findOne({ where: { id: new_user.id }, attributes: ["is_email_verified"], raw: true });

      res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: driver_api_res_msg.driver_registered, data: user_data };
      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};

/******* email Verify Otp Send on registered email ******/
exports.emailVerifyOtpSend = async (request) => {
   const log_type = driver_api_log_type.emailverify_otp_send;
   try {
      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);

      const { body } = request;
      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };

      const userrole = await Role.findAll({ where: { role_name: { [Op.in]: access_auth } }, attributes: ["id"], raw: true }).then(userrole => userrole.map(role_val => role_val.id));

      const user = await Users.findOne({ where: { email: body.email, is_deleted: 0, role_id: { [Op.in]: userrole } }, attributes: ["id", "name", "company_id"], raw: true });
      if (!user) { res_arr.message = driver_api_res_msg.user_not_found; return res_arr; }

      const comp_data = await Company.findOne({ where: { is_root_company: true, is_deleted: 0, enable: 1 }, attributes: ["id"], raw: true });
      if (isEmpty(user?.company_id)) { user.company_id = comp_data?.id || null; }

      const otp_str = generateOTP();
      const template_id = email_template.driver_email_verification_front;
      let replacements = { DRIVERNAME: user.name || "", OTP: `<b>${otp_str}</b>` };
      await emailSending(body.email, user.company_id, template_id, replacements);
      await Users.update({ otp: otp_str }, { where: { id: user.id } });

      res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: driver_api_res_msg.emailverify_otp_sent, data: {} };
      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};

/******* Driver login ******/
exports.login = async (request) => {
   const log_type = driver_api_log_type.login;
   try {
      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);
      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };

      const { email, password } = request.body;

      const userrole = await Role.findAll({
         where: { role_name: { [Op.in]: access_auth } }, attributes: ["id"], raw: true
      }).then(userrole => userrole.map(role_val => role_val.id))

      // let where = { email: email, is_deleted: 0, enable: 1, is_email_verified: true, role_id: { [Op.in]: userrole } };
      let where = { email: { [Op.iLike]: email }, is_deleted: 0, enable: 1, role_id: { [Op.in]: userrole } };
      const user = await Users.findOne({ where: where, include: [{ model: Driver, as: "driver_detail", attributes: ["id", "enable", "is_deleted", "account_status"], where: { is_deleted: 0 } }], nest: true });
      if (!user) { res_arr.message = driver_api_res_msg.user_not_found; return res_arr; }

      res_arr.data = { is_email_verified: user?.is_email_verified || false };
      const isMatch = await user.correctPassword(password);
      if (!isMatch) { res_arr.message = driver_api_res_msg.invalid_login_details; return res_arr; }
      if (user.is_email_verified == false) { res_arr.message = driver_api_res_msg.email_not_verified; return res_arr; }

      user.last_login = Date.now();
      await user.update({ last_login: Date.now() });
      const token = await generateTokens("app", "login", user);

      var ip = request.connection.remoteAddress;
      var latest_token = { token: token, user_id: user.id, ip_address: ip };
      await Token.create(latest_token); // everytime INSERT new record for login TOKEN

      const user_details = await Users.findOne({
         where: { email: { [Op.iLike]: email } },
         include: [{ model: Role, as: "role", attributes: ["id", "role_name"] }, { model: Company, as: "company_detail", attributes: ["name"] }, { model: Driver, as: "driver_detail", attributes: ["working_status", "driver_type"] }],
         attributes: ["id", "name", "email", "role_id", "company_id", "is_email_verified", "driver_id"],
         raw: true, nest: true,
      });
      user_details.working_status = user_details.driver_detail.working_status;
      user_details.driver_type = user_details.driver_detail.driver_type;
      user_details.token = token;
      delete user_details.role_id;
      delete user_details.driver_detail;

      request.appUserProfile = { id: user.id };

      res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: driver_api_res_msg.user_loggedin, data: user_details || {} };

      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);

      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};

/******* Country-wise get dynamic LICENCE FIELDS|VEH. DOCS|BANK ACC. fields ******/
exports.getDynamicFields = async (request) => {
   const log_type = driver_api_log_type.get_dynamic_fields;
   try {

      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);
      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };

      const { body, appUserProfile } = request;
      let { type } = body;
      const country_id = appUserProfile.country;

      let res_data = [];
      if (type === "licence_fields") {
         res_data = await LicenceFields.findAll({ where: { country_id: country_id, is_deleted: 0 }, attributes: ["id", "field_label", "field_type", "field_value", "description"], order: [["id", "asc"]], raw: true });
      } else if (type === "bank_account_fields") {
         res_data = await BankAccountFields.findAll({ where: { country_id: country_id, is_deleted: 0 }, attributes: ["id", "field_label", "field_type", "field_value", "description"], order: [["id", "asc"]], raw: true });
      } else if (type === "document_types") {
         res_data = await VehicleDocuments.findAll({ where: { country_id: country_id, is_deleted: 0 }, attributes: ["id", "name", "description"], order: [["id", "asc"]], raw: true });
      } else { res_arr.message = "Unknown TYPE key passing in request"; return res_arr; }

      res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: driver_api_res_msg.get_details, data: res_data || [] };

      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);

      createAPILog(request, log_type, res_data, res_arr.statusCode, res_arr.message);
      return res_arr;

   } catch (error) {
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};

// ============= Get driver's LICENCE|VEHICLES|BANK ACC. detail by driver ID  =====================
exports.getDriverDetail = async (request) => {
   let log_type = driver_api_log_type.get_driver_details;
   if (request.query.type === "licence_details") { log_type = driver_api_log_type.get_drivers_licence_details; }
   else if (request.query.type == "bankacc_details") { log_type = driver_api_log_type.get_drivers_bank_details; }
   else if (request.query.type == "vehicle_details") { log_type = driver_api_log_type.get_drivers_vehicles_details; }

   try {

      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);
      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };

      const { appUserProfile, query } = request;
      const driver_id = appUserProfile.driver_id;

      var data = [];
      if (query.type === "licence_details") {
         data = await Driver.findAll({ where: { id: driver_id, is_deleted: 0 }, attributes: [["id", "driver_id"], "name", "licence_no", "licence_img_front", "licence_img_back", "licence_expire_at"], raw: true });
         const driver_licence_data = await DriverLicenceDetail.findAll({ where: { driver_id: driver_id, country_id: appUserProfile.country, is_deleted: 0, enable: 1 }, attributes: ["licencefield_id", "licencefield_value"], include: [{ model: LicenceFields, as: "licencefield_detail", attributes: ["field_label", "field_type", "field_value", "description"] }], order: [['licencefield_id', 'ASC']], raw: true, nest: true });
         (data.length > 0) ? data[0].dynamic_licence_field = driver_licence_data : [];

      } else if (query.type === "bankacc_details") {
         data = await UserBankDetail.findAll({ where: { driver_id: driver_id, is_deleted: 0 }, attributes: ["driver_id", "acc_holder_name", "acc_number", "bank_name", "branch_name"], raw: true });

         const other_bank_data = await UserOtherBankDetail.findAll({ where: { driver_id: driver_id, country_id: appUserProfile.country, is_deleted: 0, enable: 1 }, attributes: ["bankfield_id", "bankfield_value"], include: [{ model: BankAccountFields, as: "bankfield_detail", attributes: ["field_label", "field_type", "field_value", "description"] }], order: [['bankfield_id', 'ASC']], raw: true, nest: true });
         (data.length > 0) ? data[0].dynamic_bank_field = other_bank_data : [];

      } else if (query.type === "vehicle_details") {
         const driver_veh = await DriverVehicles.findAll({ where: { driver_id: driver_id, is_deleted: 0 }, attributes: ["id", "driver_id", "vehicle_id", "vehicle_no_plate", "enable"], order: [['id', 'ASC']], raw: true, nest: true, include: [{ model: Vehicle, as: "vehicle_detail", attributes: ["make", "model"] }] });

         data = await Promise.all(
            driver_veh.map(async (val) => {
               val = { ...val, veh_name: `${val.vehicle_detail.make} ${val.vehicle_detail.model}` || "" };
               delete val.vehicle_detail;
               const veh_img_attach = await DriverVehicleAttachment.findOne({ where: { driver_vehicle_id: val.id, is_deleted: 0, type: "vehicle_imgs" }, attributes: ["image_name"], raw: true, order: [['id', 'ASC']] });

               val.vehicle_img = (veh_img_attach) ? veh_img_attach.image_name : "";

               return val;
            })
         );

      } else { res_arr.message = "Unknown TYPE key passing in request"; return res_arr; }

      res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: driver_api_res_msg.get_details, data: data || [] };

      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);

      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      return res_arr;

   } catch (error) {
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};

/******* Update driver's LICENCE details (FORMIDABLE)******/
exports.updateLicenceData_formidable = async (request) => {
   const log_type = driver_api_log_type.edit_licence_info;
   try {
      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);
      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };

      const { body, appUserProfile, licence_img_front, licence_img_back } = request;

      if (isEmpty(appUserProfile.driver_id)) { res_arr.message = response_msg.blank_driver_id; return res_arr; }
      if (isEmpty(licence_img_front) || isEmpty(licence_img_back)) { res_arr.message = response_msg.blank_licence_img; return res_arr; }

      let parsedDynamicLicenceField = [];
      if (body.dynamic_licence_field) { parsedDynamicLicenceField = JSON.parse(body.dynamic_licence_field); }

      const driver_id = appUserProfile.driver_id;
      body.country_id = appUserProfile.country || null;
      body.updated_at = Date.now();
      body.updated_by = appUserProfile.id;

      // ================================== 
      var imgs_arr = {};
      const old_data = await Driver.findOne({
         where: { id: driver_id }, attributes: ["id", "licence_img_front", "licence_img_back"], raw: true
      })
      if (isEmpty(old_data)) {
         res_arr.statusCode = response_status_code.not_found; res_arr.message = response_msg.driver_not_found;
         return res_arr;
      }

      if (!isEmpty(licence_img_front)) {
         imgs_arr.licence_img_front = { "media": licence_img_front, "media_type": "doc", "upload_path": constant.DOC_UPLOAD_DIR, "curr_img": old_data?.licence_img_front || "" };
      }
      if (!isEmpty(licence_img_back)) {
         imgs_arr.licence_img_back = { "media": licence_img_back, "media_type": "doc", "upload_path": constant.DOC_UPLOAD_DIR, "curr_img": old_data?.licence_img_back || "" };
      }

      const img_upload_res = await imgUploading(imgs_arr, service_name, body);
      if (!isEmpty(img_upload_res) && img_upload_res.statusCode !== 200) return img_upload_res;
      // ==================================

      await Driver.update(body, { where: { id: driver_id } });
      if (parsedDynamicLicenceField.length > 0) {
         const updated_data_res = await Promise.all(
            parsedDynamicLicenceField?.map(async (new_val) => {
               new_val.country_id = body.country_id;
               const field_id = new_val.licencefield_id;

               const driver_lic_field = await DriverLicenceDetail.findOne({ where: { licencefield_id: field_id, driver_id: driver_id }, attributes: ["id"], raw: true });

               if (!isEmpty(driver_lic_field)) {
                  delete new_val.licencefield_id;

                  new_val.updated_at = Date.now();
                  new_val.updated_by = appUserProfile.id;
                  await DriverLicenceDetail.update(new_val, { where: { licencefield_id: field_id, driver_id: driver_id } });
               } else {
                  new_val.driver_id = driver_id;
                  new_val.created_by = appUserProfile.id;
                  await DriverLicenceDetail.create(new_val);
               }
               // return new_val;
            })
         );
      }

      res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: driver_api_res_msg.update_details, data: {} };

      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);

      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      return res_arr;

   } catch (error) {
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};

/******* Update driver's LICENCE details (MULTER)******/
exports.updateLicenceData = async (request) => {
   const log_type = driver_api_log_type.edit_licence_info;
   try {
      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);
      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };

      let { body, appUserProfile } = request;
      if (isEmpty(appUserProfile.driver_id)) { res_arr.message = response_msg.blank_driver_id; return res_arr; }

      body = JSON.parse(JSON.stringify(body));
      // if (isEmpty(licence_img_front) || isEmpty(licence_img_back)) { res_arr.message = response_msg.blank_licence_img; return res_arr; }

      let parsedDynamicLicenceField = [];
      if (body.dynamic_licence_field) { parsedDynamicLicenceField = JSON.parse(body.dynamic_licence_field); }

      const driver_id = appUserProfile.driver_id;
      body.country_id = appUserProfile.country || null;
      body.updated_at = Date.now();
      body.updated_by = appUserProfile.id;

      // ================================== 
      const imageFiles = request.files;
      if (!isEmpty(imageFiles)) {
         for (const imageFile of imageFiles) {
            const fieldname = imageFile.fieldname;
            if (!isEmpty(fieldname) && fieldname == "licence_img_front") {
               body.licence_img_front = imageFile.filename;

               // UNLINK current licence_img_front from directory
               const old_imgs = await Driver.findOne({ where: { id: driver_id }, raw: true, attributes: ["licence_img_front"] });
               if (old_imgs && !isEmpty(old_imgs?.licence_img_front)) {
                  const old_img_arr = [old_imgs.licence_img_front];
                  await unlinkImgs(old_img_arr);
               }
            } else if (!isEmpty(fieldname) && fieldname == "licence_img_back") {
               body.licence_img_back = imageFile.filename;

               // UNLINK current licence_img_back from directory
               const old_imgs = await Driver.findOne({ where: { id: driver_id }, raw: true, attributes: ["licence_img_back"] });
               if (old_imgs && !isEmpty(old_imgs?.licence_img_back)) {
                  const old_img_arr = [old_imgs.licence_img_back];
                  await unlinkImgs(old_img_arr);
               }
            }
         }
      }
      // ==================================

      await Driver.update(body, { where: { id: driver_id } });
      if (parsedDynamicLicenceField.length > 0) {
         const updated_data_res = await Promise.all(
            parsedDynamicLicenceField?.map(async (new_val) => {
               new_val.country_id = body.country_id;
               const field_id = new_val.licencefield_id;

               const driver_lic_field = await DriverLicenceDetail.findOne({ where: { licencefield_id: field_id, driver_id: driver_id }, attributes: ["id"], raw: true });

               if (!isEmpty(driver_lic_field)) {
                  delete new_val.licencefield_id;

                  new_val.updated_at = Date.now();
                  new_val.updated_by = appUserProfile.id;
                  await DriverLicenceDetail.update(new_val, { where: { licencefield_id: field_id, driver_id: driver_id } });
               } else {
                  new_val.driver_id = driver_id;
                  new_val.created_by = appUserProfile.id;
                  await DriverLicenceDetail.create(new_val);
               }
               // return new_val;
            })
         );
      }

      res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: driver_api_res_msg.update_details, data: {} };

      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);

      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      return res_arr;

   } catch (error) {
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};

/******* Update driver's BANK ACC. details ******/
exports.updateBankAccInfo = async (request) => {
   const log_type = driver_api_log_type.edit_bankacc_info;
   try {
      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);
      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };

      const { body, appUserProfile } = request;

      if (isEmpty(appUserProfile.driver_id)) { res_arr.message = response_msg.blank_driver_id; return res_arr; }
      body.driver_id = appUserProfile.driver_id
      const driver_basic_data = await Driver.findOne({
         where: { id: body.driver_id, is_deleted: 0 }, attributes: ["id"], raw: true
      })
      if (isEmpty(driver_basic_data)) {
         res_arr.statusCode = response_status_code.not_found; res_arr.message = response_msg.driver_not_found;
         return res_arr;
      }
      const old_data = await UserBankDetail.findOne({ where: { driver_id: body.driver_id } })
      if (body.acc_number) {
         var where = { acc_number: body.acc_number };
         if (!isEmpty(old_data)) { where.driver_id = { [Op.ne]: body.driver_id }; }
         const is_bankacc_exist = await UserBankDetail.findOne({ where: where, attributes: ["id"] })
         if (is_bankacc_exist) { res_arr.message = response_msg.exist_bankacc; return res_arr; }
      }

      let parsedDynamicBankField = [];
      if (body.dynamic_bank_field) { parsedDynamicBankField = body.dynamic_bank_field; }
      if (isEmpty(old_data)) {
         body.user_id = appUserProfile.id;
         body.company_id = appUserProfile.company_id;
         body.country_id = appUserProfile.country;
         body.created_by = appUserProfile.id;
         const inserted_data = await UserBankDetail.create(body);
         const req_data = parsedDynamicBankField?.map(fields => ({
            ...fields,
            driver_id: body.driver_id,
            user_bank_detail_id: inserted_data.id,
            country_id: appUserProfile.country,
            created_by: appUserProfile.id,
         }));
         // adding other bank account detail in "user_other_bank_details" table
         if (req_data.length > 0) { await UserOtherBankDetail.bulkCreate(req_data); }

      } else {
         body.updated_at = Date.now();
         body.updated_by = appUserProfile.id;

         const tbl_id = body.driver_id;
         delete body.driver_id;
         await UserBankDetail.update(body, { where: { driver_id: tbl_id } });
         if (parsedDynamicBankField.length > 0) {
            // ADD/UPDATE data when data is exist in table
            await Promise.all(
               parsedDynamicBankField?.map(async (new_val) => {
                  const field_id = new_val.bankfield_id;
                  const where = { bankfield_id: field_id, user_bank_detail_id: old_data.id }
                  const is_field_exist = await UserOtherBankDetail.findAll({ where: where })
                  if (is_field_exist.length > 0) {
                     delete new_val.bankfield_id;
                     new_val.updated_at = Date.now();
                     new_val.updated_by = appUserProfile.id;
                     await UserOtherBankDetail.update(new_val, { where: where });
                  } else {
                     new_val.driver_id = tbl_id;
                     new_val.user_bank_detail_id = old_data.id;
                     new_val.country_id = appUserProfile.country;
                     new_val.created_by = appUserProfile.id;
                     await UserOtherBankDetail.create(new_val);
                  }
                  // return new_val;
               })
            );
         }
      }

      res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: driver_api_res_msg.update_details, data: {} };

      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);

      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      return res_arr;

   } catch (error) {
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};

/******* Get package types list ******/
exports.getPackageList = async (request) => {
   const log_type = driver_api_log_type.get_package_types;
   try {

      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);
      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };

      const res_data = await package.findAll({ where: { enable: 1, is_deleted: 0 }, attributes: ["id", "package_name"], order: [["id", "asc"]], raw: true });
      res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: driver_api_res_msg.get_details, data: res_data || {} };

      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);

      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      return res_arr;

   } catch (error) {
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};

/******* Add/Edit/Delete/Get vehicle documents ******/
exports.vehDocOperations = async (request) => {

   let log_type = "VEHICLE_DOCUMENT_ACTION";
   if (request.body.action === "update") { log_type = driver_api_log_type.addedit_veh_docs; }
   else if (request.body.action == "delete") { log_type = driver_api_log_type.delete_veh_doc; }
   else if (request.body.action == "get") { log_type = driver_api_log_type.get_veh_docs; }

   try {
      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);
      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };

      let { body, appUserProfile } = request;

      if (isEmpty(appUserProfile.driver_id)) { res_arr.message = response_msg.blank_driver_id; return res_arr; }
      if (isEmpty(body.action)) { res_arr.message = response_msg.blank_action_key; return res_arr; }

      let msg = "", data = {};
      if (body.action == "update") {

         if (isEmpty(body.vehicle_id)) { res_arr.message = response_msg.blank_vehicle_id; return res_arr; }
         if (isEmpty(body.document_id)) { res_arr.message = response_msg.blank_doc_id; return res_arr; }

         body = JSON.parse(JSON.stringify(body));
         body.driver_id = appUserProfile.driver_id;

         let driver_vehicle, new_driver_veh;
         await DriverVehicles.findOrCreate({
            where: { driver_id: body.driver_id, vehicle_id: body.vehicle_id, is_deleted: 0 },
            defaults: { created_by: appUserProfile.id }
         }).then(([data, created]) => {
            driver_vehicle = data;
            new_driver_veh = created;
         });

         const where_str = { driver_vehicle_id: driver_vehicle.id, driver_id: body.driver_id, document_id: body.document_id };


         // ------------- Code block for img uploading via FORMIDABLE -------------
         /*
         if (attachment.length > 0) {
            const where_str = { driver_vehicle_id: driver_vehicle.id, driver_id: body.driver_id, document_id: body.document_id };
            let removalble_imgs = await DriverVehicleAttachment.findAll({ where: where_str, attributes: ["image_name"], raw: true }).then((res) => res.map(val => val.image_name));
            removalble_imgs = removalble_imgs.join(",");

            var imgs_arr = {};
            imgs_arr.attachment = { "media": attachment, "media_type": "doc", "upload_path": constant.DOC_UPLOAD_DIR, "curr_img": removalble_imgs };
            const img_upload_res = await imgUploading(imgs_arr, service_name, body);
            if (!isEmpty(img_upload_res) && img_upload_res.statusCode !== 200) return img_upload_res;
            if (isEmpty(body.attachment)) { res_arr.message = response_msg.img_not_uploaded; return res_arr; }

            const attch_arr = body.attachment.split(",");
            delete body.attachment;
            const new_req = await Promise.all(
               attch_arr.map(async (val) => {
                  tmp_val = { ...body, driver_vehicle_id: driver_vehicle.id, image_name: val, image_path: `${constant.DOC_UPLOAD_DIR}/${val}`, created_by: appUserProfile.id, type: "vehicle_doc_imgs" };
                  return tmp_val;
               })
            );
            await DriverVehicleAttachment.destroy({ where: where_str });
            if (new_req.length > 0) { await DriverVehicleAttachment.bulkCreate(new_req) }
         }
         */

         // ------------- Code block for img uploading via MULTER -------------
         const imageFiles = request.files;
         let attach_arr = [];
         if (!isEmpty(imageFiles)) {
            for (const imageFile of imageFiles) {
               const fieldname = imageFile.fieldname;
               if (!isEmpty(fieldname) && fieldname == "attachment") {
                  attach_arr.push(imageFile.filename);
               }
            }
         }

         if (attach_arr.length > 0) {

            // UNLINK current attachment from directory
            let removalble_imgs = await DriverVehicleAttachment.findAll({ where: where_str, attributes: ["image_name"], raw: true }).then((res) => res.map(val => val.image_name));
            await unlinkImgs(removalble_imgs);

            const new_req = await Promise.all(
               attach_arr.map(async (val) => {
                  tmp_val = { ...body, driver_vehicle_id: driver_vehicle.id, image_name: val, image_path: `${constant.DOC_UPLOAD_DIR}/${val}`, created_by: appUserProfile.id, type: "vehicle_doc_imgs" };
                  return tmp_val;
               })
            );
            await DriverVehicleAttachment.destroy({ where: where_str });
            if (new_req.length > 0) { await DriverVehicleAttachment.bulkCreate(new_req) }
         }

         const driver_veh_docs = await DriverVehicleDocs.findOne({ where: { ...where_str, is_deleted: 0 }, attributes: ["id"], raw: true });
         if (!isEmpty(driver_veh_docs)) {
            val = { updated_at: Date.now(), updated_by: appUserProfile.id, document_id: body.document_id, document_no: body.document_no, document_expire_at: body.document_expire_at };
            await DriverVehicleDocs.update(val, { where: { id: driver_veh_docs.id } });
         } else {
            val = { created_by: appUserProfile.id, driver_id: body.driver_id, driver_vehicle_id: driver_vehicle.id, document_id: body.document_id, document_no: body.document_no, document_expire_at: body.document_expire_at };

            await DriverVehicleDocs.create(val);
         }

         msg = driver_api_res_msg.update_details;
      } else if (body.action == "delete") {
         body.driver_id = appUserProfile.driver_id;
         let where_str = { driver_id: body.driver_id };
         const driver_vehicle = await DriverVehicles.findOne({
            where: { ...where_str, vehicle_id: body.vehicle_id }, attributes: ["id"], raw: true
         });

         if (isEmpty(driver_vehicle)) { res_arr.message = response_msg.details_not_found; return res_arr; }
         where_str = { ...where_str, driver_vehicle_id: driver_vehicle.id, document_id: body.document_id };
         const removalble_imgs = await DriverVehicleAttachment.findAll({ where: where_str, attributes: ["image_path"], raw: true }).then((res) => res.map(val => val.image_path));

         await DriverVehicleAttachment.destroy({ where: where_str });
         await DriverVehicleDocs.destroy({ where: where_str });

         // deleting img from DB by pasing it's IMG_PATH 
         if (removalble_imgs.length > 0) { // UNLINK files from folder
            removalble_imgs.map(async (old_file) => {
               let prev_img_path = path.join(__dirname, '../../driver_service', old_file);
               if (fs.existsSync(prev_img_path)) { fs.unlinkSync(prev_img_path); }
            });
         }
         msg = driver_api_res_msg.details_deleted;
      } else if (body.action == "get") {
         body.driver_id = appUserProfile.driver_id;
         const driver_vehicle = await DriverVehicles.findOne({
            where: { driver_id: body.driver_id, vehicle_id: body.vehicle_id, is_deleted: 0 }, attributes: ["id"]
         });
         if (!isEmpty(driver_vehicle)) {
            const veh_docs = await DriverVehicleDocs.findOne({ where: { driver_vehicle_id: driver_vehicle.id, driver_id: body.driver_id, document_id: body.document_id, is_deleted: 0 }, attributes: ["id", "document_id", "document_no", "document_expire_at", "document_status"], raw: true, nest: true, order: [['id', 'ASC']], include: [{ model: VehicleDocuments, as: "doc_detail", attributes: ["name"] }] });

            const veh_doc_attach = await DriverVehicleAttachment.findAll({ where: { driver_vehicle_id: driver_vehicle.id, is_deleted: 0, document_id: body.document_id, type: "vehicle_doc_imgs" }, attributes: ["image_name"], raw: true, order: [['id', 'ASC']] }).then(res => res.map(val => val.image_name));

            if (veh_docs) {
               veh_docs.vehicle_id = body.vehicle_id;
               veh_docs.document_imgs = veh_doc_attach || [];
               veh_docs.document_name = veh_docs.doc_detail.name || "";
               delete veh_docs.doc_detail;
            }
            data = veh_docs || {};
         }
         msg = driver_api_res_msg.get_details;
      } else { res_arr.message = response_msg.incorrect_actiontype; return res_arr; }

      res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: msg, data: data || {} };

      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      return res_arr;

   } catch (error) {
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};

/******* Delete vehicle attachment ******/
exports.removeVehAttachment = async (request) => {
   const log_type = driver_api_log_type.del_veh_attach;
   try {
      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);
      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };

      const { body, appUserProfile } = request;

      if (isEmpty(appUserProfile.driver_id)) { res_arr.message = response_msg.blank_driver_id; return res_arr; }
      body.driver_id = appUserProfile.driver_id;

      if (!isEmpty(body.image_name)) { // deleting img from DB by pasing it's IMG_NAME 
         removalble_imgs = [body.image_name];
         await DriverVehicleAttachment.destroy({ where: { image_name: body.image_name } });
         if (removalble_imgs.length > 0) { // UNLINK files from folder
            removalble_imgs.map(async (old_file) => {
               let prev_img_path = path.join(__dirname, '../../', service_name, constant.DOC_UPLOAD_DIR, old_file);
               if (fs.existsSync(prev_img_path)) { fs.unlinkSync(prev_img_path); }
            });
         }
      }

      res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: response_msg.img_unlinked, data: {} };

      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      return res_arr;

   } catch (error) {
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};

/******* Get/Update/Delete driver's vehicle details ******/
exports.vehicleOperation = async (request) => {
   let log_type = "VEHICLE_ACTION";
   if (request.body.action === "update") { log_type = driver_api_log_type.addedit_driver_veh; }
   else if (request.body.action == "delete") { log_type = driver_api_log_type.delete_driver_veh; }
   else if (request.body.action == "get") { log_type = driver_api_log_type.get_driver_veh; }

   try {
      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);
      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };

      let { body, appUserProfile } = request;

      if (isEmpty(appUserProfile.driver_id)) { res_arr.message = response_msg.blank_driver_id; return res_arr; }
      if (isEmpty(body.action)) { res_arr.message = response_msg.blank_action_key; return res_arr; }

      body.driver_id = appUserProfile.driver_id;
      let msg = "", data = {};
      if (body.action == "update") {

         if (isEmpty(body.weightunit_id)) { delete body.weightunit_id; }
         if (isEmpty(body.vehicle_id)) { res_arr.message = response_msg.blank_vehicle_id; return res_arr; }
         if (isEmpty(body.package_id)) { res_arr.message = response_msg.blank_package_id; return res_arr; }
         if (isEmpty(body.vehicle_no_plate)) { res_arr.message = response_msg.blank_veh_no; return res_arr; }
         body = JSON.parse(JSON.stringify(body));

         let driver_vehicle, new_driver_veh;
         await DriverVehicles.findOrCreate({
            where: { driver_id: body.driver_id, vehicle_id: body.vehicle_id, is_deleted: 0 },
            defaults: { created_by: appUserProfile.id }
         }).then(([data, created]) => {
            driver_vehicle = data;
            new_driver_veh = created;
         });
         const where_str = { driver_vehicle_id: driver_vehicle.id, driver_id: body.driver_id, vehicle_id: body.vehicle_id, type: "vehicle_imgs" };

         // ------------- Code block for img uploading via FORMIDABLE -------------
         /*
         if (attachment.length > 0) {
            const where_str = { driver_vehicle_id: driver_vehicle.id, driver_id: body.driver_id, vehicle_id: body.vehicle_id, type: "vehicle_imgs" };
            let removalble_imgs = await DriverVehicleAttachment.findAll({ where: where_str, attributes: ["image_name"], raw: true }).then((res) => res.map(val => val.image_name));
            removalble_imgs = removalble_imgs.join(",");

            var imgs_arr = {};
            imgs_arr.attachment = { "media": attachment, "media_type": "doc", "upload_path": constant.DOC_UPLOAD_DIR, "curr_img": removalble_imgs };
            const img_upload_res = await imgUploading(imgs_arr, service_name, body);
            if (!isEmpty(img_upload_res) && img_upload_res.statusCode !== 200) return img_upload_res;
            if (isEmpty(body.attachment)) { res_arr.message = response_msg.img_not_uploaded; return res_arr; }

            const attch_arr = body.attachment.split(",");
            delete body.attachment;
            const new_req = await Promise.all(
               attch_arr.map(async (val) => {
                  tmp_val = { ...body, driver_vehicle_id: driver_vehicle.id, image_name: val, image_path: `${constant.DOC_UPLOAD_DIR}/${val}`, created_by: appUserProfile.id, type: "vehicle_imgs" };
                  return tmp_val;
               })
            );
            await DriverVehicleAttachment.destroy({ where: where_str });
            if (new_req.length > 0) { await DriverVehicleAttachment.bulkCreate(new_req) }
         }
         */

         // ------------- Code block for img uploading via MULTER -------------
         const imageFiles = request.files;

         let attach_arr = [];
         if (!isEmpty(imageFiles)) {
            for (const imageFile of imageFiles) {
               const fieldname = imageFile.fieldname;
               if (!isEmpty(fieldname) && fieldname == "attachment") { attach_arr.push(imageFile.filename); }
            }
         }
         if (attach_arr.length > 0) {

            // UNLINK current attachment from directory
            let removalble_imgs = await DriverVehicleAttachment.findAll({ where: where_str, attributes: ["image_name"], raw: true }).then((res) => res.map(val => val.image_name));
            await unlinkImgs(removalble_imgs);

            const new_req = await Promise.all(
               attach_arr.map(async (val) => {
                  tmp_val = { ...body, driver_vehicle_id: driver_vehicle.id, image_name: val, image_path: `${constant.DOC_UPLOAD_DIR}/${val}`, created_by: appUserProfile.id, type: "vehicle_imgs" };
                  return tmp_val;
               })
            );
            await DriverVehicleAttachment.destroy({ where: where_str });
            if (new_req.length > 0) { await DriverVehicleAttachment.bulkCreate(new_req) }
         }

         await DriverVehicles.update({ ...body, updated_at: Date.now(), updated_by: appUserProfile.id }, { where: { id: driver_vehicle.id } });

         msg = driver_api_res_msg.vehicle_updated;
      } else if (body.action == "delete") {
         let where_str = { driver_id: body.driver_id };
         const driver_vehicle = await DriverVehicles.findOne({
            where: { ...where_str, vehicle_id: body.vehicle_id }, attributes: ["id"], raw: true
         });

         if (isEmpty(driver_vehicle)) { res_arr.message = response_msg.details_not_found; return res_arr; }
         where_str = { ...where_str, driver_vehicle_id: driver_vehicle.id };
         const removalble_imgs = await DriverVehicleAttachment.findAll({ where: where_str, attributes: ["image_path"], raw: true }).then((res) => res.map(val => val.image_path));

         await DriverVehicleAttachment.destroy({ where: where_str });
         await DriverVehicleDocs.destroy({ where: where_str });
         await DriverVehicles.destroy({ where: { driver_id: body.driver_id, vehicle_id: body.vehicle_id } });

         // deleting img from DB by pasing it's IMG_PATH 
         if (removalble_imgs.length > 0) { // UNLINK files from folder
            removalble_imgs.map(async (old_file) => {
               let prev_img_path = path.join(__dirname, '../../driver_service', old_file);
               if (fs.existsSync(prev_img_path)) { fs.unlinkSync(prev_img_path); }
            });
         }
         msg = driver_api_res_msg.details_deleted;
      } else if (body.action == "get") {
         const driver_veh = await DriverVehicles.findOne({
            where: { driver_id: body.driver_id, vehicle_id: body.vehicle_id, is_deleted: 0 },
            attributes: { exclude: ["created_by", "updated_by", "deleted_by", "created_at", "updated_at", "deleted_at", "is_deleted"] },
            raw: true, nest: true, order: [['id', 'ASC']],
            include: [
               { model: Vehicle, as: "vehicle_detail", attributes: ["make", "model"] },
               { model: WeightUnits, as: "weightunit_detail", attributes: ["unit_name"] }
            ]
         });

         if (!isEmpty(driver_veh)) {
            driver_veh.vehicle_name = `${driver_veh.vehicle_detail.make} ${driver_veh.vehicle_detail.model}`;
            driver_veh.weightunit_name = driver_veh.weightunit_detail.unit_name;
            driver_veh.package_details = [];

            delete driver_veh.vehicle_detail;
            delete driver_veh.weightunit_detail;

            if (!isEmpty(driver_veh.package_id)) {
               const packageid_arr = driver_veh.package_id.split(",");
               const package_name = await package.findAll({ where: { id: { [Op.in]: packageid_arr } }, attributes: ["id", "package_name"], raw: true });
               driver_veh.package_details = package_name || [];
            }

            const veh_img_attach = await DriverVehicleAttachment.findAll({ where: { driver_vehicle_id: driver_veh.id, is_deleted: 0, type: "vehicle_imgs" }, attributes: ["image_name"], raw: true, order: [['id', 'ASC']] }).then(res => res.map(val => val.image_name));
            driver_veh.vehicle_img = veh_img_attach;

            const veh_docs = await DriverVehicleDocs.findAll({
               where: { driver_vehicle_id: driver_veh.id, is_deleted: 0 }, attributes: ["id", "document_id", "document_no", "document_expire_at", "document_status"], raw: true, nest: true,
               order: [['id', 'ASC']],
               include: [{ model: VehicleDocuments, as: "doc_detail", attributes: ["name"] }]
            });

            const veh_doc_files = veh_docs?.map(async (value) => {
               value.document_name = value.doc_detail.name || "";
               delete value.doc_detail;
               veh_doc_attach = await DriverVehicleAttachment.findAll({ where: { driver_vehicle_id: driver_veh.id, is_deleted: 0, document_id: value.document_id, type: "vehicle_doc_imgs" }, attributes: ["image_name"], raw: true, order: [['id', 'ASC']] }).then(res => res.map(val => val.image_name));
               return { ...value, document_imgs: veh_doc_attach };
            });
            await Promise.all(veh_doc_files).then(results => {
               driver_veh.vehicle_docs = results;
            }).catch(error => { console.error("Error updating records:", error); });
         }
         data = driver_veh;
         msg = driver_api_res_msg.get_details;
      } else { res_arr.message = response_msg.incorrect_actiontype; return res_arr; }

      res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: msg, data: data || {} };

      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      return res_arr;

   } catch (error) {
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};

/******* Get Driver Vehicle detail with it's document list by vehicle ID  ******/
/*
exports.getVehByVehicleId = async (request) => {
   try {
      logger.log(logger_level.info, `Driver API - START : ${driver_api_log_type.get_drivers_vehicles_details} | Request : ${JSON.stringify(request.body)}`);
      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };

      const { body, appUserProfile } = request;

      if (isEmpty(appUserProfile.driver_id)) { res_arr.message = response_msg.blank_driver_id; return res_arr; }
      if (isEmpty(body.vehicle_id)) { res_arr.message = response_msg.blank_vehicle_id; return res_arr; }
      const driver_id = appUserProfile.driver_id;

      const driver_veh = await DriverVehicles.findOne({ where: { driver_id: driver_id, vehicle_id: body.vehicle_id, is_deleted: 0 }, attributes: { exclude: ["created_by", "updated_by", "deleted_by", "created_at", "updated_at", "deleted_at", "is_deleted"] }, raw: true, order: [['id', 'ASC']] });

      if (!isEmpty(driver_veh)) {
         const veh_img_attach = await DriverVehicleAttachment.findAll({ where: { driver_vehicle_id: driver_veh.id, is_deleted: 0, type: "vehicle_imgs" }, attributes: ["image_name"], raw: true, order: [['id', 'ASC']] }).then(res => res.map(val => val.image_name));
         driver_veh.vehicle_img = veh_img_attach;

         const veh_docs = await DriverVehicleDocs.findAll({ where: { driver_vehicle_id: driver_veh.id, is_deleted: 0 }, attributes: ["id", "document_id", "document_no", "document_expire_at", "document_status"], raw: true, order: [['id', 'ASC']] });

         const veh_doc_files = veh_docs?.map(async (value) => {
            veh_doc_attach = await DriverVehicleAttachment.findAll({ where: { driver_vehicle_id: driver_veh.id, is_deleted: 0, document_id: value.document_id, type: "vehicle_doc_imgs" }, attributes: ["image_name"], raw: true, order: [['id', 'ASC']] }).then(res => res.map(val => val.image_name));
            return { ...value, document_imgs: veh_doc_attach };
         });
         await Promise.all(veh_doc_files).then(results => {
            driver_veh.vehicle_docs = results;
         }).catch(error => { console.error("Error updating records:", error); });
      }

      res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: response_msg.details_get, data: driver_veh || {} };

      logger.log(logger_level.info, `Driver API - END : ${driver_api_log_type.get_drivers_vehicles_details} | Response : ${JSON.stringify(res_arr)}`);
      createAPILog(request, driver_api_log_type.get_drivers_vehicles_details, res_arr.data || {}, res_arr.statusCode, res_arr.message);
      return res_arr;

   } catch (error) {
      logger.log(logger_level.error, `Driver API - ${driver_api_log_type.get_drivers_vehicles_details} | ${error}`);
      console.log(error);
      createAPILog(request, driver_api_log_type.get_drivers_vehicles_details, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};
*/

/******* Function for testing & debugging purpose (PLEASE DON'T REMOVE) ******/
exports.testFunction = async (request) => {
   let log_type = "TESTING_FUNCTION";

   try {
      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);

      const { body, appUserProfile, licence_img_front, licence_img_back } = request;
      console.log('licence_img_back: ', licence_img_back);
      console.log('licence_img_front: ', licence_img_front);
      console.log("body---------", body);

      const res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: "Test function called", data: {} };

      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      return res_arr;

   } catch (error) {
      console.log(error);
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};

/******* Function for testing & debugging purpose (PLEASE DON'T REMOVE) ******/
exports.testFunctionNew = async (request) => {
   let log_type = "TESTING_FUNCTION";

   try {
      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);

      const { body, appUserProfile, licence_img_front, licence_img_back } = request;
      console.log('licence_img_back: ', licence_img_back);
      console.log('licence_img_front: ', licence_img_front);
      console.log("body---------", body);
      console.log("FILESSSSSS---------", request.files);

      const res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: "Test function called", data: {} };

      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      return res_arr;

   } catch (error) {
      console.log(error);
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};

// Check Personal info complete or not
async function isPersonalInfoComplete(personalInfo) {
   // Check for all fields to be present and non-empty
   const allFieldsFilled = Object.values(personalInfo).every(field => {
      // return field !== undefined && field !== null && field !== '';
      return !isEmpty(field);
   });

   // Check if email is verified
   const isEmailVerified = personalInfo.is_email_verified === true;

   // Profile completion requires all fields to be filled and email to be verified
   return allFieldsFilled && isEmailVerified;
}

// Check Vehicle Document info complete or not
async function isVehicleDocCompleted(country_id, driver_id) {

   const where_str = { driver_id: driver_id, is_deleted: 0 };
   const veh_wise_doc_cnt = await VehicleDocuments.count({ where: { country_id: country_id, is_deleted: 0, enable: 1 } });
   const total_vehicle = await DriverVehicles.count({ where: where_str });
   const approved_documents = await DriverVehicleDocs.count({ where: { ...where_str, document_status: 1 } });
   const total_documents = parseInt(veh_wise_doc_cnt) * parseInt(total_vehicle);

   // const completion_percentage = (approved_documents / total_documents) * 100 || 0;
   let vehdoc_stat = false;
   if (total_vehicle > 0 && total_documents == approved_documents) { vehdoc_stat = true; }
   return vehdoc_stat;
}

/******* Function to get profile progress ******/
exports.getProfileProgress = async (request) => {
   let log_type = driver_api_log_type.get_profile_progress;

   try {

      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);

      const { appUserProfile } = request;
      let res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };

      if (isEmpty(appUserProfile.driver_id)) { res_arr.message = response_msg.blank_driver_id; return res_arr; }
      const driver_id = appUserProfile.driver_id;

      const driver_data = await Driver.findOne({ where: { id: driver_id, is_deleted: 0 }, attributes: ["licence_status"], raw: true });
      if (isEmpty(driver_data)) {
         res_arr.statusCode = response_status_code.not_found; res_arr.message = response_msg.driver_not_found;
         return res_arr;
      }

      const profileCompletionPoints = constant.PROFILE_COMPLETION_POINTS;

      const personalinfo_obj = { name: appUserProfile.name, email: appUserProfile.email, is_email_verified: appUserProfile.is_email_verified, contact_no: appUserProfile.contact_no, country: appUserProfile.country };
      const personal_stat = await isPersonalInfoComplete(personalinfo_obj);

      let licence_stat = false;
      if (driver_data.licence_status == 1) { licence_stat = true; }

      const vehicledoc_stat = await isVehicleDocCompleted(appUserProfile.country, driver_id);

      // Completion status for each stage
      const completionStatus = { personal_info: personal_stat, licence_info: licence_stat, vehicledoc_info: vehicledoc_stat };

      // Calculate total percentage
      const totalWeight = Object.values(profileCompletionPoints).reduce((acc, val) => acc + val, 0);

      // Calculate completed percentage
      const completedWeight = Object.keys(completionStatus)
         .filter(task => completionStatus[task])
         .reduce((acc, task) => acc + profileCompletionPoints[task], 0);

      // Calculate percentage
      let completionPercentage = (completedWeight / totalWeight) * 100;
      completionPercentage = completionPercentage.toFixed(2);

      console.log(`Profile Completion Percentage: ${completionPercentage}%`);

      completionStatus.progress = completionPercentage;
      res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: driver_api_res_msg.get_details, data: completionStatus || {} };

      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      return res_arr;

   } catch (error) {
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};

/******* Driver vehicle status ******/
exports.changeVehicleStatus = async (request) => {
   const log_type = driver_api_log_type.driver_veh_stat_changed;
   try {
      logger.log(logger_level.info, `Driver API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);
      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, data: {} };

      const { body, appUserProfile } = request;

      if (isEmpty(appUserProfile.driver_id)) { res_arr.message = response_msg.blank_driver_id; return res_arr; }
      const driver_id = appUserProfile.driver_id;

      // check "At least one active vehicle is required"
      if (body.enable != 1) {
         const act_veh_cnt = await DriverVehicles.count({ where: { driver_id: driver_id, is_deleted: 0, enable: 1 } });
         if (act_veh_cnt <= 1) { res_arr.message = response_msg.active_veh_msg; return res_arr; }
      }
      // user can ACTIVE one vehicle at time
      await DriverVehicles.update({ enable: 0 }, { where: { driver_id: driver_id } });
      await DriverVehicles.update(body, { where: { driver_id: driver_id, vehicle_id: body.vehicle_id } });

      res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: response_msg.status_updated, data: {} };

      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      logger.log(logger_level.info, `Driver API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      return res_arr;

   } catch (error) {
      logger.log(logger_level.error, `Driver API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, driver_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: driver_api_res_msg.internal_error,
      };
   }
};
