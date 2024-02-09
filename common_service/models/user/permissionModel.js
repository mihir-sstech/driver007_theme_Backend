const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");

const Permission = authDB.define(
  "permission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    module_name: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    module_id: {
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    superadmin_access: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
    },
    updated_at: {
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
    deleted_by: {
      type: DataTypes.INTEGER,
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Table field assiciations 
Permission.belongsTo(require("../adminModulesModel"), {
  as: "admin_module",
  foreignKey: "module_id",
});

// Permission.associate = (models) => {
//   Permission.belongsToMany(models.Role, {
//     through: models.RolePermission,
//     // as: "roles",
//     foreignKey: "permission_id",
//   });
// };

// Permission.sync({ alter: true })
module.exports = Permission;
