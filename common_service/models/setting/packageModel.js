const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const Package = authDB.define(
  "master_package",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    package_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    length: {
      type: DataTypes.STRING(100),
      trim: true,
      lowercase: true,
      defaultValue: "",
    },
    width: {
      type: DataTypes.STRING(100),
      trim: true,
      lowercase: true,
      defaultValue: "",
    },
    height: {
      type: DataTypes.STRING(100),
      trim: true,
      lowercase: true,
      defaultValue: "",
    },
    weight: {
      type: DataTypes.STRING(100),
      trim: true,
      lowercase: true,
      defaultValue: "",
    },
    description: {
      type: DataTypes.STRING(500),
      trim: true,
      lowercase: true,
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
      defaultValue: 0
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Package.sync({ alter: true })
module.exports = Package;