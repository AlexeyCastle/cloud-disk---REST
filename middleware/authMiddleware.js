
const jwt = require('jsonwebtoken')
const config = require('config')
const ApiError = require("../error/ApiError");


module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }

    try {
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return next(ApiError.unauthorized('Пользователь не авторизован'))
        }
        const decoded = jwt.verify(token, config.get('secretKey'))
        req.user = decoded
        next()
    } catch (e) {
        return next(ApiError.unauthorized('Пользователь неавторизован'))
    }
}
