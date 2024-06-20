const Router = require('express')
const router = new Router()
const authMiddleware = require('../middleware/authMiddleware')
const fileController = require('../controllers/fileController')

router.post('/', authMiddleware, fileController.createDir)
router.post('/upload', authMiddleware, fileController.uploadFile)
router.get('/', authMiddleware, fileController.getFiles)
router.get('/download', authMiddleware, fileController.downloadFile)
router.get('/search', authMiddleware, fileController.searchFile)
router.delete('/', authMiddleware, fileController.deleteFile)
router.patch('/rename',authMiddleware, fileController.renameFile)


module.exports = router
