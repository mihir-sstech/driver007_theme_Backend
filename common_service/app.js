const express = require("express");
const dotenv = require("dotenv");
const bodyparser = require("body-parser");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

const app = express();

dotenv.config({ path: path.resolve(__dirname, "./.env") });
app.use(cors());
app.use(morgan("dev"));
app.use(bodyparser.json());

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

const port = process.env.PORT || 2700;
app.listen(port, () => {
  console.log("API Port:", port);
  // dbConnection.connectDB();
});
