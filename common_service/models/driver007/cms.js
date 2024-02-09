const { DataTypes } = require("sequelize");
const authDB = require("../../config/themeDb");
// const Users = require("../user/userModel");
const Cms = authDB.define(
  "cms",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },

    slug: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },

    title: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },

    meta_tags: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },


    meta_description: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
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
    active: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{
      fields: ["is_deleted", "active"],
    }],
  }
);

// Cms.sync({ alter: true })
module.exports = Cms;