import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/header";
import TimeTable from "../components/EntryTable";
import "../styles/doctor-page.css";
import {
  doctorCertificates,
  getDoctorSchedule,
  getDoctorDataById,
} from "../http/userAPI";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import { useContext } from "react";
import { Context } from "../index";
import "../styles/filter-modal.css"; // Импортируем стили для модального окна
import { saveEntry } from "../http/patientApi"; // Импортируем функцию для сохранения записи
import Reviews from "../components/reviews";
import Footer from "../components/Footer";

const DoctorPage = () => {
  const location = useLocation();
  const { doctor } = location.state || {}; // Получаем данные врача

  const { user } = useContext(Context); // Получаем информацию о пользователе
  const [doctorData, setDoctorData] = useState(doctor || null); // Состояние для данных врача
  const Admin = user.isAdmin;
  const [dates, setDates] = useState(null);
  const [scheduledTimes, setScheduledTimes] = useState({}); // Все записи
  const [certificates, setCertificates] = useState([]);
  const [modalData, setModalData] = useState(null); // Данные для модального окна
  const [showModal, setShowModal] = useState(false); // Состояние для отображения модального окна
  const [coordinates, setCoordinates] = useState(null);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false); // Состояние для успешности записи
  const [occupiedSlots, setOccupiedSlots] = useState([]); // Занятые слоты
  const [currentPage, setCurrentPage] = useState(1); // Текущая страница
  const [itemsPerPage] = useState(3); // Количество сертификатов на странице
  useEffect(() => {
    const { id_doctor } = location.state || {};
    if (id_doctor && !doctorData) {
      const fetchDoctorData = async () => {
        try {
          const data = await getDoctorDataById(id_doctor); // Запрос на получение данных врача по ID
          setDoctorData(data);
        } catch (error) {
          console.error("Ошибка при получении данных врача:", error);
        }
      };

      fetchDoctorData();
    }
    if (doctorData) {
      // Если у нас есть данные врача, то извлекаем и геокодируем адрес
      if (doctorData.location) {
        fetchCoordinatesFromAddress(doctorData.location);
      }
    }
    if (doctorData && doctorData.date_table) {
      const data = JSON.parse(doctorData.date_table);
      if (Object.keys(data).length) {
        const datesArr = Object.keys(data)
          .map((d) => new Date(d)) // Преобразуем строки в объекты Date
          .sort((a, b) => a - b);
        setDates({ startDate: datesArr[0], endDate: datesArr.at(-1) });
        setScheduledTimes(data);
      }
    }

    const fetchCertificates = async () => {
      try {
        const certificatesData = await doctorCertificates(
          doctorData.certificates
        );
        setCertificates(certificatesData.certificates);
      } catch (error) {
        console.error("Ошибка при получении сертификатов:", error);
      }
    };

    if (doctorData) {
      fetchCertificates();
    }

    // Получаем занятые слоты с сервера
    const fetchOccupiedSlots = async () => {
      try {
        const rawSlots = await getDoctorSchedule(doctorData.id); // ["2025-04-23T21:00:00.000Z-13:00", …]

        const formatted = rawSlots.map((slotString) => {
          // Разделяем строку на дату и смещение
          const [date, time] = slotString.split("-");

          return { date: date, time: time };
        });

        setOccupiedSlots(formatted); // Сохраняем отформатированные занятые слоты
      } catch (error) {
        console.error("Ошибка при получении занятых слотов:", error);
      }
    };

    fetchOccupiedSlots(); // Изначально получаем данные

    // Обновляем занятые слоты каждые 5 секунд
    const intervalId = setInterval(fetchOccupiedSlots, 5000);

    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(intervalId);
  }, [location.state, doctorData]);
  // Функция для геокодирования адреса и получения координат
  const fetchCoordinatesFromAddress = async (address) => {
    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=803a134d-e7f7-4fbf-92d1-e95182a65a4e&format=json&geocode=${encodeURIComponent(
          address
        )}`
      );
      const data = await response.json();
      const coords =
        data.response.GeoObjectCollection.featureMember[0]?.GeoObject.Point.pos
          .split(" ")
          .map(Number);
      if (coords) {
        setCoordinates([coords[1], coords[0]]); // Сохраняем координаты
      }
    } catch (error) {
      console.error("Ошибка при геокодировании адреса:", error);
    }
  };

  const handleCellClick = (date, time) => {
    if (!user.isAuth) {
      alert("Пожалуйста, авторизуйтесь для записи на прием.");
      return;
    }

    // Проверяем, занята ли ячейка
    const slotKey = `${date}-${time}`;
    if (occupiedSlots.includes(slotKey)) {
      alert("Этот слот уже занят.");
      return;
    }

    // Заполняем данные для модального окна
    setModalData({
      doctorName: `${doctorData.Surname} ${doctorData.Name} ${doctorData.LastName}`,
      date: date,
      time: time,
      location: doctorData.location,
    });
    setShowModal(true); // Показываем модальное окно
    setIsBookingSuccess(false); // Сброс состояния успешной записи
  };

  const closeModal = () => {
    setShowModal(false); // Закрытие модального окна
  };

  const handleSubmit = async () => {
    // Отправляем данные на сервер
    const response = await saveEntry({
      doctorId: doctorData.id, // ID врача
      date: modalData.date, // Дата приема
      time: modalData.time, // Время приема
    });

    if (response === "Запись прошла успешно") {
      setIsBookingSuccess(true); // Успешная запись
    } else {
      alert(response.message);
    }
  };
  const indexOfLastCertificate = currentPage * itemsPerPage;
  const indexOfFirstCertificate = indexOfLastCertificate - itemsPerPage;
  const currentCertificates = certificates.slice(
    indexOfFirstCertificate,
    indexOfLastCertificate
  );
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <Header />
      <div className="doctor-page">
        <div className="doctor-info">
          <img
            src={
              doctorData && doctorData.photo
                ?  doctorData.photo.replace('/static/', '/media/')
                : "img/doc.png"
            }
            alt={
              doctorData
                ? doctorData.Surname +
                  " " +
                  doctorData.Name +
                  " " +
                  doctorData.LastName
                : "Доктор"
            }
            className="doctor-photo"
          />
          <div className="doctor-details">
            <h1>
              {doctorData ? doctorData.Surname : ""}{" "}
              {doctorData ? doctorData.Name : ""}{" "}
              {doctorData ? doctorData.LastName : ""}
            </h1>
            <p>
              <strong>Специальность:</strong>{" "}
              {doctorData ? doctorData.specialization.specialization : ""}
            </p>
            <p>
              <strong>Стаж:</strong> {doctorData ? doctorData.experience : ""}{" "}
              лет
            </p>
            <p>
              <strong>Описание:</strong>{" "}
              {doctorData ? doctorData.description : ""}
            </p>
          </div>
        </div>
        {coordinates && (
          <div className="doctor-map">
            <YMaps query={{ apikey: "803a134d-e7f7-4fbf-92d1-e95182a65a4e" }}>
              <Map
                defaultState={{ center: coordinates, zoom: 14 }}
                width="100%"
                height="400px"
              >
                <Placemark geometry={coordinates} />
              </Map>
            </YMaps>
          </div>
        )}

        {certificates.length > 0 && (
          <div className="doctor-certificates">
            <h3>Сертификаты</h3>
            <div className="certificate-images">
              {currentCertificates.map((certificate, index) => {
                // Если сертификат является изображением
                const isImage =
                  certificate.endsWith(".jpg") ||
                  certificate.endsWith(".png") ||
                  certificate.endsWith(".jpeg");

                return (
                  <div key={index} className="certificate-item">
                    {isImage ? (
                      <img
                        src={`${certificate.replace('/static/', '/media/')}`}
                        alt={`Сертификат ${index + 1}`}
                        className="certificate-img"
                      />
                    ) : (
                      <a
                        href={`${certificate.replace('/static/', '/media/')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {certificate.split("/").pop()}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Пейджинг */}
            <div className="pagination">
              {Array.from({
                length: Math.ceil(certificates.length / itemsPerPage),
              }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`page-btn ${
                    currentPage === index + 1 ? "active" : ""
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
        {dates && (
          <div className="doctor-entry">
            <h2>Записаться на прием</h2>
            <TimeTable
              startDate={dates.startDate}
              endDate={dates.endDate}
              scheduledTimes={scheduledTimes}
              isEditable={false} // Отключаем редактирование
              onDateClick={handleCellClick}
              occupiedSlots={occupiedSlots} // Передаем занятые слоты
            />
          </div>
        )}
        <div className="doctor-reviews">
            <h2>Отзывы</h2>
            <Reviews doctorId={doctorData.id} isAdmin={Admin} />
          </div>
      </div>

      {/* Модальное окно для записи */}
      {showModal && modalData && (
        <div className="filter-modal-overlay">
          <div className="filter-modal-content">
            <div className="filter-header">
              <h2>Запись на прием</h2>
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
                <strong>Врач:</strong> {modalData.doctorName}
              </p>
              <p>
                <strong>Место приёма:</strong> {modalData.location}
              </p>
            </div>
            <div className="filter-footer">
              {isBookingSuccess ? (
                <p>Запись прошла успешно!</p> // Сообщение об успешной записи
              ) : (
                <button className="apply-btn" onClick={handleSubmit}>
                  Записаться
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer/>
    </div>
  );
};

export default DoctorPage;
