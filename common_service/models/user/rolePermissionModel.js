const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
 
const RolePermission = authDB.define(
   "role_permission",
   {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      role_id: {
         type: DataTypes.INTEGER,
         references: {
            model: "roles",
            key: "id",
         },
      },
      permissions: {
         type: DataTypes.ARRAY(DataTypes.STRING),
         // references: {
         //   model: "permissions",
         //   key: "id",
         // },
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

RolePermission.associate = (models) => {
   RolePermission.belongsTo(models.role, {
      foreignKey: "role_id",
   });
   // RolePermission.belongsTo(models.Permission);

   // Permission.hasMany(RolePermission);
};

module.exports = RolePermission;
