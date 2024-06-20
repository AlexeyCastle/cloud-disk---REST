const Router = require('express')
const router = new Router()
const ActionController = require('../controllers/ActionController')

router.post('/add',ActionController.addAction )
router.get('/', ActionController.getActions)

module.exports = router
