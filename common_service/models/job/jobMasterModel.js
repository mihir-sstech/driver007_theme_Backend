const { DataTypes } = require("sequelize");
const jobDB = require("../../config/jobDb");
const JobMaster = jobDB.define(
  "job_master",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    job_id: {
      type: DataTypes.STRING(100),
      defaultValue: "",
      comment: "job_id value is auto generated with specific format",
    },
    user_id: {
      type: DataTypes.INTEGER,
      comment: "ID of the user who created this job",
    },
    driver_id: {
      type: DataTypes.INTEGER,
      comment: "Reference of Driver Table which is in database-defaultdb",
    },
    company_id: {
      type: DataTypes.INTEGER,
      comment: "Reference of Company Table which is in database-defaultdb",
    },
    vehicle_id: {
      type: DataTypes.INTEGER,
      comment: "Reference of Vehicle Table which is in database-defaultdb",
    },
    job_type: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "0=single job, 1=multi job & 3=bulk job and default value is 0",
    },
    // driver_type: {
    //   type: DataTypes.ENUM("freelance", "company"),
    //   defaultValue: "freelance",
    //   comment:
    //     "Driver type can be a Freelance driver or Company driver and default value is FREELANCE",
    // },
    driver_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
      comment: "Driver type can be a 2=Freelance driver or 1=Company driver and default value is 2(FREELANCE DRIVER)",
    },
    order_no: {
      type: DataTypes.STRING(100),
      trim: true,
      defaultValue: "",
    },
    instruction: {
      type: DataTypes.TEXT,
      trim: true,
      defaultValue: "",
      comment: "Job instruction",
    },
    label_pdf: {
      type: DataTypes.TEXT,
      trim: true,
      defaultValue: "",
      comment: "Label in PDF",
    },
    label_pdf_100_150: {
      type: DataTypes.TEXT,
      trim: true,
      defaultValue: "",
      comment: "Label in PDF with size 100*150",
    },
    label_png_100_150: {
      type: DataTypes.TEXT,
      trim: true,
      defaultValue: "",
      comment: "Label in PNG with size 100*150",
    },
    email_send_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "default value is 0",
    },
    is_signature_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "default value is false",
    },
    reference_1: {
      type: DataTypes.STRING(100),
      defaultValue: "",
    },
    reference_2: {
      type: DataTypes.STRING(100),
      defaultValue: "",
      comment: "Value can be a additional Shipment Reference",
    },
    reference_3: {
      type: DataTypes.STRING(100),
      defaultValue: "",
      comment: "Value can be a additional Shipment Reference",
    },
    carrier: {
      type: DataTypes.STRING(100),
      defaultValue: "Driver007",
    },
    service: {
      type: DataTypes.STRING(100),
      defaultValue: "",
      comment:
        "service name as per your requirements like: SameDay, NextDay, Economy",
    },
    duties_taxes_by_receiver: {
      type: DataTypes.ENUM("y", "n"),
      defaultValue: "n",
      comment: "Only use if International Parcel Y Or N",
    },
    brand_id: {
      type: DataTypes.INTEGER,
      comment: "Reference of Brand Table which is in database-defaultdb",
    },
    inco_terms: {
      type: DataTypes.TEXT,
      defaultValue: "",
      comment:
        "Only use if International Parcel You can pass incoterms like DDP, DDU etc",
    },
    carrier_logo: {
      type: DataTypes.TEXT,
      defaultValue: "",
      comment: "",
    },
    payment_mode: {
      type: DataTypes.STRING(20),
      trim: true,
      defaultValue: "",
      comment: "PaymentMode: 1=Wallet, 2=Online, 3=Cash collect",
    },
    payment_status: {
      type: DataTypes.INTEGER,
      trim: true,
      defaultValue: 0,
      comment: "Paymentstatus: 1=Paid, 0=Pending",
    },
    job_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment:
        "JobStatus: 0=Pending, 1=Created, 2=Canceled, 3=Accepted, 4=Inprogress and 5=Completed",
    },
    job_created_via: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "0=Web(via Dashboard), 1=Mobile, 2=Public API",
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
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: [
          "is_deleted",
          "job_status",
          "job_id",
          "user_id",
          "driver_id",
          "company_id",
          "email_send_status",
          "is_signature_required",
          "brand_id",
        ],
      },
    ],
  }
);

// JobMaster.sync({ alter: true })
module.exports = JobMaster;
