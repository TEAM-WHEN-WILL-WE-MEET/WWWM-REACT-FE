import React, { useState, useEffect, useRef  } from 'react';
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

  //타일 클릭시, 해당 날 반환
  const handleDateChange = (date) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    const monthKey = moment(calendarDate).format("YYYY-MM");
    console.log(date);
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

  //드롭다운에서 월(1-12) 선택
  const handleMonthChange = (e) => {
    
    // 현재 달의 선택된 날짜들을 저장
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    console.log(currentMonthKey);
    // 현재 무슨달인지 console.log에 출력
    if (selectedDates.length > 0) {
      setSavedDates(prevSavedDates => ({
        ...prevSavedDates,
        [currentMonthKey]: selectedDates,
      }));
      console.log("현재 선택된 날짜: "+selectedDates);
      //새로운 달로 이동하기전에 현재달에서 무슨무슨 날 선택된건지 출력
    }

    // 새로운 달로 이동
    const newMonth = parseInt(e.target.value, 10)-1;
    setSelectedMonth(e.target.value);
    console.log(newMonth);
    //무슨 달로 이동한건지 출력
    const newDate = new Date(calendarDate.getFullYear(), newMonth, 1);
    setCalendarDate(newDate);
    console.log(newDate);
    console.log(calendarDate);
    // 새로운 달로 이동할 때 이전 선택 상태를 불러옴
    const newMonthKey = moment(newDate).format("YYYY-MM");
    setSelectedDates(savedDates[newMonthKey] || []);

  };

  //타일 비활성화 조건->true일때
  const tileDisabled = ({ date, view }) => {
    // console.log(date+"랄ㄹ라"); //Sat Oct 05 2024 00:00:00 GMT+0900 (한국 표준시) 이런식
    // console.log(view+"룰루"); //month
    // console.log(date.getMonth()+"dddddd"); //9
    // console.log("ㅇㅇㅇㅇ"+calendarDate.getMonth()); //8???
    // return view === 'month' && date.getMonth() !== calendarDate.getMonth();
    // return true;
    return false; //임시 반환값
    //return 현재달(맨처음 클릭한달?) =< 지금 클릭한 달 숫자일때만 false반환
  };

  // const DatePicker = ({ activeStartDate }) => {
  //   const [startDate, setStartDate] = useState(activeStartDate);
  //   const refCalendarContainer = useRef(null);
  
  //   const handleNavigationClick = () => {
  //     const refNode = refCalendarContainer.current;
  //     const currentCalendarView = refNode.querySelector('.react-calendar__view');
  //     const activeMonth = new Date(currentCalendarView?.dataset?.activeStartDate || new Date());
  //     setStartDate(activeMonth);
  //   };
  
  //   useEffect(() => {
  //     if (activeStartDate instanceof Date) {
  //       setStartDate(activeStartDate);
  //     }
  //   }, [activeStartDate]);
  
  //   useEffect(() => {
  //     const refNode = refCalendarContainer.current;
  //     const navigationButtons = refNode.querySelectorAll('.react-calendar__navigation__arrow');
  
  //     navigationButtons.forEach(button => {
  //       button.addEventListener('click', handleNavigationClick);
  //     });
  
  //     return () => {
  //       navigationButtons.forEach(button => {
  //         button.removeEventListener('click', handleNavigationClick);
  //       });
  //     };
  //   }, []);
  
   

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
      {/* <div className="calendar" ref={refCalendarContainer}> */}
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
          // activeStartDate={startDate}
        /> 
      </div>
    </div>
  );
};

export default MonthView;