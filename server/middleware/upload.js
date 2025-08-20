const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.resolve(__dirname, '..', 'static', 'doctor_photos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // сохраняем оригинальное расширение
    const userId = req.user.id;
    cb(null, `${userId}${ext}`); // например: 42.jpg
  }
});

const upload = multer({ storage });

module.exports = upload;
