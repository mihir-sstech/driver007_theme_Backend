const { DataTypes } = require("sequelize");
const jobDB = require("../../config/jobDb");
const Transaction = jobDB.define(
    "transaction",
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
        company_id: {
            type: DataTypes.INTEGER,
            comment: "Reference of Company Table which is in database-defaultdb",
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: "0.00",
        },
        payment_mode: {
            type: DataTypes.STRING(20),
            trim: true,
            defaultValue: "",
            comment: "PaymentMode: 1=Wallet, 2=Online, 3=Cash collect",
        },
        enable: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            defaultValue: 0
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
        indexes: [{
            fields: ["is_deleted", "enable", "job_id", "user_id", "company_id"],
        }],
    }
);

// Transaction.sync({ alter: true })
module.exports = Transaction;