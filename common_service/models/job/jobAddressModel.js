const { DataTypes } = require("sequelize");
const jobDB = require("../../config/jobDb");
const JobAddress = jobDB.define(
    "job_address",
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
        pickup_addr_title: {
            type: DataTypes.STRING(100),
            trim: true,
            defaultValue: "",
        },
        pickup_email: {
            type: DataTypes.STRING(200),
            trim: true,
            lowercase: true,
            defaultValue: "",
        },
        pickup_contact_person: {
            type: DataTypes.STRING(100),
            trim: true,
            defaultValue: "",
        },
        pickup_contact_no: {
            type: DataTypes.STRING(25),
            defaultValue: "",
        },
        pickup_building_name: {
            type: DataTypes.STRING(200),
            trim: true,
            defaultValue: "",
        },
        pickup_street_address: {
            type: DataTypes.TEXT,
            trim: true,
            defaultValue: "",
        },
        pickup_postcode: {
            type: DataTypes.STRING(10),
            trim: true,
            defaultValue: "",
        },
        pickup_city: {
            type: DataTypes.STRING(50),
            defaultValue: "",
            comment: "Value of pickup city or suburb"
        },
        pickup_state_code: {
            type: DataTypes.STRING(50),
            defaultValue: "",
        },
        pickup_country_code: {
            type: DataTypes.STRING(50),
            defaultValue: "",
        },
        pickup_latitude: {
            type: DataTypes.STRING(100),
            defaultValue: "",
        },
        pickup_longitude: {
            type: DataTypes.STRING(100),
            defaultValue: "",
        },
        pickup_pickupnotes: {
            type: DataTypes.TEXT,
            trim: true,
            defaultValue: "",
        },
        dropoff_addr_title: {
            type: DataTypes.STRING(100),
            trim: true,
            defaultValue: "",
        },
        dropoff_email: {
            type: DataTypes.STRING(200),
            trim: true,
            lowercase: true,
            defaultValue: "",
        },
        dropoff_contact_person: {
            type: DataTypes.STRING(100),
            trim: true,
            defaultValue: "",
        },
        dropoff_contact_no: {
            type: DataTypes.STRING(25),
            defaultValue: "",
        },
        dropoff_building_name: {
            type: DataTypes.STRING(200),
            trim: true,
            defaultValue: "",
        },
        dropoff_street_address: {
            type: DataTypes.TEXT,
            trim: true,
            defaultValue: "",
        },
        dropoff_postcode: {
            type: DataTypes.STRING(10),
            trim: true,
            defaultValue: "",
        },
        dropoff_city: {
            type: DataTypes.STRING(50),
            defaultValue: "",
            comment: "Value of dropoff city or suburb"
        },
        dropoff_state_code: {
            type: DataTypes.STRING(50),
            defaultValue: "",
        },
        dropoff_country_code: {
            type: DataTypes.STRING(50),
            defaultValue: "",
        },
        dropoff_latitude: {
            type: DataTypes.STRING(100),
            defaultValue: "",
        },
        dropoff_longitude: {
            type: DataTypes.STRING(100),
            defaultValue: "",
        },
        dropoff_delivery_notes: {
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
            fields: ["is_deleted", "enable", "job_id"],
        }],
    }
);

// Table field assiciations 
JobAddress.belongsTo(require("../job/jobMasterModel"), {
    foreignKey: "job_id",
    as: "job_detail",
});

// JobAddress.sync({ alter: true })
module.exports = JobAddress;