const _ = require('lodash');
const { Op, where } = require("sequelize");
const constant = require("common-service/constant/constant.json");
const { generateTokens } = require("common-service/middleware/token");
const { createAPILog } = require("common-service/helper/apiLog");
const { isEmailExist } = require("common-service/helper/checkEmailExist");
const { imgUploading } = require("common-service/helper/general");
const { isEmpty, generateOTP, cleanQuery } = require("common-service/utils/utils");
const logger = require("common-service/utils/logger");
const { emailSending } = require("common-service/utils/sendEmail");
const commonService = require("common-service/services/commonService");
const { response_status_code, response_type, response_success, response_msg, roles, email_template, logger_level } = require("common-service/statics/static.json");
const { app_api_res_msg, app_api_log_type } = require("common-service/statics/retailerStatic.json");
const db = require("common-service/models/index");
const acc_role = [roles.COMPANY_STANDARD, roles.ACCOUNT_STANDARD];

/******* User loggedin ******/
exports.login = async (request) => {
   const log_type = app_api_log_type.login;
   try {
      logger.log(logger_level.info, `Retailer API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);

      const { email, password, company_id } = request.body;

      var res_arr = {
         success: response_success.false,
         statusCode: response_status_code.bad_request,
         type: response_type.error,
         message: "",
      };

      const userrole = await db.Role.findAll({
         where: { role_name: { [Op.in]: acc_role } },
         attributes: ["id"],
         raw: true
      }).then(userrole => userrole.map(role_val => role_val.id))
      let where = { email: { [Op.iLike]: email }, is_deleted: 0, enable: 1, is_email_verified: true, role_id: { [Op.in]: userrole } };
      if (!isEmpty(company_id)) { where.company_id = company_id; }

      const user = await db.Users.findOne({ where: where });
      if (!user) { res_arr.message = app_api_res_msg.user_not_found; return res_arr; }

      const isMatch = await user.correctPassword(password);
      if (!isMatch) { res_arr.message = app_api_res_msg.invalid_login_details; return res_arr; }
      if (!user.enable) { res_arr.message = app_api_res_msg.user_deactived; return res_arr; }

      user.last_login = Date.now();
      await user.update({ last_login: Date.now() });
      const token = await generateTokens("app", "login", user);

      var ip = request.connection.remoteAddress;
      var latest_token = { token: token, user_id: user.id, ip_address: ip };
      await db.Token.create(latest_token); // everytime INSERT new record for login TOKEN

      /* If data exist with given user_id then, UPDATE login token insted of new INSERT */
      // var prev_token = await db.Token.findOne({ where: { user_id: user.id }, attributes: ["id", "user_id"], raw: true, });
      // if (prev_token) { latest_token.id = prev_token.id; }
      // await db.Token.upsert(latest_token);

      const user_details = await db.Users.findOne({
         where: { email: { [Op.iLike]: email } },
         include: [{ model: db.Role, as: "role", attributes: ["id", "role_name"] }, { model: db.Company, as: "company_detail", attributes: ["name"] }],
         attributes: ["id", "driver_id", "name", "email", "enable", "role_id", "company_id", "account_id", "contact_no", "allow_notification", "is_email_verified"],
         raw: true,
         nest: true,
      });
      user_details.token = token;
      request.appUserProfile = {};
      request.appUserProfile.id = user.id;

      res_arr = {
         success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: app_api_res_msg.user_loggedin, data: user_details || {}
      };

      createAPILog(request, log_type, res_arr, response_status_code.success, app_api_res_msg.user_loggedin);
      logger.log(logger_level.info, `Retailer API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `Retailer API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: app_api_res_msg.internal_error,
      };
   }
};

/******* Forgot Password ******/
exports.forgotPassword = async (request, app_type) => {
   const log_type = app_api_log_type.forgot_password;
   try {
      logger.log(logger_level.info, `${app_type} API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);

      const { body, method } = request;

      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };
      if (isEmpty(body.email)) { res_arr.message = response_msg.blank_email; return res_arr; }

      let role_arr = "";
      if (app_type.toLowerCase() == "driver") { role_arr = [roles.DRIVER]; } else { role_arr = acc_role; }
      const userrole = await db.Role.findAll({ where: { role_name: { [Op.in]: role_arr } }, attributes: ["id"], raw: true }).then(userrole => userrole.map(role_val => role_val.id));

      const user = await db.Users.findOne({ where: { email: { [Op.iLike]: body.email }, is_deleted: 0, enable: 1, is_email_verified: true, role_id: { [Op.in]: userrole } }, attributes: ["id", "name", "company_id"], raw: true });
      if (!user) { res_arr.message = response_msg.not_found_user; return res_arr; }

      const otp_str = generateOTP();
      const template_id = email_template.user_forgot_password;
      let replacements = { USERNAME: user.name || "", OTP: `<b>${otp_str}</b>` };
      await emailSending(body.email, user.company_id || 1, template_id, replacements);

      const timestamp = new Date(); // Current timestamp 
      timestamp.setMinutes(timestamp.getMinutes() + 15); // Set OTP expiration time (e.g., 15 minutes from now)

      await db.Users.update({ otp: otp_str, otp_expire_at: timestamp }, { where: { id: user.id } });

      res_arr.success = response_success.true;
      res_arr.statusCode = response_status_code.success;
      res_arr.type = response_type.success;
      res_arr.message = app_api_res_msg.forgot_pass_otp_sent;
      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      logger.log(logger_level.info, `${app_type} API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);

      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `${app_type} API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: app_api_res_msg.internal_error,
      };
   }
};

