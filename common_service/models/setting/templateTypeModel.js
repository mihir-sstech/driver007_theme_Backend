const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const TemplateType = authDB.define(
  "template_type",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    template_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    fields: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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

// TemplateType.sync({ alter: true })
module.exports = TemplateType;