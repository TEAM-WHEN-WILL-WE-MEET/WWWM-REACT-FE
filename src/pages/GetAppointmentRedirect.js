// GetAppointmentRedirect.js
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loading from "../components/Loading";
import { useAppointmentStore } from "../store/appointmentStore";
import { useCalendarStore } from "../store/calendarStore";
import { useUserStore } from "../store/userStore";

const GetAppointmentRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Store actions
  const setAppointment = useAppointmentStore((state) => state.setAppointment);
  const initializeFromSchedules = useCalendarStore(
    (state) => state.initializeFromSchedules
  );
  const { setUserInfo, setUserSchedule } = useUserStore();

  useEffect(() => {
    const fetchAppointment = async () => {
      const appointmentId = searchParams.get("appointmentId");
      if (!appointmentId) {
        navigate("/");
        return;
      }

      try {
        const BASE_URL =
          process.env.NODE_ENV === "production"
            ? process.env.REACT_APP_WWWM_BE_ENDPOINT
            : process.env.REACT_APP_WWWM_BE_DEV_EP;

        const response = await fetch(
          `${BASE_URL}/appointment/getAppointment?appointmentId=${appointmentId}`
        );
        const responseData = await response.json();

        if (!responseData || !responseData.object) {
          throw new Error("Invalid response data");
        }

        // Store 초기화
        setAppointment(responseData);
        initializeFromSchedules(
          responseData.object.schedules,
          responseData.object.startTime,
          responseData.object.endTime
        );
        setUserInfo(responseData.userName, responseData.firstLogin);
        setUserSchedule(responseData.userSchedule);

        // 페이지 이동
        navigate("/eventCalendar");
      } catch (error) {
        console.error("Error fetching appointment:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [
    searchParams,
    navigate,
    setAppointment,
    initializeFromSchedules,
    setUserInfo,
    setUserSchedule,
  ]);

  return loading ? <Loading /> : null;
};

export default GetAppointmentRedirect;
