const Router = require('express')
const router = new Router()
const logController = require('../controllers/logController')
const authMiddleware = require('../middleware/authMiddleware')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')

router.get('/', logController.getLogs)
router.delete('/',authMiddleware, checkRoleMiddleware('admin'), logController.clearLogs)


module.exports = router
