import React, { useState } from 'react';
import Calendar from "react-calendar";
import moment from "moment-timezone";
import { Button } from './Button';
import { useCalendarNavigation } from '../features/calendar/components/MonthViewCalendar/hooks/useCalendarNavigation';
import { formatMonthYear, formatDay } from '../features/calendar/components/MonthViewCalendar/utils/dateUtils';
import '../features/calendar/components/MonthViewCalendar/styles.css';

interface DateSelectionPageProps {
  className?: string;
}

const DateSelectionPage: React.FC<DateSelectionPageProps> = ({ className = '' }) => {
  const [appointmentTitle] = useState("프로젝트 회의 시간");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  
  const {
    calendarDate,
    isMonthModalOpen,
    modalMode,
    selectedYear,
    setIsMonthModalOpen,
    setModalMode,
    goToPreviousMonth,
    goToNextMonth,
    handleYearSelectInModal,
    handleMonthSelect,
  } = useCalendarNavigation();

  const handleDateChange = (date: Date) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    if (selectedDates.includes(dateString)) {
      setSelectedDates(selectedDates.filter(d => d !== dateString));
    } else {
      setSelectedDates([...selectedDates, dateString]);
    }
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
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

  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const today = moment().startOf("day");
      return moment(date).isBefore(today);
    }
    return false;
  };

  const isButtonEnabled = selectedDates.length > 0;

  return (
    <div className={`bg-white min-h-screen relative ${className}`}>
      {/* Status Bar */}
      <div className="bg-white h-[24px] w-full px-4 flex items-center justify-between text-[13px] font-medium text-[#444444] tracking-[-0.325px]">
        <span>9:40</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-400 rounded-sm opacity-50"></div>
          <div className="w-4 h-4 bg-gray-400 rounded-sm opacity-50"></div>
          <div className="w-4 h-4 bg-gray-400 rounded-sm opacity-50"></div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white h-[56px] px-2 flex items-center justify-between">
        <div className="w-10 h-10 flex items-center justify-center">
          <div className="w-6 h-6 bg-[#aac4ff] rounded"></div>
        </div>
        <div className="w-10 h-10 flex items-center justify-center">
          <div className="flex flex-col gap-[3px]">
            <div className="w-4 h-[2px] bg-[#767676] rounded-full"></div>
            <div className="w-4 h-[2px] bg-[#767676] rounded-full"></div>
            <div className="w-4 h-[2px] bg-[#767676] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-[16px] font-medium text-[#767676] tracking-[-0.4px] leading-5">
          {appointmentTitle}
        </h1>
      </div>

      {/* Calendar Container */}
      <div className="bg-white mx-4 rounded-2xl shadow-sm p-4 mb-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <div className="w-6 h-6 flex items-center justify-center text-[#767676]">
              &#8249;
            </div>
          </button>
          
          <h2 className="text-[18px] font-semibold text-[#242424] tracking-[-0.45px]">
            {moment(calendarDate).format("M월")}
          </h2>
          
          <button 
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <div className="w-6 h-6 flex items-center justify-center text-[#767676]">
              &#8250;
            </div>
          </button>
        </div>

        {/* Calendar */}
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
      </div>

      {/* Selection Buttons */}
      <div className="px-4 mb-6">
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-[#aac4ff] bg-[#aac4ff] text-white rounded-full text-[14px] font-semibold tracking-[-0.35px]">
            날짜 선택
          </button>
          <button className="px-4 py-2 border border-[#efefef] bg-white text-[#767676] rounded-full text-[14px] font-semibold tracking-[-0.35px]">
            기간 선택
          </button>
        </div>
      </div>

      {/* Bottom Input and Navigation */}
      <div className="fixed bottom-[48px] left-0 right-0 bg-white px-4 py-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="시간 선택하기"
            className="w-full h-12 px-4 rounded-lg border border-[#efefef] text-[16px] text-[#767676] font-medium tracking-[-0.4px] placeholder:text-[#767676] focus:outline-none focus:border-[#aac4ff]"
          />
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white h-12 flex items-center justify-center">
        <div className="flex items-center gap-[100px]">
          <div className="w-4 h-4 bg-[#797979] rounded-sm"></div>
          <div className="w-4 h-4 bg-[#797979] rounded-full"></div>
          <div className="w-4 h-4 bg-[#797979] rounded-sm"></div>
        </div>
      </div>

      {/* Month/Year Modal */}
      {isMonthModalOpen && (
        <div
          className="monthview-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setIsMonthModalOpen(false);
            setModalMode("month");
          }}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {modalMode === "month" ? (
              <div className="year-month-selector">
                <div
                  className="text-center text-lg font-semibold mb-4 cursor-pointer"
                  onClick={() => setModalMode("year")}
                >
                  {selectedYear}년
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handleMonthSelect(i)}
                      className="month-button p-2 text-center border rounded-lg hover:bg-gray-100"
                    >
                      {i + 1}월
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="monthview-year-buttons grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }, (_, i) => selectedYear + i).map(
                  (year) => (
                    <button
                      key={year}
                      onClick={() => handleYearSelectInModal(year)}
                      className="monthview-year-button p-2 text-center border rounded-lg hover:bg-gray-100"
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

export default DateSelectionPage;