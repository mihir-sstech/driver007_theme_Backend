const { DataTypes } = require("sequelize");
const authDB = require("../config/authDb");

const State = authDB.define(
    "state",
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
        state_code: {
            type: DataTypes.STRING(10),
        },
        country_code: {
            type: DataTypes.STRING(10),
        },
        country_id: {
            type: DataTypes.INTEGER,
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
            fields: ["state_code", "country_code", "country_id"],
        }],
    }
);

// State.sync({ alter: true })
module.exports = State;
