const { DataTypes } = require("sequelize");
const authDB = require("../config/authDb");

const Currency = authDB.define(
    "currency",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        currency: {
            type: DataTypes.STRING(50),
            trim: true,
        },
        currency_code: {
            type: DataTypes.STRING(50),
            trim: true,
        },
        currency_symbol: {
            type: DataTypes.STRING(10),
            trim: true,
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
    },
    {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = Currency;
