const Router = require('express')
const router = new Router()
const doctorController = require('../controllers/doctorController')
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const uploadCertificates = require('../middleware/uploadCertificates');  

router.post('/setInfo', authMiddleware,upload.single("image"), doctorController.setInformation)
router.get('/getInfo', authMiddleware, doctorController.getInformation);
router.post('/saveDateTable', authMiddleware, doctorController.setEntryDate);
router.get('/getDateTable', authMiddleware, doctorController.getEntryDate);
router.post('/uploadCertificates', authMiddleware, uploadCertificates.array('certificates'), doctorController.uploadCertificates);
router.get('/getCertificates', authMiddleware, doctorController.getCertificates);
router.post('/deleteCertificate', authMiddleware, doctorController.deleteCertificate);
router.get('/getReviews', authMiddleware, doctorController.getReviews);
router.get('/getPatientBySlot/:date/:time', authMiddleware, doctorController.getPatientBySlot);
router.post('/cancelEntry', authMiddleware, doctorController.cancelEntry);
module.exports = router