const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const companyModel = require("../company/companyModel");
const ApiSetting = authDB.define(
  "setting_api",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
    },
    api_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    api_url: {
      type: DataTypes.STRING(500),
      trim: true,
      lowercase: true,
      defaultValue: "",
    },
    setting: {
      type: DataTypes.JSON,
      defaultValue: {},
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
      defaultValue: 0
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// ApiSetting.associate = (models) => {
//   console.log(models);
// }
// console.log('authDB.models', authDB.models)
ApiSetting.belongsTo(authDB.models.master_company, {
  foreignKey: "company_id",
  as: "company_detail",
});

// ApiSetting.sync({ alter: true })
module.exports = ApiSetting;