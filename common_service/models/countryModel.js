const { DataTypes } = require("sequelize");
const authDB = require("../config/authDb");

const Country = authDB.define(
    "country",
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
        code: {
            type: DataTypes.STRING(10),
            allowNull: false,
            trim: true,
        },
        iso3: {
            type: DataTypes.STRING(10),
            allowNull: false,
            trim: true,
        },
        calling_code: {
            type: DataTypes.STRING(50),
            allowNull: true,
            trim: true,
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
        indexes: [{
            fields: ["code"],
        }],
    }
);

// Country.sync({ alter: true });
module.exports = Country;
