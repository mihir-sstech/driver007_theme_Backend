const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const DriverVehicles = authDB.define(
  "driver_vehicles",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    driver_id: {
      type: DataTypes.INTEGER
    },
    vehicle_id: {
      type: DataTypes.INTEGER,
    },
    package_id: {
      type: DataTypes.STRING(200),
      defaultValue: "",
    },
    weightunit_id: {
      type: DataTypes.INTEGER,
      comment: "Reference id of table weightunits",
    },
    weight_capacity_min: {
      type: DataTypes.STRING(25),
      defaultValue: "",
    },
    weight_capacity_max: {
      type: DataTypes.STRING(25),
      defaultValue: "",
    },
    vehicle_no_plate: {
      type: DataTypes.STRING(50),
      trim: true,
      defaultValue: "",
      comment: "Vehicle number plate",
    },
    vehicle_color: {
      type: DataTypes.STRING(25),
      defaultValue: "",
      comment: "Color of vehicle",
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
      defaultValue: 0,
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{
      fields: ["is_deleted", "driver_id", "vehicle_id", "package_id"],
    }],
  }
);

// Table field assiciations 
DriverVehicles.belongsTo(require("./driverModel"), {
  foreignKey: "driver_id",
  as: "driver_detail",
});
DriverVehicles.belongsTo(require("../vehicle/vehicleModel"), {
  foreignKey: "vehicle_id",
  as: "vehicle_detail",
});
DriverVehicles.belongsTo(require("../wightUnitsModel"), {
  foreignKey: "weightunit_id",
  as: "weightunit_detail",
});

// DriverVehicles.sync({ alter: true })
module.exports = DriverVehicles;