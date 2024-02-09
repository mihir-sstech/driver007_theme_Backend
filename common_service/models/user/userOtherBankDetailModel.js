const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const UserOtherBankDetail = authDB.define(
    "user_other_bank_details",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        driver_id: {
            type: DataTypes.INTEGER
        },
        country_id: {
            type: DataTypes.INTEGER,
        },
        user_bank_detail_id: {
            type: DataTypes.INTEGER,
            comment: "reference id of user_bank_details table"
        },
        bankfield_id: {
            type: DataTypes.INTEGER,
            comment: "reference id of dynamic_bank_acc_field table"
        },
        bankfield_value: {
            type: DataTypes.TEXT,
            allowNull: false,
            trim: true,
            defaultValue: ""
        },
        enable: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        created_by: {
            type: DataTypes.INTEGER,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
        is_deleted: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
    },
    {
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [{
            fields: ["is_deleted", "enable", "country_id", "user_bank_detail_id", "bankfield_id"],
        }],
    }
);

// Table field assiciations  
UserOtherBankDetail.belongsTo(require("../dynamic_fields/bankFieldsModel"), {
    as: "bankfield_detail",
    foreignKey: "bankfield_id",
});

// UserOtherBankDetail.sync({ alter: true })
module.exports = UserOtherBankDetail;