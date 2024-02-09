const { DataTypes } = require("sequelize");
const jobDB = require("../../config/jobDb");
const JobCharge = jobDB.define(
    "job_charge",
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
        fare_id: {
            type: DataTypes.INTEGER,
            comment: "Reference Id of setting_fareprice table",
        },
        fareprice_id: {
            type: DataTypes.INTEGER,
            comment: "Reference Id of setting_fareprice_details table",
        },
        faretype: {
            type: DataTypes.STRING(70),
            trim: true,
            defaultValue: "",
        },
        currency_code: {
            type: DataTypes.STRING(6),
            trim: true,
            defaultValue: "",
        },
        job_charges: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: "0.00",
        },
        total_fare_cost: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: "0.00",
            comment: "Total job charge including all taxes"
        },
        driver_payout: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: "0.00",
        },
        company_commision: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: "0.00",
            comment: "driver007 commission"
        },
        toll_charge: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: "0.00",
        },
        total_tax_amt: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: "0.00",
        },
        tax_details: {
            type: DataTypes.TEXT,
            trim: true,
            defaultValue: "",
        },
        distance: {
            type: DataTypes.STRING(200),
            trim: true,
            defaultValue: "",
            comment: "Distance between Pickup & Dropoff location",
        },
        duration: {
            type: DataTypes.STRING(50),
            trim: true,
            defaultValue: "",
            comment: "Time duration to reach from pickup to drop off location",
        },
        created_by: {
            type: DataTypes.INTEGER,
        },
        updated_by: {
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
    },
    {
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [{
            fields: ["job_id", "job_address_id"],
        }],
    }
);

// Table field assiciations 
JobCharge.belongsTo(require("../job/jobMasterModel"), {
    foreignKey: "job_id",
    as: "job_detail",
});
JobCharge.belongsTo(require("../job/jobAddressModel"), {
    foreignKey: "job_address_id",
    as: "job_address_detail",
});

// JobCharge.sync({ alter: true })
module.exports = JobCharge;