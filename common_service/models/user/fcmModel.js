const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");

const FcmToken = authDB.define(
    "fcm_tokens",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
        },
        device_type: {
            type: DataTypes.STRING(20),
        },
        fcm_token: {
            type: DataTypes.TEXT,
        },
        device_id: {
            type: DataTypes.TEXT,
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
        indexes: [
            // Index on the 'user_id' column for faster user-based lookup
            {
                fields: ["user_id"],
                name: "idx_fcm_user_id",
            },
            // Index on the 'fcm_token' column for faster token-based lookup
            {
                fields: ["fcm_token"],
                name: "idx_fcm_token",
            },
            // Composite index on 'type' and 'device_id' columns
            {
                fields: ["device_type", "device_id"],
                name: "idx_fcm_devicetype_deviceid",
            },
        ],
    }
);

FcmToken.belongsTo(require("./userModel"), {
    foreignKey: "user_id",
    as: "user_details",
});

// FcmToken.sync({ alter: true })
module.exports = FcmToken;
