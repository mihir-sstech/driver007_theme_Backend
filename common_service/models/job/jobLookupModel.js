const { DataTypes } = require("sequelize");
const jobDB = require("../../config/jobDb");
const JobLookup = jobDB.define(
    "job_lookup",
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
        job_address_id: {
            type: DataTypes.INTEGER,
            comment: "Reference of Job Address Table",
        },
        job_package_id: {
            type: DataTypes.INTEGER,
            comment: "Reference of Job Package Table",
        },
        job_commodity_id: {
            type: DataTypes.INTEGER,
            comment: "Reference of Job Commodity Table",
        },
        barcode: {
            type: DataTypes.TEXT,
            trim: true,
            defaultValue: "",
            comment: "Package Barcode"
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
            fields: ["is_deleted", "job_id", "job_address_id", "job_package_id", "job_commodity_id"],
        }],
    }
);

// Table field assiciations 
JobLookup.belongsTo(require("../job/jobMasterModel"), {
    foreignKey: "job_id",
    as: "job_detail",
});
JobLookup.belongsTo(require("../job/jobAddressModel"), {
    foreignKey: "job_address_id",
    as: "job_address_detail",
});
JobLookup.belongsTo(require("../job/jobPackageModel"), {
    foreignKey: "job_package_id",
    as: "job_package_detail",
});
JobLookup.belongsTo(require("../job/jobCommodityModel"), {
    foreignKey: "job_commodity_id",
    as: "job_commodity_detail",
});
// JobLookup.sync({ alter: true })
module.exports = JobLookup;