/******* Reset Password OTP Verify ******/
exports.otpVerify = async (request, app_type) => {
   let log_type, msg_str = "";
   const { body } = request;
   if (body.action_type === "email_verification_otp_verify") {
      log_type = app_api_log_type.verify_email_via_otp; msg_str = app_api_res_msg.email_verified_via_otp;
   } else {
      log_type = app_api_log_type.forgot_pass_otp; msg_str = app_api_res_msg.otp_verified;
   }

   try {

      logger.log(logger_level.info, `${app_type} API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);

      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, data: {} };

      let role_arr = "";
      if (app_type.toLowerCase() == "driver") { role_arr = [roles.DRIVER]; } else { role_arr = acc_role; }
      const userrole = await db.Role.findAll({ where: { role_name: { [Op.in]: role_arr } }, attributes: ["id"], raw: true }).then(userrole => userrole.map(role_val => role_val.id));

      const user = await db.Users.findOne({ where: { email: { [Op.iLike]: body.email }, is_deleted: 0, role_id: { [Op.in]: userrole } }, attributes: ["id", "otp", "otp_expire_at"], raw: true });
      if (!user) { res_arr.message = response_msg.not_found_user; return res_arr; }
      if (body.otp != user.otp) { res_arr.message = app_api_res_msg.invalid_otp; return res_arr; }

      const new_data = { updated_by: user.id, updated_on: Date.now(), otp: null };
      if (body.action_type === "email_verification_otp_verify") {
         new_data.enable = 1;
         new_data.is_email_verified = 1;
         // const random_pass = generateRandomPassword(8);
         // const template_id = email_template.driver_login_detail_send_front;
         // let replacements = { DRIVERNAME: user.name || "", EMAIL: body.email, PASSWORD: random_pass };
         // await emailSending(body.email, user.company_id, template_id, replacements);
      } else {
         const currentTimestamp = new Date();
         if (currentTimestamp > new Date(user.otp_expire_at)) { res_arr.message = app_api_res_msg.otp_invalid_or_expired; return res_arr; }
      }

      await db.Users.update(new_data, { where: { id: user.id } });

      res_arr.success = response_success.true;
      res_arr.statusCode = response_status_code.success;
      res_arr.type = response_type.success;
      res_arr.message = msg_str;
      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      logger.log(logger_level.info, `${app_type} API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);

      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `${app_type} API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: app_api_res_msg.internal_error,
      };
   }
};

/******* Change Password ******/
exports.changePassword = async (request, app_type) => {
   const log_type = app_api_log_type.change_password;
   try {
      logger.log(logger_level.info, `${app_type} API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);

      const { body, appUserProfile } = request;

      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, data: {} };

      let role_arr = "";
      if (app_type.toLowerCase() == "driver") { role_arr = [roles.DRIVER]; } else { role_arr = acc_role; }
      const userrole = await db.Role.findAll({ where: { role_name: { [Op.in]: role_arr } }, attributes: ["id"], raw: true }).then(userrole => userrole.map(role_val => role_val.id));

      let where = { is_deleted: 0, enable: 1, is_email_verified: true, role_id: { [Op.in]: userrole } };
      if (body.action_type === "change_password") {
         where.email = body.email;
      } else if (body.action_type === "update_password") {
         if (!appUserProfile) { res_arr.message = app_api_res_msg.user_not_loggedin; return res_arr; }
         where.email = appUserProfile.email;
         body.password = body.new_password;
         delete body.new_password;
      } else { res_arr.message = app_api_res_msg.incorrect_actiontype; return res_arr; }

      let user = await db.Users.findOne({ where: where });
      if (!user) { res_arr.message = app_api_res_msg.user_not_found; return res_arr; }
      if (body.action_type === "update_password") {
         const isMatch = await user.correctPassword(body.old_password);
         if (!isMatch) { res_arr.message = app_api_res_msg.invalid_oldpass; return res_arr; }
      }

      const updated_salt = db.Users.generateSalt();
      const hass_pass = db.Users.encryptPassword(body.password, updated_salt);
      const updatedFields = { salt: updated_salt, password: hass_pass, updated_by: user.id, updated_on: Date.now(), };
      await user.update(updatedFields);

      res_arr.success = response_success.true;
      res_arr.statusCode = response_status_code.success;
      res_arr.type = response_type.success;
      res_arr.message = app_api_res_msg.pass_changed;

      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      logger.log(logger_level.info, `${app_type} API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `${app_type} API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: app_api_res_msg.internal_error,
      };
   }
};

