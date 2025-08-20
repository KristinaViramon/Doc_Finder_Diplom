import React, { useEffect, useState } from "react";
import Input from "./input";
import ShineButton from "./shine-button";
import YandexGeocoderInput from "./autocompleteGeo";
import ImageUploader from "./imageUploader";
import { saveInfo, getInfo } from "../http/docApi";
const ContentDoctor = () => {
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const data = await getInfo();
      console.log(data)
      setFormData({
        surname: data.Surname,
        name: data.Name,
        lastname: data.LastName,
        birthDate: data.birthDate,
        location: data.location,
        image: null, // только если хотим перезалить
    });
    if (data.photo) {
      setImagePreview(`${data.photo.replace('/static/', '/media/')}`);
    }
    };

    fetchData();
  }, []);
 
  const handleAddressSelect = (address) => {
    setFormData((prev) => ({
      ...prev,
      location: address.fullText,
    }));
  };

  const handleImageUpload = (file) => {
    console.log("Загружен файл:", file);
    setFormData((prev) => ({
      ...prev,
      image: file,
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
  };

  return (
    <div className="form-user">
      <ImageUploader
        onUpload={handleImageUpload}
        previewImage={imagePreview}
      />

      <div className="input-with-label">
        <label className="input-label" htmlFor="surname">
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
        <label className="input-label" htmlFor="name">
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
        <label className="input-label" htmlFor="lastname">
          Отчество:
        </label>
        <Input
          type="text"
          id="lastname"
          name="Введите отчество (если есть)"
          value={formData.lastname || ""}
          onChange={handleInputChange}
        />
      </div>
      <div className="input-with-label">
        <label className="input-label" htmlFor="city">
          Место приёма:
        </label>
        <YandexGeocoderInput
          apiKey="803a134d-e7f7-4fbf-92d1-e95182a65a4e"
          onSelect={handleAddressSelect}
          initialValue={formData.location}
        />
      </div>

      <ShineButton name="Сохранить" onClick={saveData}   style={{border:"2px solid rgb(186.25, 217.0833333333, 241.25)"}} />
    </div>
  );
};

export default ContentDoctor;
