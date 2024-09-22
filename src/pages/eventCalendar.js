import React, { useState } from "react";
import './eventCalendar.css'; 
import { useSwipeable } from "react-swipeable";

const EventCalendar = () => {
  
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const dates = [
    { date: "9/7(토)", key: 0 },
    { date: "9/14(토)", key: 1 },
    { date: "9/15(일)", key: 2 },
    { date: "9/21(토)", key: 3 },
    { date: "9/22(일)", key: 4 },
    { date: "9/23(월)", key: 5 },
  ];

  const times = ["9시", "10시", "11시", "12시", "1시", "2시", "3시", "4시", "5시", "6시", "7시", "8시"];

  const handleRowClick = (timeIndex) => {
    const newState = {...selectedTimes};
    const allSelected = newState[timeIndex]?.every(Boolean); // 모든 버튼이 선택되었는지 검사

    newState[timeIndex] = new Array(6).fill(!allSelected);  // 모든 버튼의 상태를 토글

    setSelectedTimes(newState);
  };
  const handleSwipeLeft = () => {
    if (selectedDate < dates.length - 1) {
      setSelectedDate((prev) => prev + 1);
    }
  };

  const handleSwipeRight = () => {
    if (selectedDate > 0) {
      setSelectedDate((prev) => prev - 1);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true, //  pc 테스트용 
  });

  const handleTimeClick = (timeIndex, buttonIndex) => {
    const newSelectedTimes = { ...selectedTimes };
    if (!newSelectedTimes[selectedDate]) {
      newSelectedTimes[selectedDate] = {};
    }
    newSelectedTimes[selectedDate][timeIndex] = {
      ...newSelectedTimes[selectedDate][timeIndex],
      [buttonIndex]: !newSelectedTimes[selectedDate][timeIndex]?.[buttonIndex],
    };
    setSelectedTimes(newSelectedTimes);
  };

  return (
    <div className="event-calendar">

      <div className="event-calendar-header">
        <div className="event-calendar-header-text">9월 동아리 정기회의</div>
      <div className="dropdown-container">
      <button className="dropdown-button" onClick={toggleDropdown}>
        1명 참여
        <img
          src={isOpen ? '/downArrow.svg' : '/upArrow.svg'}
          alt="arrow"
          className="arrow-icon"
          onClick={toggleDropdown}
        />
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-item">
            <span className="user-icon">나</span> 모임장
          </div>
        </div>
      )}
    </div>
    </div>
      <div {...swipeHandlers} className="event-date-tabs">
       
        {dates.map(({ date, key }) => (
          <div key={key}
          className={`event-date-tab ${selectedDate === key ? 'active' : ''}`}
            onClick={() => setSelectedDate(key)}
           >
            {date}
          </div>
        ))}
      </div>

      <div className="time-selection">
        {times.map((time, timeIndex) => (
          <div key={timeIndex} className="time-row">
            <div className="time">{time}</div>
            <div className="eventCalendar-time-buttons">
              {[...Array(6)].map((_, buttonIndex) => (
                <button
                  key={buttonIndex}
                  className={`eventCalendar-time-button ${
                    selectedTimes[selectedDate]?.[timeIndex]?.[buttonIndex]
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleTimeClick(timeIndex, buttonIndex)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="save-button">내 시간대 저장</button>
    </div>
  );
};

export default EventCalendar;
