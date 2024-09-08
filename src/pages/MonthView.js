import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './MonthView.css'; 
import moment from "moment";

const MonthView = () => {
  const [eventName, setEventName] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]); 
  const [savedDates, setSavedDates] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(''); 

  const handleInputChange = (e) => {
    setEventName(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleDateChange = (date) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    const monthKey = moment(calendarDate).format("YYYY-MM");

    // 현재 달의 선택된 날짜를 저장
    setSavedDates(prevSavedDates => {
      const currentMonthDates = prevSavedDates[monthKey] || [];
      let updatedMonthDates;

      if (currentMonthDates.includes(dateString)) {
        // 이미 선택된 날짜를 다시 클릭한 경우 배열에서 제거
        updatedMonthDates = currentMonthDates.filter(d => d !== dateString);
      } else {
        // 선택되지 않은 날짜 클릭 시 배열에 추가
        updatedMonthDates = [...currentMonthDates, dateString];
      }

      return {
        ...prevSavedDates,
        [monthKey]: updatedMonthDates
      };
    });

    // 현재 달의 선택된 날짜를 즉시 반영
    setSelectedDates(prevSelectedDates => {
      if (prevSelectedDates.includes(dateString)) {
        return prevSelectedDates.filter(d => d !== dateString);
      } else {
        return [...prevSelectedDates, dateString];
      }
    });
  };

  const tileClassName = ({ date, view }) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    if (selectedDates.includes(dateString)) {
      return 'selected-date';
    }
    return null;
  };

  useEffect(() => {
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    setSelectedDates(savedDates[currentMonthKey] || []); // 새로운 달로 이동할 때 해당 달의 선택된 날짜를 불러옴
  }, [calendarDate, savedDates]);

  const handleMonthChange = (e) => {
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");

    // 현재 달의 선택된 날짜들을 저장
    if (selectedDates.length > 0) {
      setSavedDates(prevSavedDates => ({
        ...prevSavedDates,
        [currentMonthKey]: selectedDates,
      }));
    }

    // 새로운 달로 이동
    const newMonth = parseInt(e.target.value, 10) - 1;
    setSelectedMonth(e.target.value);
    const newDate = new Date(calendarDate.getFullYear(), newMonth, 1);
    setCalendarDate(newDate);

    // 새로운 달로 이동할 때 이전 선택 상태를 불러옴
    const newMonthKey = moment(newDate).format("YYYY-MM");
    setSelectedDates(savedDates[newMonthKey] || []); 
  };

  const tileDisabled = ({ date, view }) => {
    return view === 'month' && date.getMonth() !== calendarDate.getMonth();
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
      <div className="calendar-header">
        <div className="date-display">
          {calendarDate.getFullYear()}년 {calendarDate.getMonth() + 1}월
        </div>
        <div className="dropdown" >
          <select
            className="select-month"
            value={selectedMonth || ''}
            // value={calendarDate.getMonth() + 1}
            onChange={handleMonthChange}
          >
             <option value="" disabled>한달 보기</option> 
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {month}월
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="calendar">
        <Calendar 
          value={calendarDate}
          locale="ko-KR"
          calendarType="gregory"
          onClickDay={handleDateChange}
          tileClassName={tileClassName}
          formatDay={(locale, date) => moment(date).format("DD")}
          showNeighboringMonth={true}
          tileDisabled={tileDisabled}
        /> 
      </div>
    </div>
  );
};

export default MonthView;