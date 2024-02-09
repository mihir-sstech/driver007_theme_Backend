const { DataTypes } = require("sequelize");
const authDB = require("../config/authDb");

const AddressBook = authDB.define(
    "addressbook",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            trim: true,
            defaultValue: "",
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            trim: true,
            lowercase: true,
            defaultValue: "",
        },
        contact_no: {
            type: DataTypes.STRING(20),
            trim: true,
            defaultValue: "",
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
            trim: true,
            defaultValue: ""
        },
        building_name: {
            type: DataTypes.STRING,
            trim: true,
            defaultValue: "",
        },
        street_address: {
            type: DataTypes.TEXT,
            trim: true,
            defaultValue: "",
        },
        country: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        state: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        city: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        zipcode: {
            type: DataTypes.STRING(10),
            trim: true,
            defaultValue: "",
        },
        latittude: {
            type: DataTypes.STRING(100),
            defaultValue: "",
        },
        longitude: {
            type: DataTypes.STRING(100),
            defaultValue: "",
        },
        created_by: {
            type: DataTypes.INTEGER,
        },
        updated_by: {
            type: DataTypes.INTEGER,
        },
        deleted_by: {
            type: DataTypes.INTEGER,
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        enable: {
            type: DataTypes.INTEGER,
            defaultValue: 1
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
            fields: ["is_deleted", "enable", "user_id"],
        }],
    }
);

// Table field assiciations 
AddressBook.belongsTo(require("./user/userModel"), {
    foreignKey: "user_id",
    as: "user_detail",
});

// AddressBook.sync({ alter: true })
module.exports = AddressBook;
