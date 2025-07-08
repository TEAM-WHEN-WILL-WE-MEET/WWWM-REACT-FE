import { create } from "zustand";
import { DateInfo, SelectedTimesMap, TimeSlotUpdate } from "./types";
import moment from "moment-timezone";
import { fetchApi } from "../utils/api";
import { API_CONFIG, API_ENDPOINTS } from "../config/environment";

interface TimeSlot {
  time: string;
}

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
  isLoading: boolean;
  error: string | null;
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
  updateJsonData: () => void;
  handleDateChange: (date: string) => void;
  createCalendar: () => Promise<string>;
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
  isLoading: false,
  error: null,
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

    const startTimeH = parseInt(
      moment.tz(startTime, "Asia/Seoul").format("HH"),
      10
    );
    const endTimeHM = parseInt(
      moment.tz(endTime, "Asia/Seoul").format("HH"),
      10
    );

    const timeSet = new Set<number>();
    if (schedules[0]?.times) {
      schedules[0].times.forEach((timeSlot: TimeSlot) => {
        const timeHM = parseInt(
          moment.tz(timeSlot.time, "Asia/Seoul").format("HH"),
          10
        );
        if (timeHM >= startTimeH && timeHM <= endTimeHM - 1) {
          timeSet.add(timeHM);
        }
      });
    }

    const timesArray = Array.from(timeSet)
      .sort((a, b) => a - b)
      .map((timeHM) =>
        moment(timeHM.toString().padStart(2, "0"), "HH").format("HH:mm")
      );

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
    const monthKey = moment(date).format("YYYY-MM");
    const currentMonthDates = get().savedDates[monthKey] || [];

    // Update savedDates
    const updatedMonthDates = currentMonthDates.includes(dateString)
      ? currentMonthDates.filter((d) => d !== dateString)
      : [...currentMonthDates, dateString];

    // Update both savedDates and selectedDates
    set((state) => ({
      savedDates: {
        ...state.savedDates,
        [monthKey]: updatedMonthDates,
      },
      selectedDates: state.selectedDates.includes(dateString)
        ? state.selectedDates.filter((d) => d !== dateString)
        : [...state.selectedDates, dateString],
    }));
  },

  updateJsonData: () => {
    const { selectedDates, eventName, startTime, endTime } = get();

    if (selectedDates.length > 0 && eventName) {
      const schedules = selectedDates
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map((dateString) => ({
          date: moment
            .tz(dateString, "YYYY-MM-DD", API_CONFIG.TIMEZONE)
            .format("YYYY-MM-DDTHH:mm:ss[Z]"),
        }));

      const sortedDates = [...selectedDates].sort();
      const earliestDate = sortedDates[0];
      const latestDate = sortedDates[sortedDates.length - 1];

      const startDateTime = moment
        .tz(
          `${earliestDate} ${startTime}`,
          "YYYY-MM-DD HH:mm",
          API_CONFIG.TIMEZONE
        )
        .format("YYYY-MM-DDTHH:mm:ss[Z]");

      const endDateTime = moment
        .tz(`${latestDate} ${endTime}`, "YYYY-MM-DD HH:mm", API_CONFIG.TIMEZONE)
        .format("YYYY-MM-DDTHH:mm:ss[Z]");

      const data = {
        name: eventName,
        schedules,
        startTime: startDateTime,
        endTime: endDateTime,
        timeZone: API_CONFIG.TIMEZONE,
      };

      set({ jsonData: data, isFormReady: true });
    } else {
      set({ isFormReady: false });
    }
  },

  createCalendar: async () => {
    const { jsonData } = get();

    if (!jsonData) {
      throw new Error("Calendar data is not ready");
    }

    set({ isLoading: true, error: null });

    try {
      console.log("Creating calendar with data:", jsonData);
      console.log("API Base URL:", API_CONFIG.BASE_URL);
      console.log(
        "Full API endpoint:",
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CREATE_APPOINTMENT}`
      );

      const response = await fetchApi(API_ENDPOINTS.CREATE_APPOINTMENT, {
        method: "POST",
        body: jsonData,
      });

      console.log("Calendar creation response:", response);
      const appointmentId = response.object.id;
      return appointmentId;
    } catch (error) {
      console.error("Calendar creation failed:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
        jsonData,
        apiConfig: API_CONFIG,
      });

      const errorMessage =
        error instanceof Error ? error.message : "Failed to create calendar";
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