/******* User FCM detail Add/Edit/Delete ******/
exports.fcmAddEditDelete = async (request, app_type) => {
   try {
      logger.log(logger_level.info, `${app_type} API - START : ${app_api_log_type.add_fcm} | Request : ${JSON.stringify(request.body)}`);

      const { appUserProfile, method, body } = request;
      var res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: "", data: {} };

      if (body.action_type === "logout") {
         await db.FcmToken.destroy({ where: { user_id: appUserProfile.id, device_id: body.device_id } });
         await db.Token.destroy({ where: { user_id: appUserProfile.id } });
         if (!isEmpty(appUserProfile.driver_id)) {
            await db.Driver.update({ working_status: false }, { where: { id: appUserProfile.driver_id } });
         }
         res_arr.message = app_api_res_msg.fcm_deleted;

         logger.log(logger_level.info, `${app_type} API - END : ${app_api_log_type.logout} | Response : ${JSON.stringify(res_arr)}`);
         createAPILog(request, app_api_log_type.logout, null, res_arr.statusCode, res_arr.message);
         return res_arr;
      }

      body.user_id = appUserProfile.id;
      var prev_token = await db.FcmToken.findOne({
         where: { user_id: appUserProfile.id, device_id: body.device_id }, attributes: ["id", "user_id"], raw: true,
      });
      if (prev_token) { body.id = prev_token.id; }
      await db.FcmToken.upsert(body);
      res_arr.message = app_api_res_msg.fcm_updated;
      createAPILog(request, app_api_log_type.add_fcm, res_arr, res_arr.statusCode, res_arr.message);
      logger.log(logger_level.info, `${app_type} API - END : ${app_api_log_type.add_fcm} | Response : ${JSON.stringify(res_arr)}`);
      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `${app_type} API : ${app_api_log_type.add_fcm} | ${error}`);
      console.log(error);
      createAPILog(request, app_api_log_type.add_fcm, error, response_status_code.internal_error,
         app_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: app_api_res_msg.internal_error,
      };
   }
};

