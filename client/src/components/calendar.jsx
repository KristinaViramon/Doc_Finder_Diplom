import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "../styles/calendaric.css";
import Header from "./header";
import {
  entryHistory,
  cancelAppointment,
  submitReview,
} from "../http/patientApi";
import "../styles/entry_history.css";
import ShineButton from "./shine-button";
function Calendaric() {
  const [date, setDate] = useState(new Date());
  const [history, setHistory] = useState({ before: [], after: [] });
  const [entriesByDate, setEntriesByDate] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false); // Показывать модальное окно отзыва
  const [selectedRating, setSelectedRating] = useState(0); // Оценка в звездах
  const [reviewText, setReviewText] = useState(""); // Текст отзыва
  const [selectedEntryId, setSelectedEntryId] = useState(null); // ID записи, для которой пишется отзыв
  useEffect(() => {
    const fetchData = async () => {
      const data = await entryHistory();
      setHistory({ before: data.before, after: data.after });

      const allEntries = [...data.before, ...data.after];
      const grouped = allEntries.reduce((acc, entry) => {
        const d = new Date(entry.date).toISOString().slice(0, 10);
        if (!acc[d]) acc[d] = [];
        acc[d].push(entry);
        return acc;
      }, {});
      setEntriesByDate(grouped);
    };
    fetchData();
  }, []);

  const selectedDateKey = date.toISOString().slice(0, 10);
  const selectedEntries = entriesByDate[selectedDateKey] || [];
  const handleCancelAppointment = async (appointmentId) => {
    try {
      // Сделайте запрос на сервер для отмены записи
      await cancelAppointment(appointmentId); // Предполагается, что у вас есть такая функция в API
      alert("Запись отменена.");
      // Обновите состояние, чтобы удалить отменённую запись из истории
      setHistory((prevHistory) => ({
        ...prevHistory,
        after: prevHistory.after.filter((entry) => entry.id !== appointmentId),
      }));
    } catch (error) {
      console.error("Ошибка при отмене записи:", error);
      alert("Произошла ошибка при отмене записи.");
    }
  };
  const openReviewModal = (entryId) => {
    setSelectedEntryId(entryId);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedRating(0);
    setReviewText("");
  };
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dateKey = date.toISOString().slice(0, 10);
      if (entriesByDate[dateKey] && entriesByDate[dateKey].length > 0) {
        return (
          <div
            style={{
              height: 6,
              width: 6,
              borderRadius: "50%",
              background: "#169bd5",
              margin: "0 auto",
              marginTop: 2,
            }}
          />
        );
      }
    }
    return null;
  };
  const handleReviewSubmit = async () => {
    try {
      await submitReview(selectedEntryId, selectedRating, reviewText);
      alert("Отзыв успешно отправлен!");
      closeReviewModal();

      // Обновляем локальное состояние history — добавляем отзыв в нужную запись
      setHistory((prevHistory) => {
        // Функция для обновления записи с нужным id
        const updateEntry = (entry) => {
          if (entry.id === selectedEntryId) {
            return {
              ...entry,
              review: {
                stars: selectedRating,
                text_review: reviewText,
              },
            };
          }
          return entry;
        };

        return {
          before: prevHistory.before.map(updateEntry),
          after: prevHistory.after.map(updateEntry),
        };
      });

      // Аналогично обновляем grouped entries
      setEntriesByDate((prevEntriesByDate) => {
        // Найти дату записи, чтобы обновить её в группе
        const newEntriesByDate = { ...prevEntriesByDate };
        for (const dateKey in newEntriesByDate) {
          newEntriesByDate[dateKey] = newEntriesByDate[dateKey].map((entry) => {
            if (entry.id === selectedEntryId) {
              return {
                ...entry,
                review: {
                  stars: selectedRating,
                  text_review: reviewText,
                },
              };
            }
            return entry;
          });
        }
        return newEntriesByDate;
      });
    } catch (error) {
      console.error("Ошибка при отправке отзыва:", error);
      alert("Произошла ошибка при отправке отзыва.");
    }
  };

  const renderEntry = (entry) => {
    const today = new Date();
    const entryDate = new Date(entry.date);

    const isFutureEntry = entryDate >= today;
    const isPastEntry = entryDate < today;

    return (
      <div key={entry.id} className="doctor-tile">
        <div style={{ display: "flex" }}>
          <div className="entry-date">
            {entryDate.toLocaleDateString("ru-RU")}
          </div>
          <div className="entry-time">{entry.time}</div>
        </div>

        <div className="doctor-details">
          <div className="doctor-name">
            {`Врач: ${entry.doctor.Surname} ${entry.doctor.Name} ${entry.doctor.LastName}`}
          </div>
          <div className="doctor-location">
            {entry.doctor.location && <p>Адрес: {entry.doctor.location}</p>}
          </div>
          {isFutureEntry && (
            <ShineButton
              name="Отменить запись"
              className="cancel-btn"
              onClick={() => handleCancelAppointment(entry.id)} // Указываем id для отмены записи
            />
          )}
          {isPastEntry && entry.review && (
            <details className="review-details">
              <summary>Посмотреть отзыв</summary>
              <div className="review-section">
                <div className="review-stars">
                  {[...Array(entry.review.stars)].map((_, idx) => (
                    <span
                      key={idx}
                      style={{ color: "#FFD700", fontSize: "2em" }}
                    >
                      &#9733;
                    </span>
                  ))}
                </div>
                <div className="review-text">
                  <p>{entry.review.text_review}</p>
                </div>
              </div>
            </details>
          )}
          {isPastEntry && !entry.review && (
            <ShineButton
              name="Оставить отзыв"
              className="review-btn"
              onClick={() => openReviewModal(entry.id)} // Открытие модального окна для отзыва
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header />
      <div id="main">
        <div
          style={{ width: "100%", height: "10em", backgroundColor: "#7cb2ca" }}
        ></div>
        <div className="calendar-container">
          <Calendar onChange={setDate} value={date} tileContent={tileContent} />
        </div>
        <div className="entries-list">
          {selectedEntries.length ? (
            selectedEntries.map(renderEntry)
          ) : (
            <p>Нет записей на выбранную дату</p>
          )}
        </div>
      </div>
      {showReviewModal && (
        <div className="filter-modal-overlay">
          <div className="filter-modal-content">
            <div className="filter-header">
              <h2>Оставить отзыв</h2>
              <button className="close-btn" onClick={closeReviewModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="filter-body">
              <div>
                <strong>Оценка:</strong>
                <div>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setSelectedRating(star)}
                      style={{
                        cursor: "pointer",
                        color: selectedRating >= star ? "#FFD700" : "#ccc", // Звезды
                        fontSize: "2em",
                      }}
                    >
                      &#9733;
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <strong>Ваш отзыв:</strong>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Напишите ваш отзыв"
                  rows={4}
                  style={{
                    width: "100%",
                    border: "1px solid rgb(158, 163, 165)",
                    borderRadius: "0.3em",
                    margin: "1em 0px",
                    height: "179px",
                  }}
                />
              </div>
            </div>
            <div className="filter-footer">
              <button className="apply-btn" onClick={handleReviewSubmit}>
                Отправить отзыв
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendaric;
