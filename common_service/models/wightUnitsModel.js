const { DataTypes } = require("sequelize");
const authDB = require("../config/authDb");

const WeightUnits = authDB.define(
  "weightunits",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    unit_name: {
      type: DataTypes.STRING(50),
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
  }
);

// WeightUnits.sync({ alter: true })
module.exports = WeightUnits;
