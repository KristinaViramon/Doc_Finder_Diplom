const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController');
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/registration', userController.registration)
router.post('/verify-code', userController.verifyCode);
router.post('/login', userController.login)
router.get('/auth', authMiddleware,  userController.check)
router.get('/doctors', userController.getDoctors)
router.get('/specializations', userController.getSpecializations);
router.post('/doctorCertificates',  userController.doctorCertificates);
router.get('/schedule/:doctorId', userController.getDoctorSchedule);
router.get('/getDoctor/:doctorId', userController.getDoctorDataById);
router.get('/getReviews/:doctorId', doctorController.getReviews);
router.post('/bcr', userController.bcr);
module.exports = router