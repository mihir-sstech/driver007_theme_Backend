const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const Users = require("./userModel");

const UserToken = authDB.define(
  "user_token",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_on: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_on: {
      type: DataTypes.DATE,
    },
  },
  {
    createdAt: "created_on",
    updatedAt: "updated_on",
  }
);


UserToken.belongsTo(Users, {
  foreignKey: "user_id",
  as: "user_details",
});

// UserToken.sync({ alter: true })
module.exports = UserToken;
