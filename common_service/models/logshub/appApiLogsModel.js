const { DataTypes } = require('sequelize');
const logDB = require('../../config/logDb');

const AppApiLog = logDB.define(
    "app_api_logs",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        method: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        url: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        request_headers: {
            type: DataTypes.TEXT,
        },
        request_body: {
            type: DataTypes.TEXT,
        },
        request_param: {
            type: DataTypes.TEXT,
        },
        request_query: {
            type: DataTypes.TEXT,
        },
        requested_ip: {
            type: DataTypes.STRING(100),
        },
        requested_by: {
            type: DataTypes.INTEGER,
        },
        response_body: {
            type: DataTypes.TEXT,
        },
        message: {
            type: DataTypes.TEXT,
        },
        status_code: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
        },
    },
    {
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [{
            fields: ["method", "url", "status_code", "type"],
        }],
    }
);

// AppApiLog.sync({ alter: true })
module.exports = AppApiLog;