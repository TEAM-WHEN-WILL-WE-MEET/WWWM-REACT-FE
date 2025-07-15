export interface User {
  name: string;
  id?: string;
  email?: string;
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

// 새로운 백엔드 v2 응답 구조 타입 정의
export interface CreateAppointmentResponse {
  status: "CREATED";
  msg: string;
  object: {
    id: string;
    createdAt: string;
    expireAt: string;
    name: string;
    startTime: string;
    endTime: string;
    timeZone: string;
    schedules: Schedule[];
    users: User[];
  };
  success: boolean;
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
