const fileService = require('../services/fileService')
const config = require('config')
const fs = require('fs')
const path = require('path')
const User = require('../models/User')
const File = require('../models/File')
const logService = require('../services/logService')
const ApiError = require('../error/ApiError')

class FileController {
    async createDir(req, res, next) {
        try {
            const {name, type, parent} = req.body
            const file = new File({name, type, parent, user: req.user.id})
            const user = await User.findById(req.user.id)
            const parentFile = await File.findOne({_id: parent})
            if(!parentFile) {
                file.path = name
                await fileService.createDir(file)
            } else {
                file.path = `${parentFile.path}\\${file.name}`
                await fileService.createDir(file)
                parentFile.children.push(file._id)
                await parentFile.save()
            }
            await file.save()
            await logService.createLog(`Пользователь ${user.name} создал папку ${file.name}`, 'Добавление файла', req.user.id, next)
            return res.json(file)
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(e))
        }
    }

    async getFiles(req, res, next) {
        try {
            const id = req.user.id
            return res.json(await File.find({user: id}))

        } catch (e) {
            console.log(e)
            return next(ApiError.internal('Невозможно получить файл'))
        }
    }

    async uploadFile(req, res, next) {
        try {
            const file = req.files.file

            const parent = await File.findOne({user: req.user.id, _id: req.body.parent})
            const user = await User.findOne({_id: req.user.id})

            if (user.usedSpace + file.size > user.diskSpace) {
                return next(ApiError.badRequest('Недостаточно места на диске'))
            }

            user.usedSpace = user.usedSpace + file.size

            let path;
            if (parent) {
                path = `${config.get('filePath')}\\${user._id}\\${parent.path}\\${file.name}`
            } else {
                path = `${config.get('filePath')}\\${user._id}\\${file.name}`
            }

            if (fs.existsSync(path)) {
                return next(ApiError.badRequest('Файл уже существует'))
            }
            file.mv(path)

            const type = file.name.split('.').pop()
            let filePath =  file.name
            if(parent){
                filePath = parent.path + '\\' + file.name
            }
            const dbFile = new File({
                name: file.name,
                type,
                size: file.size,
                path: filePath,
                parent: parent?._id,
                user: user._id
            })
            await dbFile.save()
            await user.save()
            await logService.createLog(`Пользователь ${user.name} загрузил файл ${file.name}`, 'Добавление файла', req.user.id, next)
            res.json(dbFile)
        } catch (e) {
            console.log(e)
            return next(ApiError.internal('Ошибка загрузки файла'))
        }
    }

    async downloadFile(req, res, next) {
        try {
            const file = await File.findOne({_id: req.query.id, user: req.user.id})
            const user = await User.findOne({_id: req.user.id})
            const path = config.get('filePath') + '\\' + req.user.id + '\\' + file.path + '\\'
            if (fs.existsSync(path)) {
                await logService.createLog(`Пользователь ${user.name} скачал файл ${file.name}`, 'Скачивание файла', req.user.id, next)
                return res.download(path, file.name)
            }
            return next(ApiError.internal('Ошибка скачивания файла'))
        } catch (e) {
            console.log(e)
            return next(ApiError.internal('Ошибка скачивания файла'))
        }
    }
    async deleteFile(req, res, next){
        try{
            const params = {...req.body, ...req.query}
            if(req.user.role === "admin"){
                const user = await User.findById(params.userId)
                if(!user) return next(ApiError.badRequest('Пользователь не найден'))
                const file = await File.findOne({_id: params.fileId, user: params.userId})
                if(!file){
                    return next(ApiError.internal('Ошибка удаления файла. Файл не найден'))
                }
                fileService.deleteFile(file)
                await file.deleteOne({_id: params.userId, user: params.userId})
                await logService.createLog(`Администратор удалил файл ${file.name}`, 'Удаление файла', params.userId, next)
                await logService.createLog(`Администратор удалил файл ${file.name}`, 'Удаление файла', req.user.id, next)
                return res.json({message: 'Файл удален'})
            }
            const file = await File.findOne({_id: params.fileId, user: req.user.id})
            const user = await User.findById(req.user.id)
            if(!file){
                return next(ApiError.internal('Ошибка удаления файла. Файл не найден'))
            }
            fileService.deleteFile(file)
            await file.deleteOne({_id: params.userId, user: req.user.id})
            await logService.createLog(`Пользователь ${user.name} удалил файл ${file.name}`, 'Удаление файла', req.user.id, next)
            return res.json({message: 'Файл удален'})
        }catch (e) {
            console.log(e)
            return next(ApiError.internal('Папка не пуста'))
        }
    }
    async searchFile(req, res, next) {
        try {
            const searchName = req.query.search
            let files = await File.find({user: req.user.id})
            return res.json(files.filter(file => file.name.includes(searchName)))
        } catch (e) {
            console.log(e)
            return next(ApiError.internal('Ошибка поиска'))
        }
    }
    async renameFile(req, res, next) {
        try {
            const { fileId, newFileName, userId } = req.body;
            if (!req.user) {
                return next(ApiError.unauthorized('Пользователь не авторизован'));
            }
            const currentUserId = req.user.id;
            const isAdmin = req.user.role === 'admin';
            if (!isAdmin && userId) {
                return next(ApiError.forbidden('Недостаточно прав для выполнения операции'));
            }

            const file = await fileService.renameFile(fileId, newFileName, userId, currentUserId, isAdmin);
            await logService.createLog(`Пользователь переименовал файл`, 'Изменение файла', req.user.id, next)
            return res.json({ message: 'Файл успешно переименован', file });
        } catch (error) {
            console.log(error);
            return next(ApiError.internal('Ошибка при переименовании файла'));
        }
    }
}

module.exports = new FileController()
