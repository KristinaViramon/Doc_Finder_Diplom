const Router = require('express')
const router = new Router()
const patientController = require('../controllers/patientController')
const authMiddleware = require('../middleware/authMiddleware');

router.post('/setInfo', authMiddleware, patientController.setInformation);
router.get('/getInfo', authMiddleware, patientController.getInformation);
router.post('/entry', authMiddleware, patientController.createEntry);
router.get('/getEntryHistory', authMiddleware, patientController.getEntryHistory);
router.post('/cancelEntry', authMiddleware, patientController.cancelEntry);
router.post('/sendReview', authMiddleware, patientController.sendReview);
module.exports = router