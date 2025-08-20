const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter');
const doctorRouter = require('./doctorRouter')
const patientRouter = require('./patientRouter')
const adminRouter = require('./adminRouter')
router.use('/user', userRouter)
router.use('/doc', doctorRouter)
router.use('/patient', patientRouter)
router.use('/adm', adminRouter)
module.exports = router