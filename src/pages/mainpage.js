import React, { useState } from 'react';
import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css'; // 기본 켈린더 라이브러리 css import
import './mainpage.css'; 
import moment from "moment";

const MainPage = () => {

  const [calendarMonth, setCalendarMonth] = useState('');

//   const handleMonthChange = (e) => {
//     const monthValue = e.target.value;
//     setCalendarMonth(monthValue);
//     const newDate = new Date(calendarDate.getFullYear(), monthValue - 1);
//     setCalendarDate(newDate);
//   };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 메뉴의 열림/닫힘 상태 관리

  // const handleYearChange = (e) => {
  //   // 연도 변경 핸들러
  //   const newYear = e.target.value;
  //   const newDate = new Date(newYear, calendarDate.getMonth(), calendarDate.getDate());
  //   setCalendarDate(newDate); // 새로운 연도와 기존 월, 날짜를 사용해 캘린더 날짜 업데이트
  // };

  // const [calendarDate, setCalendarDate] = useState(new Date()); // 초기 캘린더 날짜 설정
  // const handleMonthChange = (e) => {
  //   // 월 변경 핸들러
  //   const newMonth = e.target.value;
  //   const newDate = new Date(calendarDate.getFullYear(), newMonth - 1, calendarDate.getDate());
  //   setCalendarDate(newDate); // 새로운 월과 기존 연도, 날짜를 사용해 캘린더 날짜 업데이트
  // };
  const [calendarDate, setCalendarDate] = useState(new Date());

  const handleMonthChange = (e) => {
    const newMonth = e.target.value - 1; // 입력값은 1-12이므로 0-11로 조정
    const newDate = new Date(calendarDate.getFullYear(), newMonth, 1);
    setCalendarDate(newDate);
  };

  const handleDateClick = (date) => {
    setCalendarDate(date);
  };

  const toggleDropdown = () => {
    // 드롭다운 메뉴 열림/닫힘 토글
    setIsDropdownOpen(!isDropdownOpen);
  };
  const [selectedDates, setSelectedDates] = useState([]); // 선택된 날짜를 저장할 상태 배열

  // const handleDateChange = (date) => {
  //   if (selectedDates.some(selectedDate => selectedDate.toDateString() === date.toDateString())) {
  //     // 이미 선택된 날짜를 다시 클릭한 경우 배열에서 해당 날짜를 제거
  //     setSelectedDates(selectedDates.filter(selectedDate => selectedDate.toDateString() !== date.toDateString()));
  //   } else {
  //     // 선택되지 않은 날짜 클릭한 경우, 배열에 추가
  //     setSelectedDates([...selectedDates, date]);
  //   }
  // };
  const handleDateChange = (date) => {
    // 달이 변경되었는지 확인
    const isSameMonth = calendarDate.getMonth() === date.getMonth();
        // 달이 변경되었으면 calendarDate 상태를 업데이트
        if (!isSameMonth) {
          setCalendarDate(new Date(date.getFullYear(), date.getMonth(), 1));
        }
    if (selectedDates.some(selectedDate => selectedDate.toDateString() === date.toDateString())) {
      // 이미 선택된 날짜를 다시 클릭한 경우 배열에서 해당 날짜를 제거
      setSelectedDates(selectedDates.filter(selectedDate => selectedDate.toDateString() !== date.toDateString()));
    } else {
      // 선택되지 않은 날짜 클릭한 경우, 배열에 추가
      setSelectedDates([...selectedDates, date]);
    }
  

  };
  
  const tileClassName = ({ date, view }) => {
    // 날짜가 선택된 날짜 배열에 포함되어 있을 때 특정 클래스를 적용
    if (selectedDates.some(selectedDate => selectedDate.toDateString() === date.toDateString())) {
      return 'selected-date';
    }
    return null;
  };
  const [eventName, setEventName] = useState(""); // 초기 텍스트 설정

  const handleInputChange = (e) => {
    setEventName(e.target.value); // 사용자가 입력한 값을 상태로 관리
  };
  const [isFocused, setIsFocused] = useState(false); // 포커스 상태 관리

  const handleFocus = () => {
    setIsFocused(true); // 입력 필드가 포커스될 때 상태 변경
  };

  const handleBlur = () => {
    setIsFocused(false); // 입력 필드에서 포커스가 해제될 때 상태 변경
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
        <div className="dropdown">
          {/* <select className="select-month" onChange={handleMonthChange}> */}
          <select className="select-month" value={calendarDate.getMonth() + 1} onChange={handleMonthChange}>
            <option value="" disabled selected>날짜 선택</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {month}월
              </option>
            ))}
          </select>
        </div>
        {/* <span onClick={toggleDropdown} >
          {calendarDate.getFullYear()}년 {calendarDate.getMonth() + 1}월
        </span>
        {isDropdownOpen && (
          <div className="dropdown">
            <select className='select-month' value={calendarDate.getMonth() + 1} onChange={handleMonthChange}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </select>
          </div>
        )} */}
      </div>
      <div className="calendar">
        {/* 캘린더 컴포넌트 */}
        <Calendar 
          value={calendarDate}
          onChange={handleDateChange} // 날짜가 변경될 때 처리하는 핸들러
          tileClassName={tileClassName} // 각 타일에 동적으로 클래스를 추가       
          locale="ko-KR" // 한국어 로케일 적용
          calendarType="gregory" // 일요일 부터 시작
          onClickDay={handleDateClick} 
          navigationLabel={null}      
          formatDay={(locale, date) => moment(date).format("DD")} // 날'일' 제외하고 숫자만 보이도록 설정
          showNeighboringMonth={true} // 이웃 달의 날짜 보이기
       /> 
      </div>
    </div>

  );
};

export default MainPage;
