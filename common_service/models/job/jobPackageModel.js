const { DataTypes } = require("sequelize");
const jobDB = require("../../config/jobDb");
const JobPackage = jobDB.define(
    "job_package",
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
        package_id: {
            type: DataTypes.INTEGER,
            comment: "Reference of Package Table which is in database-defaultdb",
        },
        item_name: {
            type: DataTypes.STRING(200),
            trim: true,
            defaultValue: "",
            comment: "Name or item",
        },
        units: {
            type: DataTypes.INTEGER,
            trim: true,
            comment: "Units",
        },
        length: {
            type: DataTypes.STRING(50),
            trim: true,
            defaultValue: "",
        },
        width: {
            type: DataTypes.STRING(50),
            trim: true,
            defaultValue: "",
        },
        height: {
            type: DataTypes.STRING(50),
            trim: true,
            defaultValue: "",
        },
        weight: {
            type: DataTypes.STRING(50),
            trim: true,
            defaultValue: "",
            comment: "Weight in KG",
        },
        barcode: {
            type: DataTypes.TEXT,
            trim: true,
            defaultValue: "",
            comment: "Package Barcode"
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
            fields: ["is_deleted", "enable", "job_id", "job_address_id"],
        }],
    }
);

// Table field assiciations 

JobPackage.belongsTo(require("../job/jobMasterModel"), {
    foreignKey: "job_id",
    as: "job_detail",
});
JobPackage.belongsTo(require("../job/jobAddressModel"), {
    foreignKey: "job_address_id",
    as: "job_address_detail",
});

// JobPackage.sync({ alter: true })
module.exports = JobPackage;