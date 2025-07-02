// @ts-check
import { create } from "zustand";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_WWWM_BE_ENDPOINT
    : process.env.REACT_APP_WWWM_BE_DEV_EP;

/** @type {import('zustand').StateCreator<{
  appointmentId: string | null,
  eventName: string,
  responseData: import('./types').AppointmentResponse | null,
  startTime: string,
  endTime: string,
  users: import('./types').User[],
  schedules: import('./types').Schedule[],
  setAppointment: (data: import('./types').AppointmentResponse) => void,
  clearAppointment: () => void,
  updateSchedule: (scheduleData: import('./types').ScheduleUpdatePayload) => Promise<void>
}>} */
const createStore = (set) => ({
  appointmentId: null,
  eventName: "",
  responseData: null,
  startTime: "",
  endTime: "",
  users: [],
  schedules: [],

  setAppointment: (data) =>
    set({
      appointmentId: data.object.id,
      eventName: data.object.name,
      responseData: data,
      startTime: data.object.startTime,
      endTime: data.object.endTime,
      users: data.object.users,
      schedules: data.object.schedules,
    }),

  clearAppointment: () =>
    set({
      appointmentId: null,
      eventName: "",
      responseData: null,
      startTime: "",
      endTime: "",
      users: [],
      schedules: [],
    }),

  updateSchedule: async (scheduleData) => {
    try {
      const response = await fetch(`${BASE_URL}/schedule/updateSchedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        throw new Error("Schedule update failed");
      }

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
});

export const useAppointmentStore = create(createStore);
