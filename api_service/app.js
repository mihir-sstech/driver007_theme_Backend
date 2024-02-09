
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const route = require("./routes/index");
const logger = require("common-service/utils/logger");
const cors = require("cors");
const path = require("path");

const app = express();
dotenv.config({ path: path.resolve(__dirname, "./.env") });
app.use(cors());
app.use(bodyParser.json());
app.use("/api/v1", route);

app.use(function (err, req, res, next) {
    logger.log("error", `Internal Server Error | ${err}`);
    if (err.name === "UnauthorizedError") {
        res.status(401).json({ success: false, type: "error", message: "Please Login" });
    } else {
        console.log(err);
        res.status(500).json({
            success: false,
            type: "error",
            message: "Internal Server Error",
        });
    }
});

const port = process.env.PORT || 6708;
app.listen(port, () => {
    console.log("API Port:", port);
});
