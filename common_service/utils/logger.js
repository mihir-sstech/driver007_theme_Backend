
const { createLogger, format, transports } = require("winston");
const fs = require('fs');
const path = require('path');
const level = "debug";

// Ensure the log directory exists
const logDirectory = 'logs'; // Directory where log files will be stored
if (!fs.existsSync(logDirectory)) { fs.mkdirSync(logDirectory); }

const today = new Date();
const logErrFileName = `error_${today.getDate()}${today.getMonth() + 1}${today.getFullYear()}.log`; // Define log file name based on the date
const logCombFileName = `combine_${today.getDate()}${today.getMonth() + 1}${today.getFullYear()}.log`; // Define log file name based on the date

const removeColorCodes = (msg) => {
    return msg.replace(/\x1B\[[0-9;]*m/g, '');
};
function formatParams(info) {
    const { timestamp, level, message, ...args } = info;
    const ts = timestamp.slice(0, 19).replace("T", " ");
    return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, "", "") : ""}`;
}
const developmentFormat = format.combine(
    format.colorize(), // Add colors to the console output
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss z" }), // Add timestamps to log entries with custom format
    format.align(),
    format.printf(formatParams)
);
const err_log_file_format = format.combine(
    format.colorize(), // Add colors to the console output
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss z" }), // Add timestamps to log entries 
    format.align(),
    format.printf((info) => { // Remove color codes from the log message
        let { timestamp, level, message, ...args } = info;
        const ts = timestamp.slice(0, 19).replace("T", " ");
        level = removeColorCodes(level);
        return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, "", "") : ""}`;
    })
);

const logTransports = [];
logTransports.push(
    new transports.Console({ format: developmentFormat }), // Log to the console
    new transports.File({ filename: path.join(logDirectory, logErrFileName), level: "error", format: err_log_file_format }), // Log error msg to a file
    new transports.File({ filename: path.join(logDirectory, logCombFileName), format: err_log_file_format })
);

// Define the logger
const logger = createLogger({
    level: level,
    format: developmentFormat,
    transports: logTransports,
});


module.exports = logger;
