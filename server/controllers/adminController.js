const {
  User,
  Doctor,
  Patient,
  Specialization,
  Review,
} = require("../models/models");
const { Op } = require("sequelize");
const reroleToDoctor = async(user)=> {
  user.role = "DOCTOR";
  await user.save();
  const doctor = await Doctor.create({ userId: user.id });
  await Patient.destroy({
    where: {
      userId: user.id,
    },
  });
  return doctor;
}

const reroleToUser= async (user)=> {
  user.role = "USER";
  await user.save();
  const doctor = await Patient.create({ userId: user.id });
  await Doctor.destroy({
    where: {
      userId: user.id,
    },
  });
  return doctor;
}
const setDocSpecialization = async (doctor, spec)=> {
  const specialization = await Specialization.findOne({
    where: { specialization: spec },
  });
  if (doctor && specialization && doctor.specializationId !== specialization.id) {
    await doctor.setSpecialization(specialization);
  }
  return doctor;
}

class adminController {
  async getUsers(req, res) {
    try {
      // Получаем пользователей, исключая текущего
      const users = await User.findAll({
        where: {
          id: {
            [Op.ne]: req.user.id, // Исключаем текущего пользователя
          },
        },
        attributes: ["id", "email", "role"], // Получаем только id и email
        include: [
          {
            model: Doctor, // Включаем информацию о докторе, если роль доктора
            include: [
              {
                model: Specialization, // Включаем специализацию
                attributes: ["specialization"], // Мы только специализацию
              },
            ],
          },
        ],
      });

      // Получаем список всех специализаций
      const specializations = await Specialization.findAll({
        attributes: ["specialization"], // Только поле specialization
      });
      // Формируем ответ, который включает информацию о пользователе и специализации
      const usersWithDetails = users.map((user) => {
        const doctorInfo = user.doctor ? user.doctor : null;
        return {
          ...user.dataValues, // Сохраняем основные данные пользователя
          specialization: doctorInfo ? doctorInfo.Specialization : null,
          description: doctorInfo ? doctorInfo.description : null,
          experience: doctorInfo ? doctorInfo.experience : null,
        };
      });

      return res.json({
        users: usersWithDetails,
        specializations: specializations,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка при получении пользователей" });
    }
  }
 
  async saveData(req, res) {
    try
    {const {
      selectedEmail,
      selectedRole,
      selectedSpecialization,
      description,
      experience,
    } = req.body;
    const user = await User.findOne({
      where: {
        email: selectedEmail,
      },
    });
    if (user.role === "USER" && user.role === selectedRole) {
      return res.json({ message: "нет изменений" });
    }
    if (user.role === "DOCTOR" && user.role !== selectedRole) {
      await reroleToUser(user)
      return res.json({ message: "Смена роли на пациент" });
    }
    let doctor = null;
    if (user.role === "USER" && user.role !== selectedRole) {
      doctor = await reroleToDoctor(user);
    } else {
      doctor = await Doctor.findOne({ where: { userId: user.id } });
    } 
    doctor = await setDocSpecialization(doctor, selectedSpecialization);
    doctor.description = description;
    doctor.experience = experience;
    await doctor.save();
    return res.json({doctor})}catch(e){
      console.error(e)
      return res.json({e})
    }
  }

  async deleteReview(req, res){
    try{
     await Review.destroy({
      where: {
        entryTableId: req.body.idReview,
      },
    });
    return res.json({message: "отзыв удален"})  
    }catch(e){
      console.error(e);
    }
   
  }
}
module.exports = new adminController();
