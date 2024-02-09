const Users = require("../models/user/userModel");
const { isEmpty } = require("../utils/utils")
const { Op } = require("sequelize");

exports.isEmailExist = async (email, user_id = "") => {
    // var where = { email: email, is_deleted: 0 };
    var where = { email: email };
    if (!isEmpty(user_id)) {
        where.id = { [Op.ne]: user_id };
    }
    const is_email_exist = await Users.findAll({
        where: where,
    });
    if (is_email_exist && is_email_exist.length > 0) {
        return true;
    } else {
        return false;
    }
};