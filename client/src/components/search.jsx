import React, { useState } from "react";
import FilterModal from "./filterModal";
import UserLocation from "./userLocation";

const Search = ({ onSearch, onFilter, setUserLocation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Состояние для управления открытием модального окна

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query); // Передаем запрос в родительский компонент
  };

  const handleFilterClick = () => {
    setIsFilterOpen(true); // Открываем модальное окно фильтрации
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false); // Закрываем модальное окно
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <UserLocation setUserLocation={setUserLocation} />
      <div
        style={{
          justifyContent: "center",
          display: "flex",
          marginRight: "17em",
        }}
      >
        <div
          style={{
            position: "relative",
            display:"flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <input
            className="input-field search-input"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Поиск по имени врача..."
          />
          <i
            className="search-filter-icon fa-solid fa-filter"
            onClick={handleFilterClick}
          />
        </div>

        {/* Модальное окно фильтра */}
        <FilterModal
          isOpen={isFilterOpen}
          onClose={handleCloseFilter}
          onFilter={onFilter}
        />
      </div>
    </div>
  );
};

export default Search;
