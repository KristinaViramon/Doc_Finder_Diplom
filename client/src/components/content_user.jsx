import React, { useEffect, useState } from "react";
import ShineButton from "./shine-button";
import Input from "./input";
import YandexGeocoderInput from "./autocompleteGeo";
import { saveInfo, getInfo } from "../http/patientApi";
const ContentUser = () => {
  const [formData, setFormData] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      const data = await getInfo();
      setFormData({
        surname: data.Surname,
        name: data.Name,
        lastname: data.LastName,
        birthDate: data.Birthday,
        location: data.PlaceOfLiving,
        phone: data.Phone,
      });
      localStorage.setItem("userLocation", data.PlaceOfLiving);
    };

    fetchData();
  }, []);

  const handleAddressSelect = (address) => {
    setFormData((prev) => ({
      ...prev,
      location: address.fullText,
      coords: address.coordinates,
    }));
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const saveData = async () => {
    console.log("Сохранённые данные:", formData);
    const data = await saveInfo(formData);
    if (formData.location) {
      localStorage.setItem("userLocation", formData.location);
    }
  };
  return (
    <div className="form-user">
      <div className="input-with-label">
        <label className="input-label" for="fullName">
          Фамилия:
        </label>
        <Input
          type="text"
          id="surname"
          name="Введите фамилию"
          value={formData.surname || ""}
          required
          onChange={handleInputChange}
        />
      </div>
      <div className="input-with-label">
        <label className="input-label" for="birthDate">
          Имя:
        </label>
        <Input
          type="text"
          id="name"
          name="Введите имя"
          value={formData.name || ""}
          required
          onChange={handleInputChange}
        />
      </div>
      <div className="input-with-label">
        <label className="input-label" for="birthDate">
          Отчество:
        </label>
        <Input
          type="text"
          id="lastname"
          value={formData.lastname || ""}
          name="Введите отчество (если есть)"
          onChange={handleInputChange}
        />
      </div>

      <div className="input-with-label">
        <label className="input-label" for="birthDate">
          Дата рождения:
        </label>
        <Input
          type="date"
          id="birthDate"
          name="birthDate"
          value={formData.birthDate || ""}
          required
          onChange={handleInputChange}
        />
      </div>

      <div className="input-with-label">
        <label className="input-label" for="city">
          Город проживания:
        </label>
        <YandexGeocoderInput
          apiKey="803a134d-e7f7-4fbf-92d1-e95182a65a4e"
          onSelect={handleAddressSelect}
          initialValue={formData.location}
        />
      </div>

      <div className="input-with-label">
        <label className="input-label" for="phone">
          Телефон:
        </label>
        <Input
          type="tel"
          id="phone"
          value={formData.phone || ""}
          name="+7 (___) ___-__-__"
          onChange={handleInputChange}
        />
      </div>

      <ShineButton
        name="Сохранить"
        onClick={saveData}
        style={{ border: "2px solid rgb(186.25, 217.0833333333, 241.25)" }}
      />
    </div>
  );
};

export default ContentUser;
