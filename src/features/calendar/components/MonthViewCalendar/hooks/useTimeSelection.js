import { useCalendarStore } from "../../../../../store/index.ts";

export const useTimeSelection = () => {
  const { startTime, endTime } = useCalendarStore();

  return {
    startTime,
    endTime,
  };
};