import React, { useState } from "react";
import { format, addDays, isBefore, isEqual } from "date-fns";
import "../styles/entry-table.css";
import ShineButton from "./shine-button";
import { getPatientBySlot, cancelAppointment } from "../http/docApi";
const TimeTable = ({
  startDate,
  endDate,
  onDateClick, // Функция, которая будет передаваться из DoctorPage для открытия модального окна
  scheduledTimes,
  selectedDates = [],
  onTimeSlotDelete,
  isEditable = true,
  occupiedSlots = [],
  handleGetPatientBySlot
}) => {
  const [selectedSlots, setSelectedSlots] = useState([]); // Состояние для выделенных ячеек
  const [time, setTime] = useState(""); // Выбранное время
  
  const generateDates = () => {
    const dates = [];
    let current = new Date(startDate);
    while (isBefore(current, endDate) || isEqual(current, endDate)) {
      dates.push(new Date(current));
      current = addDays(current, 1);
    }
    return dates;
  };

  const dates = generateDates();

  // Найдем максимальное количество временных слотов
  const maxRows = Math.max(
    ...dates.map((date) => scheduledTimes[date.toDateString()]?.length || 0)
  );

  // Функция для проверки, занят ли слот
  const isOccupied = (date, time) => {
    return occupiedSlots.some(
      (slot) => slot.date === date && slot.time === time
    );
  };

  // Логика для выделения ячеек
  const handleCellClick = (rowIndex, dateKey) => {
    if (isEditable) {
      const slotKey = `${dateKey}-${rowIndex}`;
      setSelectedSlots(
        (prevSelectedSlots) =>
          prevSelectedSlots.includes(slotKey)
            ? prevSelectedSlots.filter((slot) => slot !== slotKey) // Убираем из выделенных
            : [...prevSelectedSlots, slotKey] // Добавляем в выделенные
      );

      // Устанавливаем выбранное время
    } else {
      const time = scheduledTimes[dateKey]
        ? scheduledTimes[dateKey][rowIndex]
        : ""; // Получаем время для выбранного слота
      setTime(time);
      onDateClick(dateKey, time);
    }
  };

  
 
  // Логика для клика на даты
  const handleDateClick = (date) => {
    const dateKey = date.toDateString();
    onDateClick(dateKey); // Вызываем переданную функцию для работы с выбранной датой
  };

  const handleDeleteSelectedSlots = () => {
    const slotsToDelete = selectedSlots.map((slotKey) => {
      const [dateKey, rowIndex] = slotKey.split("-");
      return { dateKey, rowIndex: parseInt(rowIndex, 10) };
    });

    // Отправляем только конкретные слоты для удаления
    onTimeSlotDelete(slotsToDelete);
    setSelectedSlots([]); // Сброс выделения
  };
  const handleClearTimeForSelectedDates = () => {
    // Создаем массив объектов с датами и индексами слотов, которые нужно очистить
    const slotsToDelete = [];

    selectedDates.forEach((dateKey) => {
      const slots = scheduledTimes[dateKey] || [];
      slots.forEach((_, index) => {
        slotsToDelete.push({ dateKey, rowIndex: index });
      });
    });

    // Передаем массив слотов для удаления
    onTimeSlotDelete(slotsToDelete);
  };
  return [
    <div className="table-wrapper">
      <table className="time-table">
        <thead>
          <tr>
            {dates.map((date) => (
              <th
                key={date}
                onClick={() => {
                  if (isEditable) {
                    handleDateClick(date); // Вызываем функцию при клике на дату
                  }
                }}
                style={{
                  cursor: isEditable ? "pointer" : "not-allowed", // Меняем курсор в зависимости от возможности редактирования
                  backgroundColor: selectedDates.includes(date.toDateString())
                    ? "white"
                    : "",
                  border: selectedDates.includes(date.toDateString())
                    ? "2px solid rgb(186, 217, 241)"
                    : "",
                }}
              >
                {format(date, "dd.MM")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(maxRows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {dates.map((date, colIndex) => {
                const dateKey = date.toDateString();
                const slots = scheduledTimes[dateKey] || [];
                const time = slots[rowIndex] || "";

                const slotKey = `${dateKey}-${rowIndex}`;
                const isSelected = selectedSlots.includes(slotKey);
                const isOccupiedSlot = isOccupied(dateKey, time); // Проверяем, занят ли слот

                return (
                  <td
                    key={colIndex}
                    onClick={() => {
                      if (!isOccupiedSlot) {
                        handleCellClick(rowIndex, dateKey);
                      } else if (isOccupiedSlot && isEditable) {
                        handleGetPatientBySlot(time, dateKey);
                      }
                    }} // Запрещаем клик на занятые ячейки
                    style={{
                      background: isOccupiedSlot
                        ? "#f8a400"
                        : time
                        ? "#b8e0c4"
                        : "transparent", // Оранжевый для занятых
                      cursor:
                        isOccupiedSlot && !isEditable
                          ? "not-allowed"
                          : isOccupied && isEditable
                          ? "pointer"
                          : "pointer", // Отключаем курсор для занятых
                      border: isSelected ? "2px solid #2e657d" : "",
                    }}
                  >
                    {time}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>,
    <div>
      {selectedSlots.length > 0 && (
        <ShineButton
          onClick={handleDeleteSelectedSlots}
          name="Удалить выбранные слоты"
          style={{ border: "2px solid rgb(186, 217, 241)" }}
        />
      )}
      {selectedDates.length > 0 && (
        <ShineButton
          onClick={handleClearTimeForSelectedDates}
          name="Очистить время для выбранных дат"
          style={{ border: "2px solid rgb(186, 217, 241)" }}
        />
      )}
    </div>,
  ];
};

export default TimeTable;
