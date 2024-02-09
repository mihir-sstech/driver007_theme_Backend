
const axios = require('axios');
const moment = require('moment');
const db = require("../models/index");
const { isEmpty } = require('../utils/utils');
const { Op } = require('sequelize');
const { response_msg, response_status_code, response_type } = require("../statics/static.json");
const constant = require("../constant/constant.json");
const google_api_key = constant.GOOGLE_API_KEY;
// const google_api_key = "AIzaSyDD1CS7mD6FJdTcwPLjAiWl3FbADpwlmEM";

// Get Duration From Seconds
async function getDurationFromSeconds(seconds) {
    const duration = moment.duration(seconds, 'seconds');
    const days = duration.days() || 0;
    const hours = duration.hours() || 0;
    const minutes = duration.minutes() || 0;
    return `${days} days: ${hours} hours: ${minutes} minutes`;
}

// Get Emission Type For Vehicle
async function getEmissionTypeForVehicle(vehicleType) {
    const emissionTypes = {
        cargoTruck: 'GASOLINE',
        car: 'ELECTRIC',
        van: 'GASOLINE',
        motorcycle: 'GASOLINE',
        bus: 'GASOLINE', // Adjust as needed based on your fleet
    };

    return emissionTypes[vehicleType] || 'GASOLINE'; // Default to GASOLINE if not explicitly mapped
}

// Get toll info for vehicle via google routes API
async function getTollInfo(dropoff_countrycode, from, to, vehicleType = "") {
    try {
        // const apiKey = 'YOUR_API_KEY'; // Replace with your Google Maps Platform API key
        const headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': google_api_key,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.travelAdvisory.tollInfo,routes.legs.travelAdvisory.tollInfo',
        };
        const requestBody = {
            origin: { location: { latLng: { latitude: from.latitude, longitude: from.longitude, } } },
            destination: { location: { latLng: { latitude: to.latitude, longitude: to.longitude } } },
            travelMode: 'DRIVE', // Toll information not available for TRANSIT currently
            languageCode: "en-US",
            extraComputations: ['TOLLS'],
            routeModifiers: {
                // vehicleInfo: {
                //     emissionType: getEmissionTypeForVehicle(vehicleType), weight: { kilograms: 3500, },
                // },
                tollPasses: await getTollPasses(dropoff_countrycode), // Adjust based on regions
            },
        };
        const response = await axios.post('https://routes.googleapis.com/directions/v2:computeRoutes', requestBody, { headers });
        const tollPrice = await getTollPrice(response.data);
        if (tollPrice) {
            console.log('Estimated toll price:', tollPrice.currencyCode, tollPrice.price);
            return tollPrice || {};
        } else { console.log('Toll information not available for this route.'); return {}; }
    } catch (error) { console.error('Error fetching toll information:', error); return {}; }
}

// Get toll price from response
async function getTollPrice(apiResponse) {
    try {
        // Find toll information from overall route or individual legs
        const tollInfo =
            apiResponse.routes[0]?.travelAdvisory?.tollInfo ||
            apiResponse.routes[0]?.legs?.find((leg) => leg?.travelAdvisory?.tollInfo)?.travelAdvisory.tollInfo;

        // Handle cases where toll information might be missing
        if (!tollInfo) {
            return null; // Or handle the absence of toll info as needed
        }

        // Extract price details, handling potential variations in response structure 
        const priceEstimate = tollInfo.estimatedPrice[0];
        const currencyCode = priceEstimate.currencyCode;
        const units = Number(priceEstimate.units) || 0;
        const nanos = priceEstimate.nanos || 0; // Assign 0 if nanos is missing

        const totalPrice = (nanos > 0) ? ((Number(units) + Number(nanos)) / 100000000).toFixed(2) : units;
        return { currencyCode, price: totalPrice.toFixed(2) };
    } catch (error) {
        console.log('error: ', error);
        return null;
    }
}

// Get country-wise toll passes list
async function getTollPasses(country_code) {
    try {
        if (isEmpty(country_code)) { return []; }
        const tollPasses = {
            'AU': ['AU_ETOLL_TAG', 'AU_EWAY_TAG', 'AU_LINKT'],
            'IN': ['IN_FASTAG', 'IN_LOCAL_HP_PLATE_EXEMPT'],
        };
        return tollPasses[country_code.toUpperCase()] || [];
    } catch (error) {
        console.log('error: ', error);
        return [];
    }
}