/******* User detail Edit/Delete/Get ******/
exports.userAction = async (request, app_type, user_type) => {
   const log_type = app_api_log_type.action_on_user_module;
   try {
      logger.log(logger_level.info, `${app_type} API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);

      const { appUserProfile, body, method, profile_pic } = request;

      var res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: "", data: {} };

      let user_tbl_where = { id: appUserProfile.id, is_deleted: 0, enable: 1 };
      if (user_type === "driver") { delete user_tbl_where.enable; }

      if (method === "DELETE") {
         var update_data = {};
         update_data.deleted_at = Date.now();
         update_data.deleted_by = appUserProfile.id;
         update_data.is_deleted = 1;

         await db.Users.update(update_data, { where: { id: appUserProfile.id } });
         await db.FcmToken.destroy({ where: { user_id: appUserProfile.id } });
         await db.Token.destroy({ where: { user_id: appUserProfile.id } });
         if (user_type === "driver") {
            if (!isEmpty(appUserProfile.driver_id)) {
               const driverCount = await db.Driver.count({ where: { id: appUserProfile.driver_id } });
               if (driverCount > 0) {
                  const where = { driver_id: appUserProfile.driver_id };
                  removalble_imgs = await db.DriverVehicleAttachment.findAll({ where: where, attributes: ["image_path"], raw: true }).then((res) => res.map(val => val.image_path));
                  if (removalble_imgs.length > 0) { // UNLINK files from folder
                     removalble_imgs.map(async (old_file) => {
                        let prev_img_path = path.join(__dirname, '../../driver_service', old_file);
                        if (fs.existsSync(prev_img_path)) { fs.unlinkSync(prev_img_path); }
                     });
                  }

                  // await db.DriverVehicleAttachment.update(update_data, { where: where });
                  await db.DriverVehicleAttachment.destroy({ where: where });
                  await db.DriverVehicleDocs.destroy({ where: where });
                  await db.DriverVehicles.destroy({ where: where });
                  await db.DriverLicenceDetail.destroy({ where: where });
                  await db.Driver.update(update_data, { where: { id: appUserProfile.driver_id } });
               }
            }
            res_arr.message = app_api_res_msg.driver_deleted;
         } else { res_arr.message = app_api_res_msg.user_deleted; }
      } else if (method === "GET") {
         let comp_attr_str = ["name", "email", "building_name", "street_address", "country", "state", "city", "zipcode", "logo"];
         if (user_type === "driver") { comp_attr_str = ["name"]; }
         let data = await db.Users.findOne({
            where: user_tbl_where,
            include: [
               { model: db.Company, as: "company_detail", attributes: comp_attr_str },
               { model: db.Driver, as: "driver_detail", attributes: ["gender", "dob", "language", "about_me", "driver_type", "todays_total_online"] }
            ],
            attributes: ["id", "name", "email", "company_id", "driver_id", "building_name", "street_address", "zipcode", "contact_no", "city", "state", "country", "profile_pic"], raw: true, nest: true,
         });

         if (isEmpty(data)) {
            return { success: response_success.false, statusCode: response_status_code.not_found, type: response_type.error, message: app_api_res_msg.user_not_found, data: {} };
         }

         let state = {};
         const country = await db.Country.findByPk(data.country, { attributes: ["name", "code", "calling_code"], raw: true });
         if (!isEmpty(data.state)) { state = await db.State.findByPk(data.state, { attributes: ["name"], raw: true }) }
         data.state_name = state?.name || "";
         data.country_name = country?.name || "";
         data.country_code = country?.code;
         data.country_calling_code = country?.calling_code;
         if (data?.company_detail?.country && data?.company_detail?.state && data.country != data.company_detail.country) {
            const comp_country = await db.Country.findByPk(data.company_detail.country, { attributes: ["name"], raw: true });
            const comp_state = await db.State.findByPk(data.company_detail.state, { attributes: ["name"], raw: true })
            data.company_detail.state_name = comp_state.name || "";
            data.company_detail.country_name = comp_country.name || "";
         } else if (data?.company_detail?.country && data?.company_detail?.state && data.country == data.company_detail.country) {
            data.company_detail.state_name = state.name || "";
            data.company_detail.country_name = country.name || "";
         }

         if (user_type === "driver") {
            data = _.merge({}, data, data.driver_detail);
            data.company_name = data.company_detail.name;
            delete data.company_detail
            data.today_totaltrip = 0;
            data.today_totaldistance = 0;
            data.total_rewards = 0;
            data.total_rating = 0;
            if (data.driver_type === 2) {
               data.today_earning = "0.00";
               data.total_earning = "0.00";
            }
         }
         delete data.driver_detail;
         // delete data.driver_id;

         res_arr.data = data;
         res_arr.message = app_api_res_msg.get_user;
      } else if (method === "PUT") {

         const data = await db.Users.findOne({ where: user_tbl_where, attributes: ["id", "profile_pic"], raw: true });
         if (isEmpty(data)) {
            res_arr.success = response_success.false;
            res_arr.statusCode = response_status_code.bad_request;
            res_arr.type = response_type.error;
            res_arr.message = response_msg.user_not_found;
            return res_arr
         }
         const is_email_exist = await isEmailExist(body.email, appUserProfile.id);
         if (is_email_exist) {
            res_arr.success = response_success.false;
            res_arr.statusCode = response_status_code.bad_request;
            res_arr.type = response_type.error;
            res_arr.message = response_msg.email_exist;
            return res_arr;
         }

         const service_name = "user_service";
         var imgs_arr = {};
         if (!isEmpty(profile_pic)) {
            imgs_arr.profile_pic = { "media": profile_pic, "media_type": "img", "upload_path": constant.IMG_UPLOAD_DIR, "curr_img": data?.profile_pic || "" };
         }
         const img_upload_res = await imgUploading(imgs_arr, service_name, body);
         if (!isEmpty(img_upload_res) && img_upload_res.statusCode !== 200) return img_upload_res;

         body.updated_at = Date.now();
         body.updated_by = appUserProfile.id;
         await db.Users.update(body, { where: { id: appUserProfile.id } });
         if (user_type === "driver") {
            if (!isEmpty(body.country)) { body.country_id = body.country }
            await db.Driver.update(body, { where: { id: appUserProfile.driver_id } });
         }
         res_arr.message = app_api_res_msg.user_updated;
      }

      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      logger.log(logger_level.info, `${app_type} API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `${app_type} API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: app_api_res_msg.internal_error,
      };
   }
};

/******* Get Vehicle List ******/
exports.getVehicleList = async (request, app_type) => {
   const log_type = app_api_log_type.get_vehicle_list;
   try {
      logger.log(logger_level.info, `${app_type} API - START : ${log_type} | Request : ${JSON.stringify(request.params)}`);

      const { method, params } = request;
      const { company_id } = params;

      var res_arr = {
         success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: "", data: {}
      };
      if (method === "GET") {
         let data = [];
         let where_str = { is_deleted: 0, enable: 1 };
         if (!isEmpty(company_id)) {
            const get_fareprice_veh_cat = await db.FareSetting.findAll({ where: { company_id: company_id, enable: 1, is_deleted: 0, vehicle_cat_id: { [Op.not]: null } }, attributes: ["vehicle_cat_id"], group: ["vehicle_cat_id"], raw: true }).then((res) => res.map(val => val?.vehicle_cat_id || ""));
            if (get_fareprice_veh_cat.length > 0) {
               where_str.vehicle_cat_id = { [Op.in]: get_fareprice_veh_cat };
               data = await db.Vehicle.findAll({
                  where: where_str, attributes: ["id", "make", "model", "enable", "vehicle_cat_id"], raw: true,
               });
            } else { data = []; }
         } else {
            data = await db.Vehicle.findAll({ where: where_str, attributes: ["id", "make", "model", "enable", "vehicle_cat_id"], raw: true, });
         }
         res_arr.data = data;
         res_arr.message = app_api_res_msg.get_vehicle_list;
      }
      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      logger.log(logger_level.info, `${app_type} API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `${app_type} API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: app_api_res_msg.internal_error,
      };
   }
};

/******* Get company's allow driver type for dropdown ******/
exports.getAllowDriver = async (request) => {
   const log_type = app_api_log_type.get_allow_driver_type;
   try {
      logger.log(logger_level.info, `Retailer API - START : ${log_type} | Request : {}`);

      const { appUserProfile } = request;

      res_arr = await commonService.getAllowDriverTypes(appUserProfile.company_id);

      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      logger.log(logger_level.info, `Retailer API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `Retailer API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: app_api_res_msg.internal_error,
      };
   }
};

/******* Address detail Add/Get ******/
exports.addressBookAction = async (request) => {
   const log_type = app_api_log_type.action_on_addr_book;
   try {
      logger.log(logger_level.info, `Retailer API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);

      const { appUserProfile, body, method } = request;

      var res_arr = {
         success: response_success.true,
         statusCode: response_status_code.success,
         type: response_type.success,
         data: []
      };
      if (method === "GET") {
         const list_data = await db.AddressBook.findAll({
            where: { user_id: appUserProfile.id, is_deleted: 0, enable: 1 },
            attributes: { exclude: ["created_by", "updated_by", "deleted_by", "is_deleted", "enable", "created_at", "updated_at", "deleted_at"] },
            raw: true,
         });

         const data = await Promise.all(
            list_data.map(async (val) => {
               const state_data = await db.State.findOne({ where: { country_code: val.country, state_code: val.state }, attributes: ["name"], raw: true });
               const country_data = await db.Country.findOne({ where: { code: val.country }, attributes: ["name"], raw: true });
               val.state_name = state_data.name || "";
               val.country_name = country_data.name || "";

               return val;
            })
         );

         res_arr.data = data;
         res_arr.message = app_api_res_msg.get_saved_addr;
      } else if (method === "POST") {

         const is_add_exist = await db.AddressBook.findOne({ where: { user_id: appUserProfile.id, title: { [Op.iLike]: body.title } } });
         if (!isEmpty(is_add_exist)) {
            return { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, message: app_api_res_msg.addr_title_used, };
         }

         body.user_id = appUserProfile.id;
         body.name = appUserProfile.name;
         body.email = appUserProfile.email;
         body.created_by = appUserProfile.id;
         await db.AddressBook.create(body);
         res_arr.message = app_api_res_msg.addr_saved;
      }
      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      logger.log(logger_level.info, `Retailer API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `Retailer API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: app_api_res_msg.internal_error,
      };
   }
};

