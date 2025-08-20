import React from "react";
import "../styles/doctor-tile.css";
import { Link } from "react-router-dom";
import { DOCTOR_ROUTE } from "../utils/consts";
const DoctorTile = ({ doctor, style, onClose, showClose = false }) => {
  return (
    <div style={{ position: "relative", ...style }}>
      {showClose && (
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            border: "none",
            background: "transparent",
            fontSize: "1.2em",
            cursor: "pointer",
            zIndex: 20,
          }}
          aria-label="Close doctor info"
        >
        <i class="fa-regular fa-circle-xmark" style={{color:"#2e657d"}}></i>
        </button>
      )}
      <Link to={DOCTOR_ROUTE} state={{ doctor: doctor }} className="link-route">
        <div className="doctor-tile" style={style}>
          <img
            src={
              doctor.photo
                ? doctor.photo.replace("/static/", "/media/")
                : "img/doc.png"
            }
            alt={doctor.Surname + doctor.Name + doctor.LastName}
            className="doctor-photo"
          />
          <div>
            <div className="doctor-name">
              {doctor.Surname + " " + doctor.Name + " " + doctor.LastName}
            </div>
            <div className="doctor-specialty">
              {doctor.specialization.specialization}
            </div>
            <div className="doctor-experience">
              Стаж: {doctor.experience} лет
            </div>
            <div className="doctor-description">{doctor.description}</div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DoctorTile;
