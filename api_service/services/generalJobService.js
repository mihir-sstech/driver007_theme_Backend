const _ = require('lodash');
const { Op } = require('sequelize');
const { response_status_code, response_type, response_success, response_msg, logger_level } = require("common-service/statics/static.json");
const { app_api_res_msg, app_api_log_type } = require("common-service/statics/retailerStatic.json");
const { createAPILog } = require("common-service/helper/apiLog");
const { isEmpty } = require("common-service/utils/utils");
const logger = require("common-service/utils/logger");
const commonService = require("common-service/services/commonService");
const commonJobService = require("common-service/services/commonJobService");
const constant = require("common-service/constant/constant.json");
const db = require("common-service/models/index");

exports.saveJobAddress = async (request, app_type) => {
  const log_type = app_api_log_type.add_edit_job_address;
  try {
    logger.log(logger_level.info, `${app_type} API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);
    var res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: "", data: {}, };

    const { appUserProfile, body, method } = request;

    const job_mst_arr = {};

    job_mst_arr.user_id = appUserProfile.id;
    job_mst_arr.created_by = appUserProfile.id;
    job_mst_arr.company_id = appUserProfile.company_id;
    job_mst_arr.driver_type = body.driver_type;
    job_mst_arr.job_id = await commonService.getNextJobId(appUserProfile.company_id);
    let job_id, last_insert_id, msg_str = "", data = {};
    msg_str = app_api_res_msg.addrinfo_saved;

    if (method == "POST") {
      const inserted_job_data = await db.JobMaster.create(job_mst_arr);
      last_insert_id = inserted_job_data.id;
      body.job_id = last_insert_id;
      body.user_id = appUserProfile.id;
      body.created_by = appUserProfile.id;
      const inserted_data = await db.JobAddress.create(body);
      job_id = inserted_data.id;
      data = { job_address_id: job_id };
    }
    // else {
    //   if (method == "PUT") {
    //     const jobId = await db.JobAddress.findOne({
    //       where: { job_id: body.job_id },
    //     });
    //     const JobAddressId = jobId?.dataValues?.job_id;
    //     if (!JobAddressId) {
    //       return {
    //         statusCode: response_status_code.bad_request,
    //         type: response_type.error,
    //         message: app_api_res_msg.job_id_not_exist,
    //         data: {},
    //       };
    //     }
    //     body.updated_at = Date.now();
    //     body.updated_by = appUserProfile.id;
    //     job_id = body.job_id;
    //     await db.JobAddress.update(body, { where: { job_id: body.job_id } });
    //     data = { job_id: body.job_id };
    //   }
    // }

    res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: msg_str, data: data || {}, };
    createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
    logger.log(logger_level.info, `${app_type} API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
    return res_arr;
  } catch (error) {
    logger.log(logger_level.error, `${app_type} API : ${log_type} | ${error}`);
    console.log(error);
    createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error);
    return {
      success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: app_api_res_msg.internal_error,
    };
  }
};

async function savePackageData(request) {
  const { appUserProfile, body } = request;
  const job_address = await db.JobAddress.findOne({ where: { id: body.job_address_id }, raw: true, attributes: ["id", "job_id"], });

  const job_master_set = { vehicle_id: body.vehicle_id || null, driver_id: body.driver_id || null, driver_type: body.driver_type, updated_by: appUserProfile.id, updated_at: Date.now() };
  await db.JobMaster.update(job_master_set, { where: { id: job_address.job_id } });

  // save package info in tbl
  let add_pkg_arr = body.package_info || [];
  if (add_pkg_arr && add_pkg_arr.length > 0) {
    add_pkg_arr = await add_pkg_arr.map((fields) => {
      Object.keys(fields).forEach((key) => { if (fields[key] == "") { delete fields[key]; } });
      return { job_id: job_address.job_id, job_address_id: job_address.id, created_by: appUserProfile.id, ...fields };
    });
    if (add_pkg_arr.length > 0) { await db.JobPackage.bulkCreate(add_pkg_arr); }
  }

}

exports.getFareEstimate = async (request, app_type) => {
  const log_type = app_api_log_type.get_fare_estimate;
  const { appUserProfile, body } = request;
  try {
    logger.log(logger_level.info, `${app_type} API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);

    let res_arr = { success: response_success.true, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };
    let data = {};
    await savePackageData({ appUserProfile, body });
    const req_item_res = await commonJobService.fetchRequiredDetails(body);
    if (!req_item_res || req_item_res.statusCode != 200 || isEmpty(req_item_res.data)) { return req_item_res; }
    const tmp_body = req_item_res.data;
    const origin = `${tmp_body.from.latitude},${tmp_body.from.longitude}`;
    const destination = `${tmp_body.to.latitude},${tmp_body.to.longitude}`;
    const dis_res = await commonJobService.getDistance([origin], [destination], tmp_body.vehicle_cat);

    data = { origin: origin, destination: destination };
    if (dis_res && dis_res.length > 0) {
      const company_id = tmp_body.job_comp_id || "";
      const fareprice_res = await commonJobService.calculateFarePrice(company_id, tmp_body, dis_res);
      data.fareprice_list = fareprice_res;
    }

    res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: response_msg.details_get, data: data || {} };

    createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
    logger.log(logger_level.info, `${app_type} API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
    return res_arr;
  } catch (error) {
    logger.log(logger_level.error, `${app_type} API : ${log_type} | ${error}`);
    console.log(error);
    createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error);

    return { success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: response_msg.catch_error, };
  }
};