/******* Package list dropdown ******/
exports.packageDropdown = async (request) => {
   const log_type = app_api_log_type.package_list;
   try {
      logger.log(logger_level.info, `Retailer API - START : ${log_type} | Request : {}`);

      var res_arr = {
         success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: response_msg.package_lists, data: []
      };

      const data = await db.package.findAll({ where: { enable: 1, is_deleted: 0 }, attributes: ["id", "package_name", "length", "width", "height", "weight"], order: [['package_name', 'ASC']], raw: true });

      res_arr.data = data;

      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      logger.log(logger_level.info, `Retailer API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      return res_arr;

   } catch (error) {
      logger.log(logger_level.error, `Retailer API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: app_api_res_msg.internal_error,
      };
   }
};

/******* Get company driver list ******/
exports.getCompanyDriver = async (request) => {
   const log_type = app_api_log_type.get_comp_driver_list;
   try {
      logger.log(logger_level.info, `Retailer API - START : ${log_type} | Request : ${JSON.stringify(request.query)}`);

      let { query, appUserProfile } = request;
      var { page, limit, search, sortby, order_type, working_status } = query;

      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, data: [] };
      if (isEmpty(appUserProfile.company_id)) { res_arr.message = response_msg.blank_company_id; return res_arr; };

      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      query = cleanQuery(query);
      sortby = sortby || "created_at";
      order_type = order_type || "DESC";
      query = { ...query, is_deleted: 0, enable: 1, company_id: appUserProfile.company_id, driver_id: { [Op.ne]: null } }
      let d_qry = { is_deleted: 0, account_status: 1, enable: 1, company_id: appUserProfile.company_id, driver_type: 1 }
      // query = { ...query, is_deleted: 0, account_status: 1, enable: 1, company_id: appUserProfile.company_id, driver_type: "company" }

      delete query.page;
      delete query.limit;
      delete query.search;
      delete query.sortby;
      delete query.order_type;
      delete query.working_status;

      if (!isEmpty(working_status)) { d_qry.working_status = working_status; }
      if (search) { query = { name: { [Op.iLike]: `%${search}%` }, ...query, } }
      if (!query.company_id) { query.company_id = { [Op.ne]: null }; }
      let options = { offset: (page - 1) * limit, limit: limit, order: [[sortby.toLowerCase(), order_type.toLowerCase()]] };


      // ********** START: NEW logic changed at 09-11-23 Reason:due to search not working **********
      let drivers = await db.Users.findAndCountAll({
         attributes: ["id", "name", "driver_id", "profile_pic"], where: query, raw: true, nest: true, ...options,
         include: [{ model: db.Driver, as: "driver_detail", attributes: ["working_status"], where: d_qry }],
      });
      const transformedDriverDetails = _.map(drivers.rows, (driver) => {
         return { id: driver.id, name: driver.name, driver_id: driver.driver_id, profile_pic: driver.profile_pic, working_status: driver.driver_detail.working_status, rating: 0 };
      });
      // **************************************** END: NEW logic ************************************

      // ******************** START: OLD logic **** ******************************
      /*
      // Get the list of drivers
      const drivers = await db.Driver.findAndCountAll({
         attributes: [["id", "driver_id"], "working_status"], where: query, raw: true, ...options
      });
      // Fetch associated user details for each driver 
      let transformedDriverDetails = await Promise.all(
         drivers.rows.map(async (driver) => {
            const user = await db.Users.findOne({
               where: { driver_id: driver.driver_id, enable: 1, is_deleted: 0 }, attributes: ["id", "name", "profile_pic"], raw: true,
            });
            driver.name = user.name || "";
            driver.profile_pic = user.profile_pic || "";
            driver.rating = 0;
            return driver;
         })
      );
      transformedDriverDetails = transformedDriverDetails.filter(item => item.name !== '');
      */
      // ************************** END: OLD logic  ******************************

      const totalPages = Math.ceil(drivers.count / limit);
      drivers.driver_details = transformedDriverDetails;
      drivers.limit = limit;
      drivers.current_page = page;
      drivers.total_pages = totalPages;
      drivers.total_records = drivers.count;

      delete drivers.count;
      delete drivers.rows;

      res_arr = {
         success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: response_msg.comp_driver_lists, data: drivers || []
      };
      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      logger.log(logger_level.info, `Retailer API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      return res_arr;

   } catch (error) {
      logger.log(logger_level.error, `Retailer API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: app_api_res_msg.internal_error,
      };
   }
};

