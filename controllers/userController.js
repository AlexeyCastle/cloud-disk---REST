const {validationResult} = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const fileService = require("../services/fileService");
const File = require("../models/File");
const Log = require("../models/Log");
const Action = require("../models/Action");
const jwt = require("jsonwebtoken");
const config = require("config");
const ApiError = require("../error/ApiError");
const logService = require("../services/logService");


class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Некорректный запрос", errors})
            }
            const {name, email, password, role} = req.body
            const candidate = await User.findOne({email})
            if (candidate) {
                return next(ApiError.internal('Пользователь с таким email уже существует'))
            }
            const hashPassword = await bcrypt.hash(password, 8)
            const user = new User({name, email, password: hashPassword, role})
            await user.save()
            await fileService.createDir(new File({user: user.id, name: ''}))
            await logService.createLog(`Пользователь ${user.name} зарегистрировался`, 'Регистрация', user.id, next)
            return res.json({message: "Пользователь создан"})
        } catch (e) {
            console.log(e)
            return next(ApiError.badRequest('Серверная ошибка'))
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body
            const user = await User.findOne({email})
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'))
            }
            const isPassValid = bcrypt.compareSync(password, user.password)
            if (!isPassValid) {
                return next(ApiError.badRequest('Ошибка ввода данных'))
            }
            const token = jwt.sign({id: user.id, role: user.role}, config.get("secretKey"), {expiresIn: "1h"})
            await logService.createLog(`Пользователь ${user.name} авторизовался`, 'Логин', user.id, next)
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                }
            })
        } catch (e) {
            console.log(e)
            return next(ApiError.internal('Серверная ошибка'))
        }
    }

    async getUsers(req, res, next) {
        return res.json(await User.find({}))
    }

    async deleteUser(req, res, next) {
        try {
            const {id} = {...req.body, ...req.query}
            const role = req.user.role
            const userId = req.user.id //id под которым вошел пользователь
            if(role === 'user'){
                const user = await User.findById(userId);
                if (!user) {
                    return next(ApiError.badRequest('Пользователь не найден'))
                }
                await User.findOneAndDelete({_id: userId})
                await logService.createLog(`Пользователь ${user.name} удалил свой профиль`, 'Удаление пользователя', user.id, next)
                return res.json({ message: 'Пользователь удален' });
            }
            else {
                if(id){
                    const user = await User.findById(id);
                    if (!user) {
                        return next(ApiError.badRequest('Пользователь не найден'))
                    }
                    await User.findOneAndDelete({_id: id})
                    await logService.createLog(`Администратор удалил пользователя ${user.name}`, 'Удаление пользователя', user.id, next)
                    await logService.createLog(`Администратор удалил пользователя ${user.name}`, 'Удаление пользователя', userId, next)
                    return res.json({ message: 'Пользователь удален' });
                }
                else{
                    const user = await User.findById(userId);
                    if (!user) {
                        return next(ApiError.badRequest('Пользователь не найден'))
                    }
                    await User.findOneAndDelete({_id: userId})
                    await logService.createLog(`Администратор ${user.name} удалил свой профиль`, 'Удаление пользователя', user.id, next)
                    return res.json({ message: 'Пользователь удален' });
                }
            }
        } catch (e) {
            console.log(e);
            return next(ApiError.internal('Ошибка при удалении пользователя'));
        }
    }
    async updateUser(req, res, next) {
        const { id, name, password } = req.body;
        const loginedUserId = req.user.id;
        const role = req.user.role;

        const updateData = {};
        if (name) updateData.name = name;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 8);
            updateData.password = hashedPassword;
        }

        try {
            let user;
            if (role === 'user') {
                user = await User.findByIdAndUpdate(loginedUserId, updateData, { new: true });
                await logService.createLog(`Пользователь ${user.name} изменил данные`, 'Обновление данных пользователя', loginedUserId, next)
            } else {
                if(!id){
                    return next(ApiError.badRequest('Не передан параметр id в запросе'))
                }
                user = await User.findByIdAndUpdate(id, updateData, { new: true });
                const admin = await User.findById(loginedUserId)
                await logService.createLog(`Администратор ${admin.name} изменил данные пользователя ${user.name}`, 'Обновление данных пользователя', id, next)
            }
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            return res.json(user);
        } catch (e) {
            return next(ApiError.internal('Ошибка при изменении данных пользователя'));
        }
    }

}


module.exports = new UserController();
