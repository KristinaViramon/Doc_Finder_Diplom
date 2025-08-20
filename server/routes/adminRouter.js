const Router = require("express");
const router = new Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/getUsers", authMiddleware, adminController.getUsers)
router.post("/saveData", authMiddleware, adminController.saveData);
router.post("/deleteReview", authMiddleware, adminController.deleteReview);
module.exports = router
