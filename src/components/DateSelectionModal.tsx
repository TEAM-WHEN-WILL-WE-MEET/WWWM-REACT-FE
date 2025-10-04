import React, { useState } from 'react';
import Calendar from "react-calendar";
import moment from "moment-timezone";
import { Button } from './Button.tsx';
import { typographyVariants } from '../styles/typography';
import { colors, colorVariants } from '../styles/color';
import { useCalendarNavigation } from '../features/calendar/components/MonthViewCalendar/hooks/useCalendarNavigation';
import { formatMonthYear, formatDay } from '../features/calendar/components/MonthViewCalendar/utils/dateUtils';
import '../features/calendar/components/MonthViewCalendar/styles.css';
import GrayLineSvg from '../../public/grayLine.svg';
import BlueLineSvg from '../../public/blueLine.svg';
import BlueEllipseSvg from '../../public/blueEllipse.svg';
import GrayEllipseSvg from '../../public/grayEllipse.svg';
import BackwardSvg from '../../public/backward.svg';
import GrayBackwardSvg from '../../public/grayBackward.svg';
import ForwardSvg from '../../public/forward.svg';

interface DateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentTitle: string;
}

const DateSelectionModal: React.FC<DateSelectionModalProps> = ({ isOpen, onClose, appointmentTitle }) => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<'date' | 'period'>('date');
  const [periodStart, setPeriodStart] = useState<string | null>(null);
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);

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

    if (selectionMode === 'date') {
      if (selectedDates.includes(dateString)) {
        setSelectedDates(selectedDates.filter(d => d !== dateString));
      } else {
        setSelectedDates([...selectedDates, dateString]);
      }
    } else {
      // 기간 선택 모드
      if (!periodStart || (periodStart && periodEnd)) {
        // 첫 번째 날짜 선택 또는 재선택
        setPeriodStart(dateString);
        setPeriodEnd(null);
        // 첫 번째 날짜를 바로 selectedDates에 추가
        if (!selectedDates.includes(dateString)) {
          setSelectedDates([...selectedDates, dateString]);
        }
      } else {
        // 두 번째 날짜 선택
        const start = moment(periodStart);
        const end = moment(dateString);

        if (end.isBefore(start)) {
          // 종료일이 시작일보다 이전이면 시작일을 새로 설정
          setPeriodStart(dateString);
          setPeriodEnd(null);
          // 기존에 선택된 periodStart 제거하고 새로운 날짜 추가
          const newDates = selectedDates.filter(d => d !== periodStart);
          if (!newDates.includes(dateString)) {
            setSelectedDates([...newDates, dateString]);
          }
        } else {
          setPeriodEnd(dateString);

          // 기간 내의 모든 날짜를 selectedDates에 추가
          const periodDates: string[] = [];
          let current = start.clone();
          while (current.isSameOrBefore(end)) {
            periodDates.push(current.format("YYYY-MM-DD"));
            current.add(1, 'day');
          }

          // 기존 selectedDates에서 periodStart 제거 후 periodDates 추가
          const filteredDates = selectedDates.filter(d => d !== periodStart);
          const newDates = [...filteredDates, ...periodDates].filter((date, index, self) => self.indexOf(date) === index);
          setSelectedDates(newDates);
        }
      }
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

  const currentMonth = moment();
  const isPreviousButtonEnabled = moment(calendarDate).isAfter(currentMonth, 'month');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-20 flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-[2rem] w-full mx-0 max-h-[80vh] min-h-fit overflow-auto "
      >
        {/* Calendar Container */}
        <div className="px-[2.2rem] pt-[2.6rem] flex flex-col gap-[2rem]">
          {/* Calendar Header */}
          <div className="flex items-center justify-center  gap-[4rem] mb-[0.4rem]">
            <button
              onClick={isPreviousButtonEnabled ? goToPreviousMonth : undefined}
              disabled={!isPreviousButtonEnabled}
              className="w-[2.4rem] h-[2.4rem] flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors disabled:hover:bg-transparent disabled:cursor-not-allowed"
            >
              <img
                src={isPreviousButtonEnabled ? BackwardSvg : GrayBackwardSvg}
                alt="previous month"
                className=""
              />
            </button>

            <h3 className="text-[18px] font-semibold tracking-[-0.45px]">
              {moment(calendarDate).format("M월")}
            </h3>

            <button
              onClick={goToNextMonth}
              className="w-[2.4rem] h-[2.4rem] flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <img src={ForwardSvg} alt="next month" className="" />
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
              // formatDay={formatDay}
              formatDay={(locale, date) => moment(date).format("DD")}
              showNeighboringMonth={true}
              tileDisabled={tileDisabled}
              minDate={new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </div>

          {/* Selection Buttons */}
          <div className="flex gap-[0.8rem] justify-center">
            <Button
              variant="default"
              property={
                selectionMode === "date" ? "dateSelectActive" : "dateSelect"
              }
              children={
                <img
                  src={
                    selectionMode === "date" ? BlueEllipseSvg : GrayEllipseSvg
                  }
                  alt="Ellipse"
                  className="w-[0.5rem] h-[0.5rem]"
                />
              }
              label="날짜 선택"
              onClick={() => {
                setSelectionMode("date");
                setPeriodStart(null);
                setPeriodEnd(null);
              }}
            />
            <Button
              variant="default"
              property={
                selectionMode === "period" ? "dateSelectActive" : "dateSelect"
              }
              children={
                <img
                  src={selectionMode === "period" ? BlueLineSvg : GrayLineSvg}
                  alt="line"
                  className="w-[0.8rem] "
                />
              }
              label="기간 선택"
              onClick={() => {
                setSelectionMode("period");
                setPeriodStart(null);
                setPeriodEnd(null);
              }}
            />
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex-shrink-0 mb-[2.4rem] mt-[2.4rem] mx-auto justify-center flex px-[2.2rem]">
          <Button
            variant="default"
            property="choiceTime"
            disabled={!isButtonEnabled}
            label="시간 선택하기"
            onClick={onClose}
          />
        </div>

        {/* Month/Year Modal */}
        {isMonthModalOpen && (
          <div
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10"
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
    </div>
  );
};

export default DateSelectionModal;