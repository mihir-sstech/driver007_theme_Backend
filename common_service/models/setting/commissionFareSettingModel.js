const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const CommissionFareSetting = authDB.define(
  "setting_fareprice_commission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fare_id: {
      type: DataTypes.INTEGER,
    },
    fare_detail_id: {
      type: DataTypes.INTEGER,
    },
    commission_title: {
      type: DataTypes.STRING(250),
      allowNull: false,
      trim: true,
      defaultValue: "",
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


CommissionFareSetting.belongsTo(require("./fareSettingModel"), {
  foreignKey: "fare_id",
  as: "fare_price",
});

CommissionFareSetting.belongsTo(require("./fareDetailSettingModel"), {
  foreignKey: "fare_detail_id",
  as: "fare_details",
});

// CommissionFareSetting.sync({ alter: true })
module.exports = CommissionFareSetting;