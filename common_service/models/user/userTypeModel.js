const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");

const UserType = authDB.define(
  "user_type",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      trim: true,
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
    enable: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    is_deleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    created_by: {
      type: DataTypes.INTEGER,
    },
    updated_by: {
      type: DataTypes.INTEGER,
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{
      fields: ["is_deleted", "enable"],
    }],
  }
);

module.exports = UserType;
