const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const PaymentKeySetting = authDB.define(
  "payment_key_setting",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    payment_setting_id:{
        type: DataTypes.INTEGER,
    },
    country_id: {
      type: DataTypes.INTEGER,
    },
    key_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    key_value: {
      type: DataTypes.STRING(100),
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
    updated_at: {
      type: DataTypes.DATE,
    },
    deleted_at: {
      type: DataTypes.DATE,
    },
    is_deleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
PaymentKeySetting.belongsTo(require("./paymentSettingModel"), {
  foreignKey: "payment_setting_id",
  as: "payment_setting_details",
});

// PaymentKeySetting.sync({ alter: true })
module.exports = PaymentKeySetting;
