const { Schema, model } = require("mongoose");
const path = require('path');
const fs = require('fs');
const config = require('config');

async function deleteUserDirectory(userId) {
    const userDir = path.join(config.get('filePath'), userId.toString());
    return new Promise((resolve, reject) => {
        fs.rm(userDir, { recursive: true }, (err) => {
            if (err) {
                return reject(new Error('Ошибка при удалении директории пользователя: ' + err.message));
            }
            resolve();
        });
    });
}

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    diskSpace: { type: Number, default: 1024 ** 3 * 10 },
    usedSpace: { type: Number, default: 0 },
    role: { type: String, default: 'user' },
}, { collection: 'user' });

UserSchema.pre('findOneAndDelete', async function (next) {
    try {
        const doc = await this.model.findOne(this.getQuery());
        if (doc) {
            this._user = doc;
        }
        next();
    } catch (e) {
        next(e);
    }
});

UserSchema.post('findOneAndDelete', async function () {
    try {
        if (this._user) {
            await deleteUserDirectory(this._user._id);
        }
    } catch (e) {
        console.error('Ошибка при удалении директории пользователя:', e.message);
    }
});

const User = model('User', UserSchema);

module.exports = User;

