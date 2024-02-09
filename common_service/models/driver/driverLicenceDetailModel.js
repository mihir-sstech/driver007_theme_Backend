
const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");

const DriverLicenceDetail = authDB.define(
    "driver_licence_detail",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        driver_id: {
            type: DataTypes.INTEGER,
        },
        licencefield_id: {
            type: DataTypes.INTEGER,
        },
        licencefield_value: {
            type: DataTypes.TEXT,
            allowNull: false,
            trim: true,
            defaultValue: ""
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
            fields: ["is_deleted", "enable", "country_id", "driver_id", "licencefield_id"],
        }],
    }
);

// Table field assiciations 
DriverLicenceDetail.belongsTo(require("../driver/driverModel"), {
    as: "driver_detail",
    foreignKey: "driver_id",
});
DriverLicenceDetail.belongsTo(require("../dynamic_fields/licenceFieldsModel"), {
    as: "licencefield_detail",
    foreignKey: "licencefield_id",
});

// DriverLicenceDetail.sync({ alter: true });
module.exports = DriverLicenceDetail;