exports.getNearByDrivers = async (request, app_type) => {

  const log_type = app_api_log_type.get_nearby_drivers;
  const { body } = request;
  try {
    logger.log(logger_level.info, `${app_type} API - START : ${log_type} | Request : ${JSON.stringify(request.body)}`);

    let res_arr = { success: response_success.true, statusCode: response_status_code.bad_request, type: response_type.error, message: "", data: {} };

    const cnt_tbl = await commonService.getCountryDetails({ code: { [Op.iLike]: body.country_code } }, ["id"]);
    const stat_tbl = await commonService.getStateDetails({ state_code: { [Op.iLike]: body.state_code }, country_code: { [Op.iLike]: body.country_code } }, ["id"]);

    let user_whr = { enable: 1, is_deleted: 0, company_id: body.company_id };
    let driver_whr = { ...user_whr, account_status: 1, working_status: true };
    if (body.driver_type) { driver_whr.driver_type = body.driver_type; }
    driver_whr = { ...driver_whr, country_id: cnt_tbl.id, curr_location_lat: { [Op.ne]: "" }, curr_location_long: { [Op.ne]: "" } };

    let nearby_drivers = await db.Users.findAll({
      where: { ...user_whr, country: cnt_tbl.id, state: stat_tbl.id, city: { [Op.iLike]: body.city } },
      attributes: [["id", "user_id"], "driver_id", "name", "email"], raw: true, nest: true,
      include: [{ model: db.Driver, as: "driver_detail", where: driver_whr, attributes: ["curr_location_lat", "curr_location_long"] }],
    });

    if (body.vehicle_id) {
      nearby_drivers = await Promise.all(
        nearby_drivers.map(async (user) => {
          const chk_veh = await db.DriverVehicles.findOne({ where: { enable: 1, is_deleted: 0, vehicle_id: body.vehicle_id, driver_id: user.driver_id }, attributes: ["id"], raw: true });
          if (!isEmpty(chk_veh)) { return user; } else { return {}; }
        })
      );
    }

    nearby_drivers = nearby_drivers.filter((item) => !isEmpty(item));
    const origin = [`${body.pickup_lat},${body.pickup_long}`]; // Single origin 
    const destinations = [];
    nearby_drivers = nearby_drivers = await Promise.all(
      nearby_drivers.map(async (item) => {
        destinations.push(`${item.driver_detail.curr_location_lat},${item.driver_detail.curr_location_long}`);
        _.merge(item, item.driver_detail);
        delete item.driver_detail;
        return item;
      })
    );

    const com_radius = await db.CompanyDetail.findOne({ where: { enable: 1, is_deleted: 0, company_id: body.company_id }, attributes: ["radius"], raw: true }).then((res) => res?.radius || constant.DEFAULT_RADIUS_IN_KM);
    let defined_radius = (com_radius && parseFloat(com_radius) > 0) ? com_radius : constant.DEFAULT_RADIUS_IN_KM;
    defined_radius = parseFloat(defined_radius) * 1000; // radius value convert from KM to METERS;

    const elements = await commonJobService.getDistance(origin, destinations);
    const exclude_drivers = [];
    if (elements && elements?.length > 0) {
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        console.log('single element....: ', element);
        if (element?.status != "OK" || element?.distance?.value > defined_radius) {
          console.log("--------- Not able to get distance OR radius is greater than per defined ---------");
          exclude_drivers.push(nearby_drivers[i].driver_id);
        }
      }
      if (exclude_drivers.length > 0) { nearby_drivers = nearby_drivers.filter(obj => !exclude_drivers.includes(obj.driver_id)); }
    } else { nearby_drivers = []; }

    res_arr = { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: response_msg.details_get, data: nearby_drivers || [], };
    createAPILog(request, log_type, res_arr, res_arr.statusCode, res_arr.message);
    logger.log(logger_level.info, `${app_type} API - END : ${log_type} | Response : ${JSON.stringify(res_arr)}`);
    return res_arr;
  } catch (error) {
    logger.log(logger_level.error, `${app_type} API : ${log_type} | ${error}`);
    console.log(error);
    createAPILog(request, log_type, error, response_status_code.internal_error, app_api_res_msg.internal_error);

    return { success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: response_msg.catch_error, };
  }
};