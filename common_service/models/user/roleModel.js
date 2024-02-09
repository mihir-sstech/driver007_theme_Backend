const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");

const Role = authDB.define(
   "role",
   {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      role_name: {
         type: DataTypes.STRING(75),
         allowNull: false,
         trim: true,
         defaultValue: "",
      },
      role_description: {
         type: DataTypes.TEXT,
         trim: true,
         defaultValue: "",
      },
      user_type: {
         type: DataTypes.BOOLEAN,
         defaultValue: false,
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
   },
   {
      createdAt: "created_at",
      updatedAt: "updated_at",
   }
);

Role.associate = (models) => {
   Role.belongsToMany(models.users, {
      through: models.role_permission,
      foreignKey: "role_id",
      as: "role",
   });
   Role.hasOne(models.role_permission, {
      foreignKey: "role_id",
      as: "permissions",
   });
   // Role.hasMany(models.Users, {
   //   // through: models.RolePermission,
   //   foreignKey: "role_id",
   //   as: "user_role",
   // });
   // Role.belongsToMany(models.Permission, {
   //   through: models.RolePermission,
   //   foreignKey: "role_id",
   //   as: "permissions",
   // });
   // Role.belongsTo(User, { through: "Role_Permission" });
};

// Role.sync({ alter: true })
module.exports = Role;
