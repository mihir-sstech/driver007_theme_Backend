const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const main = require("../db_config/auth.json")["development"];
const certpath1 = path.join(__dirname, "../uploads/", "ca-certificate-pem.pem");

const authDB = new Sequelize(main.database, main.username, main.password, {
   host: main.host,
   port: main.port,
   dialect: main.dialect,
   hook: true,
   logging: false, // Disable query logging
   dialectOptions: {
      logging: true,
      ssl: {
         require: true,
         ca: fs.readFileSync(certpath1),
      },
   },
});

// Test the connection
async function testConnection() {
   try {
      await authDB.authenticate();
      console.log(`Database "${main.database}" connection has been established successfully.`);

      // authDB.sync();
      // authDB.sync({ alter: true });
   } catch (error) {
      console.error(`Database "${main.database}" unable to connect to the database:`, error);
   }
}

testConnection();

module.exports = authDB;
