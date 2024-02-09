const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");

const VehicleDocuments = authDB.define(
  "dynamic_vehicle_doc",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    country_id: {
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      trim: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      trim: true,
      defaultValue: ""
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

VehicleDocuments.belongsTo(require("../countryModel"), {
  as: "country_detail",
  foreignKey: "country_id",
});

// VehicleDocuments.sync({ alter: true })
module.exports = VehicleDocuments;
