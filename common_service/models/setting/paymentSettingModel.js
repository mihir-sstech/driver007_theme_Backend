const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const PaymentSetting = authDB.define(
  "payment_setting",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
    },
    api: {
      type: DataTypes.STRING(100),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    country_id: {
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    environment: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment:
        "0: default value of environment is Production, 1: value of environment is Test",
    },
    default: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment:
        "0: default value of this field is No, 1: value of this field  is Yes",
    },
    api_url: {
      type: DataTypes.STRING(500),
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
PaymentSetting.belongsTo(require("../company/companyModel"), {
  foreignKey: "company_id",
  as: "company_detail",
});
PaymentSetting.belongsTo(require("../countryModel"), {
  foreignKey: "country_id",
  as: "country_detail",
});

// PaymentSetting.sync({ alter: true })
module.exports = PaymentSetting;