// Get distance using google distance matrix api
exports.getDistance_Old = async (origin, destination, veh_cat) => {
    try {
        let travelmode = "&travelMode=driving";
        if (!isEmpty(veh_cat) && veh_cat == "motorcycle") { travelmode = "&travelMode=bicycling"; }
        else if (!isEmpty(veh_cat) && veh_cat == "bus") { travelmode = "&travelMode=transit&transit_mode=bus"; }

        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?key=${google_api_key}&origins=${origin}&destinations=${destination}${travelmode}`;

        const response = await axios.get(url);
        if (!isEmpty(response?.data) && response?.data?.status == "OK") {
            const data = response.data.rows[0].elements[0];
            console.log(`Distance: ${data.distance.text}`);
            console.log(`Duration: ${data.duration.text}`);
            return data || {};
        } else { return {}; }

    } catch (error) {
        console.log(error);
        return {};
    }
};

// Get distance using google distance matrix api
exports.getDistance = async (origin, destinations) => {
    try {
        if (origin?.length <= 0 && destinations?.length <= 0) { return []; }
        const limit = constant.MAX_ADDR_LIMIT || 25; // Maximum origins/destinations per request
        let allResults = [];

        // Split request as it allow Maximum 25 origins/destinations per request
        for (let i = 0; i < destinations.length; i += limit) {
            const subDestinations = destinations.slice(i, i + limit);
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${subDestinations.join('|')}&key=${google_api_key}&travelMode=driving`;

            const response = await axios.get(url);
            if (!isEmpty(response?.data) && response?.data?.status == "OK") {
                const elements = response?.data?.rows[0].elements;
                allResults.push(elements);
            }
        }
        allResults = allResults.flat();
        return allResults;
    } catch (error) {
        console.log(error);
        return [];
    }
};

// Get fare price list with commisions and taxes
async function getFarePriceList(company_id, req_item) {
    try {
        if (isEmpty(company_id)) return "";

        const comp_details = await db.CompanyDetail.findOne({ where: { company_id: company_id, is_deleted: 0, enable: 1 }, attributes: ["fare_setting_id"], raw: true });
        console.log('comp_details.fare_setting_id: ', comp_details.fare_setting_id);

        let data = {};
        if (!isEmpty(comp_details) && !isEmpty(comp_details.fare_setting_id)) {

            const faresett_id_arr = comp_details.fare_setting_id.split(",");
            where_str = {
                company_id: company_id, is_deleted: 0, enable: 1, id: { [Op.in]: faresett_id_arr }, vehicle_cat_id: req_item.vehicle_cat_id, country_id: req_item.dropoff_country,
                [Op.and]: [
                    { [Op.or]: [{ state_id: req_item?.dropoff_state || null }, { state_id: { [Op.is]: null } }] },
                    { [Op.or]: [{ city: { [Op.iLike]: req_item.dropoff_city } || null }, { city: "" }] },
                ]
            }
            const fare_res = await db.FareSetting.findAll({ where: where_str, attributes: ["id", "country_id", "state_id", "city"], raw: true });

            let city_fareid, state_fareid, country_fareid, final_fareid = "";
            fare_res.map(async (val) => {
                if (val.city.toLowerCase() == req_item.dropoff_city.toLowerCase()) { city_fareid = val.id; }
                if (val.state_id == req_item.dropoff_state) { state_fareid = val.id; }
                if (val.country_id == req_item.dropoff_country) { country_fareid = val.id; }
            })
            if (!isEmpty(city_fareid)) { final_fareid = city_fareid; }
            if (!isEmpty(state_fareid) && isEmpty(final_fareid)) { final_fareid = state_fareid; }
            if (!isEmpty(country_fareid) && isEmpty(final_fareid)) { final_fareid = country_fareid; }

            console.log('c_fid=>', city_fareid, "::s_fid=>", state_fareid, "::cntry_fid=>", country_fareid, "::f_fid=>", final_fareid);

            if (!isEmpty(final_fareid)) {
                data = await db.FareSetting.findOne({ where: { id: final_fareid }, attributes: ["id", "category_name", "currency_id", "vehicle_cat_id"], raw: true });
                const tmp_other_data = await db.FareDetail.findAll({ where: { fare_id: final_fareid, is_deleted: 0, enable: 1 }, attributes: ["id", "delivery_type", "base_price", "per_km_charge", "min_charge", "per_km_time"], raw: true });
                const fare_pricedata = await Promise.all(
                    tmp_other_data.map(async (val) => {
                        const fare_comm_data = await db.FareCommission.findAll({ where: { fare_id: final_fareid, fare_detail_id: val.id, is_deleted: 0, enable: 1 }, attributes: ["id", "commission_title", "amount", "type"], raw: true });
                        val.fareprice_commissions = fare_comm_data;
                        return val;
                    })
                );
                const fare_taxdata = await db.FareTax.findAll({ where: { fare_id: final_fareid, is_deleted: 0, enable: 1 }, attributes: ["id", "amount", "type", "tax_label"], raw: true });

                data.fare_prices = fare_pricedata;
                data.fare_taxes = fare_taxdata;
            }
            return data;
        }
        return data;

    } catch (error) {
        console.log('error: ', error);
        return "";
    }
}

