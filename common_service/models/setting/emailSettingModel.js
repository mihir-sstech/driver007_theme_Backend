const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const companyModel = require("../company/companyModel");
const templateModel = require("../setting/templateTypeModel");
const EmailSetting = authDB.define(
  "setting_email",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    company_id: {
      type: DataTypes.INTEGER,
    },
    template_id: {
      type: DataTypes.INTEGER,
    },
    email_subject: {
      type: DataTypes.STRING(250),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    email_body: {
      type: DataTypes.TEXT,
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    full_body_bg_color: {
      type: DataTypes.STRING(100),
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


EmailSetting.belongsTo(authDB.models.master_company, {
  foreignKey: "company_id",
  as: "company_detail",
});
EmailSetting.belongsTo(authDB.models.template_type, {
  foreignKey: "template_id",
  as: "template_detail",
});

// EmailSetting.sync({ alter: true })
module.exports = EmailSetting;