const {
  User,
  Doctor,
  Patient,
  Entry_table,
  Review,
} = require("../models/models");
const ApiError = require("../error/ApiError");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: "465",
  secure: true,
  auth: {
    user: "nkouka@inbox.ru",
    pass: "DiyH07dZC5ksjf8qZLWi",
  },
});
const formatDateToRussian = (date) => {
  const months = [
    "Января",
    "Февраля",
    "Марта",
    "Апреля",
    "Мая",
    "Июня",
    "Июля",
    "Августа",
    "Сентября",
    "Октября",
    "Ноября",
    "Декабря",
  ];

  const daysOfWeek = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];

  const d = new Date(date);
  const dayOfWeek = daysOfWeek[d.getDay()]; // День недели
  const day = d.getDate(); // Число
  const month = months[d.getMonth()]; // Месяц
  const year = d.getFullYear(); // Год

  return `${dayOfWeek}, ${day} ${month} ${year} года`;
};
class doctorController {

  async setInformation(req, res) {
    try {
      const { surname, name, lastname, location } = req.body;
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });

      if (!doctor) {
        return res.status(404).json({ message: "Доктор не найден" });
      }

      doctor.Surname = surname;
      doctor.Name = name;
      doctor.LastName = lastname;
      doctor.location = location;

      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const photoPath = `/static/doctor_photos/${req.user.id}${ext}`;
        doctor.photo = photoPath;
      }

      await doctor.save();
      return res.json(doctor);
    } catch (e) {
      console.error("Ошибка при сохранении данных врача:", e);
      res.status(500).json({ message: "Ошибка сервера", error: e.message });
    }
  }

  async getInformation(req, res) {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) {
      return res.status(404).json({ message: "Доктор не найден" });
    }
    return res.json(doctor);
  }

  async setEntryDate(req, res) {
    const { date } = req.body;
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) {
      return res.status(404).json({ message: "Доктор не найден" });
    }
    doctor.date_table = date;
    await doctor.save();
    return res.json(doctor);
  }

  async getEntryDate(req, res) {
    try {
      const doctor = await Doctor.findOne({
        where: { userId: req.user.id },
        include: [{ model: Entry_table, attributes: ["date", "time"] }],
      });
      if (!doctor) {
        return res.status(404).json({ message: "Доктор не найден" });
      }
      // Фильтрация и удаление устаревших дат из date_table
      if (doctor.date_table) {
        const table = JSON.parse(doctor.date_table);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const filteredTable = Object.fromEntries(
          Object.entries(table).filter(
            ([dateStr]) => new Date(dateStr) >= today
          )
        );
        if (JSON.stringify(filteredTable) !== doctor.date_table) {
          doctor.date_table = JSON.stringify(filteredTable);
          await doctor.save();
        }
      }
      // Парсим строку в объект, либо возвращаем пустой объект
      const dateTable = doctor.date_table ? JSON.parse(doctor.date_table) : {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filteredEntries = doctor.entry_tables.filter(
        (entry) => new Date(entry.date) >= today
      );

      const occupiedSlots = filteredEntries.map(
        (entry) => `${entry.date}-${entry.time}`
      );
      return res.json({ date: dateTable, occupated: occupiedSlots });
    } catch (e) {
      console.error("Ошибка при получении расписания:", e);
      res.status(500).json({ message: "Ошибка сервера", error: e.message });
    }
  }
  async uploadCertificates(req, res) {
    try {
      const userId = req.user.id;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "Файлы не были загружены" });
      }

      // Формируем путь к папке с сертификатами
      const folderPath = `/static/certificates/${userId}`;
      const doctor = await Doctor.findOne({ where: { userId } });

      if (!doctor) {
        return res.status(404).json({ message: "Доктор не найден" });
      }
      doctor.certificates = folderPath;

      await doctor.save();

      return res.json({
        message: "Сертификаты успешно загружены и сохранены в базе данных",
      });
    } catch (error) {
      console.error("Ошибка при загрузке сертификатов:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  async getCertificates(req, res) {
    try {
      const userId = req.user.id;
      const doctor = await Doctor.findOne({ where: { userId: userId } });

      if (!doctor || !doctor.certificates) {
        return res.status(404).json({ message: "Сертификаты не найдены" });
      }

      // Путь к папке с сертификатами
      const certificatesFolderPath = path.resolve(
        __dirname,
        "..",
        "static",
        "certificates",
        userId.toString()
      );

      // Получаем список файлов в папке сертификатов
      const files = fs.readdirSync(certificatesFolderPath).map((file) => {
        return `http://localhost:5000/static/certificates/${userId}/${file}`;
      });

      return res.json({ certificates: files });
    } catch (error) {
      console.error("Ошибка при получении сертификатов:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
  async deleteCertificate(req, res) {
    try {
      const { filePath } = req.body; // Получаем путь к файлу из тела запроса
      // Формируем полный путь к файлу на сервере
      const Path = filePath.replace(/^http:\/\/localhost:5000\//, "");

      const fileToDelete = path.resolve(__dirname, "..", Path);
      // Проверяем, существует ли файл
      if (fs.existsSync(fileToDelete)) {
        // Удаляем файл
        fs.unlinkSync(fileToDelete);
      } else {
        return res.status(404).json({ message: "Файл не найден" });
      }

      return res.json({ message: "Сертификат успешно удален" });
    } catch (error) {
      console.error("Ошибка при удалении сертификата:", error);
      res.status(500).json({ message: "Ошибка при удалении сертификата" });
    }
  }
  async getReviews(req, res) {
    try {
      const userId = req.params.doctorId ? req.params.doctorId : req.user.id;

      const doctor = await Doctor.findOne({
        where: req.params.doctorId ? { id: userId } : { userId: userId },
        include: [
          {
            model: Entry_table,
            attributes: ["id", "date"],
            include: [
              {
                model: Patient,
                attributes: ["Surname", "Name", "LastName"],
              },
              {
                model: Review, // Включаем модель Review
                attributes: ["text_review", "stars"],
                required: true, // Этот параметр заставит возвращать только записи с отзывами
              },
            ],
          },
        ],
      });

      // Проверяем, если у доктора нет записей с отзывами
      if (!doctor || !doctor.entry_tables.length) {
        return res.json({ message: "Нет записей с отзывами" });
      }
      return res.json(doctor.entry_tables); // Возвращаем только записи с отзывами
    } catch (e) {
      return res.status(500).json({ message: "Ошибка загрузки" });
    }
  }

  async getPatientBySlot(req, res) {
    try {
      const { date, time } = req.params; // Получаем параметры из запроса
  
      // Запрос на нахождение пациента, связанного с записью по doctorId, date и time
      const doctor = await Doctor.findOne({
        where: {
          userId: req.user.id, // Проверяем, что запись принадлежит врачу с текущим userId
        },
        include: [
          {
            model: Entry_table, // Указываем связь с Entry_table
            where: {
              date: date, // Используем date из запроса
              time: time, // Используем time из запроса
            },
            required: true,
            include: [
              {
                model: Patient,
                attributes:["Surname", "Name", "LastName", "Phone"]
              },
            ],
          },
        ],
      });
      if (!doctor) {
        return res.status(404).json({ message: "Пациент не найден для данного времени и даты" });
      }
      const patient = doctor.entry_tables[0].patient;
      // Возвращаем имя и телефон пациента
      return res.json({
        id_entry: doctor.entry_tables[0].id,
        name: `${patient.Surname} ${patient.Name} ${patient.LastName}`,
        phone: patient.Phone,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Ошибка при получении данных о пациенте" });
    }
  }
  async cancelEntry(req, res) {
    try {
      const { appointmentId, cancelReason } = req.body;
      const entry = await Entry_table.findOne({
        where: { id: appointmentId },
        attributes: ["date", "time"],
        include: [
          {
            model: Doctor, // Включаем модель Doctor для получения данных о враче
            attributes: ["Name", "Surname", "LastName"]
          },
          {
            model: Patient,
            include: [
              {
                model: User, // Включаем модель User для получения email 
                attributes: ["email"], // Извлекаем только email
              },
            ],
          }
        ],
      });

      // Если запись не найдена, возвращаем ошибку
      if (!entry) {
        return res.status(404).json({ message: "Запись не найдена" });
      }

      // Извлекаем email врача из связанной модели User
      const Email = entry.patient.user.email;
      await Entry_table.destroy({
        where: {
          id: appointmentId,
        },
      });
      const formattedDate = formatDateToRussian(entry.date);
      await transporter.sendMail({
        from: "nkouka@inbox.ru",
        to: Email,
        subject: "Запись на прием была отменена", // Тема письма
        html: `
          <html>
            <body>
              <h2>Отмена записи</h2>
              <p><strong>Дата:</strong> ${formattedDate}</p>
              <p><strong>Время:</strong> ${entry.time}</p>
              <p><strong>Врач:</strong> ${
                entry.doctor.Surname + " " + entry.doctor.Name + " " + entry.doctor.LastName
              }</p>
              <p><strong>Причина отмены:</strong> ${
               cancelReason
              }</p>
            </body>
          </html>
        `,
      });
      return res.json({ message: "Запись отменена" }); // Возвращаем сообщение об успехе
    } catch (e) {
      console.error("Ошибка при отмене записи:", e);
      return res
        .status(500)
        .json({ message: "Произошла ошибка, запись не отменена" });
    }
  }
}

module.exports = new doctorController();
