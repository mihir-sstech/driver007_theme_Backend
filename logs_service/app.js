
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const logs_route = require("./routes/logsRoute");
const cors = require("cors");
const path = require("path");

const app = express();
dotenv.config({ path: path.resolve(__dirname, "./.env") });
app.use(cors());
app.use(bodyParser.json());
app.use("/logs", logs_route);

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

const port = process.env.PORT || 6709;
app.listen(port, () => {
    console.log("API Port:", port);
});
