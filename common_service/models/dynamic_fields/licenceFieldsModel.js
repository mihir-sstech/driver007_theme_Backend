
const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");

const LicenceFields = authDB.define(
    "dynamic_licence_field",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        field_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
            trim: true,
            defaultValue: ""
        },
        field_label: {
            type: DataTypes.STRING(150),
            allowNull: false,
            trim: true,
            defaultValue: ""
        },
        field_type: {
            type: DataTypes.STRING(100),
            allowNull: false,
            trim: true,
            comment: "field type value can be a textbox, date, datetime, textarea, select box, checkbox, radio, etc."
        },
        field_value: {
            type: DataTypes.TEXT,
            allowNull: false,
            trim: true,
            defaultValue: "",
            comment: "Possible values for field type dropdown"
        },
        description: {
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
        created_by: {
            type: DataTypes.INTEGER,
        },
        updated_by: {
            type: DataTypes.INTEGER,
        },
    },
    {
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [{
            fields: ["is_deleted", "enable", "country_id"],
        }],
    }
);

LicenceFields.belongsTo(require("../countryModel"), {
    as: "country_detail",
    foreignKey: "country_id",
});

// LicenceFields.sync({ alter: true });
module.exports = LicenceFields;
