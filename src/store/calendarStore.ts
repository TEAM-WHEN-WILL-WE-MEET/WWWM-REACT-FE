import { create } from "zustand";
import moment from "moment-timezone";

interface CalendarState {
  calendarDate: Date;
  selectedDates: string[];
  savedDates: Record<string, string[]>;
  eventName: string;
  startTime: string;
  endTime: string;
  isFormReady: boolean;
  jsonData: any;
  setCalendarDate: (date: Date) => void;
  setSelectedDates: (dates: string[]) => void;
  setSavedDates: (dates: Record<string, string[]>) => void;
  setEventName: (name: string) => void;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
  setIsFormReady: (isReady: boolean) => void;
  setJsonData: (data: any) => void;
  resetForm: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  calendarDate: new Date(),
  selectedDates: [],
  savedDates: {},
  eventName: "이름 없는 캘린더",
  startTime: "09:00",
  endTime: "20:00",
  isFormReady: false,
  jsonData: null,

  // Simple actions
  setCalendarDate: (date) => set({ calendarDate: date }),
  setSelectedDates: (dates) => set({ selectedDates: dates }),
  setSavedDates: (dates) => set({ savedDates: dates }),
  setEventName: (name) => set({ eventName: name }),
  setStartTime: (time) => set({ startTime: time }),
  setEndTime: (time) => set({ endTime: time }),
  setIsFormReady: (isReady) => set({ isFormReady: isReady }),
  setJsonData: (data) => set({ jsonData: data }),
  resetForm: () =>
    set({
      selectedDates: [],
      eventName: "",
      startTime: "",
      endTime: "",
      isFormReady: false,
      jsonData: null,
    }),

  // Complex actions
  handleDateChange: (date) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    const monthKey = moment(get().calendarDate).format("YYYY-MM");
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
      selectedDates: state.selectedDates.includes(dateString)
        ? state.selectedDates.filter((d) => d !== dateString)
        : [...state.selectedDates, dateString],
    }));
  },

  updateJsonData: () => {
    const state = get();
    if (state.selectedDates.length > 0 && state.eventName) {
      const schedules = state.selectedDates
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map((dateString) => ({
          date: moment
            .tz(dateString, "YYYY-MM-DD", "Asia/Seoul")
            .format("YYYY-MM-DDTHH:mm:ss"),
        }));

      const sortedDates = [...state.selectedDates].sort();
      const earliestDateString = sortedDates[0];
      const latestDateString = sortedDates[sortedDates.length - 1];

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