// Calculate fare price for job creation
exports.calculateFarePrice = async (company_id, req_item, dis_res) => {
    // console.log('req_item: ', req_item.from.latitude); return
    try {
        const total_km = parseInt(dis_res[0].distance.value) / parseInt(1000); //ex. 57812/1000
        const tmp_res = await getFarePriceList(company_id, req_item);

        final_farepricedata = [];
        if (tmp_res?.fare_prices?.length > 0) {

            const tollinfo = await getTollInfo(req_item.dropoff_countrycode, req_item.from, req_item.to) || 0;
            console.log('tollinfo: ', tollinfo);

            final_farepricedata = await Promise.all(
                tmp_res.fare_prices?.map(async (val) => {

                    let perkm_charge = Math.round(val.per_km_charge);
                    let base_charge = Math.round(val.base_price);
                    let min_charge = Math.round(val.min_charge);
                    let perkm_time = val.per_km_time;
                    let dr_payout_type, cmp_comm_type;
                    let job_charges, total_fare_cost, cmp_comm_chrg, cmp_comm_amt, dr_payout, dr_payout_amt, total_tax_amt = 0;

                    dr_payout = Math.round(80).toFixed(2);
                    dr_payout_type = "percent";
                    cmp_comm_chrg = Math.round(5).toFixed(2);
                    cmp_comm_type = "percent";
                    /*val.fareprice_commissions?.map(async (comm_val) => {
                        dr_payout = 80;
                        dr_payout_type = "percent";
                        cmp_comm_chrg = 5;
                        cmp_comm_type = "percent";
                    });*/

                    // let timing = Math.round((total_km * perkm_time) * 60).toFixed(2);
                    // esti_time = await getDurationFromSeconds(timing);
                    esti_time = dis_res[0].duration.text || "";

                    let fare_cost = perkm_charge * total_km;
                    job_charges = base_charge + fare_cost;
                    if (job_charges < min_charge) { job_charges = min_charge; }
                    job_charges = Math.round(job_charges).toFixed(2);

                    /* Calculation : Driver payout */
                    if (dr_payout > 0 && dr_payout_type == 'percent') { dr_payout_amt = Math.round((job_charges / 100) * dr_payout).toFixed(2); }
                    else if (dr_payout > 0 && dr_payout_type == 'fix') { dr_payout_amt = Math.round(dr_payout).toFixed(2); }

                    /* Calculation : Driver007 Company commision */
                    if (cmp_comm_chrg > 0 && cmp_comm_type == "percent") { cmp_comm_amt = Math.round((job_charges / 100) * cmp_comm_chrg).toFixed(2); }
                    else if (cmp_comm_chrg > 0 && cmp_comm_type == 'fix') { cmp_comm_amt = Math.round(cmp_comm_chrg).toFixed(2); }

                    /* Calculation : Taxes */
                    const tax = [];
                    tmp_res.fare_taxes?.map(async (taxval) => {
                        let amt = taxval.amount, label = taxval.tax_label, type = taxval.type;
                        if (amt > 0 && type == "percent") {
                            tax.push({ "title": `${label}(${amt}%)`, "value": Math.round((job_charges / 100) * amt, 2) });
                        } else if (amt > 0 && type == "fix") {
                            tax.push({ "title": `${label}(${amt})`, "value": Math.round(amt, 2) });
                        } else { tax.push({ "title": label, "value": 0 }); }
                    });
                    if (tax.length > 0) { total_tax_amt = tax.reduce((acc, item) => acc + item.value, 0); }
                    total_tax_amt = Math.round(total_tax_amt).toFixed(2);
                    total_fare_cost = Math.round(parseFloat(job_charges) + parseFloat(total_tax_amt) + parseFloat(tollinfo.price || 0)).toFixed(2);

                    return {
                        fare_id: tmp_res.id,
                        fareprice_id: val.id,
                        faretype: val.delivery_type,
                        currency_code: req_item.currency_code,
                        job_charges: job_charges,
                        total_fare_cost: total_fare_cost,
                        driver_payout: dr_payout_amt,
                        company_commision: cmp_comm_amt,
                        total_tax_amt: total_tax_amt,
                        toll_charge: tollinfo.price || 0,
                        tax_details: tax,
                        distance: dis_res[0]?.distance?.text || "", //total_km,
                        duration: dis_res[0]?.duration?.text || "", //esti_time,
                    }

                })
            );
        }
        // -------------------------------------------

        return final_farepricedata;
    } catch (error) {
        console.log(error);
        return {};
    }
};