/******* Get driver details by passing driver id ******/
exports.getDriverDetails = async (request) => {
   const log_type = app_api_log_type.get_driver_detail;
   try {
      logger.log(logger_level.info, `Retailer API - START : ${log_type} | Request : ${JSON.stringify(request.params)}`);

      const { driver_id } = request.params;

      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, data: {} };

      let driver = await db.Driver.findOne({
         where: { id: driver_id, is_deleted: 0, account_status: 1, enable: 1 },
         include: [{ "model": db.Currency, as: "currency_detail", attributes: ["currency_code"] }],
         attributes: ["id", "name", "country_id", "currency_id", "earning", "dob", "language", "about_me", "gender", "licence_no"], raw: true, nest: true
      });
      const user = await db.Users.findOne({ where: { driver_id: driver.id, is_deleted: 0 }, attributes: ["email", "profile_pic", "contact_no", "building_name", "street_address", "zipcode", "city", "state", "country"], raw: true });
      const driver_veh = await db.DriverVehicles.findAll({
         where: { driver_id: driver.id, is_deleted: 0 }, attributes: ["id", "vehicle_id", "vehicle_no_plate"],
         include: [{ model: db.Vehicle, as: "vehicle_detail", attributes: ["make", "model"], }],
         raw: true, nest: true
      });
      veh_data = await Promise.all(
         driver_veh.map(async (val) => {
            const veh_img_attach = await db.DriverVehicleAttachment.findAll({ where: { driver_vehicle_id: val.id, is_deleted: 0, type: "vehicle_imgs" }, attributes: ["image_name"], raw: true, order: [['id', 'ASC']] }).then(res => res.map(val => val.image_name));

            // const driver_veh_doc = await db.DriverVehicleDocs.findOne({
            //    where: { driver_id: driver.id, driver_vehicle_id: val.id, '$doc_detail.name$': { [Op.iLike]: `%registration%` } }, attributes: ["id", "document_no"],
            //    include: [{ model: db.VehicleDocuments, as: "doc_detail", attributes: ["name"], }],
            //    raw: true, nest: true
            // });
            // val.vehicle_reg_no = driver_veh_doc?.document_no || "";

            val.vehicle_imgs = veh_img_attach;
            const flattenedData = _.merge({}, val, val.vehicle_detail);

            delete flattenedData.vehicle_detail;
            delete flattenedData.vehicle_id;
            delete flattenedData.id;
            return flattenedData;
         })
      );

      driver = _.merge({}, driver, driver.currency_detail);
      driver = _.merge({}, driver, user);
      driver.driver_vehicles = veh_data;
      delete driver.currency_id;
      delete driver.currency_detail;
      var country_name, state_name = "";
      if (!isEmpty(user)) {
         country_name = await db.Country.findByPk(user.country, { attributes: ["name"], raw: true });
         state_name = await db.State.findByPk(user.state, { attributes: ["name"], raw: true });
         driver.country = country_name.name || "";
         driver.state = state_name.name || "";
      }

      driver.total_trips = 0;
      driver.total_rejectedjobs = 0;
      res_arr = {
         success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: response_msg.details_get, data: driver || {}
      };
      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      logger.log(logger_level.info, `Retailer API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `Retailer API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: app_api_res_msg.internal_error,
      };
   }
};

