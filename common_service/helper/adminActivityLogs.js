const adminActivityLog = require("../models/logshub/adminActivityLogsModel");

exports.createAdminActivityLog = async (
  req,
  res = null,
  type,
  module,
  old_values = "",
  new_values = "",
  description = "",
  status_code,
  res_type,
  // next
) => {
  // const responseBody = res ? res.locals.data : null; // Assuming you have stored the response body in res.locals.data

  try {
    const ActivityLog = new adminActivityLog({
      user_id: req?.userProfile?.id || null,
      type,
      module,
      old_values,
      new_values,
      description,
      req_header: JSON.stringify(req.headers) || "",
      req_param: JSON.stringify(req.params) || "",
      req_query: JSON.stringify(req.query) || "",
      req_body: JSON.stringify(req.body) || "",
      res_body: res ? JSON.stringify(res) || "" : "",
      status_code,
      res_type,
    });

    const activtiy_log = await ActivityLog.save();

    //next()
  } catch (error) {
    console.error("Error creating API log:", error);

    // next();
  }
};
