const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");

const Brand = authDB.define(
  "master_brand",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      trim: true,
    },
    max_width: {
      type: DataTypes.INTEGER,
    },
    brand_logo: {
      type: DataTypes.TEXT, // Assuming Buffer-like data for Sequelize
      defaultValue: "",
    },
    brand_image: {
      type: DataTypes.TEXT, // Assuming Buffer-like data for Sequelize
      defaultValue: "",
    },
    enable: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
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
    indexes: [
      {
        fields: ["is_deleted", "enable", "company_id"],
      },
    ],
  }
);
Brand.belongsTo(require("../company/companyModel"), {
  as: "company_detail",
  foreignKey: "company_id",
});

// Brand.sync({ alter: true });
module.exports = Brand;
