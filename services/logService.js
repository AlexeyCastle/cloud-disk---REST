const Log = require('../models/Log'); // путь к модели Log
const Action = require('../models/Action'); // путь к модели Action
const ApiError = require('../error/ApiError'); // путь к классу ошибок

class LogService {
    static async createLog(description, actionName, userId, next) {
        try {
            const action = await Action.findOne({ name: actionName });
            if (!action) {
                return next(ApiError.internal(`Действие "${actionName}" не найдено`));
            }
            const log = new Log({ description, action: action._id, user: userId });
            await log.save();
        } catch (error) {
            console.error(`Ошибка при создании лога для действия "${actionName}":`, error);
            return next(ApiError.internal('Ошибка при создании лога'));
        }
    }
}

module.exports = LogService;
