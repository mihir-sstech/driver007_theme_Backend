const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const CompanyDetail = authDB.define(
  "company_detail",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
    },
    token: {
      type: DataTypes.TEXT,
      trim: true,
      defaultValue: "",
      comment: "Notification token",
    },
    notification_method_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "Notification Method: 1=Broadcast All, 2=Priority Wise",
    },
    account_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "Account Type: 1=Prepaid, 2=Postpaid",
    },
    default_credit_value: {
      type: DataTypes.DECIMAL(10, 3),
      defaultValue: "0.00",
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: "0.00",
    },
    per_job_charge: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: "0.00",
    },
    credit_date: {
      type: DataTypes.DATE,
    },
    invoice_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "Invoice Type: 1=Weekly, 2=Fortnightly, 3=Monthly",
    },
    allow_driver: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Allow Driver: 0=All Driver, 1=Company Driver,2=Freelance Driver,",
    },
    fare_setting_id: {
      type: DataTypes.STRING(50),
      trim: true,
      defaultValue: "",
      comment: "Comma seperate ID's of fareprice table",
    },
    radius: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: "0.00",
      comment: "radius value is in KM"
    },
    account_job_payment_gateway: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "Accept retailer/account payment using payment gateway and value 1=Razorpay, 2=PayPal, 3=Stripe"
    },
    wallet_credit_payment_gateway: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "Accept wallet credit payment using payment gateway and value 1=Razorpay, 2=PayPal, 3=Stripe"
    },
    company_payment_mode: {
      type: DataTypes.STRING(20),
      trim: true,
      defaultValue: "",
      comment: "Company PaymentMode: 1=Wallet, 2=Online, 3=Cash collect"
    },
    individual_payment_mode: {
      type: DataTypes.STRING(20),
      trim: true,
      defaultValue: "",
      comment: "individual PaymentMode: 1=Wallet, 2=Online, 3=Cash collect"
    },
    test_driver007_accountid: {
      type: DataTypes.TEXT,
      trim: true,
      defaultValue: "",
    },
    live_driver007_accountid: {
      type: DataTypes.TEXT,
      trim: true,
      defaultValue: "",
    },
    enable: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
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
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{
      fields: ["is_deleted", "enable", "company_id"],
    }],
  }
);

CompanyDetail.belongsTo(require("./companyModel"), {
  as: "company_basic_detail",
  foreignKey: "company_id",
});

// CompanyDetail.sync({ alter: true })
module.exports = CompanyDetail;