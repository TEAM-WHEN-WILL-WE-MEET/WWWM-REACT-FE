import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { useNavigate } from "react-router-dom";
import "./MonthView.css";
// import moment from "moment";
import moment from "moment-timezone";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

import { colors, colorVariants } from "../styles/color.ts";
import { typographyVariants } from "../styles/typography.ts";
import Loading from "../components/Loading";
import { useCalendarStore } from "../store/index.ts";

const MonthView = () => {
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState("month");

  // Zustand store에서 상태와 액션들을 가져옵니다
  const {
    calendarDate,
    selectedDates,
    savedDates,
    eventName,
    setCalendarDate,
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
      "w-[320px]",
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
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    setSelectedDates(savedDates[currentMonthKey] || []);
  }, [calendarDate, savedDates, setSelectedDates]);

  useEffect(() => {
    updateJsonData();
  }, [selectedDates, eventName, updateJsonData]);

  const handleInputChange = (e) => {
    setEventName(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const tileClassName = ({ date, view }) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    const today = moment().startOf("day");
    const classes = [];

    if (moment(date).isBefore(today)) {
      classes.push("disabled-date");
    }

    if (selectedDates.includes(dateString)) {
      classes.push("selected-date");
    }

    return classes.join(" ");
  };

  const openMonthModal = () => {
    setSelectedYear(calendarDate.getFullYear());
    setIsMonthModalOpen(true);
    setModalMode("month");
  };

  const handleYearSelectInModal = (year) => {
    setSelectedYear(year);
    setModalMode("month");
  };

  const handleMonthSelect = (monthIndex) => {
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    if (selectedDates.length > 0) {
      setSavedDates({
        ...savedDates,
        [currentMonthKey]: selectedDates,
      });
    }

    const newDate = new Date(selectedYear, monthIndex, 1);
    setCalendarDate(newDate);

    const newMonthKey = moment(newDate).format("YYYY-MM");
    setSelectedDates(savedDates[newMonthKey] || []);

    setIsMonthModalOpen(false);
    setModalMode("month");
  };

  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      const today = moment().startOf("day");

      if (moment(date).isBefore(today)) {
        return true;
      }

      const currentYear = calendarDate.getFullYear();
      const currentMonth = calendarDate.getMonth();
      const tileYear = date.getFullYear();
      const tileMonth = date.getMonth();

      return currentYear !== tileYear || currentMonth !== tileMonth;
    }
    return false;
  };

  const goToPreviousMonth = () => {
    const currentMonth = moment(calendarDate);
    const previousMonth = currentMonth.subtract(1, "month");

    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    if (selectedDates.length > 0) {
      setSavedDates({
        ...savedDates,
        [currentMonthKey]: selectedDates,
      });
    }

    setCalendarDate(previousMonth.toDate());

    const newMonthKey = previousMonth.format("YYYY-MM");
    setSelectedDates(savedDates[newMonthKey] || []);
  };

  const goToNextMonth = () => {
    const currentMonth = moment(calendarDate);
    const nextMonth = currentMonth.add(1, "month");

    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    if (selectedDates.length > 0) {
      setSavedDates({
        ...savedDates,
        [currentMonthKey]: selectedDates,
      });
    }

    setCalendarDate(nextMonth.toDate());

    const newMonthKey = nextMonth.format("YYYY-MM");
    setSelectedDates(savedDates[newMonthKey] || []);
  };

  const handleClear = () => {
    setEventName("");
  };

  return (
    <div className="flex flex-col w-auto h-auto !px-[0.8rem]">
      <div className="flex  justify-between">
        <img
          alt="언제볼까? 서비스 로고"
          src="/wwmtLogo.svg"
          className="flex px-[1.2rem] py-[1.2rem] cursor-pointer"
          onClick={() => navigate("/")}
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