// Fetched required data for to get fare price list
exports.fetchRequiredDetails = async (body) => {
    try {
        let res_arr = { statusCode: response_status_code.bad_request, type: response_type.error, data: {} };
        let comp_id = "", data = {};

        const jobaddr = await db.JobAddress.findOne({
            where: { id: body.job_address_id }, raw: true,
            attributes: ["id", "job_id", "dropoff_country_code", "dropoff_state_code", "dropoff_city", "dropoff_latitude", "dropoff_longitude", "pickup_latitude", "pickup_longitude"]
        });
        if (isEmpty(jobaddr)) { res_arr.statusCode = response_status_code.not_found; res_arr.message = response_msg.jobaddr_not_found; return res_arr; }

        const job_data = await db.JobMaster.findOne({ where: { id: jobaddr.job_id }, attributes: ["company_id"], raw: true });
        const country = await db.Country.findOne({ where: { code: { [Op.iLike]: jobaddr.dropoff_country_code } }, raw: true });
        const state = await db.State.findOne({ where: { country_code: { [Op.iLike]: jobaddr.dropoff_country_code }, state_code: { [Op.iLike]: jobaddr.dropoff_state_code } }, raw: true }).then((res) => res.id);
        const veh_data = await db.Vehicle.findOne({ where: { id: body.vehicle_id }, attributes: ["vehicle_cat_id"], raw: true, nest: true, include: [{ model: db.VehicleCategory, as: "vehicle_cat_detail", attributes: ["name"] }] });


        if (!isEmpty(job_data.company_id)) {
            comp_id = job_data.company_id;
        } else {
            const comp_data = await db.Company.findOne({
                where: { is_root_company: true, is_deleted: 0, enable: 1 }, attributes: ["id"], raw: true,
            });
            comp_id = comp_data ? comp_data?.id : "";
        }

        data = {
            vehicle_cat_id: veh_data.vehicle_cat_id || "",
            vehicle_cat: veh_data.vehicle_cat_detail.name.toLowerCase() || "",
            dropoff_city: jobaddr.dropoff_city || "",
            dropoff_state: state || "",
            dropoff_country: country.id || "",
            dropoff_countrycode: jobaddr.dropoff_country_code || "",
            currency_code: country.currency_code || "",
            from: { latitude: jobaddr.pickup_latitude, longitude: jobaddr.pickup_longitude },
            to: { latitude: jobaddr.dropoff_latitude, longitude: jobaddr.dropoff_longitude },
            job_comp_id: comp_id || "",
        };
        res_arr.statusCode = response_status_code.success; res_arr.type = response_type.success; res_arr.data = data; return res_arr;
    }
    catch (error) {
        console.log(error);
        return { statusCode: response_status_code.internal_error, type: response_type.error, message: response_msg.catch_error, };
    }
}

