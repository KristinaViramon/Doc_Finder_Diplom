import React, { useState, useEffect } from "react";
import Select from "react-select";
import { getUsers, saveData } from "../http/admApi"; // Предположим, что эта функция возвращает пользователей с сервера
import ShineButton from "./shine-button";

const ContentAdmin = () => {
  const [users, setUsers] = useState([]); // Состояние для списка пользователей
  const [specializations, setSpecializations] = useState([]); // Состояние для списка специализаций
  const [selectedEmail, setSelectedEmail] = useState(null); // Состояние для выбранного email
  const [selectedRole, setSelectedRole] = useState(null); // Состояние для выбранной роли
  const [description, setDescription] = useState(""); // Состояние для поля ввода описания
  const [experience, setExperience] = useState(""); // Состояние для поля ввода стажа
  const [selectedSpecialization, setSelectedSpecialization] = useState(null); // Состояние для выбранной специализации

  const roleTranslations = {
    DOCTOR: "Доктор",
    USER: "Пациент",
  };

  useEffect(() => {
    // Получаем пользователей, кроме текущего
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();

        // Форматируем данные для автодополнения
        const usersForSelect = usersData.users.map((user) => ({
          value: user.id,
          label: user.email,
          role: user.role, // Добавляем роль пользователя в данные
          description: user.description,
          experience: user.experience,
          specialization:
            user.role === "DOCTOR" && user.doctor.specialization
              ? user.doctor.specialization.specialization
              : null, // Добавляем специализацию пользователя
        }));
        setUsers(usersForSelect); // Обновляем список пользователей
        setSpecializations(usersData.specializations);
      } catch (error) {
        console.error("Ошибка при загрузке пользователей:", error);
      }
    };

    fetchUsers(); // Вызываем функцию для получения пользователей
    // Вызываем функцию для получения специализаций
  }, []); // Выполняем один раз при монтировании компонента

  const save = async()=>{
    const role = selectedRole.label === "Доктор" ? "DOCTOR" : "USER"
    const data = await saveData(selectedEmail.label, role, selectedSpecialization.label,description, experience)
    console.log(data)
  }
  const handleEmailSelectChange = (selectedOption) => {
    setSelectedEmail(selectedOption);
    setSelectedRole({
      value: selectedOption.role,
      label: roleTranslations[selectedOption.role],
    }); // Устанавливаем роль, связанную с email

    // Если выбран доктор, заполняем поля с описанием и стажем

    setDescription(selectedOption.description || ""); // Заполняем описание
    setExperience(selectedOption.experience || ""); // Заполняем стаж
    setSelectedSpecialization({
      value: selectedOption.specialization,
      label: selectedOption.specialization,
    });
  };

  const handleRoleSelectChange = (selectedOption) => {
    setSelectedRole(selectedOption); // Обновляем выбранную роль
  };

  const handleSpecializationSelectChange = (selectedOption) => {
    setSelectedSpecialization(selectedOption); // Обновляем выбранную специализацию
  };

  // Опции для второго селектора (роль)
  const roleOptions = [
    { value: "DOCTOR", label: roleTranslations.DOCTOR },
    { value: "USER", label: roleTranslations.USER },
  ];

  return (
    <div style={{ minHeight: "20em" }}>
      <Select
        value={selectedEmail}
        onChange={handleEmailSelectChange}
        options={users}
        placeholder="Начните вводить email"
      />

      {selectedEmail && (
        <div style={{ marginTop: "20px" }}>
          <h3>Выберите роль:</h3>
          <Select
            value={selectedRole}
            onChange={handleRoleSelectChange}
            options={roleOptions}
            placeholder="Выберите роль"
          />
        </div>
      )}

      {/* Если роль "Доктор", отображаем дополнительные поля */}
      {selectedRole && selectedRole.value === "DOCTOR" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Дополнительная информация о докторе</h3>

          {/* Селектор для специализации */}
          <div>
            <label htmlFor="specialization">Специализация</label>
            <Select
              value={selectedSpecialization}
              onChange={handleSpecializationSelectChange}
              options={specializations.map((specialization) => ({
                value: specialization.specialization,
                label: specialization.specialization,
              }))}
              placeholder="Выберите специализацию"
            />
          </div>

          <div style={{ marginTop: "10px" }}>
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              value={description ? description : ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание"
              rows="4"
              style={{
                width: "100%",
                border: "1px solid hsl(0, 0%, 80%)",
                borderRadius: "0.3em",
              }}
            />
          </div>
          <div style={{ marginTop: "10px" }}>
            <label htmlFor="experience">Стаж</label>
            <input
              type="number"
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Введите стаж"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid hsl(0, 0%, 80%)",
                borderRadius: "0.3em",
              }}
            />
          </div>
        </div>
      )}
      <ShineButton name="Сохранить" onClick={save}   style={{border:"2px solid rgb(186.25, 217.0833333333, 241.25)"}} />
    </div>
  );
};

export default ContentAdmin;
