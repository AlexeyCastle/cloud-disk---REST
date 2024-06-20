const fs = require('fs')
const config = require('config')
const path = require('path')
const File = require('../models/File')
const { renameFileWithExtension } = require('../services/helpers/fileNameHelper');

class FileService {

    createDir(file) {
        const filePath = `${config.get('filePath')}\\${file.user}\\${file.path}`
        return new Promise(((resolve, reject) => {
            try {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath)
                    return resolve({message: 'Файл создан'})
                } else {
                    return reject({message: "Файл уже существует"})
                }
            } catch (e) {
                return reject({message: 'Файловая ошибка'})
            }
        }))
    }

    deleteFile(file) {
        const path = this.getPath(file)
        if (file.type === 'dir') {
            fs.rmdirSync(path)
        } else {
            fs.unlinkSync(path)
        }
    }

    getPath(file) {
        return config.get('filePath') + '\\' + file.user + '\\' + file.path
    }

    async renameFile(fileId, newFileName, userId, currentUserId, isAdmin) {
        try {
            if (isAdmin) {
                userId = userId || currentUserId;
            } else {
                userId = currentUserId;
            }

            const file = await File.findOne({ _id: fileId, user: userId });


            const oldFileNameWithExtension = file.name;

            const newFileNameWithExtension = renameFileWithExtension(oldFileNameWithExtension, newFileName);

            const oldFilePath = path.join(config.get('filePath'), file.user.toString(), file.path);
            const newFilePath = path.join(config.get('filePath'), file.user.toString(), path.dirname(file.path), newFileNameWithExtension);

            file.name = newFileNameWithExtension;
            file.path = path.join(path.dirname(file.path), newFileNameWithExtension);

            await file.save();

            if (fs.existsSync(oldFilePath)) {
                fs.renameSync(oldFilePath, newFilePath);
            } else {
                console.log('Несуществующий файл', oldFilePath);
            }

            return file;
        } catch (error) {
            console.error(`Ошибка при переименовании файла:`, error);
        }
    }
}


module.exports = new FileService()
