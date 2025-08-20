const bcrypt = require("bcrypt");
const {
  User,
  Doctor,
  Patient,
  Specialization,
  Entry_table,
  VerificationCode,
} = require("../models/models");
const ApiError = require("../error/ApiError");
const jwt = require("jsonwebtoken");
const path = require("path");
const nodemailer = require("nodemailer");
const fs = require("fs");
const generateJwt = (id, email, role) => {
  return jwt.sign({ id: id, email, role }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });
};
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000); // Генерирует случайный код из 6 цифр
}
class UserController {
  async registration(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(ApiError.badRequest("Некорректный email или пароль"));
      }
      const candidate = await User.findOne({ where: { email } });
      if (candidate) {
        return next(ApiError.badRequest("Пользователь уже существует"));
      }

      // Генерация кода подтверждения
      const verificationCode = generateVerificationCode();

      // Устанавливаем дату истечения срока действия кода (например, 10 минут)
      const expirationDate = new Date();
      expirationDate.setMinutes(expirationDate.getMinutes() + 10); // Код действителен 10 минут

      // Сохраняем код в таблице VerificationCode
      await VerificationCode.create({
        email,
        verificationCode,
        expirationDate,
      });

      // Настройка транспорта для отправки email
      let transporter = nodemailer.createTransport({
        host: "smtp.mail.ru",
        port: "465",
        secure: true,
        auth: {
          user: "doc_finder@inbox.ru",
          pass: "z7EJ5ra4DGeCdAPT4rYQ",
        },
      });

      // Отправка письма с кодом подтверждения
      await transporter.sendMail({
        from: "doc_finder@inbox.ru",
        to: email,
        subject: "Подтверждение регистрации",
        text: `Ваш код подтверждения: ${verificationCode}`,
      });

      return res.json({
        message: "На вашу почту был отправлен код для подтверждения.",
      });
    } catch (e) {
      console.error(e);
    }
  }
  async verifyCode(req, res, next) {
    const { email, verificationCode, role, password } = req.body;

    const codeRecord = await VerificationCode.findOne({
      where: { email, verificationCode },
    });

    if (!codeRecord) {
      return res.json({ message: "Неверный код подтверждения" });
    }

    // Проверяем, не истек ли срок действия кода
    if (new Date() > new Date(codeRecord.expirationDate)) {
      return res.json({ message: "Срок действия кода подтверждения истек" });
    }
    const hashPassword = await bcrypt.hash(password, 5);
    const user = await User.create({ email, role, password: hashPassword });
    const patient = await Patient.create({ userId: user.id });
    // Создаем JWT токен
    const token = generateJwt(user.id, user.email, user.role);

    // Удаляем код из временной таблицы
    await VerificationCode.destroy({ where: { email, verificationCode } });

    return res.json({ message: "Регистрация успешна", token });
  }
  async login(req, res, next) {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(ApiError.internal("Пользователь не найден"));
    }
    let comparePassword = bcrypt.compareSync(password, user.password);
    if (!comparePassword) {
      return next(ApiError.internal("Неверный пароль"));
    }
    const token = generateJwt(user.id, user.email, user.role);
    return res.json({ token });
  }

  async bcr(req, res){
    const { password } = req.body;
    const hashPassword = await bcrypt.hash(password, 5);
    res.json({hashPassword})
  }
  async check(req, res) {
    const token = generateJwt(req.user.id, req.user.email, req.user.role);
    return res.json({ token });
  }
  async getDoctors(req, res, next) {
    try {
      const doctors = await Doctor.findAll({
        include: [
          { model: Specialization, attributes: ["specialization"] }, // Добавляем специализацию в ответ
        ],
      });

      // Проходим по всем врачам и фильтруем их date_table
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Устанавливаем начало дня (чтобы сравнивать только по датам)

      for (let doctor of doctors) {
        if (doctor.date_table) {
          const table = JSON.parse(doctor.date_table); // Парсим строку с таблицей

          // Фильтруем записи, оставляя только те, которые равны или позже текущей даты
          const filteredTable = Object.fromEntries(
            Object.entries(table).filter(
              ([dateStr]) => new Date(dateStr) >= today
            )
          );

          // Если таблица изменилась, сохраняем ее
          if (JSON.stringify(filteredTable) !== doctor.date_table) {
            doctor.date_table = JSON.stringify(filteredTable);
            await doctor.save(); // Сохраняем изменения
          }
        }
      }

      return res.json(doctors); // Отправляем список врачей с обновленной date_table
    } catch (error) {
      next(error); // Обработка ошибок
    }
  }

  async getSpecializations(req, res, next) {
    try {
      const specializations = await Specialization.findAll(); // Получаем все специализации
      return res.json(specializations); // Отправляем их в ответе
    } catch (error) {
      next(error); // Обрабатываем ошибки
    }
  }

  async doctorCertificates(req, res) {
    try {
      const { filePath } = req.body;
      const Path = filePath.replace(/^\//, "");
      // Путь к папке с сертификатами
      const certificatesFolderPath = path.resolve(__dirname, "..", Path);

      // Получаем список файлов в папке сертификатов
      const files = fs.readdirSync(certificatesFolderPath).map((file) => {
        return `${filePath}/${file}`;
      });

      return res.json({ certificates: files });
    } catch (error) {
      console.error("Ошибка при получении сертификатов:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
  async getDoctorSchedule(req, res) {
    try {
      const doctorId = req.params.doctorId;

      // Получаем все записи для этого врача
      const entries = await Entry_table.findAll({
        where: { doctorId: doctorId },
        attributes: ["date", "time"], // Получаем только дату и время
      });

      // Преобразуем данные в формат [дата- время]
      const occupiedSlots = entries.map(
        (entry) => `${entry.date}-${entry.time}`
      );

      return res.json(occupiedSlots); // Отправляем список занятых слотов
    } catch (e) {
      console.error("Ошибка при получении расписания врача:", e);
      return res
        .status(500)
        .json({ message: "Ошибка сервера", error: e.message });
    }
  }

  async getDoctorDataById(req, res) {
    try {
      const doctorId = req.params.doctorId;
      const doctor = await Doctor.findOne({
        where: { id: doctorId },
        include: [
          { model: Specialization, attributes: ["specialization"] }, // Добавляем специализацию в ответ
        ],
      });
      return res.json(doctor);
    } catch (e) {
      return res.status(404).json({ message: "Доктор не найден" });
    }
  }
}

module.exports = new UserController();
