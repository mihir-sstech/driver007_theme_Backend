const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const UserBankDetail = authDB.define(
    "user_bank_details",
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
        company_id: {
            type: DataTypes.INTEGER,
        },
        acc_holder_name: {
            type: DataTypes.STRING(200),
            trim: true,
            defaultValue: "",
            comment: "Account holder name",
        },
        acc_number: {
            type: DataTypes.STRING(50),
            defaultValue: "",
        },
        ifsc_code: {
            type: DataTypes.STRING(25),
            defaultValue: "",
        },
        bank_name: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        branch_name: {
            type: DataTypes.STRING(50),
            trim: true,
            defaultValue: "",
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
            fields: ["is_deleted", "enable", "user_id"],
        }],
    }
);

// Table field assiciations 
UserBankDetail.belongsTo(require("./userModel"), {
    foreignKey: "user_id",
    as: "user_detail",
});
UserBankDetail.belongsTo(require("../company/companyModel"), {
    as: "company_detail",
    foreignKey: "company_id",
});
UserBankDetail.belongsTo(require("../driver/driverModel"), {
    as: "driver_detail",
    foreignKey: "driver_id",
});

// UserBankDetail.sync({ alter: true })
module.exports = UserBankDetail;