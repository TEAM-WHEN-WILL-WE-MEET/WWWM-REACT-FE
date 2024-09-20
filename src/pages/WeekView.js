import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './WeekView.css'; 
import moment from "moment";
import { useNavigate } from 'react-router-dom';

const WeekView = () => {
  const [eventName, setEventName] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const [selectedDays, setSelectedDays] = useState([]);

  const [viewMode, setViewMode] = useState('month'); // 월/주 선택 'month' 또는 'week'
  const navigate = useNavigate();
  const handleDayClick = (day) => {
    setSelectedDays((prevSelectedDays) => {
      if (prevSelectedDays.includes(day)) {
        // 이미 선택된 경우 배열에서 해당 요일을 제거
        return prevSelectedDays.filter(selectedDay => selectedDay !== day);
      } else {
        // 선택되지 않은 경우 배열에 추가
        return [...prevSelectedDays, day];
      }
    });
  };
  const handleInputChange = (e) => {
    setEventName(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };


  

  return (
    <div className="main-container">
      <div className="tab"></div>
      <img src="/GrayRectangle.svg" className="logo-image"/>
      <input
        className="event-name"
        type="text"
        value={eventName}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="이벤트 이름"
      />
      <div className="weekday-selector">
        <div className="week-header">
          <label className="labelWeek">요일 선택</label>
          <div className="view-mode-toggle2">
            <button
              className="toggle-the-other-month"
              onClick={() => navigate('/MonthView')}
            >
              월
            </button>
            <button
              className='active'
              onClick={() => navigate('/WeekView')}
            >
              주
            </button>
          </div>
        </div>
      <div className="days-container">
        {days.map((day, index) => (
          <button
          key={index}
          className={`day-button ${selectedDays.includes(day) ? 'selected' : ''}`}
          onClick={() => handleDayClick(day)} // 클릭 시 상태 업데이트
          >
            {day}
          </button>
        ))}
      </div>
    </div>
    </div>
  );
};

export default WeekView;