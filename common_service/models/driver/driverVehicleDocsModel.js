const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const DriverVehicleDocs = authDB.define(
  "driver_vehicle_document",
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
    document_id: {
      type: DataTypes.INTEGER,
      comment: "Reference of Vehicle Document Table"
    },
    document_no: {
      type: DataTypes.STRING(200),
      trim: true,
      defaultValue: "",
    },
    // document_imgs: {
    //   type: DataTypes.TEXT,
    //   defaultValue: "",
    // },
    document_expire_at: {
      type: DataTypes.DATE
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
    document_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Possible values, 0=Pending, 1=Approved, 2=Rejected and default value is 0"
    },
    note: {
      type: DataTypes.TEXT,
      defaultValue: "",
      comment: "Document verify status related NOTE like if status is rejected then, reason for why its rejected"
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{
      fields: ["is_deleted", "driver_id", "driver_vehicle_id"],
    }],
  }
);

// Table field assiciations
DriverVehicleDocs.belongsTo(require("./driverModel"), {
  foreignKey: "driver_id",
  as: "driver_detail",
});
DriverVehicleDocs.belongsTo(require("../driver/driverVehicleModel"), {
  foreignKey: "driver_vehicle_id",
  as: "driver_vehicle_detail",
});
DriverVehicleDocs.belongsTo(require("../dynamic_fields/VehicleDocsModel"), {
  foreignKey: "document_id",
  as: "doc_detail",
});

// DriverVehicleDocs.sync({ alter: true })
module.exports = DriverVehicleDocs;