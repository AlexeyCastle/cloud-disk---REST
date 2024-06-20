const jwt = require('jsonwebtoken')
const ApiError = require('../error/ApiError')
const config = require('config')

module.exports = function (role){
    return function (req, res, next){
        if (req.method === 'OPTIONS') {
            return next()
        }
        try {
            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                return res.status(401).json({message: 'Ошибка авторизации'})
            }
            const decoded = jwt.verify(token, config.get('secretKey'))
            if(decoded.role !== role){
                return next(ApiError.forbidden('Нет доступа'))
            }
            req.user = decoded
            next()
        } catch (e) {
            return res.status(401).json({message: 'Ошибка авторизации'})
        }
    }
}






