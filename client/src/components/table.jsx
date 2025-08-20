import React, { useEffect, useState } from "react";
import TimeSelector from "./datePicker";
import TimeTable from "./EntryTable";
import ShineButton from "./shine-button";
import { addMinutes, parse } from "date-fns";
import {
  saveDateTable,
  getDateTable,
  getPatientBySlot,
  cancelAppointment,
} from "../http/docApi";
import { addDays, isBefore, isEqual } from "date-fns";

const Table = () => {
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]); // Массив для выбранных дат
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("15:00");
  const [duration, setDuration] = useState(15);
  const [scheduledTimes, setScheduledTimes] = useState({}); // 💾 храним расписание
  const [occupiedSlots, setOccupiedSlots] = useState([]); // Занятые слоты
  const [modalData, setModalData] = useState(null); // Данные для модального окна
  const [showModal, setShowModal] = useState(false); // Состояние для отображения модального окна
  const [isCanceling, setIsCanceling] = useState(false); // Флаг отмены записи
  const [cancelReason, setCancelReason] = useState(""); // Причина отмены
  useEffect(() => {
    (async () => {
      try {
        const data = await getDateTable();
        if (Object.keys(data.date).length) {
          const datesArr = Object.keys(data.date)
            .map((d) => new Date(d))
            .sort((a, b) => a - b);
          setDates({ startDate: datesArr[0], endDate: datesArr.at(-1) });
          setScheduledTimes(data.date);
        }
        const formatted = data.occupated.map((slotString) => {
          // Разделяем строку на дату и смещение
          const [date, time] = slotString.split("-");

          return { date: date, time: time };
        });
        setOccupiedSlots(formatted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleBuild = ({ startDate, endDate }) => {
    const occupiedDates = occupiedSlots.map((slot) => new Date(slot.date));
    const hasOccupiedOutside = occupiedDates.some(
      (date) => date < startDate || date > endDate
    );
    if (hasOccupiedOutside) {
      window.alert(
        "В расписании есть занятые слоты за пределами выбранного диапазона. Перестройка невозможна."
      );
      return;
    }
    const existingDates = Object.keys(scheduledTimes).map((d) => new Date(d));
    const hasOlder = existingDates.some((date) => date < startDate);
    if (hasOlder) {
      if (
        !window.confirm(
          "В расписании есть даты раньше выбранной даты начала. При продолжении они будут удалены. Продолжить?"
        )
      ) {
        return;
      }
    }

    setDates({ startDate, endDate });
    setSelectedDates([]); // Сброс выбранных дат

    // сохраняем старые слоты в новом диапазоне
    setScheduledTimes((prev) => {
      const updated = {};
      let current = new Date(startDate);
      while (isBefore(current, endDate) || isEqual(current, endDate)) {
        const key = current.toDateString();
        if (prev[key]) {
          updated[key] = prev[key];
        }
        current = addDays(current, 1);
      }
      return updated;
    });
  };

  const handleDateClick = (date) => {
    setSelectedDates((prevSelectedDates) =>
      prevSelectedDates.includes(date)
        ? prevSelectedDates.filter((d) => d !== date)
        : [...prevSelectedDates, date]
    );
  };

  const handleSave = async () => {
    const result = {};
    let current = new Date(dates.startDate);
    while (
      isBefore(current, dates.endDate) ||
      isEqual(current, dates.endDate)
    ) {
      const key = current.toDateString();
      result[key] = scheduledTimes[key] || [];
      current = addDays(current, 1);
    }

    console.log("Сохранённые данные:", JSON.stringify(result));
    const data = await saveDateTable(JSON.stringify(result));
  };

  // Функция для генерации временных слотов
  const generateTimeSlots = () => {
    const slots = [];
    const start = parse(startTime, "HH:mm", new Date());
    const end = parse(endTime, "HH:mm", new Date());
    let current = start;

    while (current <= end) {
      slots.push(current.toTimeString().slice(0, 5)); // формат HH:mm
      current = addMinutes(current, Number(duration));
    }

    return slots;
  };
  const handleGetPatientBySlot = async (time, dateKey) => {
    try {
      // Запрос на получение информации о пользователе, который записан на этот слот
      const userData = await getPatientBySlot(time, dateKey);

      if (userData) {
        // Сохраняем данные в modalData и показываем модальное окно
        setModalData({
          id_entry: userData.id_entry,
          patientName: userData.name,
          phone: userData.phone,
          date: dateKey,
          time: time,
        });
        setShowModal(true); // Показываем модальное окно
      }
    } catch (error) {
      console.error("Ошибка при получении данных о пользователе:", error);
      alert("Произошла ошибка при получении данных.");
    }
  };
  const closeModal = () => {
    setShowModal(false); // Закрытие модального окна
  };
  const handleCancelClick = () => {
    setIsCanceling(true); // Включаем режим отмены записи
  };
  const handleCancelSubmit = async () => {
    // Отправляем данные на сервер с причиной отмены
    if (!cancelReason) {
      alert("Пожалуйста, введите причину отмены.");
      return;
    }
    const data = await cancelAppointment(modalData.id_entry, cancelReason);
    setScheduledTimes((prevScheduledTimes) => {
      const updatedScheduledTimes = { ...prevScheduledTimes };

      // Находим ключ записи и удаляем слот
      const dateKey = modalData.date;
      const time = modalData.time;

      if (updatedScheduledTimes[dateKey]) {
        const updatedSlots = updatedScheduledTimes[dateKey].filter(
          (slot) => slot !== time // Очищаем только нужный слот
        );
        updatedScheduledTimes[dateKey] = updatedSlots; // Перезаписываем слот
      }

      return updatedScheduledTimes; // Возвращаем обновленный объект
    });
    setShowModal(false); 
    // Отправить запрос на сервер с причиной отмены (например, через API)

    // Сбрасываем состояние
    setIsCanceling(false);
    setCancelReason(""); // Очищаем поле ввода
  };
  const handleSubmitTime = () => {
    const slots = generateTimeSlots();

    setScheduledTimes((prev) => {
      const updatedScheduledTimes = { ...prev };
      selectedDates.forEach((dateKey) => {
        updatedScheduledTimes[dateKey] = slots;
      });

      return updatedScheduledTimes;
    });
  };

  const handleTimeSlotDelete = (slotsToDelete) => {
    setScheduledTimes((prevScheduledTimes) => {
      // Копируем все элементы предыдущего состояния
      const updatedScheduledTimes = { ...prevScheduledTimes };

      slotsToDelete.forEach(({ dateKey, rowIndex }) => {
        // Проверяем, существует ли ключ dateKey и существует ли индекс rowIndex
        if (updatedScheduledTimes[dateKey]) {
          // Создаем новый массив для слотов на этот день
          const slots = [...updatedScheduledTimes[dateKey]]; // Копируем текущие слоты для данного дня
          if (slots[rowIndex] !== undefined) {
            slots[rowIndex] = ""; // Очищаем только нужный слот
          }

          // Перезаписываем массив слотов для этого ключа
          updatedScheduledTimes[dateKey] = slots;
        }
      });

      return updatedScheduledTimes;
    });
  };
  // Функция для генерации временных опций (доступных интервалов времени)
  const generateTimeOptions = () => {
    const validDuration = duration > 0 ? duration : 15; // Устанавливаем значение по умолчанию
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += Number(validDuration)) {
        times.push(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}` // Генерация временных слотов в формате HH:mm
        );
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div>
      <TimeSelector initialDates={dates} onSubmit={handleBuild} />
      {dates && (
        <>
          <TimeTable
            startDate={dates.startDate}
            endDate={dates.endDate}
            onDateClick={handleDateClick}
            scheduledTimes={scheduledTimes}
            selectedDates={selectedDates} // передаем массив выбранных дат
            onTimeSlotDelete={handleTimeSlotDelete} // передаем функцию для удаления
            isEditable={true} // Разрешаем редактирование
            occupiedSlots={occupiedSlots}
            handleGetPatientBySlot={handleGetPatientBySlot}
          />
          {selectedDates.length > 0 && (
            <div className="container-date-picker">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <div className="section">
                  <label>Время</label>
                  <div className="row">
                    <select
                      className="input"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <select
                      className="input"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="section" style={{ marginLeft: "5px" }}>
                  <label>Длительность (в минутах)</label>
                  <input
                    type="number"
                    className="input"
                    min="1"
                    step="1"
                    value={duration}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setDuration(""); // Позволяем стереть поле
                      } else if (value >= 1) {
                        setDuration(Number(value)); // Обновляем длительность
                      }
                    }}
                    placeholder="Введите длительность"
                  />
                </div>
              </div>
              <ShineButton
                name="Применить"
                onClick={handleSubmitTime}
                style={{
                  border: "2px solid rgb(186.25, 217.0833333333, 241.25)",
                }}
              />
            </div>
          )}
        </>
      )}
      {showModal && modalData && (
        <div className="filter-modal-overlay">
          <div className="filter-modal-content">
            <div className="filter-header">
              <h2>Прием</h2>
              <button className="close-btn" onClick={closeModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="filter-body">
              <p>
                <strong>Дата: </strong>
                {new Date(modalData.date).toLocaleDateString("ru-RU")}
              </p>
              <p>
                <strong>Время:</strong> {modalData.time}
              </p>
              <p>
                <strong>Пациент:</strong> {modalData.patientName}
              </p>
              <p>
                <strong>Телефон:</strong> {modalData.phone}
              </p>
            </div>
            {isCanceling ? (
              <div>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Введите причину отмены"
                  rows={4}
                  style={{
                    width: "100%",
                    border: "1px solid rgb(158, 163, 165)",
                    borderRadius: "0.3em",
                    margin: "1em 0px",
                    height: "179px",
                  }}
                />
                <button className="apply-btn" onClick={handleCancelSubmit}>
                  Отправить
                </button>
              </div>
            ) : (
              <button className="apply-btn" onClick={handleCancelClick}>
                Отменить запись
              </button>
            )}
          </div>
        </div>
      )}
      <ShineButton
        name="Сохранить"
        onClick={handleSave}
        style={{ border: "2px solid rgb(186.25, 217.0833333333, 241.25)" }}
      />
    </div>
  );
};

export default Table;
