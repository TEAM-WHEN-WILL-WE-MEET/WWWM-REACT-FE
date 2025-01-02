import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import './MonthView.css'; 
// import moment from "moment";
import moment from 'moment-timezone'; 

import MyPage from './MyPage';
// const MonthView = () => {
// const MonthView = ({ setJsonData }) => {
// const MonthView = ({ setJsonData, startTime, endTime }) => {
  const MonthView = ({ setJsonData, startTime, endTime }) => {

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

  // //서버에 보낼 json 만들기
  // const schedules = selectedDates.map(dateString => {
  //   // 날짜 문자열을 ISO 8601 형식으로 변환하고 시간대를 지정합니다.
  //   const dateISO = moment.tz(dateString, 'YYYY-MM-DD', 'Asia/Seoul').startOf('day').toISOString();
  //   return { date: dateISO };
  // });
  // const sortedDates = [...selectedDates].sort();
  // const earliestDateString = sortedDates[0];
  // const latestDateString = sortedDates[sortedDates.length - 1];
  // const startTime = moment.tz(`${earliestDateString} 09:00`, 'YYYY-MM-DD HH:mm', 'Asia/Seoul').toISOString();
  // const endTime = moment.tz(`${latestDateString} 17:00`, 'YYYY-MM-DD HH:mm', 'Asia/Seoul').toISOString();
  // const jsonData = {
  //   name: eventName,
  //   schedules: schedules,
  //   startTime: startTime,
  //   endTime: endTime,
  //   timeZone: 'Asia/Seoul'
  // };

  //서버에 보낼 json 만들기
  useEffect(() => {
    if (selectedDates.length > 0 && eventName) {
      const schedules = selectedDates.map(dateString => {
        // const dateISO = moment.tz(dateString, 'YYYY-MM-DD', 'Asia/Seoul').startOf('day').toISOString();
        // const dateISO = moment.tz(dateString, 'YYYY-MM-DD', 'Asia/Seoul').toISOString();
        const dateISO = moment.utc(dateString, 'YYYY-MM-DD').format('YYYY-MM-DD[T]00:00:00[Z]');

        return { date: dateISO };
      });

      const sortedDates = [...selectedDates].sort();
      const earliestDateString = sortedDates[0];
      const latestDateString = sortedDates[sortedDates.length - 1];

      // const startTime = moment.tz(`${earliestDateString} 09:00`, 'YYYY-MM-DD HH:mm', 'Asia/Seoul').toISOString();
      // const endTime = moment.tz(`${latestDateString} 17:00`, 'YYYY-MM-DD HH:mm', 'Asia/Seoul').toISOString();
      
      // 부모에게 받은 startTime과 endTime을 사용
      // 부모로부터 받은 startTime과 endTime을 사용
      // console.log("시작시간이 몇시? "+startTime);
      // console.log("마감시간이 몇시? "+endTime);

    //   const startDateTime = moment
    //   .tz(`${earliestDateString} ${startTime}`, 'YYYY-MM-DD HH:mm', 'Asia/Seoul')
    //   .format();
    // const endDateTime = moment
    //   .tz(`${latestDateString} ${endTime}`, 'YYYY-MM-DD HH:mm', 'Asia/Seoul')
    //   .format(); 

      // startTime과 endTime을 UTC로 파싱하고, 시간 변환 없이 포맷
      const startDateTime = moment.utc(`${earliestDateString} ${startTime}`, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DDTHH:mm:ss[Z]');
      const endDateTime = moment.utc(`${latestDateString} ${endTime}`, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DDTHH:mm:ss[Z]');
      const data = {
        name: eventName,
        schedules: schedules,
        startTime: startDateTime,
        endTime: endDateTime,
        timeZone: 'Asia/Seoul'
      };

      // 부모의 setJsonData 함수 사용
      setJsonData(data);
    }
  // }, [selectedDates, eventName, setJsonData]);
}, [selectedDates, eventName, startTime, endTime, setJsonData]);

// 

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
    const today = moment().startOf('day');
    const classes = [];

    // 오늘 이전 날짜는 'disabled-date' 클래스 추가
    if (moment(date).isBefore(today)) {
      classes.push('disabled-date');
    }

    // 선택된 날짜는 'selected-date' 클래스 추가
    if (selectedDates.includes(dateString)) {
      classes.push('selected-date');
    }

    return classes.join(' ');
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
      const today = moment().startOf('day');
      
      // 1. 오늘 이전 날짜 비활성화
      if (moment(date).isBefore(today)) {
        return true;
      }

      // 2. 현재 선택된 달의 날짜가 아닌 경우 비활성화
      const currentYear = calendarDate.getFullYear();
      const currentMonth = calendarDate.getMonth();
      const tileYear = date.getFullYear();
      const tileMonth = date.getMonth();

      return currentYear !== tileYear || currentMonth !== tileMonth;
    }
    return false;
  };
  // 이전 달로 이동하는 함수
  const goToPreviousMonth = () => {
    const currentMonth = moment(calendarDate);
    const previousMonth = currentMonth.subtract(1, 'month');
    
    // 현재 달의 선택된 날짜들을 저장
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    if (selectedDates.length > 0) {
      setSavedDates(prevSavedDates => ({
        ...prevSavedDates,
        [currentMonthKey]: selectedDates,
      }));
    }

    // 새로운 달의 날짜로 설정
    setCalendarDate(previousMonth.toDate());
    
    // 새로운 달의 저장된 날짜들을 불러옴
    const newMonthKey = previousMonth.format("YYYY-MM");
    setSelectedDates(savedDates[newMonthKey] || []);
  };

  // 다음 달로 이동하는 함수
  const goToNextMonth = () => {
    const currentMonth = moment(calendarDate);
    const nextMonth = currentMonth.add(1, 'month');
    
    // 현재 달의 선택된 날짜들을 저장
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    if (selectedDates.length > 0) {
      setSavedDates(prevSavedDates => ({
        ...prevSavedDates,
        [currentMonthKey]: selectedDates,
      }));
    }

    // 새로운 달의 날짜로 설정
    setCalendarDate(nextMonth.toDate());
    
    // 새로운 달의 저장된 날짜들을 불러옴
    const newMonthKey = nextMonth.format("YYYY-MM");
    setSelectedDates(savedDates[newMonthKey] || []);
  };

  return (
    <div className="main-container">
      <div className="tab"></div>
      <img 
        src="/Icon_menu.svg" 
        className="logo-image"
        onClick={() => navigate('/mypage')} 
        style={{ cursor: 'pointer' }}
        />
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
        {/* <div className="date-display">
          <span onClick={openMonthModal} style={{ cursor: 'pointer' }}>
            {calendarDate.getFullYear()}년 {calendarDate.getMonth() + 1}월
          </span>
  
        </div> */}
        {/* <div className="view-mode-toggle1">
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
          </div> */}
        <div className="month-navigation">
        <div className="current-month-display">
            {moment(calendarDate).format('YYYY년 MM월')}
          </div>
          <div className="navigation-buttons">
          <button 
            className="month-nav-button" 
            onClick={goToPreviousMonth}
            aria-label="이전 달"
          >
            &#8249;
          </button>

          <button 
            className="month-nav-button" 
            onClick={goToNextMonth}
            aria-label="다음 달"
          >
            &#8250;
          </button>
        </div>
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