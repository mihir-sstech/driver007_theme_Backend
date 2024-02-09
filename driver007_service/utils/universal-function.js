const {
    STATUS_CODE,
    MESSAGES
} = require("../constant/index");

/**
 * 
 * @param {*} req - Request Data
 * @param {*} res - Response Data
 * @param {*} code - Status Code
 * @param {*} message - Message
 * @param {*} data - Reponse Body
 */
const sendResponse = async (req, res, code, message, data) => {
    try {
        const statusCode = code || STATUS_CODE.SUCCESS;
        message = message || MESSAGES.SUCCESS;
        data = data || {};
        return res.status(statusCode).send({
            statusCode,
            status: true,
            message,
            data,
        });
    } catch (error) {
        throw error;
    }
};

/**
 *
 * @param {*} req - Request Data
 * @param {*} res - Response Data
 * @param {*} code - Status Code
 * @param {*} error - Error
 */
const sendErrorResponse = async (req, res, code, error, msg = null, data = null) => {
    try {
        const statusCode = code || STATUS_CODE.BAD_REQUEST;
        var message = (error && error.message) ? error.message : MESSAGES.INTERNAL_SERVER_ERROR;
        message = msg ? msg : message;
        data ? data : {};
        return res.status(200).send({
            status: false,
            statusCode,
            error,
            message,
            data
        });
    } catch (error) {
        throw error;
    }
}

/**
 *
 * @param {*} req - Request Data
 * @param {*} res - Response Data
 */
const sendUnauthorizedErrorResponse = async (req, res) => {
    try {
        statusCode = STATUS_CODE.UNAUTHORIZED;
        message = MESSAGES.UNAUTHORIZED;
        return res.status(STATUS_CODE.UNAUTHORIZED).send({
            status: false,
            statusCode,
            message,
            error: { message }
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @param {*} req - Request Data
 * @param {*} res - Response Data
 * @param {*} code - Status Code
 * @param {*} errorMsg - Error Message
 */
const sendCustomErrorResponse = async (req, res, code, errorMsg) => {
    try {
        statusCode = code || STATUS_CODE.BAD_REQUEST;
        message = errorMsg || APP_MESSAGES.IMPLEMENTATION_ERROR;
        return res.status(200).send({
            status: false,
            statusCode,
            message,
            error: { message }
        });
    } catch (error) {
        throw error;
    }
};

module.exports = {
    sendResponse,
    sendErrorResponse,
    sendCustomErrorResponse,
    sendUnauthorizedErrorResponse
};