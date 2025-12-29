import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loading from "../../../../components/Loading";
import { useAppointmentStore } from "../../../../store/appointmentStore";
import { useCalendarStore } from "../../../../store/calendarStore";
import { useUserStore } from "../../../../store/userStore";

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

  // JWT 토큰 디코딩 함수
  const decodeJWT = (token) => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT token format");
      }

      const payload = parts[1];
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      );

      const decoded = JSON.parse(atob(padded));
      return decoded;
    } catch (error) {
      return null;
    }
  };

  // 토큰에서 사용자명 추출 함수
  const extractUsernameFromToken = (token) => {
    if (!token || typeof token !== "string") {
      return null;
    }

    const payload = decodeJWT(token);
    if (!payload) {
      return null;
    }

    const username =
      payload.username ||
      payload.name ||
      payload.email?.split("@")[0] ||
      payload.sub ||
      null;

    if (!username) {
      return null;
    }

    return username;
  };


  useEffect(() => {
    const handleAppointmentAccess = async () => {
      const appointmentId = searchParams.get("appointmentId");
      if (!appointmentId) {
        navigate("/");
        return;
      }

      // 이미 처리 중인 경우 중복 실행 방지
      if (loading === false) {
        return;
      }

      const BASE_URL =
        import.meta.env.PROD
          ? import.meta.env.VITE_WWWM_BE_ENDPOINT
          : import.meta.env.VITE_WWWM_BE_DEV_EP;

      // 토큰 체크 및 인증 처리
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate(`/login?redirect=${encodeURIComponent(`/getAppointment?appointmentId=${appointmentId}`)}`);
        return;
      }

      try {
        // 토큰 형식 정리 (이미 Bearer가 포함되어 있을 수 있음)
        let cleanToken = token;
        if (token.startsWith("Bearer")) {
          cleanToken = token.substring(6).trim(); // "Bearer" 제거
        }
        // 토큰에서 사용자명 추출
        const userName = extractUsernameFromToken(cleanToken);
        if (!userName) {
        }

        // 약속 정보 가져오기로 토큰 유효성 검증 (v2 API 사용)
        const response = await fetch(
          `${BASE_URL}/appointments/${appointmentId}`,
          {
            headers: {
              Authorization: `Bearer ${cleanToken}`,
              "Cache-Control": "no-cache",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("authToken");
            navigate(`/login?redirect=${encodeURIComponent(`/getAppointment?appointmentId=${appointmentId}`)}`);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const appointmentData = await response.json();

        // 사용자 개별 스케줄 가져오기 (사용자명이 있는 경우에만)
        let hasExistingSchedule = false;
        if (userName) {
          try {
            const userScheduleResponse = await fetch(
              `${BASE_URL}/schedule/getUserSchedule?appointmentId=${appointmentId}&userName=${userName}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${cleanToken}`,
                  "Cache-Control": "no-cache",
                },
              }
            );

            if (userScheduleResponse.ok) {
              const userScheduleData = await userScheduleResponse.json();
              hasExistingSchedule = userScheduleData.object && userScheduleData.object.length > 0;
            } else {
            }
          } catch (error) {
          }
        }

        // 개별 캘린더로 리다이렉트 (사용자명 또는 기본값 사용)
        const finalUserName = userName || "참여자";
        
        navigate("/individualCalendar", {
          state: { 
            appointmentId: appointmentId,
            userName: finalUserName,
            firstLogin: !hasExistingSchedule
          }
        });

      } catch (error) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    handleAppointmentAccess();
  }, [searchParams, navigate, initializeFromResponse, initializeFromSchedules, setUserInfo, setUserSchedule, extractUsernameFromToken, loading]);

  return loading ? <Loading /> : null;
};

export default GetAppointmentRedirect;
