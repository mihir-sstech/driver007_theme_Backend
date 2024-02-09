const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const settingModel = require("./fareSettingModel");
const TaxFareSettingModel = authDB.define(
  "setting_fareprice_tax",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fare_id: {
      type: DataTypes.INTEGER,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.ENUM("fix", "percent"),
      // allowNull: false,
      trim: true,
    },
    tax_label: {
      type: DataTypes.STRING(250),
      allowNull: false,
      trim: true,
      defaultValue: "",
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


TaxFareSettingModel.belongsTo(authDB.models.setting_fareprice, {
  foreignKey: "fare_id",
  as: "fare_detail",
});

// TaxFareSettingModel.sync({ alter: true })
module.exports = TaxFareSettingModel;