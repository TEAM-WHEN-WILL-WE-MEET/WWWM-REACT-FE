export interface User {
  name: string;
  id?: string;
}

export interface TimeSlot {
  time: string;
  users: User[];
}

export interface Schedule {
  id: string;
  date: string;
  times: TimeSlot[];
}

export interface AppointmentResponse {
  object: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    users: User[];
    schedules: Schedule[];
  };
  firstLogin: boolean;
  userSchedule: Schedule[];
}

export interface DateInfo {
  date: string;
  key: number;
  id: string;
}

export type SelectedTimesMap = {
  [dateIndex: number]: {
    [timeIndex: number]: {
      [buttonIndex: number]: boolean;
    };
  };
};

export interface TimeSlotUpdate {
  timeIndex: number;
  buttonIndex: number;
  value: boolean;
}

export interface ScheduleUpdatePayload {
  id: string;
  date: string;
  times: TimeSlot[];
  appointmentId: string;
}
