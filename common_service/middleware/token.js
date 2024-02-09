const jwt = require('jsonwebtoken')
const moment = require('moment')
const constant = require("../constant/constant.json");

exports.generateTokens = async (tokenfor, type, user) => {
    var jwt_secret;
    var payload
    var tokenExpire
    if (tokenfor === "app") {
        jwt_secret = constant.APP_JWT_SECRET;
    } else if (tokenfor === "admin") { jwt_secret = constant.ADMIN_JWT_SECRET; }

    switch (type) {
        case 'login':
            tokenExpire = moment().add(365, 'days')
            payload = {
                sub: user.id,
                iat: moment().unix(),
                exp: tokenExpire.unix(),
                type
            }
            return jwt.sign(payload, jwt_secret)

        case 'reset-password':
            tokenExpire = moment().add(10, 'minutes')
            payload = {
                sub: user.id,
                iat: moment().unix(),
                exp: tokenExpire.unix(),
                type
            }
            return jwt.sign(payload, jwt_secret)

        case 'user-verify':
            tokenExpire = moment().add(365, 'days')
            payload = {
                sub: user.email,
                iat: moment().unix(),
                exp: tokenExpire.unix(),
                type
            }
            return jwt.sign(payload, jwt_secret)

    }
}