
const { response_msg, response_status_code, response_type, response_success } = require("../statics/static.json");
const { isEmpty } = require("../utils/utils");
const { Op } = require("sequelize");
const db = require("../models/index");

// get country list for dropdown
exports.getCountryList = async (request) => {

    try {
        const country_data = await db.Country.findAll({
            where: { is_deleted: 0, enable: 1 }, attributes: ["id", "name", "code", "calling_code"], order: [['name', 'ASC']], raw: true
        })
        return {
            success: response_success.true,
            statusCode: response_status_code.success,
            type: response_type.success,
            message: response_msg.get_country_list,
            data: country_data
        };
    } catch (error) {
        console.log(error);
        return {
            success: response_success.false,
            statusCode: response_status_code.internal_error,
            type: response_type.error,
            message: response_msg.catch_error,
            data: []
        };
    }
};

// get state list for dropdown
exports.getStateList = async (request) => {
    // const { id } = request.params;
    const { country_id, country_code } = request.body;

    try {
        // if (isEmpty(id)) {
        //     return {
        //         success: response_success.false,
        //         statusCode: response_status_code.bad_request,
        //         type: response_type.error,
        //         message: response_msg.blank_country_id,
        //         data: []
        //     };
        // }

        let where_str = {};
        if (!isEmpty(country_id)) { where_str.country_id = country_id; }
        if (!isEmpty(country_code)) { where_str.country_code = { [Op.iLike]: country_code }; }
        if (isEmpty(where_str)) {
            return {
                success: response_success.false, statusCode: response_status_code.bad_request, type: response_type.error,
                message: "Missing required parameter to fetch state lists", data: []
            };
        }
        const state_data = await db.State.findAll({ where: { is_deleted: 0, enable: 1, ...where_str }, attributes: ["id", "name", "state_code"], order: [['name', 'ASC']], raw: true })
        return {
            success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: response_msg.get_state_list,
            data: state_data
        };
    } catch (error) {
        console.log(error);
        return {
            success: response_success.false,
            statusCode: response_status_code.internal_error,
            type: response_type.error,
            message: response_msg.catch_error,
            data: []
        };
    }
};

// get city list for dropdown
exports.getCityList = async (request) => {
    const { id } = request.params;

    try {
        if (isEmpty(id)) {
            return {
                success: response_success.false,
                statusCode: response_status_code.bad_request,
                type: response_type.error,
                message: response_msg.blank_state_id,
                data: []
            };
        }
        const city_data = await db.City.findAll({ where: { is_deleted: 0, enable: 1, state_id: id }, attributes: ["id", "name"], order: [['name', 'ASC']], raw: true })
        return {
            success: response_success.true,
            statusCode: response_status_code.success,
            type: response_type.success,
            message: response_msg.get_city_list,
            data: city_data
        };
    } catch (error) {
        console.log(error);
        return {
            success: response_success.false,
            statusCode: response_status_code.internal_error,
            type: response_type.error,
            message: response_msg.catch_error,
            data: []
        };
    }
};

// get currency list for dropdown
exports.getCurrencyDropdown = async (request) => {

    try {
        const currency_data = await db.Currency.findAll({ where: { is_deleted: 0, enable: 1 }, attributes: ["id", "currency_code"], order: [['currency_code', 'ASC']], raw: true })
        return {
            success: response_success.true,
            statusCode: response_status_code.success,
            type: response_type.success,
            message: response_msg.get_currency_list,
            data: currency_data
        };
    } catch (error) {
        console.log(error);
        return {
            success: response_success.false,
            statusCode: response_status_code.internal_error,
            type: response_type.error,
            message: response_msg.catch_error,
            data: []
        };
    }
};

// get Weight Units for dropdown
exports.getWeightUnits = async (request) => {

    try {
        const data = await db.WeightUnits.findAll({ where: { is_deleted: 0, enable: 1 }, attributes: ["id", "unit_name"], order: [['unit_name', 'ASC']], raw: true })
        return {
            success: response_success.true,
            statusCode: response_status_code.success,
            type: response_type.success,
            message: response_msg.get_weightunit_list,
            data: data
        };
    } catch (error) {
        console.log(error);
        return {
            success: response_success.false,
            statusCode: response_status_code.internal_error,
            type: response_type.error,
            message: response_msg.catch_error,
            data: []
        };
    }
};

// get Input field types for dropdown
exports.getInputFieldTypes = async (request) => {

    try {
        const data = await db.InputFieldTypes.findAll({ where: { is_deleted: 0, enable: 1 }, attributes: ["id", "type"], order: [['type', 'ASC']], raw: true });
        return {
            success: response_success.true,
            statusCode: response_status_code.success,
            type: response_type.success,
            message: response_msg.get_fieldtype_list,
            data: data
        };
    } catch (error) {
        console.log(error);
        return {
            success: response_success.false,
            statusCode: response_status_code.internal_error,
            type: response_type.error,
            message: response_msg.catch_error,
            data: []
        };
    }
};

