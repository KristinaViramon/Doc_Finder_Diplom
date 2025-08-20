import React from 'react';
import '../styles/footer.css'; // Для подключения стилей

const Footer = () => {
  return (
    <footer className="footer">
      <p className="footer-text"> 
         <img src="img/18_plus.svg" style={{ width : "32px"}}></img>
        Информация, представленная на сайте, не может быть использована для постановки диагноза, назначения лечения и не заменяет прием врача.
      </p>
      <p className="footer-contact">
        Для обращения пишите на почту: <a href="mailto:doc_finder@inbox.ru">doc_finder@inbox.ru</a>
      </p>
    </footer>
  );
};

export default Footer;
