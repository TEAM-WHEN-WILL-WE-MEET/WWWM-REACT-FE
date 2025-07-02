// @ts-check
import { create } from "zustand";
import moment from "moment-timezone";

/** @type {import('zustand').StateCreator<{
  selectedDate: number,
  dates: import('./types').DateInfo[],
  times: string[],
  selectedTimes: import('./types').SelectedTimesMap,
  selectedDates: string[],
  savedDates: Record<string, string[]>,
  calendarDate: Date,
  eventName: string,
  setSelectedDate: (index: number) => void,
  setDates: (dates: import('./types').DateInfo[]) => void,
  setTimes: (times: string[]) => void,
  setSelectedDates: (dates: string[]) => void,
  setSavedDates: (dates: Record<string, string[]>) => void,
  setCalendarDate: (date: Date) => void,
  setEventName: (name: string) => void,
  updateTimeSlot: (timeIndex: number, buttonIndex: number, value: boolean) => void,
  bulkUpdateTimeSlots: (updates: import('./types').TimeSlotUpdate[]) => void,
  initializeFromSchedules: (schedules: any[], startTime: string, endTime: string) => void,
  clearCalendar: () => void,
  handleDateChange: (date: Date) => void,
  updateJsonData: () => void
}>} */
const createStore = (set) => ({
  selectedDate: 0,
  dates: [],
  times: [],
  selectedTimes: {},
  selectedDates: [], // 빈 배열로 초기화
  savedDates: {},
  calendarDate: new Date(),
  eventName: "",

  setSelectedDate: (index) => set({ selectedDate: index }),

  setDates: (dates) => set({ dates }),

  setTimes: (times) => set({ times }),

  setSelectedDates: (dates) => set({ selectedDates: dates }),

  setSavedDates: (dates) => set({ savedDates: dates }),

  setCalendarDate: (date) => set({ calendarDate: date }),

  setEventName: (name) => set({ eventName: name }),

  updateTimeSlot: (timeIndex, buttonIndex, value) =>
    set((state) => {
      const newSelectedTimes = { ...state.selectedTimes };
      if (!newSelectedTimes[timeIndex]) {
        newSelectedTimes[timeIndex] = {};
      }
      newSelectedTimes[timeIndex][buttonIndex] = value;
      return { selectedTimes: newSelectedTimes };
    }),

  bulkUpdateTimeSlots: (updates) =>
    set((state) => {
      const newSelectedTimes = { ...state.selectedTimes };
      updates.forEach(({ timeIndex, buttonIndex, value }) => {
        if (!newSelectedTimes[timeIndex]) {
          newSelectedTimes[timeIndex] = {};
        }
        newSelectedTimes[timeIndex][buttonIndex] = value;
      });
      return { selectedTimes: newSelectedTimes };
    }),

  initializeFromSchedules: (schedules, startTime, endTime) =>
    set((state) => {
      // 시작 시간과 종료 시간을 기반으로 times 배열 생성
      const start = moment(startTime, "HH:mm");
      const end = moment(endTime, "HH:mm");
      const times = [];
      let current = start.clone();

      while (current.isSameOrBefore(end)) {
        times.push(current.format("HH:mm"));
        current.add(30, "minutes");
      }

      return { times };
    }),

  clearCalendar: () =>
    set({
      selectedDate: 0,
      dates: [],
      times: [],
      selectedTimes: {},
      selectedDates: [],
      savedDates: {},
      calendarDate: new Date(),
      eventName: "",
    }),

  handleDateChange: (date) =>
    set((state) => {
      const dateString = moment(date).format("YYYY-MM-DD");
      const newSelectedDates = state.selectedDates.includes(dateString)
        ? state.selectedDates.filter((d) => d !== dateString)
        : [...state.selectedDates, dateString];
      return { selectedDates: newSelectedDates };
    }),

  updateJsonData: () =>
    set((state) => {
      const currentMonthKey = moment(state.calendarDate).format("YYYY-MM");
      if (state.selectedDates.length > 0) {
        return {
          savedDates: {
            ...state.savedDates,
            [currentMonthKey]: state.selectedDates,
          },
        };
      }
      return state;
    }),
});

export const useCalendarStore = create(createStore);
