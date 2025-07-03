import { create } from "zustand";
import { AppointmentResponse, ScheduleUpdatePayload } from "./types";
import moment from "moment-timezone";

interface AppointmentState {
  responseData: any;
  appointmentId: string | null;
  userName: string | null;
  dates: Array<{ date: string; key: number; id: string }>;
  times: string[];
  eventName: string;
  selectedDate: number;
  selectedTimes: Record<number, Record<number, Record<number, boolean>>>;
  startTime: string;
  endTime: string;
  users: AppointmentResponse["object"]["users"];
  schedules: AppointmentResponse["object"]["schedules"];

  // actions
  setResponseData: (data: any) => void;
  setAppointmentId: (id: string) => void;
  setUserName: (name: string) => void;
  setDates: (dates: Array<{ date: string; key: number; id: string }>) => void;
  setTimes: (times: string[]) => void;
  setEventName: (name: string) => void;
  setSelectedDate: (index: number) => void;
  setSelectedTimes: (
    times: Record<number, Record<number, Record<number, boolean>>>
  ) => void;
  updateSchedule: (scheduleData: ScheduleUpdatePayload) => Promise<void>;

  // Complex actions
  initializeFromResponse: (responseData: any) => void;
  resetStore: () => void;
}

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_WWWM_BE_ENDPOINT
    : process.env.REACT_APP_WWWM_BE_DEV_EP;

export const useAppointmentStore = create<AppointmentState>((set) => ({
  responseData: null,
  appointmentId: null,
  userName: null,
  dates: [],
  times: [],
  eventName: "",
  selectedDate: 0,
  selectedTimes: {},
  startTime: "",
  endTime: "",
  users: [],
  schedules: [],

  // Simple actions
  setResponseData: (data) => set({ responseData: data }),
  setAppointmentId: (id) => set({ appointmentId: id }),
  setUserName: (name) => set({ userName: name }),
  setDates: (dates) => set({ dates }),
  setTimes: (times) => set({ times }),
  setEventName: (name) => set({ eventName: name }),
  setSelectedDate: (index) => set({ selectedDate: index }),
  setSelectedTimes: (times) => set({ selectedTimes: times }),

  // Complex actions
  initializeFromResponse: (responseData) => {
    if (!responseData || !responseData.object) return;

    const schedules = responseData.object.schedules;
    if (!schedules) return;

    const datesArray = schedules.map((schedule: any, index: number) => ({
      date: moment.tz(schedule.date, "Asia/Seoul").format("YYYY-MM-DD"),
      key: index,
      id: schedule.id,
    }));

    const startTimeH = moment
      .tz(responseData.object.startTime, "Asia/Seoul")
      .format("HH");
    const endTimeHM = moment
      .tz(responseData.object.endTime, "Asia/Seoul")
      .format("HH");

    const timeSet = new Set();
    if (schedules[0]?.times) {
      schedules[0].times.forEach((timeSlot: any) => {
        const timeHM = parseInt(
          moment.tz(timeSlot.time, "Asia/Seoul").format("HH"),
          10
        );
        const startTimeHNum = parseInt(startTimeH, 10);
        const endTimeHNum = parseInt(endTimeHM, 10);
        if (timeHM >= startTimeHNum && timeHM <= endTimeHNum - 1) {
          timeSet.add(timeHM);
        }
      });
    }

    const timesArray = Array.from(timeSet) as number[];
    const sortedTimesArray = timesArray
      .sort((a, b) =>
        moment(a.toString(), "HH").diff(moment(b.toString(), "HH"))
      )
      .map((timeHM) => moment(timeHM.toString(), "HH").format("HH:mm"));

    set({
      responseData,
      appointmentId: responseData.object.id,
      eventName: responseData.object.name,
      dates: datesArray,
      times: sortedTimesArray,
      selectedDate: 0,
      startTime: responseData.object.startTime,
      endTime: responseData.object.endTime,
      users: responseData.object.users,
      schedules: responseData.object.schedules,
    });
  },

  resetStore: () =>
    set({
      responseData: null,
      appointmentId: null,
      userName: null,
      dates: [],
      times: [],
      eventName: "",
      selectedDate: 0,
      selectedTimes: {},
      startTime: "",
      endTime: "",
      users: [],
      schedules: [],
    }),

  updateSchedule: async (scheduleData: ScheduleUpdatePayload) => {
    try {
      const response = await fetch(`${BASE_URL}/schedule/updateSchedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        throw new Error("Schedule update failed");
      }

      // 성공 시 새로운 약속 데이터를 가져와서 store 업데이트
      const updatedAppointment = await fetch(
        `${BASE_URL}/appointment/getAppointment?appointmentId=${scheduleData.appointmentId}`
      );
      const updatedData = await updatedAppointment.json();
      set((state) => ({
        ...state,
        responseData: updatedData,
        schedules: updatedData.object.schedules,
      }));
    } catch (error) {
      console.error("Failed to update schedule:", error);
      throw error;
    }
  },
}));
