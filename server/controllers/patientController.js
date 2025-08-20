const {
  User,
  Doctor,
  Patient,
  Entry_table,
  Review,
} = require("../models/models");
const ApiError = require("../error/ApiError");
const { model } = require("../db");
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: "465",
  secure: true,
  auth: {
    user: "doc_finder@inbox.ru",
    pass: "z7EJ5ra4DGeCdAPT4rYQ",
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
class PatientController {
  async setInformation(req, res) {
    try {
      const { surname, name, lastname, location, birthDate, phone } = req.body;
      const patient = await Patient.findOne({ where: { userId: req.user.id } });

      if (!patient) {
        return res.status(404).json({ message: "Пациент не найден" });
      }

      patient.Surname = surname;
      patient.Name = name;
      patient.LastName = lastname;
      patient.PlaceOfLiving = location;
      patient.Birthday = birthDate;
      patient.Phone = phone;
      await patient.save();
      return res.json(patient);
    } catch (e) {
      console.error("Ошибка при сохранении данных пациента:", e);
      res.status(500).json({ message: "Ошибка сервера", error: e.message });
    }
  }

  async getInformation(req, res) {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) {
      return res.status(404).json({ message: "Пациент не найден" });
    }
    return res.json(patient);
  }

  async createEntry(req, res) {
    try {
      const { id: patientId } = await Patient.findOne({
        where: { userId: req.user.id },
      });
      const { doctorId, date, time } = req.body;

      // 1. Проверка: есть ли уже запись у врача на эту дату и время
      const existingEntry = await Entry_table.findOne({
        where: {
          doctorId,
          date,
          time,
        },
      });

      if (existingEntry) {
        return res.json({
          message: "На выбранную дату и время уже есть запись к этому врачу",
        });
      }

      // 2. Получение данных врача
      const { location, Surname, Name, LastName } = await Doctor.findByPk(
        doctorId
      );

      // 3. Создание записи
      const newEntry = await Entry_table.create({
        date,
        time,
        patientId,
        doctorId,
      });

      // 4. Отправка письма
      const yandexMapsLink = `https://yandex.ru/maps/?text=${encodeURIComponent(
        location
      )}`;
      const formattedDate = formatDateToRussian(date);

      await transporter.sendMail({
        from: "doc_finder@inbox.ru",
        to: req.user.email,
        subject: "Запись на прием",
        html: `
        <html>
          <body>
            <h2>Вы записаны на прием!</h2>
            <p><strong>Дата:</strong> ${formattedDate}</p>
            <p><strong>Время:</strong> ${time}</p>
            <p><strong>Врач:</strong> ${Surname} ${Name} ${LastName}</p>
            <p><strong>Адрес приема:</strong> <a href="${yandexMapsLink}" target="_blank">${location}</a></p>
          </body>
        </html>
      `,
      });

      return res.json("Запись прошла успешно");
    } catch (e) {
      console.error("Ошибка при создании записи:", e);
      return res.json({ message: "Ошибка сервера", error: e.message });
    }
  }

  async getEntryHistory(req, res) {
    const patient = await Patient.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: Entry_table,
          attributes: ["id", "date", "time", "doctorId"],
          include: [
            {
              model: Doctor,
              attributes: ["location", "Surname", "Name", "LastName"],
            },
            {
              model: Review,
              attributes: ["text_review", "stars"],
            },
          ],
        },
      ],
    });

    if (!patient) {
      return res.status(404).json({ message: "Пациент не найден" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // обнуляем время, чтобы сравнивать только по датам

    const before = [];
    const after = [];

    patient.entry_tables.forEach((entry) => {
      const entryDate = new Date(entry.date);

      if (entryDate < today) {
        before.push(entry);
      } else {
        after.push(entry);
      }
    });

    return res.json({ before, after });
  }
  async cancelEntry(req, res) {
    try {
      const { appointmentId } = req.body;
      const entry = await Entry_table.findOne({
        where: { id: appointmentId },
        attributes: ["date", "time"],
        include: [
          {
            model: Doctor, // Включаем модель Doctor для получения данных о враче
            include: [
              {
                model: User, // Включаем модель User для получения email врача
                attributes: ["email"], // Извлекаем только email врача
              },
            ],
          },
          {
            model: Patient,
            attributes: ["Name", "Surname", "LastName"],
          },
        ],
      });

      // Если запись не найдена, возвращаем ошибку
      if (!entry) {
        return res.status(404).json({ message: "Запись не найдена" });
      }

      // Извлекаем email врача из связанной модели User
      const doctorEmail = entry.doctor.user.email;

      await Entry_table.destroy({
        where: {
          id: appointmentId,
        },
      });
      const formattedDate = formatDateToRussian(entry.date);
      await transporter.sendMail({
        from: "doc_finder@inbox.ru",
        to: "nkouka@inbox.ru",
        subject: "Запись на прием была отменена", // Тема письма
        html: `
          <html>
            <body>
              <h2>Отмена записи</h2>
              <p><strong>Дата:</strong> ${formattedDate}</p>
              <p><strong>Время:</strong> ${entry.time}</p>
              <p><strong>Пациент:</strong> ${
                entry.patient.Surname +
                " " +
                entry.patient.Name +
                " " +
                entry.patient.LastName
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

  async sendReview(req, res) {
    try {
      const { selectedEntryId, selectedRating, reviewText } = req.body;
      const entry = await Entry_table.findByPk(selectedEntryId);
      await Review.create({
        text_review: reviewText,
        stars: selectedRating,
        patientId: entry.patientId,
        doctorId: entry.doctorId,
        entryTableId: entry.id,
      });
      return res.json({ message: "Отзыв отправлен" });
    } catch (e) {
      return res.json({ message: "Неудалось отправить отзыв" });
    }
  }
}

module.exports = new PatientController();
