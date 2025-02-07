import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import './MonthView.css'; 
// import moment from "moment";
import moment from 'moment-timezone';
import clsx from 'clsx'; 
import { twMerge } from 'tailwind-merge';

import { colors, colorVariants } from '../styles/color.ts';
import { typographyVariants } from '../styles/typography.ts';

  const MonthView = ({ setJsonData, startTime, endTime, isFormReady, setIsFormReady }) => {

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

//Utility-First CSS (ft. TailwindCSS) Codes . . .

// input field 
const inputClasses = twMerge(
  clsx(
    //default
    'flex',
    'w-[320px]', 
    'h-[40px]', 
    'flex-col',
    'justify-end',
    'items-start',
    'gap-[4px]', 
    'flex-shrink-0',
    'mb-[12px]',
    'peer',
    typographyVariants({ 
      variant: 'h1-sb', 
    }),
    colorVariants({
      color: 'gray-500', 
    }),

    'text-[20px]', //왜 얘만 적용안된지 모르겠지만 일단 하드코딩딩

    //사용자가 input field 클릭했을 때
    'focus:outline-none', 
    'focus:border-b-2', 
    'focus:ring-[var(--gray-800)]', 
    'focus:text-[var(--gray-800)]',

    //사용자가 input field 입력했을때
    'valid:text-[var(--gray-800)]',

    )
);
 // 연도 범위 설정
  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 3 }, (_, i) => currentYear + i);

  // useEffect(() => {
  //   console.log('Form ready status:', isFormReady); // 상태 변경 확인용 로그
  // }, [isFormReady]);

  //서버에 보낼 json 만들기
  useEffect(() => {
    if (selectedDates.length > 0 && eventName) {
      const schedules = selectedDates
          .sort((a, b) => new Date(a) - new Date(b))
          .map(dateString => {

            // const dateISO = moment.utc(dateString, 'YYYY-MM-DD').format('YYYY-MM-DD[T]00:00:00[Z]');
            const dateISO = moment
                            .tz(dateString, 'YYYY-MM-DD', 'Asia/Seoul')  // 'KST'로 파싱
                            .format('YYYY-MM-DDTHH:mm:ss'); 

            return { date: dateISO };
      });

      const sortedDates = [...selectedDates].sort();
      const earliestDateString = sortedDates[0];
      const latestDateString = sortedDates[sortedDates.length - 1];

      const startDateTime = moment
                            .tz(`${earliestDateString} ${startTime}`, 'YYYY-MM-DD HH:mm', 'Asia/Seoul')
                            .format('YYYY-MM-DDTHH:mm:ss[Z]');
                            // const endDateTime = moment.utc(`${latestDateString} ${endTime}`, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DDTHH:mm:ss[Z]');
      const endDateTime = moment
                  .tz(`${latestDateString} ${endTime}`, 'YYYY-MM-DD HH:mm', 'Asia/Seoul')
                  .format('YYYY-MM-DDTHH:mm:ss[Z]');
      // console.log("startDateTime", startDateTime);
      // console.log("endDateTime", endDateTime);
      const data = {
        name: eventName,
        schedules: schedules,
        startTime: startDateTime,
        endTime: endDateTime,
        timeZone: 'Asia/Seoul'
      };

      // 부모의 setJsonData 함수 사용
      setJsonData(data);
      setIsFormReady(true); //캘린더 만들기 버튼 활성화
      // console.log("준비됨! ", isFormReady); 정상작동동
    }else{
      setIsFormReady(false);
    }
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

  const handleClear = () => {
    setEventName(''); // 입력값을 빈 문자열로 설정
  };

  return (
    <div className="flex flex-col w-auto h-auto !px-[0.8rem]">
      <div className="flex-row justify-start">
        <img 
          alt="언제볼까? 서비스 로고"
          src="/wwmtLogo.svg" 
          className="flex px-[1.2rem] py-[1.2rem] cursor-pointer"
          // onClick={() => navigate('/mypage')} 
          onClick={() => navigate('/')}  
        />
        {/* <img 
          alt=""
          src="/hambugerMenu.svg" 
          className="   cursor-pointer "
          onClick={() => navigate('/mypage')} 
        /> */}
      </div>
      <div className="relative px-4">
        <input
          className={inputClasses} //구 event-name
          type="text"
          value={eventName}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="캘린더 이름"
          aria-label="캘린더 이름 작성란"
        />
        <img 
          alt="캘린더 제목 지우기 버튼"
          src="/Icon_X.svg" 
          className="absolute right-2 top-1/2 -translate-y-1/2 w-[3.2rem] h-[3.2rem] cursor-pointer"
          style={{ cursor: 'pointer' }}
          onClick={handleClear}
        />
      </div>
      <div class="flex h-[2rem] mb-[0.8rem] justify-between items-center self-stretch px-[0.8rem] pl-[2rem]">
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
        {/* <div className="month-navigation"> */}
        <div class={twMerge(
          clsx(
            typographyVariants({ variant: 'b2-md' }),
            "text-[var(--gray-800)] "
          )
        )}>
          {moment(calendarDate).format('YYYY년 MM월')}
        </div>
        <div className="flex items-center ml-[0.8rem]">
          <img 
            className="bg-none cursor-pointer pl-px-[1rem] pt-px-[0.8rem] transition-colors duration-200 ease-in 
            active:scale-95"
            onClick={goToPreviousMonth}
            alt="이전 달로 넘어가기"
            src="btn_Back.svg"
          />
          <img 
            className="bg-none cursor-pointer ml-[0.6rem] pl-px-[0.4rem] pt-px-[0.8rem] transition-colors duration-200 ease-in 
            active:scale-95"
            onClick={goToNextMonth}
            alt="다음 달로 넘어가기"
            src="btn_Forward.svg"
          />
        </div>
        {/* </div> */}
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