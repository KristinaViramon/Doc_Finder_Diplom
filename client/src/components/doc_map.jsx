import React, { useState, useEffect, useRef } from "react";
import {
  YMaps,
  Map,
  Placemark,
  GeolocationControl,
  RouteButton,
} from "@pbe/react-yandex-maps"; // Импортируем карту Яндекса
import DoctorTile from "./doctorTile"; // Импортируем компонент для отображения информации о враче
import "../styles/doctor-map.css";
const DocMap = ({ doctors, userLocation }) => {
  const [coordinates, setCoordinates] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null); // Храним выбранного врача
  const [selectedCoords, setSelectedCoords] = useState(null); // Координаты выбранного Placemark
  const mapRef = useRef(null);
  const [StoredLocation, setStoredLocation] = useState();
  const routePanelRef = useRef(null);
  const [showDoctorTile, setShowDoctorTile] = useState(false);
  // Функция для получения координат для каждого врача
  useEffect(() => {
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      fetchCoordinates(storedLocation).then((coords) => {
        if (coords) setStoredLocation(coords);
      });
    }
  }, []);
  const fetchCoordinates = (address) => {
    if (address) {
      return fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=803a134d-e7f7-4fbf-92d1-e95182a65a4e&format=json&geocode=${encodeURIComponent(
          address
        )}`
      )
        .then((response) => response.json())
        .then((data) => {
          const coords =
            data.response.GeoObjectCollection.featureMember[0]?.GeoObject.Point.pos
              .split(" ")
              .map(Number);
          return coords ? [coords[1], coords[0]] : null; // [широта, долгота]
        })
        .catch((error) => {
          console.error("Ошибка при получении координат:", error);
        });
    }
    return null;
  };

  // Используем useEffect для получения координат
  useEffect(() => {
    const getDoctorCoordinates = async () => {
      const coords = await Promise.all(
        doctors.map(async (doctor) => {
          const doctorCoords = await fetchCoordinates(doctor.location);
          return doctorCoords
            ? { id: doctor.id, coordinates: doctorCoords }
            : null;
        })
      );
      setCoordinates(coords.filter((coord) => coord !== null));
    };

    getDoctorCoordinates();
  }, [doctors]);

  // Функция для обработки клика по метке
  const handlePlacemarkClick = (coordinates, doctor) => {
    setSelectedDoctor(doctor); // Устанавливаем выбранного врача
    setSelectedCoords(coordinates); // Устанавливаем координаты выбранной метки
  };
  // Функция для закрытия doctorTile
  const closeDoctorTile = () => {
    setShowDoctorTile(false);
    setSelectedDoctor(null);
    setSelectedCoords(null);
  };
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.setCenter(
        [userLocation.latitude, userLocation.longitude],
        10
      ); // Центрируем карту на новых координатах
    }
  }, [userLocation]); // Запускать при изменении местоположения пользователя

  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        position: "relative",
        display: "flex",
      }}
    >
      <YMaps query={{ apikey: "803a134d-e7f7-4fbf-92d1-e95182a65a4e" }}>
        <Map
          instanceRef={mapRef}
          defaultState={{
            center: userLocation
              ? [userLocation.latitude, userLocation.longitude]
              : [55.7558, 37.6173],
            zoom: 10,
          }}
          width="100%"
          height="100%"
        >
          {coordinates.map((doctor) => (
            <Placemark
              key={doctor.id}
              geometry={doctor.coordinates}
              onClick={() =>
                handlePlacemarkClick(
                  doctor.coordinates,
                  doctors.find((doc) => doc.id === doctor.id)
                )
              }
            />
          ))}
          <Placemark
            geometry={StoredLocation} // Координаты второй метки
            options={{
              iconColor: "red", // Изменяем цвет иконки
            }}
            properties={{
              balloonContentHeader: "Здесь вы", // Заголовок балуна
              balloonContentBody: "по информации указанной в профиле",
            }}
          />
          <GeolocationControl options={{ float: "right" }} />
          {/* Добавление RouterPanel для маршрута */}

          <RouteButton
            options={{
              float: "right",
            }}
          />
        </Map>
      </YMaps>

      {/* Информация о враче поверх карты, рядом с меткой */}
      {selectedDoctor && selectedCoords && (
        <div
          style={{
            position: "absolute",
            backgroundColor: "transparent",
            padding: "10px",
            borderRadius: "8px",
            zIndex: 10,
          }}
        >
          <DoctorTile
            doctor={selectedDoctor}
            style={{
              flexDirection: "column",
              width: "14em",
              position: "relative",
            }}
            onClose={closeDoctorTile}
            showClose={true}
          />
        </div>
      )}
    </div>
  );
};

export default DocMap;
