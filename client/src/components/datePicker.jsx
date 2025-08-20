import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays } from "date-fns";
import ShineButton from "./shine-button";
import '../styles/date-picker.css'
const TimeSelector = ({ initialDates, onSubmit }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 14));
  useEffect(() => {
    if (initialDates) {
      setStartDate(initialDates.startDate);
      setEndDate(initialDates.endDate);
    }
  }, [initialDates]);
  
  const handleSubmit = () => {
    onSubmit({ startDate, endDate });
  };

  return (
    <div className="container-date-picker">
      <div className="section">
        <label>Выбор дат</label>
        <div className="row">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            minDate={new Date()}
            dateFormat="dd.MM.yyyy"
            placeholderText="С"
            className="input"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            minDate={startDate || new Date()}
            dateFormat="dd.MM.yyyy"
            placeholderText="По"
            className="input"
          />
        </div>
      </div>
      <ShineButton name="Построить таблицу" onClick={handleSubmit}   style={{border:"2px solid rgb(186.25, 217.0833333333, 241.25)"}} />
    </div>
  );
};

export default TimeSelector;
