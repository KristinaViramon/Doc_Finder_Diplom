import React, { useState, useEffect } from 'react';
import Input from './input';
import "../styles/autocomplete.css"

const YandexGeocoderInput = ({ apiKey, onSelect, initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);  // Записываем адрес напрямую в поле, если он передан
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);  // Состояние для отслеживания фокуса на поле

  useEffect(() => {
    // Если initialValue есть, не выполняем запросы
    if (initialValue && !isFocused) {
      return;  // Просто выходим из useEffect, чтобы не выполнять запрос
    }

    if (!query) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=${encodeURIComponent(query)}&results=5`
        );
        const data = await response.json();
        const found = data.response.GeoObjectCollection.featureMember;
        const items = found.map((item) => ({
          name: item.GeoObject.name,
          description: item.GeoObject.description,
          fullText: item.GeoObject.metaDataProperty.GeocoderMetaData.text,
          coordinates: item.GeoObject.Point.pos.split(' ').map(Number),
        }));
        setSuggestions(items);
      } catch (error) {
        console.error('Geocoder error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {  // Вызываем автодополнение только если поле в фокусе
      const timeout = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(timeout);
    }

  }, [query, apiKey, initialValue, isFocused]);  // Следим за фокусом и изменениями в query

  useEffect(() => {
    setQuery(initialValue);  // Обновляем значение поля, если изначально передан адрес
  }, [initialValue]);

  const handleSelect = (item) => {
    setQuery(item.fullText);
    setSuggestions([]);
    if (onSelect) onSelect(item);
  };

  const handleFocus = () => {
    setIsFocused(true);  // Устанавливаем фокус на поле
  };

  const handleBlur = () => {
    setIsFocused(false);  // Снимаем фокус с поля
  };

  return (
    <div className="relative w-full max-w-md">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Введите адрес"
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onFocus={handleFocus}  // Устанавливаем фокус на поле
        onBlur={handleBlur}    // Снимаем фокус с поля
      />
      {loading && <div className="text-sm text-gray-500 mt-1">Поиск...</div>}

      {suggestions.length > 0 && (
        <ul className="autocomplete-block">
          {suggestions.map((item, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
              onClick={() => handleSelect(item)}
            >
              <div className="text-sm font-medium">{item.fullText}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default YandexGeocoderInput;
