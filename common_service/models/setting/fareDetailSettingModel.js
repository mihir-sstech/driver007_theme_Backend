const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const settingModel = require("./fareSettingModel");
const FareDetailSettingModel = authDB.define(
  "setting_fareprice_details",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fare_id: {
      type: DataTypes.INTEGER,
    },
    delivery_type: {
      type: DataTypes.STRING(250),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    base_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    per_km_charge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    min_charge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    per_km_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      trim: true,
      defaultValue: 0,
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
    deleted_at: {
      type: DataTypes.DATE,
    },
    updated_at: {
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
  }
);


FareDetailSettingModel.belongsTo(authDB.models.setting_fareprice, {
  foreignKey: "fare_id",
  as: "fare_detail",
});

// FareDetailSettingModel.sync({ alter: true })
module.exports = FareDetailSettingModel;