exports.testFun = async () => {
    try {
        const to_countrycode = "INR";
        const from = { latitude: 22.4536868908282, longitude: 70.01102982880144 }
        const to = { latitude: 23.02479635851749, longitude: 72.5075951313002 }
        // const to_countrycode = "AU";
        // const from = { latitude: -33.63311372212195, longitude: 150.76298980133348 }
        // const to = { latitude: -33.96861736428797, longitude: 151.10905914116327 }
        await getTollInfo(to_countrycode, from, to);
    }
    catch (error) {
        console.log(error);
        return {};
    }
}

exports.getMultipleRouteDistance = async () => {
    try {
        // const origin = ["23.02053514405835, 72.5042824116619"];
        // const destination = ["23.015013470518735, 72.50422767037844", "23.005044865047406, 0.0000000"]
        // const destination = ["23.015013470518735, 72.50422767037844", "23.005044865047406, 72.50144526914683", "23.013211955155004, 72.50598772279804",]

        const origin = '23.02053514405835, 72.5042824116619'; // Single origin
        const userdata = [
            { "user_id": 1, "fromLatLong": origin, "toLatLong": "23.015013470518735,72.50422767037844" },
            { "user_id": 2, "fromLatLong": origin, "toLatLong": "23.005044865047406, 72.50144526914683" },
            { "user_id": 3, "fromLatLong": origin, "toLatLong": "23.005044865047406, 0.00000" },
            { "user_id": 4, "fromLatLong": origin, "toLatLong": "23.013211955155004, 72.50598772279804" },
            { "user_id": 5, "fromLatLong": origin, "toLatLong": "23.09087280890044, 72.62699428567566" },
            { "user_id": 6, "fromLatLong": origin, "toLatLong": "23.074449316616125, 72.6829558932937" },
            { "user_id": 7, "fromLatLong": origin, "toLatLong": "23.020747818285038, 72.50511560878803" },
        ];
        const destinations = userdata.map((user) => user.toLatLong); // Extract destinations 

        let travelmode = "&travelMode=driving";
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?key=${google_api_key}&origins=${origin}&destinations=${destinations.join('|')}${travelmode}`;

        const response = await axios.get(url);
        const closeUsers = [];

        console.log('rows: ', response?.data?.destination_addresses);

        if (!isEmpty(response?.data) && response?.data?.status == "OK") {
            const elements = response?.data?.rows[0]?.elements;

            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                if (element.status == "OK") {
                    // const distance = element.distance.text;
                    // const duration = element.duration.text;
                    console.log(`Distance: ${element.distance.text}, Duration: ${element.duration.text}`);
                    if (element.distance.value > 1000) { // greater than 1km
                        closeUsers.push({
                            user_id: userdata[i].user_id,
                            distance: element.distance.text,
                        });
                    }
                } else { console.log("******Not able to get distance******"); }
            }
        }
        console.log('List of users within 50 km:');
        console.table(closeUsers);
        return

        /*
        console.log('response.data: ', response?.data);
        if (!isEmpty(response?.data) && response?.data?.status == "OK") {
            const elements = response?.data?.rows[0]?.elements;
    
            for (const element of elements) {
                console.log('element: ', element);
                if (element.status == "OK") {
                    // const distance = element.distance.text;
                    // const duration = element.duration.text;
                    // console.log(`Distance: ${element.distance.text}, Duration: ${element.duration.text}`);
                } else {
    
                }
            }
            const data = response.data.rows;
            return data || {};
        } else { return {}; }
        */

    } catch (error) {
        console.log(error);
        return {};
    }
};

exports.saveDriverLocation = async (updt_data) => {
    try {
        console.log('updt_data: ', updt_data);
        if (!isEmpty(updt_data.driver_id) && !isEmpty(updt_data.latitude) && !isEmpty(updt_data.longitude)) {
            const new_Data = { curr_location_lat: updt_data.latitude, curr_location_long: updt_data.longitude };
            await db.Driver.update(new_Data, { where: { id: updt_data.driver_id } });
        }
        return true;

    } catch (error) {
        console.log(error);
        return false;
    }
};