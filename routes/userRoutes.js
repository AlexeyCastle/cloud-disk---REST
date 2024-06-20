const Router = require("express");
const {check} = require("express-validator")
const router = new Router()
const authMiddleware = require('../middleware/authMiddleware')
const userController = require('../controllers/userController')

router.post('/registration',
    [
        check('email', "Неверный формат записи email").isEmail(),
        check('password', 'Пароль должен быть длиннее 3 символов, но не больше 12').isLength({min:3, max:12})
    ], userController.registration)


router.post('/login',[
    check('email', 'Неверный формат записи email').isEmail()
], userController.login)

router.get('/',userController.getUsers)
router.delete('/delete',authMiddleware, userController.deleteUser)
router.patch('/update',authMiddleware, userController.updateUser)



module.exports = router
