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
      console.error("JWT 디코딩 실패:", error);
      return null;
    }
  };

  // 토큰에서 사용자명 추출 함수
  const extractUsernameFromToken = (token) => {
    if (!token || typeof token !== "string") {
      console.warn("유효하지 않은 토큰입니다.");
      return null;
    }

    const payload = decodeJWT(token);
    if (!payload) {
      console.warn("토큰 페이로드 디코딩에 실패했습니다.");
      return null;
    }

    const username =
      payload.username ||
      payload.name ||
      payload.email?.split("@")[0] ||
      payload.sub ||
      null;

    if (!username) {
      console.warn("토큰에서 사용자명을 찾을 수 없습니다. 페이로드:", payload);
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
        console.log("토큰이 없어 로그인 페이지로 리다이렉트");
        navigate(`/login?redirect=${encodeURIComponent(`/getAppointment?appointmentId=${appointmentId}`)}`);
        return;
      }

      try {
        console.log("=== GetAppointmentRedirect 시작 ===");
        console.log("appointmentId:", appointmentId);

        // 토큰 형식 정리 (이미 Bearer가 포함되어 있을 수 있음)
        let cleanToken = token;
        if (token.startsWith("Bearer")) {
          cleanToken = token.substring(6).trim(); // "Bearer" 제거
        }
        console.log("정리된 토큰 (앞 20자):", cleanToken.substring(0, 20) + "...");

        // 토큰에서 사용자명 추출
        const userName = extractUsernameFromToken(cleanToken);
        if (!userName) {
          console.warn("토큰에서 사용자명 추출 실패, 약속 정보로 토큰 유효성 확인");
        }

        console.log("추출된 사용자명:", userName);

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
          console.error("약속 정보 가져오기 실패:", response.status);
          if (response.status === 401 || response.status === 403) {
            console.log("인증 실패, 토큰 삭제 후 로그인 페이지로 리다이렉트");
            localStorage.removeItem("authToken");
            navigate(`/login?redirect=${encodeURIComponent(`/getAppointment?appointmentId=${appointmentId}`)}`);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const appointmentData = await response.json();
        console.log("약속 정보:", appointmentData);

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
              console.log("기존 스케줄 존재 여부:", hasExistingSchedule);
            } else {
              console.warn("사용자 스케줄 조회 실패:", userScheduleResponse.status);
            }
          } catch (error) {
            console.warn("사용자 스케줄 조회 중 오류:", error);
          }
        }

        // 개별 캘린더로 리다이렉트 (사용자명 또는 기본값 사용)
        const finalUserName = userName || "참여자";
        console.log(`${hasExistingSchedule ? '재로그인' : '첫 로그인'} 사용자 (${finalUserName}) - 개별 캘린더로 리다이렉트`);
        
        navigate("/individualCalendar", {
          state: { 
            appointmentId: appointmentId,
            userName: finalUserName,
            firstLogin: !hasExistingSchedule
          }
        });

      } catch (error) {
        console.error("=== GetAppointmentRedirect 오류 ===");
        console.error("Error:", error);
        console.log("홈으로 리다이렉션");
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
