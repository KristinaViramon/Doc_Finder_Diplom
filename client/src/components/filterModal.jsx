import React, { useState, useEffect } from "react";
import "../styles/filter-modal.css"; // Импортируем стили для модального окна
import { fetchSpecializations } from "../http/userAPI"; // Функция для получения специализаций с сервера
import ShineButton from "./shine-button";

const FilterModal = ({ isOpen, onClose, onFilter }) => {
  const [specializations, setSpecializations] = useState([]); // Список специализаций
  const [selectedSpecializations, setSelectedSpecializations] = useState([]); // Выбранные специализации
  const [experience, setExperience] = useState([]); // Выбранный диапазон стажа

  useEffect(() => {
    const loadSpecializations = async () => {
      try {
        const fetchedSpecializations = await fetchSpecializations(); // Запрос на сервер для получения специализаций
        setSpecializations(fetchedSpecializations);
      } catch (error) {
        console.error("Ошибка при загрузке специализаций:", error);
      }
    };

    loadSpecializations(); // Загружаем специализации при открытии модального окна
  }, []);

  const handleSpecializationChange = (e) => {
    const value = e.target.value;
    setSelectedSpecializations((prevSelected) => {
      if (prevSelected.includes(value)) {
        return prevSelected.filter((item) => item !== value); // Убираем из выбранных
      } else {
        return [...prevSelected, value]; // Добавляем в выбранные
      }
    });
  };

  const handleReset = () => {
    setSelectedSpecializations([]); // Сбрасываем выбранные специализации
    setExperience([]); // Сбрасываем выбранные диапазоны стажа
  };

  const handleExperienceChange = (e) => {
    const value = e.target.value;
    setExperience((prevExperience) => {
      if (prevExperience.includes(value)) {
        return prevExperience.filter((item) => item !== value); // Убираем из выбранных
      } else {
        return [...prevExperience, value]; // Добавляем в выбранные
      }
    });
  };

  const handleApplyFilter = () => {
    onFilter({ specializations: selectedSpecializations, experience });
    onClose(); // Закрытие модального окна после применения фильтра
  };

  if (!isOpen) return null; // Если модальное окно не открыто, ничего не рендерим

  const hasSelection = selectedSpecializations.length > 0 || experience.length > 0; // Проверяем, выбраны ли фильтры

  return (
    <div className="filter-modal-overlay">
      <div className="filter-modal-content">
        <div className="filter-header">
          <h2>Фильтр</h2>
          <button className="close-btn" onClick={onClose}>
          <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="filter-body">
          <div className="filter-option">
            <label>Специальность</label>
            <div className="specializations-list">
              {specializations.map((specialization) => (
                <div key={specialization.id} className="specialization-option">
                  <input
                    type="checkbox"
                    value={specialization.specialization}
                    checked={selectedSpecializations.includes(specialization.specialization)}
                    onChange={handleSpecializationChange}
                  />
                  <label>{specialization.specialization}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="filter-option">
            <label>Стаж</label>
            <div className="experience-list">
              <div className="experience-options">
                <input
                  type="checkbox"
                  value="lessThan10"
                  checked={experience.includes("lessThan10")}
                  onChange={handleExperienceChange}
                />
                <label>Менее 10 лет</label>
              </div>
              <div className="experience-options">
                <input
                  type="checkbox"
                  value="moreThan10"
                  checked={experience.includes("moreThan10")}
                  onChange={handleExperienceChange}
                />
                <label>Более 10 лет</label>
              </div>
              <div className="experience-options">
                <input
                  type="checkbox"
                  value="moreThan20"
                  checked={experience.includes("moreThan20")}
                  onChange={handleExperienceChange}
                />
                <label>Более 20 лет</label>
              </div>
            </div>
          </div>
        </div>
        <div className="filter-footer">
          {/* Показываем кнопку сброса только если выбран хотя бы один фильтр */}
          {hasSelection && (
            <button className="reset-btn" onClick={handleReset}>
              Сбросить
            </button>
          )}
          <button onClick={handleApplyFilter} className="apply-btn">
            Применить
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
