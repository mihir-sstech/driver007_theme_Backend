const { DataTypes } = require("sequelize");
const authDB = require("../config/authDb");

const City = authDB.define(
    "city",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        state_id: {
            type: DataTypes.INTEGER,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            trim: true,
            defaultValue: "",
        },
        post_code: {
            type: DataTypes.STRING(30),
            allowNull: true,
            trim: true,
            defaultValue: "",
        },
        region: {
            type: DataTypes.STRING,
            allowNull: false,
            trim: true,
            defaultValue: "",
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

// City.sync({ alter: true });
module.exports = City;
