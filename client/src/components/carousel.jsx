import React, { useState, useEffect } from "react";
import "../styles/carousel.css"; // Путь к стилям
import {Link} from "react-router-dom"
import { LIST_ROUTE } from "../utils/consts";
const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false); // Флаг для анимации
  const slides = [
    {
      id: "State1",
      imgSrc: "img/doc.png",
      text: "Запишитесь на прием к нужному специалисту",
      textButton: "Запись",
      link: LIST_ROUTE
    },
    {
      id: "State2",
      imgSrc:
        "img/simple-map-with-pink-marker-it-map-is-isometric-view-has-pink-background-marker-is-center-map_14117-222231.png",
      text: "Вы можете найти ближайшего к вам специалиста",
      textButton: "Перейти",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!transitioning) {
        setTransitioning(true);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [transitioning, slides.length]);

  const handleTransitionEnd = () => {
    setTransitioning(false); // Завершаем анимацию после завершения
  };

  return (
    <div id="carousel" className="ax_default">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          id={`carousel_state${index}`}
          className={`panel_state ${
            index === currentIndex ? "active" : "hidden"
          }`}
          onTransitionEnd={handleTransitionEnd}
        >
          <div className="panel_state_content">
            <div className="ax_default state_image">
              <img
                className="state_img"
                src={slide.imgSrc}
                alt={`Slide ${index + 1}`}
              />
            </div>
            <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", height:"100%"}}>
              <div id="text-carousel-state" className="ax_default heading_1">
                <span>{slide.text}</span>
              </div> 
              <Link to={slide.link} class = "link-route">
               <div id="button-div" className="ax_default primary_button">
                <button id="button">{slide.textButton}</button>
              </div></Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Carousel;
