import { useState, useEffect } from "react";
import moment from "moment-timezone";
import { useCalendarStore } from "../../../store/index.ts";

export const useCalendarNavigation = () => {
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarDate, setCalendarDate] = useState(new Date());

  const {
    selectedDates,
    savedDates,
    startTime,
    endTime,
    setSelectedDates,
    setSavedDates,
    handleDateChange,
    updateJsonData,
  } = useCalendarStore();

  // 현재 달력 월이 변경될 때마다 해당 월의 저장된 선택 날짜들을 로드
  useEffect(() => {
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    setSelectedDates(savedDates[currentMonthKey] || []);
  }, [calendarDate, savedDates, setSelectedDates]);

  // 선택된 날짜나 시간이 변경될 때마다 API 전송용 JSON 데이터를 업데이트
  useEffect(() => {
    updateJsonData();
  }, [selectedDates, startTime, endTime, updateJsonData]);

  // react-calendar의 각 날짜 타일에 적용할 CSS 클래스를 결정하는 함수
  const tileClassName = ({ date, view }: any) => {
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

  // react-calendar에서 특정 날짜를 비활성화할지 결정하는 함수
  const tileDisabled = ({ date, view }: any) => {
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

  // 현재 월의 선택된 날짜들을 저장소에 백업
  const saveCurrentMonthDates = () => {
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    if (selectedDates.length > 0) {
      setSavedDates({
        ...savedDates,
        [currentMonthKey]: selectedDates,
      });
    }
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

  // 모달에서 연도를 선택했을 때 호출되는 함수
  const handleYearSelectInModal = (year: number) => {
    setSelectedYear(year);
    setModalMode("month");
  };

  // 모달에서 특정 월을 선택했을 때 호출되는 함수
  const handleMonthSelect = (monthIndex: number) => {
    saveCurrentMonthDates();

    const newDate = new Date(selectedYear, monthIndex, 1);
    setCalendarDate(newDate);

    const newMonthKey = moment(newDate).format("YYYY-MM");
    setSelectedDates(savedDates[newMonthKey] || []);

    setIsMonthModalOpen(false);
    setModalMode("month");
  };

  return {
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
  };
};