/******* Get company credit details ******/
exports.getCompCreditDetails = async (request) => {
   const log_type = app_api_log_type.get_comp_detail;
   try {
      logger.log(logger_level.info, `Retailer API - START : ${log_type} | Request : {}`);

      let { appUserProfile } = request;

      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, data: {} };
      if (isEmpty(appUserProfile.company_id)) { res_arr.message = response_msg.blank_company_id; return res_arr; };


      const qry_res = await db.CompanyDetail.findOne({
         where: { company_id: appUserProfile.company_id, is_deleted: 0 }, attributes: ["balance"], include: [{ model: db.Company, as: "company_basic_detail", attributes: ["company_currency"] }]
      });
      const balance = `${qry_res.balance} ${qry_res.company_basic_detail.company_currency}`;

      res_arr = {
         success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: response_msg.details_get, data: { balance: balance || "" }
      };
      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      logger.log(logger_level.info, `Retailer API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `Retailer API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: app_api_res_msg.internal_error,
      };
   }
};

/******* Update user notification setting ******/
exports.editNotificationSett = async (request) => {
   const log_type = app_api_log_type.edit_notification_sett;
   try {
      logger.log(logger_level.info, `Retailer API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);

      let { appUserProfile, body } = request;

      var res_arr = { success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error, data: {} };
      if (isEmpty(appUserProfile)) { res_arr.message = app_api_res_msg.user_not_loggedin; return res_arr }
      if (body.allow_notification !== 1 && body.allow_notification !== 0) { res_arr.message = app_api_res_msg.req_data_inproper; return res_arr }

      const updatedFields = { allow_notification: body.allow_notification, updated_by: appUserProfile.id, updated_on: Date.now(), };
      await db.Users.update(updatedFields, { where: { id: appUserProfile.id } });

      res_arr = {
         success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: app_api_res_msg.setting_updated, data: {}
      };

      createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
      logger.log(logger_level.info, `Retailer API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
      return res_arr;
   } catch (error) {
      logger.log(logger_level.error, `Retailer API - ${log_type} | ${error}`);
      console.log(error);
      createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error)
      return {
         success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: app_api_res_msg.internal_error,
      };
   }
};

