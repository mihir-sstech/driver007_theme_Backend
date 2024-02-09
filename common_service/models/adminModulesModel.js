const { DataTypes } = require("sequelize");
const authDB = require("../config/authDb");

const AdminModules = authDB.define(
    "admin_modules",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            trim: true,
        },
        superadmin_access: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
        },
        deleted_at: {
            type: DataTypes.DATE,
        },
        enable: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        created_by: {
            type: DataTypes.INTEGER,
        },
        updated_by: {
            type: DataTypes.INTEGER,
        },
        deleted_by: {
            type: DataTypes.INTEGER,
        },
    },
    {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);
// AdminModules.sync({ alter: true })
module.exports = AdminModules;
