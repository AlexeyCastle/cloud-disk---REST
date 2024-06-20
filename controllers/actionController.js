const Action = require('../models/Action');
const ApiError = require("../error/ApiError");
class ActionController {
    async addAction(req, res, next) {
        try {
            const {name} = req.body
            if (!name) {
                console.log('err')
            }
            const action = new Action({name})
            await action.save()
            res.status(201).json({ message: 'Действие успешно добавлено', action: action});
        }catch (e) {
            return next(ApiError.internal(e));
        }
    }

    async getActions(req, res, next) {
        return res.json(await Action.find({}))
    }
}


module.exports = new ActionController();
