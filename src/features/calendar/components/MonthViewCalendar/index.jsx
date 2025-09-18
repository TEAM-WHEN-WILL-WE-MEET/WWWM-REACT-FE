import React from "react";
import Calendar from "react-calendar";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import moment from "moment-timezone";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

import { typographyVariants } from "../../../../styles/typography.ts";
import { useTitleField } from "./hooks/useTitleField.js";
import { useCalendarNavigation } from "./hooks/useCalendarNavigation.js";
import { useTimeSelection } from "./hooks/useTimeSelection.js";
import { getInputClasses } from "./utils/styleUtils.js";
import { formatMonthYear, formatDay } from "./utils/dateUtils.js";

const MonthView = () => {
  const navigate = useNavigate();
  
  // Custom hooks
  const {
    eventName,
    isFocused,
    handleInputChange,
    handleFocus,
    handleBlur,
    handleClear,
  } = useTitleField();

  const {
    calendarDate,
    isMonthModalOpen,
    modalMode,
    selectedYear,
    setIsMonthModalOpen,
    setModalMode,
    tileClassName,
    tileDisabled,
    goToPreviousMonth,
    goToNextMonth,
    handleYearSelectInModal,
    handleMonthSelect,
    handleDateChange,
  } = useCalendarNavigation();

  const { startTime, endTime } = useTimeSelection();

  // Styles
  const inputClasses = getInputClasses();


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
            {formatMonthYear(calendarDate)}
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
          formatDay={formatDay}
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
