const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const route = require("./routes/index");
const module_route = require("./routes/moduleRoute");
const cors = require("cors");
const path = require("path");
// const morgan = require("morgan");

const app = express();
dotenv.config({ path: path.resolve(__dirname, "./.env") });

app.use(cors());
// app.use(morgan("dev"));
app.use(bodyParser.json());
app.use("/module", module_route);

// require("common-service/config/authDb");
app.use("/", route);

app.use(function (err, req, res, next) {
   if (err.name === "UnauthorizedError") {
      res.status(401).json({ error: "Please Login" });
   } else {
      console.log(err);
      res.status(500).json({
         type: "error",
         message: "Internal Server Error",
      });
   }
});

const port = process.env.PORT || 2701;
app.listen(port, () => {
   console.log("API Port:", port);
});