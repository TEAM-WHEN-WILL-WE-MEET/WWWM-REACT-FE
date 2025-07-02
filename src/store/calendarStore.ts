import { create } from "zustand";
import { DateInfo, SelectedTimesMap, TimeSlotUpdate } from "./types";
import moment from "moment-timezone";

interface CalendarState {
  selectedDate: number;
  dates: DateInfo[];
  times: string[];
  selectedTimes: SelectedTimesMap;
  savedDates: Record<string, string[]>;
  selectedDates: string[];
  eventName: string;
  startTime: string;
  endTime: string;
  isFormReady: boolean;
  jsonData: any;

  // actions
  setSelectedDate: (index: number) => void;
  setDates: (dates: DateInfo[]) => void;
  setTimes: (times: string[]) => void;
  updateTimeSlot: (
    timeIndex: number,
    buttonIndex: number,
    value: boolean
  ) => void;
  bulkUpdateTimeSlots: (updates: TimeSlotUpdate[]) => void;
  initializeFromSchedules: (
    schedules: any[],
    startTime: string,
    endTime: string
  ) => void;
  clearCalendar: () => void;
  setSavedDates: (dates: Record<string, string[]>) => void;
  setSelectedDates: (dates: string[]) => void;
  setEventName: (name: string) => void;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
  setIsFormReady: (isReady: boolean) => void;
  setJsonData: (data: any) => void;
  resetForm: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  selectedDate: 0,
  dates: [],
  times: [],
  selectedTimes: {},
  savedDates: {},
  selectedDates: [],
  eventName: "이름 없는 캘린더",
  startTime: "09:00",
  endTime: "20:00",
  isFormReady: false,
  jsonData: null,

  // Simple actions
  setSelectedDate: (index: number) => set({ selectedDate: index }),
  setDates: (dates: DateInfo[]) => set({ dates }),
  setTimes: (times: string[]) => set({ times }),
  setSavedDates: (dates) => set({ savedDates: dates }),
  setSelectedDates: (dates: string[]) => set({ selectedDates: dates }),
  setEventName: (name: string) => set({ eventName: name }),
  setStartTime: (time: string) => set({ startTime: time }),
  setEndTime: (time: string) => set({ endTime: time }),
  setIsFormReady: (isReady: boolean) => set({ isFormReady: isReady }),
  setJsonData: (data: any) => set({ jsonData: data }),
  resetForm: () =>
    set({
      selectedDate: 0,
      dates: [],
      times: [],
      selectedTimes: {},
      selectedDates: [],
      eventName: "",
      startTime: "",
      endTime: "",
      isFormReady: false,
      jsonData: null,
    }),

  // Complex actions
  updateTimeSlot: (timeIndex: number, buttonIndex: number, value: boolean) =>
    set((state) => {
      const newSelectedTimes = { ...state.selectedTimes };
      if (!newSelectedTimes[state.selectedDate]) {
        newSelectedTimes[state.selectedDate] = {};
      }
      if (!newSelectedTimes[state.selectedDate][timeIndex]) {
        newSelectedTimes[state.selectedDate][timeIndex] = {};
      }
      newSelectedTimes[state.selectedDate][timeIndex][buttonIndex] = value;
      return { selectedTimes: newSelectedTimes };
    }),

  bulkUpdateTimeSlots: (updates: TimeSlotUpdate[]) =>
    set((state) => {
      const newSelectedTimes = { ...state.selectedTimes };
      updates.forEach(({ timeIndex, buttonIndex, value }) => {
        if (!newSelectedTimes[state.selectedDate]) {
          newSelectedTimes[state.selectedDate] = {};
        }
        if (!newSelectedTimes[state.selectedDate][timeIndex]) {
          newSelectedTimes[state.selectedDate][timeIndex] = {};
        }
        newSelectedTimes[state.selectedDate][timeIndex][buttonIndex] = value;
      });
      return { selectedTimes: newSelectedTimes };
    }),

  initializeFromSchedules: (schedules, startTime, endTime) => {
    const datesArray = schedules.map((schedule, index) => ({
      date: moment.tz(schedule.date, "Asia/Seoul").format("YYYY-MM-DD"),
      key: index,
      id: schedule.id,
    }));

    const startTimeH = moment.tz(startTime, "Asia/Seoul").format("HH");
    const endTimeHM = moment.tz(endTime, "Asia/Seoul").format("HH");

    const timeSet = new Set();
    if (schedules[0]?.times) {
      schedules[0].times.forEach((timeSlot) => {
        const timeHM = moment.tz(timeSlot.time, "Asia/Seoul").format("HH");
        if (timeHM >= startTimeH && timeHM <= endTimeHM - 1) {
          timeSet.add(timeHM);
        }
      });
    }

    const timesArray = Array.from(timeSet)
      .sort((a, b) => moment(a, "HH").diff(moment(b, "HH")))
      .map((timeHM) => moment(timeHM, "HH").format("HH:mm"));

    set({
      dates: datesArray,
      times: timesArray,
      selectedDate: 0,
      selectedTimes: {},
    });
  },

  clearCalendar: () =>
    set({
      selectedDate: 0,
      dates: [],
      times: [],
      selectedTimes: {},
    }),

  handleDateChange: (date) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    const monthKey = moment(get().dates[get().selectedDate]?.date).format(
      "YYYY-MM"
    );
    const currentMonthDates = get().savedDates[monthKey] || [];

    // Update savedDates
    const updatedMonthDates = currentMonthDates.includes(dateString)
      ? currentMonthDates.filter((d) => d !== dateString)
      : [...currentMonthDates, dateString];

    set((state) => ({
      savedDates: {
        ...state.savedDates,
        [monthKey]: updatedMonthDates,
      },
    }));

    // Update selectedDates
    set((state) => ({
      selectedDate: state.dates.findIndex((d) => d.date === dateString),
    }));
  },

  updateJsonData: () => {
    const state = get();
    if (state.selectedDate >= 0 && state.eventName) {
      const schedules = state.dates
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((dateInfo) => ({
          date: dateInfo.date,
        }));

      const sortedDates = [...state.dates].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const earliestDateString = sortedDates[0].date;
      const latestDateString = sortedDates[sortedDates.length - 1].date;

      const startDateTime = moment
        .tz(
          `${earliestDateString} ${state.startTime}`,
          "YYYY-MM-DD HH:mm",
          "Asia/Seoul"
        )
        .format("YYYY-MM-DDTHH:mm:ss[Z]");

      const endDateTime = moment
        .tz(
          `${latestDateString} ${state.endTime}`,
          "YYYY-MM-DD HH:mm",
          "Asia/Seoul"
        )
        .format("YYYY-MM-DDTHH:mm:ss[Z]");

      const data = {
        name: state.eventName,
        schedules,
        startTime: startDateTime,
        endTime: endDateTime,
        timeZone: "Asia/Seoul",
      };

      set({ jsonData: data, isFormReady: true });
    } else {
      set({ isFormReady: false });
    }
  },
}));
