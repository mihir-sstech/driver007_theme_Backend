const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { generateTokens } = require("common-service/middleware/token");
const { isEmpty, transformedPermData } = require("common-service/utils/utils");
const {
  sendResetPasswordEmail,
  emailSending,
} = require("common-service/utils/sendEmail");
const {
  createAdminActivityLog,
} = require("common-service/helper/adminActivityLogs");
const common = require("common-service/statics/static.json");
const constant = require("common-service/constant/constant.json");
const {
  Users,
  Role,
  Token,
  Permission,
  RolePermission,
  AdminModules,
  Company,
} = require("common-service/models/index");
const authority = [
  common.roles.SUPER_ADMIN,
  common.roles.COMPANY_ADMIN,
  common.roles.ACCOUNT_ADMIN,
];

exports.signin = async (request) => {
  const { email, password } = request.body;
  console.log('email, password : ', email, password);
  var data = {};
  var role_data = "";
  try {
    if (!email || !password) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.blank_login_details,
      };
    }

    const user = await Users.findOne({
      where: {
        email: email,
        is_email_verified: true,
        is_deleted: 0,
      },
    });
    if (!user) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.invalid_login_details,
      };
    }
    if (!isEmpty(user.role_id)) {
      const user_role = await Role.findOne({
        where: {
          id: user.role_id,
          enable: 1,
          role_name: { [Op.in]: authority },
        },
        attributes: ["id", "role_name", "enable"],
        raw: true,
      });
      if (isEmpty(user_role)) {
        return {
          statusCode: common.response_status_code.unauthorized,
          type: common.response_type.error,
          message: common.response_msg.unauthorized_login,
        };
      }

      role_data = user_role;
      console.log('user_role: ', user_role);
    }
    const isMatch = await user.correctPassword(password);
    if (!isMatch) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.invalid_login_details,
      };
    }

    const userData = await Users.findOne({
      where: {
        email: email,
        is_email_verified: true,
        enable: 1,
        is_deleted: 0,
      },
    });
    if (!userData?.enable || userData.is_deleted > 0) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.deactive_user_not_login,
      };
    }
    const company_id = userData?.company_id;
    const company = await Company.findOne({
      where: {
        id: company_id,
        enable: 1,
      },
    });
    if (!company) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.deactive_user_not_login,
      };
    }

    // if (!user.enable || user.is_deleted > 0) {
    //   return {
    //     statusCode: common.response_status_code.bad_request,
    //     type: common.response_type.error,
    //     message: common.response_msg.user_deactived,
    //   };
    // }

    user.last_login = Date.now();
    await user.update({ last_login: Date.now() });

    const token = await generateTokens("admin", "login", user);

    var ip = request.connection.remoteAddress;
    var latest_token = { token: token, user_id: user.id, ip_address: ip };

    await Token.create(latest_token); // everytime INSERT new record for login TOKEN

    /* If data exist with given user_id then, UPDATE login token insted of new INSERT */
    // var prev_token = await Token.findOne({ where: { user_id: user.id }, attributes: ["id", "user_id"], raw: true, });
    // if (prev_token) { latest_token.id = prev_token.id; }
    // await Token.upsert(latest_token);

    request.userProfile = {};
    request.userProfile.id = user.id;
    createAdminActivityLog(
      request,
      null,
      "login",
      common.admin_module.auth,
      "",
      "",
      `User "${user.name}" logged in successfully`,
      common.response_status_code.success,
      common.response_type.success
    );

    const user_details = await Users.findOne({
      where: { email: email },
      attributes: [
        "id",
        "name",
        "email",
        "role_id",
        "company_id",
        "account_id",
        "last_login",
        "country",
        "enable",
      ],
      raw: true,
    });
    user_details.role = role_data;
    var transformed_data = {};
    const user_perm = await RolePermission.findOne({
      where: { role_id: user_details.role_id },
      attributes: ["permissions"],
      raw: true,
    });
    if (!isEmpty(user_perm) && !isEmpty(user_perm.permissions)) {
      const perm_data = await Permission.findAll({
        where: { key: { [Op.in]: user_perm.permissions } },
        attributes: ["id", "name", "key"],
        raw: true,
        nest: true,
        include: [
          {
            model: AdminModules,
            as: "admin_module",
            attributes: ["name"],
            raw: true,
          },
        ],
      });

      transformed_data = transformedPermData(perm_data);
    }
    user_details.permissions =
      role_data.role_name === common.roles.SUPER_ADMIN ? {} : transformed_data;

    data.token = token;
    data.user = user_details;
    return {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.user_loggedin,
      data: data,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.forgotPassword = async ({ email }) => {
  try {
    if (!email) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.invalid_email,
      };
    }

    const user = await Users.findOne({ where: { email: email } });
    if (!user) {
      return {
        statusCode: common.response_status_code.not_found,
        type: common.response_type.error,
        message: common.response_msg.not_found_user,
      };
    }

    // const token = await generateTokens("admin", "reset-password", user);
    // await user.update({ forgot_email_token: token });
    // await sendResetPasswordEmail(email, token);
    // ------------------------------------------
    let company_id = user.company_id;
    const comp_data = await Company.findOne({
      where: { is_root_company: true, is_deleted: 0, enable: 1 },
      attributes: ["id"],
      raw: true,
    });
    if (isEmpty(company_id)) {
      company_id = comp_data.id || null;
    }

    const token = await generateTokens("admin", "reset-password", user);
    await user.update({ forgot_email_token: token });

    const template_id = common.email_template.user_pass_reset_request;
    let replacements = {
      USERNAME: user.name,
      RESETLINK: `<a href='${constant.CLIENT_URL}/reset-password?uid=${token}'><b>Click here</b></a>`,
    };
    await emailSending(user.email, company_id, template_id, replacements);

    msg_str = common.response_msg.verify_email_sent;
    // ------------------------------------------

    return {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.forgot_pass_email_sent,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.resetPassword = async (request) => {
  const { token, password, confirm_password } = request.body;
  if (!token) {
    return {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      message: common.response_msg.blank_token,
    };
  }
  jwt.verify(token, `${constant.ADMIN_JWT_SECRET}`, (err) => {
    if (err) throw common.response_msg.invalid_token;
  });

  try {
    if (!password || !confirm_password) {
      return {
        statusCode: common.response_status_code.not_acceptable,
        type: common.response_type.error,
        message: common.response_msg.required_details,
      };
    }

    if (password !== confirm_password) {
      return {
        statusCode: common.response_status_code.not_acceptable,
        type: common.response_type.error,
        message: common.response_msg.confpass_not_matche,
      };
    }

    const { sub } = jwt.decode(token);
    let user = await Users.findOne({ where: { id: sub, is_deleted: 0 } });

    if (!user) {
      return {
        statusCode: common.response_status_code.not_found,
        type: common.response_type.error,
        message: common.response_msg.invalid_token,
      };
    }

    if (user.forgot_email_token !== token) {
      return {
        statusCode: common.response_status_code.not_found,
        type: common.response_type.error,
        message: common.response_msg.invalid_token,
      };
    }

    const updated_salt = Users.generateSalt();
    const hass_pass = Users.encryptPassword(password, updated_salt);

    const updatedFields = {
      salt: updated_salt,
      password: hass_pass,
      // password: password,
      forgot_email_token: "",
      updated_by: user.id,
      updated_on: Date.now(),
    };
    await user.update(updatedFields);

    request.userProfile = {};
    request.userProfile.id = user.id;
    createAdminActivityLog(
      request,
      null,
      "login",
      common.admin_module.auth,
      "",
      "",
      `Password reset successfully for user "${user.name}"`,
      common.response_status_code.success,
      common.response_type.success
    );

    return {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.reset_pass,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.logout = async (token, request) => {
  try {
    if (!token) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.blank_token,
      };
    }
    const tokenExist = await Token.findOne({
      where: { token: token },
      attributes: ["id", "token", "user_id", "ip_address"],
    });

    if (!tokenExist) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.token_not_found,
      };
    }

    // await tokenExist.update({ token: "" });
    await Token.destroy({ where: { token: token } });

    let user = await Users.findByPk(tokenExist.user_id);
    request.userProfile = {};
    request.userProfile.id = user.id;
    createAdminActivityLog(
      request,
      null,
      "logout",
      common.admin_module.auth,
      "",
      "",
      `User "${user.name}" logout successfully`,
      common.response_status_code.success,
      common.response_type.success
    );

    return {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.logout_done,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.loginUserData = async (data) => {
  delete data.role;
  delete data.permissions;

  if (!data.enable) {
    return {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      message: common.response_msg.user_deactived,
    };
  }

  return {
    statusCode: common.response_status_code.success,
    type: common.response_type.success,
    message: common.response_msg.get_loggedin_userdata,
    user_details: data,
  };
};

exports.test = async () => {
  try {
    var tt = await Role.findAll();
    var dd = await Permission.findAll();
    var ss = await RolePermission.findAll();
  } catch (error) {
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.roleAddOrEdit = async (request) => {
  const { userProfile } = request;
  var body = request.body;
  var role_name = body.role_name;
  role_name = role_name.toLowerCase();
  body.role_name = role_name;

  try {
    if (!role_name) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.role_name_blank,
      };
    }
    var where = {};
    if (request.method == "PUT") {
      if (!body.id) {
        return {
          statusCode: common.response_status_code.bad_request,
          type: common.response_type.error,
          message: common.response_msg.role_id_blank,
        };
      }

      role_id = body.id;
      delete body.id;

      where = { id: { [Op.ne]: role_id }, role_name: role_name };
    } else {
      where = { role_name: role_name };
    }

    var is_role_exist = await Role.findOne({
      where: where,
    });
    if (!isEmpty(is_role_exist)) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.role_exist,
      };
    }

    if (request.method == "PUT") {
      await Role.update(body, {
        where: { id: role_id },
      });
    } else {
      await Role.create(body);
    }

    var msg = "";
    if (request.method == "PUT") {
      msg = common.response_msg.role_updated;
    } else {
      msg = common.response_msg.role_created;
    }
    return {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: msg,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.getRoleList = async (request) => {
  const { id } = request.params;
  const { type } = request.query;
  const { userProfile } = request;
  try {
    var data = [];
    if (type === "forgetbyid" && !isEmpty(id)) {
      data = await Role.findByPk(id);
    } else if (
      type === "forlistingpage" &&
      userProfile.role.role_name === common.roles.SUPER_ADMIN
    ) {
      data = await Role.findAll({
        attributes: ["id", "role_name", "role_description", "enable"],
        order: [["created_at", "desc"]],
      });
    } else if (type === "fordropdown") {
      let where = "";
      if (userProfile.role.role_name === common.roles.SUPER_ADMIN) {
        where = { enable: 1 };
      } else if (userProfile.role.role_name === common.roles.COMPANY_ADMIN) {
        where = {
          enable: 1,
          role_name: {
            [Op.notIn]: [
              common.roles.COMPANY_ADMIN,
              common.roles.SUPER_ADMIN,
              common.roles.CUSTOMER,
            ],
          },
        };
      } else if (userProfile.role.role_name === common.roles.ACCOUNT_ADMIN) {
        where = {
          enable: 1,
          role_name: {
            [Op.in]: [common.roles.ACCOUNT_STANDARD, common.roles.DRIVER],
          },
        };
      }
      if (!isEmpty(where)) {
        data = await Role.findAll({
          where: where,
          attributes: ["id", "role_name", "enable"],
          order: [["role_name", "ASC"]],
          raw: true,
        });
      }
    }

    return {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.role_details,
      data: data,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.getRoleDetail = async (req) => {
  const { id } = req.params;
  try {
    const exist_role_data = await Role.findByPk(id);
    if (isEmpty(exist_role_data)) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.role_not_exist,
        data: [],
      };
    }
    return {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.role_details,
      data: exist_role_data,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.getPermRoleWise = async (req) => {
  try {
    const { role_id } = req.query;

    if (isEmpty(role_id)) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.role_id_blank,
      };
    }

    const role_data = await Role.findOne({ where: { id: role_id } });
    if (isEmpty(role_data)) {
      return {
        statusCode: common.response_status_code.bad_gateway,
        type: common.response_type.error,
        message: common.response_msg.role_not_exist,
        data: { role_name: "", permissions: [] },
      };
    }
    const role_wise_perm = await RolePermission.findOne({
      where: { role_id: role_id },
    });
    if (
      isEmpty(role_wise_perm) ||
      (role_wise_perm && isEmpty(role_wise_perm.permissions))
    ) {
      return {
        statusCode: common.response_status_code.success,
        type: common.response_type.success,
        message: common.response_msg.perm_not_granted,
        data: { role_name: role_data.role_name, permissions: [] },
      };
    }
    const perm_data = await Permission.findAll({
      where: {
        key: { [Op.in]: role_wise_perm.permissions },
        superadmin_access: false,
      },
      attributes: ["id", "name", "key"],
      raw: true,
      nest: true,
      include: [
        {
          model: AdminModules,
          as: "admin_module",
          attributes: ["name"],
          raw: true,
        },
      ],
    });
    var transformed_data = transformedPermData(perm_data, "sorted");

    return {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.permissions_get,
      data: { role_name: role_data.role_name, permissions: transformed_data },
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.editPermRoleWise = async (req) => {
  const { body } = req;
  try {
    if (!body.role_id || isEmpty(body.role_id)) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.role_id_blank,
      };
    }
    const permlist = await RolePermission.findOne({
      where: { role_id: body.role_id },
    });
    if (!isEmpty(permlist)) {
      await RolePermission.update(
        { permissions: body.permissions },
        {
          where: { role_id: body.role_id },
        }
      );
    } else {
      await RolePermission.create(body);
    }

    return {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.permission_updated,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.permissionAdd = async (req) => {
  const { body } = req;
  try {
    const permlist = await Permission.findOne({ where: { key: body.key } });
    console.log(permlist);

    if (isEmpty(permlist)) {
      await Permission.create(body);

      return {
        statusCode: common.response_status_code.success,
        type: common.response_type.success,
        message: common.response_msg.permissions_create,
      };
    } else {
      return {
        statusCode: common.response_status_code.success,
        type: common.response_type.success,
        message: common.response_msg.module_perm_add,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.permissionGetAll = async (req) => {
  try {
    const perm_data = await Permission.findAll({
      where: { superadmin_access: false, is_deleted: 0 },
      attributes: ["id", "name", "key"],
      raw: true,
      nest: true,
      include: [
        {
          model: AdminModules,
          as: "admin_module",
          attributes: ["name"],
          where: { superadmin_access: false },
          raw: true,
        },
      ],
    });
    var transformed_data = transformedPermData(perm_data, "sorted");
    return {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.permissions_get,
      data: transformed_data,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};
