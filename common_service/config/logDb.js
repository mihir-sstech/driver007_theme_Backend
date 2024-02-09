const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const main = require("../db_config/logshub.json")["development"];
const certpath1 = path.join(__dirname, "../uploads/", "ca-certificate-pem.pem");

const logDB = new Sequelize(main.database, main.username, main.password, {
  host: main.host,
  port: main.port,
  dialect: main.dialect,
  logging: false, // Disable query logging
  dialectOptions: {
    ssl: {
      require: true,
      ca: fs.readFileSync(certpath1),
    },
  },
});

// Test the connection
async function testConnection() {
  try {
    await logDB.authenticate();
    console.log(`Database "${main.database}" connection has been established successfully.`);
    // logDB.sync();
    // logDB.sync({ alter: true });
  } catch (error) {
    console.error(`Database "${main.database}" unable to connect to the database:`, error);
  }
}

testConnection();

module.exports = logDB;
