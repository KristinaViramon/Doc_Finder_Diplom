import React, { useState, useEffect } from 'react';
import { saveCertificates, getCertificates, deleteCertificate } from '../http/docApi'; // Импортируем функции для загрузки и удаления сертификатов
import ShineButton from './shine-button';

const Certificates = () => {
  const [files, setFiles] = useState([]); // Для хранения выбранных файлов
  const [uploadedFiles, setUploadedFiles] = useState([]); // Для хранения загруженных файлов с сервера
  const [loading, setLoading] = useState(true); // Для отслеживания загрузки данных
  const [isSaving, setIsSaving] = useState(false); // Для отслеживания процесса загрузки
  const [modalImage, setModalImage] = useState(null); // Для отображения изображения в модальном окне

  // Функция для получения сертификатов с сервера
  const fetchCertificates = async () => {
    try {
      const response = await getCertificates();  // Запрос на получение сертификатов
      setUploadedFiles(response.certificates); // Обновляем состояние с полученными сертификатами
    } catch (error) {
      console.error('Ошибка при загрузке сертификатов:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функция для загрузки сертификатов на сервер
  const handleSave = async () => {
    setIsSaving(true); // Начинаем процесс загрузки
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('certificates', file);  // Добавляем все файлы в FormData
    });
    try {
      const response = await saveCertificates(formData); // Отправляем на сервер
      console.log('Сертификаты успешно загружены:', response);
      fetchCertificates(); // После загрузки заново получаем файлы с сервера
    } catch (error) {
      console.error('Ошибка при загрузке сертификатов:', error);
    } finally {
      setIsSaving(false); // Завершаем процесс загрузки
    }
  };

  // Функция для удаления локального файла
  const handleRemoveLocalFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index); // Удаляем файл из состояния
    setFiles(newFiles);
  };

  // Функция для удаления сертификата с сервера
  const handleDelete = async (filePath) => {
    try {
      const file = filePath;
      await deleteCertificate(file); // Удаляем сертификат с сервера
      setUploadedFiles(uploadedFiles.filter((file) => file !== filePath)); // Обновляем состояние
    } catch (error) {
      console.error('Ошибка при удалении сертификата:', error);
    }
  };

  // Обработчик для выбора файлов
  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles([...files, ...newFiles]);
  };

  // Обработчик для drag-and-drop
  const handleDrop = (event) => {
    event.preventDefault();
    const newFiles = Array.from(event.dataTransfer.files);
    setFiles([...files, ...newFiles]);
  };

  // Обработчик для предотвращения стандартного поведения drag-and-drop
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Функция для открытия изображения в модальном окне
  const openModal = (imageUrl) => {
    setModalImage(imageUrl); // Устанавливаем выбранное изображение в модальное окно
  };

  // Функция для закрытия модального окна
  const closeModal = () => {
    setModalImage(null); // Закрываем модальное окно
  };

  // Загружаем сертификаты при монтировании компонента
  useEffect(() => {
    fetchCertificates();
  }, []);

  return (
    <div>
      <div
        style={{
          width: '100%',
          height: '200px',
          border: '2px dashed #ccc',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginBottom: '20px',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>Перетащите сюда фотографии или нажмите для загрузки</p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload" style={{ cursor: 'pointer', color: '#007BFF' }}>
          Загрузить файл
        </label>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {files.length > 0 &&
          files.map((file, index) => (
            <div key={index} style={{ margin: '10px', position: 'relative' }}>
              <img
                src={URL.createObjectURL(file)}
                alt={`certificate-${index}`}
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => openModal(URL.createObjectURL(file))} // Открываем изображение в модальном окне при клике
              />
              <button
                onClick={() => handleRemoveLocalFile(index)} // Удаляем локальное изображение
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  backgroundColor: '#2e657d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                }}
              >
                X
              </button>
            </div>
          ))}
      </div>

      {isSaving ? (
        <p>Загрузка...</p>
      ) : (
        <ShineButton name="Сохранить" onClick={handleSave} style={{ border: '2px solid rgb(186.25, 217.0833333333, 241.25)' }} />
      )}

      <h3>Загруженные сертификаты</h3>
      {loading ? (
        <p>Загрузка сертификатов...</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {uploadedFiles.length > 0 ? (
            uploadedFiles.map((file, index) => (
              <div key={index} style={{ margin: '10px', position: 'relative' }}>
                <img
                  src={file.replace('http://localhost:5000', '').replace('/static/', '/media/')}
                  alt={`certificate-${index}`}
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => openModal(file.replace('http://localhost:5000', '').replace('/static/', '/media/'))} // Открываем изображение в модальном окне при клике
                />
                <button
                  onClick={() => handleDelete(file)} // Удаляем файл с сервера при клике
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    backgroundColor: '#2e657d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                  }}
                >
                  X
                </button>
              </div>
            ))
          ) : (
            <p>Сертификаты не найдены.</p>
          )}
        </div>
      )}

      {/* Модальное окно для отображения изображения */}
      {modalImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={closeModal} // Закрываем модальное окно при клике на его фон
        >
          <img
            src={modalImage}
            alt="certificate"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Certificates;
