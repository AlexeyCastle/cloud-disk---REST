const Log = require('../models/Log');
const ApiError = require("../error/ApiError");
class LogController{

    async getLogs(req, res, next){
        try {
            const {id} = {...req.body, ...req.query}
            if(id){
                const logs = await Log.find({user: id});
                return res.json(logs);
            }
            return res.json(await Log.find({}))
        }catch (e) {
            console.log(e)
            return next(ApiError.badRequest(e));
        }
    }

    async clearLogs(req, res, next){
        try{
            const {userId} = {...req.body, ...req.query}
            if(userId){
                const userLogs = await Log.find({user: userId})
                if(!userLogs){
                    return next(ApiError.badRequest('Логи этого пользователя не найдены'));
                }
                await Log.remove({user: userId})
                return res.json({message: `Логи пользователя ${userId} удалены`})
            }
            else {
                await Log.deleteMany()
                return res.json({message: 'Логи удалены'})
            }
        }catch (e) {
            console.log(e)
            return next(ApiError.badRequest(e))
        }
    }

}

module.exports = new LogController();
