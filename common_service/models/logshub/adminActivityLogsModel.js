const { DataTypes } = require('sequelize');
const logDB = require('../../config/logDb');

const adminActivityLog = logDB.define(
    "admin_activity_logs",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
        },
        type: {
            type: DataTypes.ENUM("login", "logout", "edit", "delete", "add", "view", "get"),
            trim: true,
        },
        module: {
            type: DataTypes.STRING,
            trim: true,
            lowercase: true,
        },
        old_values: {
            type: DataTypes.TEXT,
            trim: true,
        },
        new_values: {
            type: DataTypes.TEXT,
            trim: true,
            // lowercase: true,
        },
        description: {
            type: DataTypes.TEXT,
            trim: true,
        },
        req_header: {
            type: DataTypes.TEXT,
            trim: true,
        },
        req_param: {
            type: DataTypes.TEXT,
            trim: true,
        },
        req_query: {
            type: DataTypes.TEXT,
            trim: true,
        },
        req_body: {
            type: DataTypes.TEXT,
            trim: true,
        },
        res_body: {
            type: DataTypes.TEXT,
            trim: true,
        },
        res_type: {
            type: DataTypes.TEXT,
            trim: true,
        },
        status_code: {
            type: DataTypes.INTEGER,
        },
        created_at: {
            type: DataTypes.DATE,
        },
        updated_at: {
            type: DataTypes.DATE,
        },
    },
    {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
)

// adminActivityLog.sync({ alter: true })
module.exports = adminActivityLog;