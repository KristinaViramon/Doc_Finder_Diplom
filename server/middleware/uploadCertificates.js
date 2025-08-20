const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем новый storage для сертификатов
const storageCertificates = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user.id;
    const uploadPath = path.resolve(__dirname, '..', 'static', 'certificates', userId.toString()); // Папка для сертификатов
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // сохраняем оригинальное расширение
    cb(null, `${Date.now()}${ext}`); // Генерируем уникальное имя для каждого файла
  }
});

const uploadCertificates = multer({ storage: storageCertificates });

module.exports = uploadCertificates;
