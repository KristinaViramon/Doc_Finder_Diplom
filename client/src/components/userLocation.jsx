import React, { useState, useEffect } from "react";
import Input from "./input";

const UserLocation = ({ setUserLocation }) => {
  const [location, setLocation] = useState(null); // Местоположение (координаты)
  const [city, setCity] = useState(""); // Текущий город
  const [isEditing, setIsEditing] = useState(false); // Статус редактирования города
  const [newCity, setNewCity] = useState(""); // Для хранения нового города

  // Получаем текущее местоположение пользователя через геолокацию
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setUserLocation({ latitude, longitude }); // Передаем координаты в родительский компонент
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }, []);

  // Получаем город на основе текущих координат
  useEffect(() => {
    if (location) {
      fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.latitude}&longitude=${location.longitude}&localityLanguage=ru`
      )
        .then((response) => response.json())
        .then((data) => setCity(data.city))
        .catch((error) => console.error("Error fetching city:", error));
    }
  }, [location]);

  // Изменение текста города
  const handleCityChange = (event) => {
    setNewCity(event.target.value); // Обновляем введенный город
  };

  // Обработка поиска города
  const handleCitySearch = () => {
    if (newCity) {
      fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=803a134d-e7f7-4fbf-92d1-e95182a65a4e&format=json&geocode=${encodeURIComponent(newCity)}`
      )
        .then((response) => response.json())
        .then((data) => {
          const coords = data.response.GeoObjectCollection.featureMember[0]?.GeoObject.Point.pos.split(" ").map(Number);
          if (coords) {
            setLocation({ latitude: coords[1], longitude: coords[0] }); // Обновляем местоположение
            setUserLocation({ latitude: coords[1], longitude: coords[0] }); // Обновляем родительский компонент
            setCity(newCity); // Обновляем город
            setIsEditing(false); // Закрываем режим редактирования
          }
        })
        .catch((error) => console.error("Error fetching coordinates:", error));
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", color: "#2e657d", margin: "0em 1em" }}>
      <i className="fa-solid fa-location-dot"></i>
      {isEditing ? (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            type="text"
            value={newCity}
            onChange={handleCityChange}
            placeholder="Введите город"
            style={{ margin: "0 0.5em", padding: "0.5em", fontSize: "1em", width:"9em" }}
          />
          <i class="fa-solid fa-magnifying-glass"style={{cursor:"pointer"}} onClick={handleCitySearch}></i>
        </div>
      ) : (
        <span
          className="geolocation-user"
          style={{ margin: "0em 0.5em", cursor: "pointer" }}
          onClick={() => setIsEditing(true)} // При клике на город, включаем режим редактирования
        >
           {city}
        </span>
      )}
    </div>
  );
};

export default UserLocation;