// get Input field types for dropdown
exports.getVehicleDocsList = async (request) => {

    try {
        const data = await db.VehicleDocuments.findAll({ where: { is_deleted: 0, enable: 1 }, attributes: ["id", "name"], order: [['name', 'ASC']], raw: true });
        return {
            success: response_success.true,
            statusCode: response_status_code.success,
            type: response_type.success,
            message: response_msg.get_vehicledocs_list,
            data: data
        };
    } catch (error) {
        console.log(error);
        return {
            success: response_success.false,
            statusCode: response_status_code.internal_error,
            type: response_type.error,
            message: response_msg.catch_error,
            data: []
        };
    }
};

// get Next Driver Code
exports.getNextDriverCode = async () => {
    try {
        const prefix = "DVR";
        var driver_code = prefix + "00000001";
        const maxCompanyCode = await db.Driver.max('driver_code');
        if (!isEmpty(maxCompanyCode)) {
            let result = maxCompanyCode.replace(prefix, "");
            const incrementValue1 = parseInt(result) + 1;
            const nextCode = `${prefix}${String(incrementValue1).padStart(result.length, '0')}`;
            driver_code = nextCode;
        }
        return driver_code;
    } catch (error) {
        console.log('error: ', error);
        return "";
    }
}

// get Next User Code
exports.getNextUserCode = async () => {

    try {
        const prefix = "USR";
        var user_code = prefix + "00000001";
        const maxCompanyCode = await db.Users.max('user_code');
        if (!isEmpty(maxCompanyCode)) {
            let result = maxCompanyCode.replace(prefix, "");
            const incrementValue1 = parseInt(result) + 1;
            const nextCode = `${prefix}${String(incrementValue1).padStart(result.length, '0')}`;
            user_code = nextCode;
        }
        return user_code;
    } catch (error) {
        console.log('error: ', error);
        return "";
    }

}

// get Next Job Id
exports.getNextJobId = async (company_id) => {
    try {
        const comp_prefix = await db.Company.findOne({ where: { id: company_id }, attributes: ["company_prefix"], raw: true });
        const prefix = comp_prefix.company_prefix || "";
        var latest_id = prefix + "100001";
        const maxCompanyCode = await db.JobMaster.max('job_id');
        if (!isEmpty(maxCompanyCode)) {
            let numericValue = maxCompanyCode.replace(/\D/g, '');
            const incrementValue1 = parseInt(numericValue) + 1;
            const nextCode = `${prefix}${String(incrementValue1).padStart(numericValue.length, '0')}`;
            latest_id = nextCode;
        }
        return latest_id;
    } catch (error) {
        console.log('error: ', error);
        return "";
    }
}

// get company-wise paymentmode list
exports.getPaymentmode = async (company_id) => {
    try {
        if (isEmpty(company_id)) return "";
        const comp_details = await db.CompanyDetail.findOne({ where: { company_id: company_id, is_deleted: 0, enable: 1 }, attributes: ["company_payment_mode"], raw: true });

        let data = [];
        if (!isEmpty(comp_details) && !isEmpty(comp_details.company_payment_mode)) {
            let tmp_str = comp_details.company_payment_mode;
            tmp_str = tmp_str.split(",");
            data = await Promise.all(
                tmp_str.map(async (val) => {
                    let name_str = "";
                    if (val == 1) { name_str = "Pre-Paid(Wallet)"; }
                    else if (val == 2) { name_str = "Online"; }
                    else if (val == 3) { name_str = "Cash"; }
                    return { id: val, name: name_str };
                })
            )
        }

        return { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: response_msg.details_get, data: data };

    } catch (error) {
        console.log('error: ', error);
        return { success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: response_msg.catch_error, data: [] };
    }
}

// get company-wise allow driver types
exports.getAllowDriverTypes = async (company_id) => {
    try {
        if (isEmpty(company_id)) return "";
        const comp_details = await db.CompanyDetail.findOne({ where: { company_id: company_id, is_deleted: 0, enable: 1 }, attributes: ["allow_driver"], raw: true });

        var data = [{ 'id': 1, 'type': 'Company Driver' }, { 'id': 2, 'type': 'Freelance Driver' }];
        if (comp_details?.allow_driver == 1) { data = [{ 'id': 1, 'type': 'Company Driver' }]; }
        else if (comp_details?.allow_driver == 2) { data = [{ 'id': 2, 'type': 'Freelance Driver' }]; }

        return { success: response_success.true, statusCode: response_status_code.success, type: response_type.success, message: response_msg.details_get, data: data };

    } catch (error) {
        console.log('error: ', error);
        return { success: response_success.false, statusCode: response_status_code.internal_error, type: response_type.error, message: response_msg.catch_error, data: [] };
    }
}

exports.getCountryDetails = async (where, attr_arr) => {
    try {
        if (isEmpty(where)) return "";
        const res_data = await db.Country.findOne({ where: where, attributes: attr_arr, raw: true, });
        return res_data;

    } catch (error) {
        console.log('error: ', error);
        return {};
    }
}

exports.getStateDetails = async (where, attr_arr) => {
    try {
        if (isEmpty(where)) return "";
        const res_data = await db.State.findOne({ where: where, attributes: attr_arr, raw: true, });
        return res_data;

    } catch (error) {
        console.log('error: ', error);
        return {};
    }
}
