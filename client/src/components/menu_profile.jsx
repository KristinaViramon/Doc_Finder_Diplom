import React, { useContext, useState } from "react";
import { Context } from "../index";
import ContentUser from "./content_user";
import Table from "./table";
import ContentDoctor from "./content_doctor";
import EntryHistory from "./entryHistory";
import Certificates from "./certificates";
import Reviews from "./reviews";
import ContentAdmin from "./content_admin";

const MenuProfile = () => {
  const { user } = useContext(Context);
  const Doctor = user.isDoctor;
  const Admin = user.isAdmin;
  // Стейт для текущей вкладки:
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "table" | "certificates" | "reviews"

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return Doctor ? <ContentDoctor /> : Admin? <ContentAdmin/> : <ContentUser />;
      case "table":
        return Doctor ? <Table /> : <EntryHistory />;
      case "certificates":
        return <Certificates />;
      case "reviews":
        return <Reviews/>;
      default:
        return Doctor ? <ContentDoctor /> : <ContentUser />;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userLocation");
    user.setUser({});
    user.setIsAuth(false);
    // перенаправление на главную, можно использовать useNavigate
    window.location.href = "/";
  };

  return (
    <div className="menu_container" style={{ display: "flex", flexDirection: "row" }}>
      <section className="menu">
        <ul className="menu__list list">
          <li 
            className={`link menu__link menu__item item ${activeTab==="profile"?"active":""}`} 
            onClick={() => setActiveTab("profile")}
          >
            <i className="icon-menu fa-solid fa-house-user" />
            <span>Профиль</span>
          </li>
          {!Admin && <li 
            className={`link menu__link menu__item item ${activeTab==="table"?"active":""}`} 
            onClick={() => setActiveTab("table")}
          >
            <i className="icon-menu fa-solid fa-calendar-days" />
            <span>Запись</span>
          </li>}
          {Doctor && (
            <li 
              className={`link menu__link menu__item item ${activeTab==="certificates"?"active":""}`} 
              onClick={() => setActiveTab("certificates")}
            >
              <i className="icon-menu fa-solid fa-certificate" />
              <span>Сертификаты</span>
            </li>
          )}
           {Doctor && (
          <li 
            className={`link menu__link menu__item item ${activeTab==="reviews"?"active":""}`} 
            onClick={() => setActiveTab("reviews")}
          >
            <i className="icon-menu fa-solid fa-comment" />
            <span>Отзывы</span>
          </li>
           )}
        </ul>
        <ul className="menu__admin admin">
          <li className="admin__item item">
            <a href="#" className="admin__link link" onClick={logout}>
              <i className="icon-menu fa-solid fa-right-from-bracket" />
              <span>Выйти</span>
            </a>
          </li>
        </ul>
      </section>
      <section className="content">
        {renderContent()}
      </section>
    </div>
  );
};

export default MenuProfile;
