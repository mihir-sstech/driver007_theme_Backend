const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
// const Users = require("../user/userModel");
const Driver = authDB.define(
  "master_driver",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
    },
    driver_code: {
      type: DataTypes.STRING(25),
      allowNull: false,
      trim: true,
      uppercase: true,
      defaultValue: "",
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    currency_id: {
      type: DataTypes.INTEGER,
    },
    country_id: {
      type: DataTypes.INTEGER,
    },
    licence_no: {
      type: DataTypes.STRING(150),
      defaultValue: "",
      comment: 'Vehicle licence number',
    },
    licence_expire_at: {
      type: DataTypes.DATE,
    },
    licence_img_front: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    licence_img_back: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    licence_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Possible values, 0=Pending, 1=Approved, 2=Rejected and default value is 0"
    },
    note: {
      type: DataTypes.TEXT,
      defaultValue: "",
      comment: "Document verify status related NOTE like if status is rejected then, reason for why its rejected"
    },
    earning: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: "0.00",
    },
    account_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '0=PENDING, 1=ACTIVE and by default is 0',
    },
    working_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'true=ONLINE, false=OFFLINE and by default is false',
    },
    todays_total_online: {
      type: DataTypes.TIME,
    },
    online_time: {
      type: DataTypes.DATE,
    },
    curr_location_lat: {
      type: DataTypes.STRING(100),
      defaultValue: "",
    },
    curr_location_long: {
      type: DataTypes.STRING(100),
      defaultValue: "",
    },
    gender: {
      type: DataTypes.STRING(10),
      defaultValue: "",
    },
    dob: {
      type: DataTypes.DATE,
    },
    language: {
      type: DataTypes.STRING(200),
      defaultValue: "",
    },
    about_me: {
      type: DataTypes.STRING(200),
      defaultValue: "",
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
      defaultValue: 0
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    driver_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
      comment: "Driver type can be a 2=Freelance driver or 1=Company driver and default value is 2(FREELANCE DRIVER)",
    }
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{
      fields: ["is_deleted", "working_status", "account_status", "curr_location_lat", "curr_location_long", "company_id", "enable", "driver_code"],
    }],
  }
);

// Table field assiciations 
Driver.belongsTo(require("../currencyModel"), {
  foreignKey: "currency_id",
  as: "currency_detail",
});
Driver.belongsTo(require("../company/companyModel"), {
  as: "company_detail",
  foreignKey: "company_id",
});

// Driver.hasMany(require("../driver/driverVehicleModel"), {
//   foreignKey: "driver_id",
//   as: "vehicle_detail",
// });

// Driver.hasOne(require("../user/userModel"), {
//   foreignKey: "driver_id",
//   as: "user_detail",
// });


// Driver.associate = (models) => {
// Driver.hasMany(require("../user/userModel"), {
//   foreignKey: "driver_id", // The foreign key in the Order model referencing the Customer model
//   as: "user_detail", // Alias to use when retrieving associated customer
// });
// };

// Driver.sync({ alter: true })
module.exports = Driver;