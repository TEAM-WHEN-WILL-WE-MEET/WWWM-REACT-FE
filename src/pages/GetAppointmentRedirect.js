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
  const initializeFromResponse = useAppointmentStore(
    (state) => state.initializeFromResponse
  );
  const initializeFromSchedules = useCalendarStore(
    (state) => state.initializeFromSchedules
  );
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const setUserSchedule = useUserStore((state) => state.setUserSchedule);

  useEffect(() => {
    const fetchAppointment = async () => {
      const appointmentId = searchParams.get("appointmentId");
      if (!appointmentId) {
        navigate("/");
        return;
      }

      try {
        console.log("=== GetAppointmentRedirect 시작 ===");
        console.log("appointmentId:", appointmentId);

        const BASE_URL =
          process.env.NODE_ENV === "production"
            ? process.env.REACT_APP_WWWM_BE_ENDPOINT
            : process.env.REACT_APP_WWWM_BE_DEV_EP;

        console.log(
          "API 호출 URL:",
          `${BASE_URL}/appointment/getAppointment?appointmentId=${appointmentId}`
        );

        const response = await fetch(
          `${BASE_URL}/appointment/getAppointment?appointmentId=${appointmentId}`
        );
        const responseData = await response.json();

        console.log("API 응답 데이터:", responseData);
        console.log("responseData.object:", responseData.object);

        if (!responseData || !responseData.object) {
          console.error("Invalid response data structure");
          throw new Error("Invalid response data");
        }

        console.log("Store 함수들 확인:");
        console.log("initializeFromResponse:", typeof initializeFromResponse);
        console.log("initializeFromSchedules:", typeof initializeFromSchedules);
        console.log("setUserInfo:", typeof setUserInfo);
        console.log("setUserSchedule:", typeof setUserSchedule);

        // Store 초기화
        console.log("Store 초기화 시작...");

        console.log("1. initializeFromResponse 호출");
        initializeFromResponse(responseData);

        console.log("2. initializeFromSchedules 호출");
        console.log("schedules:", responseData.object.schedules);
        console.log("startTime:", responseData.object.startTime);
        console.log("endTime:", responseData.object.endTime);
        initializeFromSchedules(
          responseData.object.schedules,
          responseData.object.startTime,
          responseData.object.endTime
        );

        console.log("3. setUserInfo 호출");
        setUserInfo(
          responseData.userName || "Test User",
          responseData.firstLogin || true
        );

        console.log("4. setUserSchedule 호출");
        setUserSchedule(responseData.userSchedule || []);

        console.log("Store 초기화 완료, 페이지 이동 시작");
        // 페이지 이동
        navigate(`/invite?appointmentId=${appointmentId}`);
        console.log("페이지 이동 완료");
      } catch (error) {
        console.error("=== GetAppointmentRedirect 오류 ===");
        console.error("Error fetching appointment:", error);
        console.error("Error stack:", error.stack);
        console.error("Error message:", error.message);
        console.log("홈으로 리다이렉션 시작");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [
    searchParams,
    navigate,
    initializeFromResponse,
    initializeFromSchedules,
    setUserInfo,
    setUserSchedule,
  ]);

  return loading ? <Loading /> : null;
};

export default GetAppointmentRedirect;
