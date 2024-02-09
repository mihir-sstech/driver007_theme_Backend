const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");
const Company = authDB.define(
  "master_company",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_code: {
      type: DataTypes.STRING(15),
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
      type: DataTypes.STRING(50),
      trim: true,
      lowercase: true,
      defaultValue: "",
    },
    description: {
      type: DataTypes.TEXT,
      trim: true,
      defaultValue: "",
    },
    logo: {
      type: DataTypes.STRING,
      trim: true,
      lowercase: true,
      defaultValue: "",
    },
    time_zone: {
      type: DataTypes.STRING(100),
      trim: true,
      defaultValue: "",
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
    company_currency: {
      type: DataTypes.STRING(5),
      defaultValue: "",
    },
    company_prefix: {
      type: DataTypes.STRING(5),
      trim: true,
      uppercase: true,
      defaultValue: "",
    },
    company_domain: {
      type: DataTypes.STRING(50),
      trim: true,
      lowercase: true,
      defaultValue: "",
    },
    background_photo: {
      type: DataTypes.STRING,
      trim: true,
      lowercase: true,
      defaultValue: "",
    },
    button_color: {
      type: DataTypes.STRING(13),
      trim: true,
      defaultValue: "",
    },
    button_hover_color: {
      type: DataTypes.STRING(13),
      trim: true,
      defaultValue: "",
    },
    font_color: {
      type: DataTypes.STRING(13),
      trim: true,
      defaultValue: "",
    },
    font_hover_color: {
      type: DataTypes.STRING(13),
      trim: true,
      defaultValue: "",
    },
    support: {
      type: DataTypes.STRING(50),
      trim: true,
      defaultValue: "",
    },
    apk_version: {
      type: DataTypes.STRING(20),
      trim: true,
      defaultValue: "",
    },
    t_and_c: {
      type: DataTypes.STRING(50),
      trim: true,
      defaultValue: "",
    },
    privacy_policy: {
      type: DataTypes.STRING(50),
      trim: true,
      defaultValue: "",
    },
    copy_right_text: {
      type: DataTypes.STRING,
      trim: true,
      defaultValue: "",
    },
    help_line_number: {
      type: DataTypes.STRING(20),
      trim: true,
      defaultValue: "",
    },
    footer_background_color: {
      type: DataTypes.STRING(13),
      trim: true,
      defaultValue: "",
    },
    contact_us_link: {
      type: DataTypes.STRING(200),
      trim: true,
      defaultValue: "",
    },
    faq: {
      type: DataTypes.STRING(200),
      trim: true,
      defaultValue: "",
    },
    facebook: {
      type: DataTypes.STRING(100),
      trim: true,
      defaultValue: "",
    },
    youtube: {
      type: DataTypes.STRING(100),
      trim: true,
      defaultValue: "",
    },
    instagram: {
      type: DataTypes.STRING(100),
      trim: true,
      lowercase: true,
      defaultValue: "",
    },
    tiktok: {
      type: DataTypes.STRING(100),
      trim: true,
      defaultValue: "",
    },
    snapchat: {
      type: DataTypes.STRING(100),
      trim: true,
      defaultValue: "",
    },
    google_plus: {
      type: DataTypes.STRING(100),
      trim: true,
      defaultValue: "",
    },
    address_autocomplete: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
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
    is_root_company: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      // Index for efficient name-based lookup
      {
        fields: ["name"],
        name: "idx_comp_name",
      },
      // Index for email-based lookup
      {
        fields: ["email"],
        name: "idx_comp_email",
      },

      // Composite index for country and state lookup
      {
        fields: ["country", "state"],
        name: "idx_comp_country_state",
      },
      // Index for enable
      {
        fields: ["enable"],
        name: "idx_comp_enable",
      },
      // Index for 'enable' and 'is_deleted' colums
      {
        fields: ["enable", "is_deleted"],
        name: "idx_comp_enable_isdeleted",
      },
    ],
  }
);

// Company.sync({ alter: true })
module.exports = Company;