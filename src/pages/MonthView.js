import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import './MonthView.css'; 
import moment from "moment";

const MonthView = () => {
  const [eventName, setEventName] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]); 
  const [savedDates, setSavedDates] = useState({});

  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('month'); // 'month' 또는 'year'
  const [selectedYear, setSelectedYear] = useState(calendarDate.getFullYear());

  const [viewMode, setViewMode] = useState('month'); // 월/주 선택 'month' 또는 'week'
  const navigate = useNavigate();
  // 연도 범위 설정
  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 3 }, (_, i) => currentYear + i);

  const handleInputChange = (e) => {
    setEventName(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // 날짜 클릭 핸들러
  const handleDateChange = (date) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    const monthKey = moment(calendarDate).format("YYYY-MM");

    // 현재 달의 선택된 날짜들을 저장
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

  // 모달 열기 함수
  const openMonthModal = () => {
    setSelectedYear(calendarDate.getFullYear());
    setIsMonthModalOpen(true);
    setModalMode('month'); // 모달 모드를 초기화
  };

  // 모달 내 연도 선택 핸들러
  const handleYearSelectInModal = (year) => {
    setSelectedYear(year);
    setModalMode('month'); // 다시 월 선택 모드로 변경
  };

  // 월 선택 핸들러
  const handleMonthSelect = (monthIndex) => {
    // 현재 달의 선택된 날짜들을 저장
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    if (selectedDates.length > 0) {
      setSavedDates((prevSavedDates) => ({
        ...prevSavedDates,
        [currentMonthKey]: selectedDates,
      }));
    }

    // 새로운 연도와 월로 이동
    const newDate = new Date(selectedYear, monthIndex, 1);
    setCalendarDate(newDate);

    // 새로운 달의 선택된 날짜를 불러옴
    const newMonthKey = moment(newDate).format("YYYY-MM");
    setSelectedDates(savedDates[newMonthKey] || []);

    // 모달 닫기 및 모드 초기화
    setIsMonthModalOpen(false);
    setModalMode('month');
  };

  // 타일 비활성화 조건
  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      // 현재 선택된 달의 연도와 월
      const currentYear = calendarDate.getFullYear();
      const currentMonth = calendarDate.getMonth();

      // 타일의 날짜의 연도와 월
      const tileYear = date.getFullYear();
      const tileMonth = date.getMonth();

      // 현재 달과 타일의 날짜의 달이 다르면 true 반환하여 비활성화
      return currentYear !== tileYear || currentMonth !== tileMonth;
    }
    return false;
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
          <span onClick={openMonthModal} style={{ cursor: 'pointer' }}>
            {calendarDate.getFullYear()}년 {calendarDate.getMonth() + 1}월
          </span>
  
        </div>
        <div className="view-mode-toggle1">
            <button
              className="active"
              onClick={() => navigate('/MonthView')}
            >
              월
            </button>
            <button
              className="toggle-the-other-week"
              onClick={() => navigate('/WeekView')}
            >
              주
            </button>
          </div>
      </div>
      <div className="calendar">
        <Calendar
          activeStartDate={calendarDate} 
          locale="ko-KR"
          calendarType="gregory"
          onClickDay={handleDateChange}
          tileClassName={tileClassName}
          formatDay={(locale, date) => moment(date).format("DD")}
          showNeighboringMonth={true}
          tileDisabled={tileDisabled}
          minDate={new Date(new Date().setHours(0, 0, 0, 0))}
        /> 
      </div>
      {isMonthModalOpen && (
        <div className="monthview-modal-overlay" onClick={() => { setIsMonthModalOpen(false); setModalMode('month'); }}>
          <div className="monthview-modal-content" onClick={(e) => e.stopPropagation()}>
            {modalMode === 'month' ? (
              // 월 선택 
              <div className="year-month-selector">
                <div className="year-display-in-modal" onClick={() => setModalMode('year')}>
                  {selectedYear}년
                </div>
                <div className="month-buttons">
                  {Array.from({ length: 12 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handleMonthSelect(i)}
                      className="month-button"
                    >
                      {i + 1}월
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // 연도 선택 
              <div className="monthview-year-buttons">
                {yearRange.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelectInModal(year)}
                    className="monthview-year-button"
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthView;
