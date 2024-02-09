const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const DriverVehicleAttachment = authDB.define(
  "driver_vehicle_attachment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    driver_id: {
      type: DataTypes.INTEGER
    },
    driver_vehicle_id: {
      type: DataTypes.INTEGER,
    },
    vehicle_id: {
      type: DataTypes.INTEGER,
    },
    document_id: {
      type: DataTypes.INTEGER,
      comment: "Reference id of vehicle_document table"
    },
    image_name: {
      type: DataTypes.STRING(75),
      defaultValue: "",
    },
    image_path: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    type: {
      type: DataTypes.ENUM("vehicle_imgs", "vehicle_doc_imgs"),
      trim: true,
      comment: "vehicle_images or vehicle document images"
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
    enable: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{
      fields: ["is_deleted", "driver_id", "driver_vehicle_id", "document_id"],
    }],
  }
);

// Table field assiciations
DriverVehicleAttachment.belongsTo(require("../dynamic_fields/VehicleDocsModel"), {
  foreignKey: "document_id",
  as: "doc_detail",
});

// DriverVehicleAttachment.sync({ alter: true })
module.exports = DriverVehicleAttachment;