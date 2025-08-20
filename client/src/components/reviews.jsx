import React, { useEffect, useState } from "react";
import { getReviews } from "../http/docApi";
import { getDocReviews } from "../http/userAPI";
import {deleteReview} from '../http/admApi'
import "../styles/reviews.css";
const Reviews = ({ doctorId = "", isAdmin = false }) => {
  const [history, setHistory] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      var data = [];
      if (!doctorId) {
        data = await getReviews(); // Здесь получаем данные из API
      } else {
        data = await getDocReviews(doctorId);
      }
      setHistory(data);
    };
    fetchData();
  }, []);
  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId); // Удаляем отзыв по ID
      alert("Отзыв успешно удален");

      // Обновляем список отзывов
      setHistory((prevHistory) =>
        prevHistory.filter((entry) => entry.id !== reviewId)
      );
    } catch (error) {
      console.error("Ошибка при удалении отзыва:", error);
      alert("Произошла ошибка при удалении отзыва.");
    }
  };
  const renderEntry = (entry) => {
    const patient = entry.patient; // Данные пациента
    const review = entry.review; // Данные отзыва
    const date = new Date(entry.date); // Преобразуем строку даты в объект Date

    return (
      <div className="review-section" key={entry.id}>
        {/* ФИО пациента */}
        <div className="patient-name">
          <strong>Пациент: </strong>
          {patient
            ? `${patient.Surname} ${patient.Name} ${patient.LastName}`
            : "Не указано"}
        </div>

        {/* Дата приема */}
        <div className="entry-date">
          <strong>Дата приема: </strong>
          {date.toLocaleDateString("ru-RU")}
        </div>

        {/* Отображение звезд отзыва */}
        <div className="review-stars">
          {[...Array(review.stars)].map((_, index) => (
            <span
              key={index}
              style={{
                cursor: "pointer",
                color: "#FFD700", // Звезды
                fontSize: "2em",
              }}
            >
              &#9733;
            </span>
          ))}
        </div>

        {/* Текст отзыва */}
        <div className="review-text">
          <p>{review.text_review}</p>
        </div>
         {/* Если пользователь админ, показываем кнопку удаления */}
         {isAdmin && (
          <button
            className="delete-review-btn"
            onClick={() => handleDeleteReview(entry.id)}
          ><i class="fa-solid fa-trash-can" style={{margin:"0px 6px"}}/>
            Удалить отзыв
          </button>
        )}
      </div>
    );
  };
  return (
    <div>
      <div className="review-list">
        {history.length ? history.map(renderEntry) : <p>Нет отзывов.</p>}
      </div>
      
    </div>
  );
};

export default Reviews;
