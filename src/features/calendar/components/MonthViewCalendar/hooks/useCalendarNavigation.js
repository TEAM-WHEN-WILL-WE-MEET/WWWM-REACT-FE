import { useState, useEffect } from "react";
import moment from "moment-timezone";
import { useCalendarStore } from "../../../../../store/index.ts";

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

  useEffect(() => {
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    setSelectedDates(savedDates[currentMonthKey] || []);
  }, [calendarDate, savedDates, setSelectedDates]);

  useEffect(() => {
    updateJsonData();
  }, [selectedDates, startTime, endTime, updateJsonData]);

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

  const saveCurrentMonthDates = () => {
    const currentMonthKey = moment(calendarDate).format("YYYY-MM");
    if (selectedDates.length > 0) {
      setSavedDates({
        ...savedDates,
        [currentMonthKey]: selectedDates,
      });
    }
  };

  const goToPreviousMonth = () => {
    const currentMonth = moment(calendarDate);
    const previousMonth = currentMonth.subtract(1, "month");

    saveCurrentMonthDates();
    setCalendarDate(previousMonth.toDate());

    const newMonthKey = previousMonth.format("YYYY-MM");
    setSelectedDates(savedDates[newMonthKey] || []);
  };

  const goToNextMonth = () => {
    const currentMonth = moment(calendarDate);
    const nextMonth = currentMonth.add(1, "month");

    saveCurrentMonthDates();
    setCalendarDate(nextMonth.toDate());

    const newMonthKey = nextMonth.format("YYYY-MM");
    setSelectedDates(savedDates[newMonthKey] || []);
  };

  const handleYearSelectInModal = (year) => {
    setSelectedYear(year);
    setModalMode("month");
  };

  const handleMonthSelect = (monthIndex) => {
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