const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const route = require("./routes/accountRoute");
const brandRoute = require("./routes/brandRoute");
const cors = require("cors");
const path = require("path");

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
dotenv.config({ path: path.resolve(__dirname, "./.env") });
app.use(cors());
app.use(bodyParser.json());
// require("common-service/config/authDb");
app.use("/account", route);
app.use("/brand", brandRoute);

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

const port = process.env.PORT || 2705;
app.listen(port, () => {
  console.log("API Port:", port);
});
