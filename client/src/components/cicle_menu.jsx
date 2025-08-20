import React from "react";
import { Link } from "react-router-dom";
import { CALENDAR_ROUTE, LIST_ROUTE, MAP_ROUTE } from "../utils/consts";
const CicleMenu = () => {
  return (
    <div
      id="cicle-block"
      className="ax_default"
      data-left={135}
      data-top={549}
      data-width={755}
      data-height={146}
    >
      <Link to={LIST_ROUTE} className="link-route">
        <div id="doctor-list" className="ax_default ellipse">
          <i className="icon_cicle fa-solid fa-stethoscope" />
        </div>
      </Link>
      <Link to={MAP_ROUTE} className="link-route">
        <div id="medi-map" className="ax_default ellipse">
          <i className="icon_cicle fa-solid fa-map-location-dot" />
        </div>
      </Link>
      <Link to={CALENDAR_ROUTE} className="link-route">
        <div id="medi-calendar" className="ax_default ellipse">
          <i className="icon_cicle fa-solid fa-calendar-day" />
        </div>
      </Link>
    </div>
  );
};

export default CicleMenu;
