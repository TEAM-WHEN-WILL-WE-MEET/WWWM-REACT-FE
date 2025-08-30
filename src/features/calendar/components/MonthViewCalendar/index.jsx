import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { useNavigate } from "react-router-dom";
import "./styles.css";
// import moment from "moment";
import moment from "moment-timezone";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

import { colorVariants } from "../../../../styles/color.ts";
import { typographyVariants } from "../../../../styles/typography.ts";
import { useCalendarStore } from "../../../../store/index.ts";

const MonthView = () => {
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Zustand store에서 상태와 액션들을 가져옵니다
  const {
    selectedDates,
    savedDates,
    eventName,
    startTime,
    endTime,
    setSelectedDates,
    setSavedDates,
    setEventName,
    handleDateChange,
    updateJsonData,
  } = useCalendarStore();

  // input field
  const inputClasses = twMerge(
    clsx(
      //default
      "flex",
      "w-full",
      "h-[40px]",
      "flex-col",
      "justify-end",
      "items-start",
      "gap-[4px]",
      "flex-shrink-0",
      "mb-[12px]",
      "peer",
      typographyVariants({
        variant: "h1-sb",
      }),
      colorVariants({
        color: "gray-500",
      }),

      "text-[20px]",

      //사용자가 input field 클릭했을 때
      "focus:outline-none",
      "focus:border-b-2",
      "focus:ring-[var(--gray-800)]",
      "focus:text-[var(--gray-800)]",

      //사용자가 input field 입력했을때
      "valid:text-[var(--gray-800)]"
    )
  );

useEffect(() => {
    // 현재 달력 월이 변경될 때마다 해당 월의 저장된 선택 날짜들을 로드
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    setSelectedDates(savedDates[currentMonthKey] || []);
  }, [calendarDate, savedDates, setSelectedDates]);

  useEffect(() => {
    // 선택된 날짜, 이벤트명, 시작/종료 시간이 변경될 때마다 API 전송용 JSON 데이터를 업데이트
    updateJsonData();
  }, [selectedDates, startTime, endTime, updateJsonData]);

  // 이벤트명 입력 필드의 값이 변경될 때 호출
  const handleInputChange = (e) => {
    setEventName(e.target.value);
  };

  // 이벤트명 입력 필드에 포커스가 갈 때 호출
  const handleFocus = () => {
    setIsFocused(true);
  };

  // 이벤트명 입력 필드에서 포커스가 벗어날 때 호출
  const handleBlur = () => {
    setIsFocused(false);
  };

  // react-calendar의 각 날짜 타일에 적용할 CSS 클래스를 결정하는 함수
  const tileClassName = ({ date, view }) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    const today = moment().startOf("day");
    const classes = [];

    // 오늘 이전 날짜는 비활성화 스타일 적용
    if (moment(date).isBefore(today)) {
      classes.push("disabled-date");
    }

    // 선택된 날짜는 선택 스타일 적용
    if (selectedDates.includes(dateString)) {
      classes.push("selected-date");
    }

    return classes.join(" ");
  };


  // 모달에서 연도를 선택했을 때 호출되는 함수
  const handleYearSelectInModal = (year) => {
    setSelectedYear(year);
    setModalMode("month");
  };

  // 모달에서 특정 월을 선택했을 때 호출되는 함수
  const handleMonthSelect = (monthIndex) => {
    // 현재 월의 선택된 날짜들을 저장소에 백업
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    if (selectedDates.length > 0) {
      setSavedDates({
        ...savedDates,
        [currentMonthKey]: selectedDates,
      });
    }

    // 새로운 월로 달력 날짜 변경
    const newDate = new Date(selectedYear, monthIndex, 1);
    setCalendarDate(newDate);

    // 새로운 월의 저장된 선택 날짜들을 로드
    const newMonthKey = moment(newDate).format("YYYY-MM");
    setSelectedDates(savedDates[newMonthKey] || []);

    // 모달 닫기
    setIsMonthModalOpen(false);
    setModalMode("month");
  };

  // react-calendar에서 특정 날짜를 비활성화할지 결정하는 함수
  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      const today = moment().startOf("day");

      // 오늘 이전 날짜는 비활성화
      if (moment(date).isBefore(today)) {
        return true;
      }

      // 현재 달력 월 외의 날짜들은 비활성화
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
    const previousMonth = currentMonth.subtract(1, "month");

    // 현재 월의 선택된 날짜들을 저장소에 백업
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    if (selectedDates.length > 0) {
      setSavedDates({
        ...savedDates,
        [currentMonthKey]: selectedDates,
      });
    }

    // 이전 달로 달력 날짜 변경
    setCalendarDate(previousMonth.toDate());

    // 이전 달의 저장된 선택 날짜들을 로드
    const newMonthKey = previousMonth.format("YYYY-MM");
    setSelectedDates(savedDates[newMonthKey] || []);
  };

  // 다음 달로 이동하는 함수
  const goToNextMonth = () => {
    const currentMonth = moment(calendarDate);
    const nextMonth = currentMonth.add(1, "month");

    // 현재 월의 선택된 날짜들을 저장소에 백업
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    if (selectedDates.length > 0) {
      setSavedDates({
        ...savedDates,
        [currentMonthKey]: selectedDates,
      });
    }

    // 다음 달로 달력 날짜 변경
    setCalendarDate(nextMonth.toDate());

    // 다음 달의 저장된 선택 날짜들을 로드
    const newMonthKey = nextMonth.format("YYYY-MM");
    setSelectedDates(savedDates[newMonthKey] || []);
  };

  // 이벤트명 입력 필드를 초기화하는 함수
  const handleClear = () => {
    setEventName("");
  };

  return (
    <div className="flex flex-col w-auto">
      <div className="min-w-[33rem] flex flex-col mx-auto">
        <div className="flex justify-between items-center w-full">
          <img
            alt="언제볼까? 서비스 로고"
            src="/wwmtLogo.svg"
            className="flex px-[1.2rem] py-[1.2rem] cursor-pointer"
            onClick={() => navigate("/")}
          />
          <img
            alt="메뉴 열기"
            src="/hambugerMenu.svg"
            className="cursor-pointer w-[2.4rem] h-[2.4rem] mr-[1.2rem]"
            onClick={() => navigate("/menu")}
          />
        </div>
        <div className="relative px-4">
          <input
            className={inputClasses}
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
            style={{ cursor: "pointer" }}
            onClick={handleClear}
          />
        </div>
        <div className="flex h-[2rem] mb-[0.8rem] justify-between items-center self-stretch px-[0.8rem] pl-[2rem]">
          <div
            className={twMerge(
              clsx(
                typographyVariants({ variant: "b2-md" }),
                "text-[var(--gray-800)] "
              )
            )}
          >
            {moment(calendarDate).format("YYYY년 MM월")}
          </div>
          <div className="flex items-center ml-[0.8rem]">
            <img
              className="bg-none cursor-pointer pl-px-[1rem] pt-px-[0.8rem] transition-colors duration-200 ease-in active:scale-95"
              onClick={goToPreviousMonth}
              alt="이전 달로 넘어가기"
              src="btn_Back.svg"
            />
            <img
              className="bg-none cursor-pointer ml-[0.6rem] pl-px-[0.4rem] pt-px-[0.8rem] transition-colors duration-200 ease-in active:scale-95"
              onClick={goToNextMonth}
              alt="다음 달로 넘어가기"
              src="btn_Forward.svg"
            />
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
        <div
          className="monthview-modal-overlay"
          onClick={() => {
            setIsMonthModalOpen(false);
            setModalMode("month");
          }}
        >
          <div
            className="monthview-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {modalMode === "month" ? (
              <div className="year-month-selector">
                <div
                  className="year-display-in-modal"
                  onClick={() => setModalMode("year")}
                >
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
              <div className="monthview-year-buttons">
                {Array.from({ length: 3 }, (_, i) => selectedYear + i).map(
                  (year) => (
                    <button
                      key={year}
                      onClick={() => handleYearSelectInModal(year)}
                      className="monthview-year-button"
                    >
                      {year}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthView;
