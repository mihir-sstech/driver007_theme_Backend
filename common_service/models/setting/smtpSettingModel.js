const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const companyModel = require("../company/companyModel");
const SmtpSetting = authDB.define(
  "setting_smtp",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
    },
    smtp_host: {
      type: DataTypes.STRING(300),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    smtp_port: {
      type: DataTypes.INTEGER,
    },
    encryption: {
      type: DataTypes.STRING(10),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    smtp_email: {
      type: DataTypes.STRING(250),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    smtp_password: {
      type: DataTypes.STRING(250),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    from_email: {
      type: DataTypes.STRING(250),
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


SmtpSetting.belongsTo(authDB.models.master_company, {
  foreignKey: "company_id",
  as: "company_detail",
});

// SmtpSetting.sync({ alter: true })
module.exports = SmtpSetting;