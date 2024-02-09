const { DataTypes } = require("sequelize");
const authDB = require("../../config/authDb");

const Account = authDB.define('master_account',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        account_code: {
            type: DataTypes.STRING(50),
        },
        company_id: {
            type: DataTypes.INTEGER,
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        country: {
            type: DataTypes.INTEGER,
        },
        state: {
            type: DataTypes.INTEGER,
        },
        suburb: {
            type: DataTypes.STRING(100),
        },
        building_name: {
            type: DataTypes.STRING(50),
            defaultValue: "",
        },
        street_address: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        pincode: {
            type: DataTypes.STRING(15),
            validate: {
                len: [0, 15],
            },
        },
        contact_no: {
            type: DataTypes.STRING(20),
            validate: {
                len: [0, 20],
            },
        },
        email: {
            type: DataTypes.STRING(50),
            defaultValue: ""
        },
        custom_domain_name: {
            type: DataTypes.STRING(100),
            defaultValue: "",
            validate: {
                len: [0, 100],
            },
        },
        site_url: {
            type: DataTypes.STRING(100),
            defaultValue: "",
            validate: {
                len: [0, 100],
            },
        },
        cost_center_name: {
            type: DataTypes.STRING(50),
            defaultValue: "",
            validate: {
                len: [0, 50],
            },
        },
        logo: {
            type: DataTypes.TEXT, // Assuming Buffer-like data for Sequelize 
            defaultValue: "",
        },
        facebook_url: {
            type: DataTypes.STRING(150),
            defaultValue: "",
            validate: {
                len: [0, 150],
            },
        },
        twitter_url: {
            type: DataTypes.STRING(150),
            defaultValue: "",
            validate: {
                len: [0, 150],
            },
        },
        googleplus_url: {
            type: DataTypes.STRING(150),
            defaultValue: "",
            validate: {
                len: [0, 150],
            },
        },
        instagram_url: {
            type: DataTypes.STRING(150),
            defaultValue: "",
            validate: {
                len: [0, 150],
            },
        },
        youtube_url: {
            type: DataTypes.STRING(150),
            defaultValue: "",
            validate: {
                len: [0, 150],
            },
        },
        snapchat_url: {
            type: DataTypes.STRING(150),
            defaultValue: "",
            validate: {
                len: [0, 150],
            },
        },
        tiktok_url: {
            type: DataTypes.STRING(150),
            defaultValue: "",
            validate: {
                len: [0, 150],
            },
        },
        footer_copyright: {
            type: DataTypes.STRING(200),
            defaultValue: "",
            validate: {
                len: [0, 200],
            },
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
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
            fields: ["is_deleted", "status", "company_id", "email"],
        }],
    }
);


Account.belongsTo(require("../company/companyModel"), {
    as: "company_detail",
    foreignKey: "company_id",
});

Account.associate = (models) => {
    // Account.belongsTo(models.users, {
    //     as: "created_by",
    //     foreignKey: "created_by",
    // });
    // Account.belongsTo(models.users, {
    //     as: "updated_by",
    //     foreignKey: "updated_by",
    // });
    // Account.belongsTo(models.users, {
    //     as: "deleted_by",
    //     foreignKey: "deleted_by",
    // });
    // Account.belongsTo(models.companies, {
    //     as: "company_details",
    //     foreignKey: "company_id",
    // });
};

// Account.sync({ alter: true });
module.exports = Account; 