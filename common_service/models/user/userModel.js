const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const { isEmpty } = require("../../utils/utils");
const crypto = require("crypto");
const Driver = require("../driver/driverModel");

const Users = authDB.define(
  "master_user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      // references: {
      //   model: "Company",
      //   key: "id",
      // },
    },
    account_id: {
      type: DataTypes.INTEGER,
    },
    driver_id: {
      type: DataTypes.INTEGER,
    },
    user_type_id: {
      type: DataTypes.INTEGER,
    },
    user_code: {
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
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      trim: true,
      lowercase: true,
      defaultValue: "",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      get() {
        return () => this.getDataValue("password");
      },
    },
    role_id: {
      type: DataTypes.INTEGER,
    },
    user_verify_token: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
      defaultValue: "",
    },
    // fcm_reg_id: {
    //   type: DataTypes.TEXT,
    //   trim: true,
    //   defaultValue: "",
    // },
    device_id: {
      type: DataTypes.TEXT,
      trim: true,
      defaultValue: "",
    },
    device_type: {
      type: DataTypes.STRING(100),
      trim: true,
      defaultValue: "",
    },
    last_login: {
      type: DataTypes.DATE,
    },
    forgot_email_token: {
      type: DataTypes.TEXT,
    },
    login: {
      type: DataTypes.INTEGER,
    },
    otp: {
      type: DataTypes.TEXT,
    },
    otp_expire_at: {
      type: DataTypes.DATE,
    },
    building_name: {
      type: DataTypes.STRING,
      trim: true,
      defaultValue: "",
    },
    street_address: {
      type: DataTypes.TEXT,
      trim: true,
      defaultValue: "",
    },
    country: {
      type: DataTypes.INTEGER,
    },
    state: {
      type: DataTypes.INTEGER,
    },
    city: {
      type: DataTypes.STRING(50),
      defaultValue: "",
    },
    zipcode: {
      type: DataTypes.STRING(10),
      trim: true,
      defaultValue: "",
    },
    contact_no: {
      type: DataTypes.STRING(20),
      defaultValue: "",
      validate: {
        len: [0, 20],
      },
    },
    time_zone: {
      type: DataTypes.STRING(100),
      trim: true,
      defaultValue: "",
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
    created_by: {
      type: DataTypes.INTEGER,
    },
    updated_by: {
      type: DataTypes.INTEGER,
    },
    deleted_by: {
      type: DataTypes.INTEGER,
    },
    enable: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_deleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    allow_notification: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    salt: {
      type: DataTypes.STRING,
      get() {
        return () => this.getDataValue("salt");
      },
    },
    profile_pic: {
      type: DataTypes.TEXT, // Assuming Buffer-like data for Sequelize 
      defaultValue: "",
    },
    addr_lat: {
      type: DataTypes.STRING(100),
      defaultValue: "",
      comment: "address latitide",
    },
    addr_long: {
      type: DataTypes.STRING(100),
      defaultValue: "",
      comment: "address longitude"
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{
      fields: ["is_deleted", "enable", "email", "company_id", "account_id"],
    }],
  }
);

// Table field assiciations 
Users.belongsTo(require("./roleModel"), {
  as: "role",
  foreignKey: "role_id",
});
Users.belongsTo(require("../company/companyModel"), {
  as: "company_detail",
  foreignKey: "company_id",
});
Users.belongsTo(require("../account/accountModel"), {
  as: "account_detail",
  foreignKey: "account_id",
});
Users.belongsTo(require("../driver/driverModel"), {
  as: "driver_detail",
  foreignKey: "driver_id",
});


Users.generateSalt = function () {
  return crypto.randomBytes(16).toString("base64");
};
Users.encryptPassword = function (plainText, salt) {
  return crypto
    .createHash("RSA-SHA256")
    .update(plainText)
    .update(salt)
    .digest("hex");
};

// const setSaltAndPassword = (user) => {
//   console.log("*******************************");
//   console.log(user);
//   // if (user.fields.includes("password")) {
//   //   user.salt = Users.generateSalt();
//   //   user.password = Users.encryptPassword(user.password, user.salt);
//   // }

//   // if (user.changed("password")) { // Use 'changed' instead of 'fields.includes'
//   //   user.salt = Users.generateSalt();
//   //   user.password = Users.encryptPassword(user.password, user.salt); // Access password directly
//   // }

//   if (!isEmpty(user.attributes.password)) {
//     user.attributes.password.salt = Users.generateSalt();
//     var salt_str = Users.generateSalt();
//     user.attributes.password = Users.encryptPassword(user.attributes.password, salt_str);
//   }

// };
const setSaltAndPassword = (user) => {
  if (user.changed("password")) {
    user.salt = Users.generateSalt();
    user.password = Users.encryptPassword(user.password(), user.salt());
  }
};

Users.beforeCreate(setSaltAndPassword);
// Users.beforeUpdate(setSaltAndPassword); 

Users.prototype.correctPassword = function (enteredPassword) {
  return (
    Users.encryptPassword(enteredPassword, this.salt()) === this.password()
  );
};

// Users.sync({ alter: true });
module.exports = Users;
