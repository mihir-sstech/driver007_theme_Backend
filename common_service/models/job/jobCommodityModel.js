const { DataTypes } = require("sequelize");
const jobDB = require("../../config/jobDb");
const JobCommodity = jobDB.define(
    "job_commodity",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        job_id: {
            type: DataTypes.INTEGER,
            comment: "Reference id of job_master table"
        },
        item_sku: {
            type: DataTypes.STRING(100),
            trim: true,
            comment: "Item SKU",
        },
        units: {
            type: DataTypes.STRING(50),
            trim: true,
            defaultValue: "",
            comment: "Item Units",
        },
        unit_value: {
            type: DataTypes.STRING(50),
            trim: true,
            defaultValue: "",
        },
        unit_kg: {
            type: DataTypes.STRING(50),
            trim: true,
            defaultValue: "",
            comment: "Unit in KG",
        },
        origin_country_code: {
            type: DataTypes.STRING(5),
            trim: true,
            comment: "Origin country code",
        },
        currency_code: {
            type: DataTypes.STRING(5),
            trim: true,
            comment: "Currency code"
        },
        harmonized_code: {
            type: DataTypes.STRING(100),
            trim: true,
            defaultValue: "",
            comment: "Harmonized Code",
        },
        description: {
            type: DataTypes.TEXT,
            trim: true,
            defaultValue: "",
        },
        enable: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            defaultValue: 0
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
    },
    {
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [{
            fields: ["is_deleted", "enable", "job_id", "item_sku"],
        }],
    }
);

// Table field assiciations 

JobCommodity.belongsTo(require("../job/jobMasterModel"), {
    foreignKey: "job_id",
    as: "job_detail",
});
// JobCommodity.sync({ alter: true })
module.exports = JobCommodity;