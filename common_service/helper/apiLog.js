const AppApiLog = require("../models/logshub/appApiLogsModel");

exports.createAPILog = async (
  req,
  type,
  response_body = null,
  status_code,
  message = null,
  // next
) => {
  // Extract relevant information from the request and response
  const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  const { method, originalUrl } = req;
  const request_headers = req.headers ? req.headers : req.params;
  const request_body = req.body;
  const request_param = req.params;
  const request_query = req.query;
  const requested_ip = req.connection.remoteAddress;
  const requested_by = req.appUserProfile ? req.appUserProfile.id : null;
  // const response_body = res ? res.locals.data : null; // Assuming you have stored the response body in res.locals.data

  try {
    // Create and save the API log entry
    const apiLog = new AppApiLog({
      method,
      url: fullUrl,
      type: type,
      status_code,
      status: (status_code === 200) ? "Success" : "Error",
      message,
      request_headers: JSON.stringify(request_headers),
      request_body: JSON.stringify(request_body),
      request_param: JSON.stringify(request_param),
      request_query: JSON.stringify(request_query),
      requested_ip: requested_ip,
      requested_by: requested_by,
      response_body: JSON.stringify(response_body),
    });

    apiLog.save();
    //next()
  } catch (error) {
    console.error("Error creating API log:", error);
    // next();
  }
};

