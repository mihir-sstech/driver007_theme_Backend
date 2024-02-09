const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const VehicleCategory = require("./vehicleCategoryModel");

const Vehicle = authDB.define(
    "master_vehicle",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        vehicle_cat_id: {
            type: DataTypes.INTEGER,
            // references: {
            //     // model: "vehicle_categories",
            //     model: VehicleCategory,
            //     key: "id",
            // },
        },
        make: {
            type: DataTypes.STRING(100),
            allowNull: false,
            trim: true,
            defaultValue: ""
        },
        model: {
            type: DataTypes.STRING(100),
            allowNull: false,
            trim: true,
            defaultValue: ""
        },
        created_by: {
            type: DataTypes.INTEGER,
        },
        updated_by: {
            type: DataTypes.INTEGER,
        },
        deleted_by: {
            type: DataTypes.INTEGER,
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        enable: {
            type: DataTypes.INTEGER,
            defaultValue: 1
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
    },
    {
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
            {
                fields: ["make"],
                name: "idx_make",
            },
            {
                fields: ["model"],
                name: "idx_model",
            },
            {
                fields: ["vehicle_cat_id", "make"],
                name: "idx_vehicle_cat_make",
            },
            // Index on the 'enable' column for faster enable based lookup
            {
                fields: ["enable"],
                name: "idx_vehi_enable",
            },
        ],
    }
);

// Vehicle.associate = (models) => {
Vehicle.belongsTo(authDB.models.vehicle_categories, {
    foreignKey: "vehicle_cat_id",
    as: "vehicle_cat_detail",
});
// };

// Vehicle.sync({ alter: true })
module.exports = Vehicle;
