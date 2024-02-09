const express = require("express");
const route = express.Router();
const formidable = require("formidable");
const { isEmpty } = require("common-service/utils/utils");
const { signinRequire } = require("common-service/middleware/authMiddleware");
const {
  brandAddOrEdit,
  brandList,
  brandDetails,
  brandDelete,
  brandStatus,
  brandDropdown,
} = require("../controller/brandController");

route.post(
  "/add-or-edit",
  async (req, res, next) => {
    const form = new formidable.IncomingForm();
    form.multiples = true; // Set the multiples option to false
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({
          type: "Error",
          message: "Something went wrong",
        });
      }
      for (const field in fields) {
        if (Array.isArray(fields[field]) && fields[field].length === 1) {
          fields[field] = fields[field][0];
        }
      }
      req.body = fields;
      req.brand_logo =
        !isEmpty(files) && files.brand_logo ? files.brand_logo : {};
      req.brand_image =
        !isEmpty(files) && files.brand_image ? files.brand_image : {};
      next();
    });
  },
  signinRequire,
  brandAddOrEdit
);

route.put(
  "/add-or-edit",
  async (req, res, next) => {
    const form = new formidable.IncomingForm();
    form.multiples = true; // Set the multiples option to false
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({
          type: "Error",
          message: "Something went wrong",
        });
      }
      for (const field in fields) {
        if (Array.isArray(fields[field]) && fields[field].length === 1) {
          fields[field] = fields[field][0];
        }
      }
      req.body = fields;
      req.brand_logo =
        !isEmpty(files) && files.brand_logo ? files.brand_logo : {};
      req.brand_image =
        !isEmpty(files) && files.brand_image ? files.brand_image : {};
      next();
    });
  },
  signinRequire,
  brandAddOrEdit
);
route.get("/getall", signinRequire, brandList);
route.get("/get/:id", signinRequire, brandDetails);
route.delete("/delete/:id", signinRequire, brandDelete);
route.put("/change-status", signinRequire, brandStatus);
route.get("/get-list", signinRequire, brandDropdown);

module.exports = route;
