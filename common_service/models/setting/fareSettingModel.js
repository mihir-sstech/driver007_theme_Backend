const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const companyModel = require("../company/companyModel");
const countryModel = require("../countryModel");
const currencyModel = require("../currencyModel");
const stateModel = require("../stateModel");
const vehicleModel = require("../vehicle/vehicleModel");
const FareSetting = authDB.define(
  "setting_fareprice",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
    },
    category_name: {
      type: DataTypes.STRING(250),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    country_id: {
      type: DataTypes.INTEGER,
    },
    currency_id: {
      type: DataTypes.INTEGER,
    },
    state_id: {
      type: DataTypes.INTEGER,
    },
    city: {
      type: DataTypes.STRING(250),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    vehicle_cat_id: {
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    size: {
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
    indexes: [{
      fields: ["is_deleted", "company_id", "enable", "country_id", "state_id", "vehicle_cat_id"],
    }],
  }
);


FareSetting.belongsTo(require("../company/companyModel"), {
  foreignKey: "company_id",
  as: "company_detail",
});
FareSetting.belongsTo(require("../countryModel"), {
  foreignKey: "country_id",
  as: "country_detail",
});
FareSetting.belongsTo(require("../currencyModel"), {
  foreignKey: "currency_id",
  as: "currency_detail",
});
FareSetting.belongsTo(require("../stateModel"), {
  foreignKey: "state_id",
  as: "state_detail",
});
FareSetting.belongsTo(require("../vehicle/vehicleCategoryModel"), {
  foreignKey: "vehicle_cat_id",
  as: "vehicle_cat_detail",
});

// FareSetting.sync({ alter: true })
module.exports = FareSetting;