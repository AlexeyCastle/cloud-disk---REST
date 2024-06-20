const Router = require('express')
const router = Router()

const actionRouter = require('../routes/actionRoutes')
const fileRouter = require('../routes/fileRoutes')
const userRouter = require('../routes/userRoutes')
const logRouter = require('../routes/logRoutes')

router.use('/users', userRouter)
router.use('/files', fileRouter)
router.use('/actions', actionRouter)
router.use('/logs', logRouter)




module.exports = router
