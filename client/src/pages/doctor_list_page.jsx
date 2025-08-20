import React, { useState, useEffect } from "react";
import Search from "../components/search";
import Header from "../components/header";
import DoctorList from "../components/doctorList";
import DocMap from "../components/doc_map";
import { fetchDoctors } from "../http/userAPI"; // Импортируем функцию для запроса врачей
import "../styles/search.css";
import { useLocation } from "react-router-dom";

const DoctorListPage = () => {
  const [doctors, setDoctors] = useState([]); // Хранение списка врачей
  const [filteredDoctors, setFilteredDoctors] = useState([]); // Хранение отфильтрованных врачей
  const [loading, setLoading] = useState(true); // Статус загрузки
  const location = useLocation();
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({ specializations: [], experience: [] });
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const fetchedDoctors = await fetchDoctors(); // Запрос списка врачей
        setDoctors(fetchedDoctors); // Обновляем состояние
        setFilteredDoctors(fetchedDoctors); // Устанавливаем изначально все врачи как отфильтрованные
      } catch (error) {
        console.error("Ошибка при загрузке врачей:", error);
      } finally {
        setLoading(false); // Завершаем загрузку
      }
    };

    loadDoctors(); // Вызов функции загрузки врачей
  }, []);

  const handleSearch = (query) => {
    const filteredByQuery = doctors.filter((doctor) =>
      (doctor.Surname + " " + doctor.Name + " " + doctor.LastName)
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    // Применяем фильтрацию через фильтры и потом поиск
    const finalFilteredDoctors = filteredByQuery.filter((doctor) => {
      const { specializations, experience } = filters; // Получаем примененные фильтры

      const matchesSpecialization = specializations.length
        ? specializations.some((specialization) =>
            doctor.specialization.specialization
              .toLowerCase()
              .includes(specialization.toLowerCase())
          )
        : true;

      const matchesExperience = experience.includes("lessThan10")
        ? doctor.experience < 10
        : experience.includes("moreThan10")
        ? doctor.experience >= 10 && doctor.experience < 20
        : experience.includes("moreThan20")
        ? doctor.experience >= 20
        : true;

      return matchesSpecialization && matchesExperience;
    });

    setFilteredDoctors(finalFilteredDoctors);
  };

  const handleFilter = (filters) => {
    setFilters(filters); // Обновляем фильтры
    const { specializations, experience } = filters;
    const filtered = doctors.filter(doctor => {
      const matchesSpecialization = specializations.length
        ? specializations.some(specialization => doctor.specialization.specialization.toLowerCase().includes(specialization.toLowerCase()))
        : true;
  
      const matchesExperience =
        experience.includes('lessThan10') ? doctor.experience < 10 :
        experience.includes('moreThan10') ? doctor.experience >= 10 && doctor.experience < 20 :
        experience.includes('moreThan20') ? doctor.experience >= 20 : true;
  
      return matchesSpecialization && matchesExperience;
    });
    setFilteredDoctors(filtered);
  };

  if (loading) {
    return <div>Загрузка...</div>; // Показываем текст загрузки
  }

  return (
    <div>
      <Header />
      <div id="main">
        <div
          style={{ width: "100%", height: "10em", backgroundColor: "#7cb2ca" }}
        ></div>
        <Search
          onSearch={handleSearch}
          onFilter={handleFilter}
          setUserLocation={setUserLocation}
        />{" "}
        {/* Передаем функцию поиска и фильтрации в компонент */}
        {location.pathname === "/map" ? (
          <DocMap doctors={filteredDoctors} userLocation={userLocation} /> // Если путь "/map", рендерим компонент с картой
        ) : (
          <DoctorList doctors={filteredDoctors} /> // Если не "/map", показываем список врачей
        )}
      </div>
    </div>
  );
};

export default DoctorListPage;
