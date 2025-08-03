import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import "moment/locale/ko";
import "./styles.css";
import { typographyVariants } from "../../../../styles/typography.ts";
import { colorVariants, colors } from "../../../../styles/color.ts";
import { cn } from "../../../../utils/cn";
import { Button } from "../../../../components/Button.tsx";
import { Helmet } from "react-helmet-async";
import { useAppointmentStore } from "../../../../store/appointmentStore";
import { useCalendarStore } from "../../../../store/calendarStore";
import { useUserStore } from "../../../../store/userStore";
import Loading from "../../../../components/Loading";
import { fetchApi } from "../../../../utils/api";
import { API_ENDPOINTS } from "../../../../config/environment";

// NODE_ENV에 기반하여 BASE_URL에 환경변수 할당
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_WWWM_BE_ENDPOINT
    : process.env.REACT_APP_WWWM_BE_DEV_EP;

const IndividualCalendar = () => {
  const [loading, setLoading] = useState(false);
  const [userAppointments, setUserAppointments] = useState([]);
  const [selectedAppointmentIndex, setSelectedAppointmentIndex] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [localDates, setLocalDates] = useState([]);
  const [localTimes, setLocalTimes] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const dragStartRef = useRef(null);
  const isDraggingRef = useRef(false);
  const updatedSlotsRef = useRef(new Set());
  const initialCellRef = useRef(null);
  const draggedSlotsRef = useRef(new Set());
  const dragSelectModeRef = useRef(null);
  const hasDraggedRef = useRef(false);

  const touchStartTimeRef = useRef(null);
  const lastTouchedCellRef = useRef(null);
  const currentTouchRef = useRef(null);

  const processedCellsRef = useRef(new Set());
  const scheduledUpdateRef = useRef(null);
  const isTouchDeviceRef = useRef(false);
  const dragStartPointRef = useRef(null);
  const dragModeRef = useRef(null);

  const {
    responseData,
    appointmentId: storeAppointmentId,
    userName: storeUserName,
    eventName,
    dates,
    times,
    selectedDate,
    selectedTimes,
    setSelectedDate,
    updateScheduleV2,
    resetStore,
  } = useAppointmentStore();

  // location.state에서 appointmentId와 userName을 가져옵니다
  const appointmentId = location.state?.appointmentId || storeAppointmentId;
  const userName = location.state?.userName || storeUserName;

  const [isChecked, setIsChecked] = useState(false);
  const [isVisuallyChecked, setIsVisuallyChecked] = useState(false);
  const minuteSlot = [10, 20, 30, 40, 50];

  //서버에 보낼 times 배열 (화면 UI에 display할 selected와는 별개)
  const [bulkTimesArray, setBulkTimesArray] = useState([]);

  // 모바일 터치 드래그 관련 ref 추가
  const mobileDragStartRef = useRef(null);
  const mobileDragEndRef = useRef(null);
  // 드래그 시작 시 기존 선택 상태(해당 날짜에 한함)를 백업
  const backupSelectedDayRef = useRef(null);

  // 모바일 터치 시작: 시작 셀의 인덱스를 기록
  const handleTouchStart = (timeIndex, buttonIndex, e) => {
    const touch = e.touches[0];

    // 시작 셀이 이미 선택되어 있으면 이번 드래그는 unselect, 아니면 select
    const startingCellSelected = !!(
      selectedTimes[selectedDate] &&
      selectedTimes[selectedDate][timeIndex] &&
      selectedTimes[selectedDate][timeIndex][buttonIndex]
    );
    const desiredValue = !startingCellSelected; // toggle: 이미 선택되어 있다면 false, 아니면 true
    mobileDragStartRef.current = {
      timeIndex,
      buttonIndex,
      desiredValue,
      startX: touch.clientX,
      startY: touch.clientY,
    };
    // mobileDragStartRef.current = { timeIndex, buttonIndex, desiredValue  };
    mobileDragEndRef.current = { timeIndex, buttonIndex, desiredValue };
    backupSelectedDayRef.current = selectedTimes[selectedDate]
      ? JSON.parse(JSON.stringify(selectedTimes[selectedDate]))
      : {};
  };

  // 모바일 터치 이동: document.elementFromPoint 를 이용해 현재 터치된 셀을 확인하고, 미리보기용으로 직사각형 범위를 state에 반영
  const handleTouchMove = (e) => {
    e.preventDefault(); // 스크롤 방지 등 기본 동작 막기
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    const timeIndexAttr = element.getAttribute("data-time-index");
    const buttonIndexAttr = element.getAttribute("data-button-index");
    if (timeIndexAttr === null || buttonIndexAttr === null) return;

    const newTimeIndex = parseInt(timeIndexAttr, 10);
    const newButtonIndex = parseInt(buttonIndexAttr, 10);
    const currentDrag = mobileDragEndRef.current;

    // 이미 같은 셀이면 업데이트하지 않음
    if (
      currentDrag &&
      currentDrag.timeIndex === newTimeIndex &&
      currentDrag.buttonIndex === newButtonIndex
    )
      return;

    mobileDragEndRef.current = {
      timeIndex: newTimeIndex,
      buttonIndex: newButtonIndex,
      desiredValue: mobileDragStartRef.current.desiredValue,
    };

    // 시작 셀과 현재 셀를 기준으로 직사각형 영역 계산
    const start = mobileDragStartRef.current;
    if (!start) return;
    const minTime = Math.min(start.timeIndex, newTimeIndex);
    const maxTime = Math.max(start.timeIndex, newTimeIndex);
    const minButton = Math.min(start.buttonIndex, newButtonIndex);
    const maxButton = Math.max(start.buttonIndex, newButtonIndex);

    // 백업된 기존 선택 상태 위에 드래그 영역을 덧씌움
    const backup = backupSelectedDayRef.current || {};
    // 백업은 직접 수정하지 않기 위해 deep copy
    const newSelectedForDay = JSON.parse(JSON.stringify(backup));
    for (let t = minTime; t <= maxTime; t++) {
      if (!newSelectedForDay[t]) {
        newSelectedForDay[t] = {};
      }
      for (let b = minButton; b <= maxButton; b++) {
        newSelectedForDay[t][b] = start.desiredValue;
      }
    }
    // 기존의 다른 날짜나 기존 state의 다른 부분은 그대로 유지
    const newSelectedTimes = {
      ...selectedTimes,
      [selectedDate]: newSelectedForDay,
    };
    useAppointmentStore.getState().setSelectedTimes(newSelectedTimes);
  };

  // 모바일 터치 종료: 미리보기 영역을 최종 선택으로 확정하고, 각 셀에 대해 서버 업데이트 호출
  const handleTouchEnd = (e) => {
    // if (!mobileDragStartRef.current || !mobileDragEndRef.current) return;
    if (!mobileDragStartRef.current) return;
    const touch = e.changedTouches[0];

    const start = mobileDragStartRef.current;
    const dx = touch.clientX - start.startX;
    const dy = touch.clientY - start.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // console.log("이거슨 distance", distance);
    const CLICK_THRESHOLD = 5;
    // const end = mobileDragEndRef.current;
    if (distance < CLICK_THRESHOLD) {
      // 단일 클릭으로 간주 , 기존 단일 클릭 로직 호출
      handleTimeClick(start.timeIndex, start.buttonIndex);
    } else {
      // 드래그로 간주주 , 미리보기 영역 확정 및 서버 업데이트
      const end = mobileDragEndRef.current;
      const minTime = Math.min(start.timeIndex, end.timeIndex);
      const maxTime = Math.max(start.timeIndex, end.timeIndex);
      const minButton = Math.min(start.buttonIndex, end.buttonIndex);
      const maxButton = Math.max(start.buttonIndex, end.buttonIndex);
      const desiredValue = start.desiredValue;

      for (let t = minTime; t <= maxTime; t++) {
        for (let b = minButton; b <= maxButton; b++) {
          updateTimeSlot(t, b, desiredValue, true, true);
        }
      }
    }
    // refs 초기화
    mobileDragStartRef.current = null;
    mobileDragEndRef.current = null;
    backupSelectedDayRef.current = null;
  };

  //timeslot drag 관련
  useEffect(() => {
    const handleWindowMouseUp = () => {
      isDraggingRef.current = false;
      draggedSlotsRef.current.clear();
      dragSelectModeRef.current = null;
      hasDraggedRef.current = false;
    };
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, []);

  // window의 mouseup 이벤트를 통해 드래그 종료 및 단일 클릭 처리
  useEffect(() => {
    // const handleWindowMouseUp = () => {
    const handleGlobalEnd = (event) => {
      if (initialCellRef.current && !isDraggingRef.current) {
        // 드래그가 감지되지 않았으면 단일 클릭으로 처리
        const { timeIndex, buttonIndex } = initialCellRef.current;
        handleTimeClick(timeIndex, buttonIndex);
      }

      // 드래그 상태 초기화
      dragStartRef.current = null;
      isDraggingRef.current = false;
      updatedSlotsRef.current.clear();
      initialCellRef.current = null;

      lastTouchedCellRef.current = null;
      draggedSlotsRef.current.clear();
      dragSelectModeRef.current = null;
      hasDraggedRef.current = false;
      currentTouchRef.current = null;
    };
    //PC 이벤트
    window.addEventListener("mouseup", handleGlobalEnd);
    // 모바일 이벤트
    window.addEventListener("touchend", handleGlobalEnd);
    window.addEventListener("touchcancel", handleGlobalEnd);

    return () => {
      window.removeEventListener("mouseup", handleGlobalEnd);
      window.removeEventListener("touchend", handleGlobalEnd);
      window.removeEventListener("touchcancel", handleGlobalEnd);
    };
  }, [selectedTimes, selectedDate, times, dates]);

  const findCellFromPoint = (x, y) => {
    // document.elementFromPoint를 사용하여 현재 터치/마우스 포인트 아래의 요소 찾기
    const element = document.elementFromPoint(x, y);
    if (!element) return null;

    // 타임슬롯 버튼 찾기
    const button = element.closest("[data-time-index]");
    if (!button) return null;

    const timeIndex = parseInt(button.getAttribute("data-time-index"));
    const buttonIndex = parseInt(button.getAttribute("data-button-index"));

    return { timeIndex, buttonIndex };
  };

  // 버튼의 mousedown: 단일 클릭/드래그 판단을 위한 초기 좌표와 셀 정보를 기록 (즉, 실제 업데이트는 여기서 진행하지 않음)
  const handleButtonMouseDown = (timeIndex, buttonIndex, event) => {
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    isDraggingRef.current = false;
    updatedSlotsRef.current.clear();
    initialCellRef.current = {
      timeIndex,
      buttonIndex,
      intendedValue: !selectedTimes[selectedDate]?.[timeIndex]?.[buttonIndex],
    };
  };

  // 버튼의 mouseenter: 마우스 이동 거리를 체크해 드래그 여부를 판단하고, 드래그가 시작되면 해당 셀을 업데이트
  const handleButtonMouseEnter = (timeIndex, buttonIndex, event) => {
    if (!dragStartRef.current) return;
    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const remThreshold =
      0.5 * parseFloat(getComputedStyle(document.documentElement).fontSize); // ==0.5rem

    // 이동 거리가 5px을 초과하면 드래그로 판단
    if (!isDraggingRef.current && distance > remThreshold) {
      isDraggingRef.current = true;
      // 드래그가 시작되면, 최초 눌렸던 셀(초기 셀)을 업데이트
      const keyInitial = `${initialCellRef.current.timeIndex}-${initialCellRef.current.buttonIndex}`;
      if (!updatedSlotsRef.current.has(keyInitial)) {
        updateTimeSlot(
          initialCellRef.current.timeIndex,
          initialCellRef.current.buttonIndex,
          initialCellRef.current.intendedValue,
          false,
          true
        );
        updatedSlotsRef.current.add(keyInitial);
      }
    }
    if (isDraggingRef.current) {
      const key = `${timeIndex}-${buttonIndex}`;
      if (!updatedSlotsRef.current.has(key)) {
        updateTimeSlot(
          timeIndex,
          buttonIndex,
          initialCellRef.current.intendedValue,
          false,
          true
        );
        updatedSlotsRef.current.add(key);
      }
    }
  };

  const { fetchMyInfo, name: currentUserName, userId } = useUserStore();

  // 현재 사용자 이름 가져오기 헬퍼 함수
  const getCurrentUserName = () => {
    return currentUserName || userName || "Unknown User";
  };

  // Store 데이터 확인 및 초기화
  useEffect(() => {
    const initializeData = async () => {
      console.log("Store 상태 확인:", {
        appointmentId,
        eventName,
        dates: dates?.length,
        times: times?.length,
        userName,
        currentUserName,
        responseData: !!responseData,
      });

      // appointmentId가 있으면 기존 로직 실행
      if (appointmentId) {
        // 데이터가 있으면 초기 설정 진행
        if (responseData && dates?.length > 0 && times?.length > 0) {
          initializeUserSchedule();
        } else {
          // 데이터가 없으면 API를 호출해서 데이터 로드
          await loadAppointmentData(appointmentId);
        }
        return;
      }

      // appointmentId가 없으면 사용자 캘린더 목록 가져오기
      try {
        setLoading(true);

        // Store 초기화 (이전 사용자 데이터 제거)
        resetStore();

        // 로컬 state도 초기화
        setUserAppointments([]);
        setSelectedAppointmentIndex(0);
        setLocalDates([]);
        setLocalTimes([]);
        setIsVisuallyChecked(false);
        setIsChecked(false);
        setBulkTimesArray([]);

        // 사용자 정보 가져오기
        await fetchMyInfo();
        const currentUser = useUserStore.getState();

        // 사용자 캘린더 목록 가져오기
        const response = await fetchApi(API_ENDPOINTS.GET_USER_APPOINTMENTS, {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (response.success && response.object && response.object.length > 0) {
          setUserAppointments(response.object);

          // 첫 번째 캘린더로 초기화
          const firstAppointment = response.object[0];

          await loadAppointmentData(firstAppointment.id);
        } else {
          navigate("/");
        }
      } catch (error) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [appointmentId, responseData, dates, times, navigate, fetchMyInfo]);

  // dates와 times 변경 감지 및 로컬 state 동기화
  useEffect(() => {
    // 로컬 state 동기화
    if (dates && dates.length > 0) {
      setLocalDates(dates);
    }
    if (times && times.length > 0) {
      setLocalTimes(times);
    }
  }, [dates, times]);

  // 특정 캘린더 데이터 로드
  const loadAppointmentData = async (appointmentId) => {
    try {
      const responseData = await fetchApi(
        API_ENDPOINTS.GET_APPOINTMENT(appointmentId)
      );

      if (responseData && responseData.object) {
        // appointmentStore에 데이터 설정
        const { initializeFromResponse, setUserName } =
          useAppointmentStore.getState();
        initializeFromResponse(responseData);

        // 사용자 이름 설정
        setUserName(getCurrentUserName());

        // 사용자 스케줄 초기화 (responseData를 직접 전달)
        initializeUserScheduleWithData(responseData);

        // 로컬 state 강제 업데이트
        const finalStore = useAppointmentStore.getState();
        if (finalStore.dates && finalStore.dates.length > 0) {
          setLocalDates(finalStore.dates);
        }
        if (finalStore.times && finalStore.times.length > 0) {
          setLocalTimes(finalStore.times);
        }

        // 강제 렌더링 트리거
        setForceUpdate((prev) => prev + 1);
      }
    } catch (error) {
      // 에러 처리
    }
  };

  // 캘린더 선택 변경 핸들러
  const handleAppointmentChange = async (index) => {
    setSelectedAppointmentIndex(index);
    const selectedAppointment = userAppointments[index];
    if (selectedAppointment) {
      setLoading(true);

      // 기존 선택 상태 초기화
      const { setSelectedTimes } = useAppointmentStore.getState();
      setSelectedTimes({});
      setIsVisuallyChecked(false);
      setIsChecked(false);

      await loadAppointmentData(selectedAppointment.id);
      setLoading(false);
      // 강제 렌더링 트리거
      setForceUpdate((prev) => prev + 1);
    }
  };

  // JWT 토큰에서 사용자 ID 추출하는 함수
  const extractUserIdFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    try {
      // Bearer 토큰에서 실제 토큰 부분만 추출
      const tokenPart = token.startsWith("Bearer ") ? token.slice(7) : token;

      // JWT는 header.payload.signature 형태
      const parts = tokenPart.split(".");
      if (parts.length !== 3) return null;

      // payload 부분 디코딩
      const payload = parts[1];
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      );

      const decoded = JSON.parse(atob(padded));

      // 다양한 필드에서 사용자 ID 찾기
      return (
        decoded.sub || decoded.userId || decoded.id || decoded.user_id || null
      );
    } catch (error) {
      console.error("JWT 토큰 디코딩 실패:", error);
      return null;
    }
  };

  // responseData를 직접 받아서 사용자 스케줄 초기화
  const initializeUserScheduleWithData = (responseData) => {
    if (!responseData) return;

    moment.locale("ko");
    const schedules = responseData.object.schedules;
    if (!schedules) {
      return;
    }

    // 현재 로그인한 사용자 정보 가져오기
    const currentUser = useUserStore.getState();
    const currentUserName = getCurrentUserName();
    const currentUserId = currentUser.userId || extractUserIdFromToken();

    console.log("=== 사용자 정보 디버깅 ===");
    console.log("currentUser:", currentUser);
    console.log("currentUserName:", currentUserName);
    console.log("currentUserId (store):", currentUser.userId);
    console.log("currentUserId (token):", extractUserIdFromToken());
    console.log("currentUserId (final):", currentUserId);

    // schedules에서 현재 사용자가 선택한 timeslot 찾기
    const userSelectedTimes = {};
    const { dates: storeDates, times: storeTimes } =
      useAppointmentStore.getState();

    // 각 날짜별로 처리
    schedules.forEach((schedule, scheduleIndex) => {
      const scheduleDate = moment
        .tz(schedule.date, "Asia/Seoul")
        .format("YYYY-MM-DD");

      if (schedule.times && schedule.times.length > 0) {
        // 해당 날짜의 모든 시간 슬롯 확인
        schedule.times.forEach((timeSlot, timeSlotIndex) => {
          const timeString = timeSlot.time;
          const users = timeSlot.users || [];

          // 현재 사용자가 이 시간대에 참여했는지 확인
          // console.log("=== 시간슬롯 확인 ===");
          // console.log("timeString:", timeString);
          // console.log("users:", users);
          // console.log(
          //   "users 타입:",
          //   users.map((u) => typeof u)
          // );

          const isUserParticipated = users.some((user) => {
            // console.log(
            //   "비교 중 - user:",
            //   user,
            //   "currentUserId:",
            //   currentUserId,
            //   "currentUserName:",
            //   currentUserName
            // );
            // 사용자 ID로 비교하거나 이름으로 비교
            if (typeof user === "string") {
              const match = user === currentUserId || user === currentUserName;
              // console.log("문자열 비교 결과:", match);
              return match;
            } else if (user && typeof user === "object") {
              const match =
                user.id === currentUserId || user.name === currentUserName;
              // console.log("객체 비교 결과:", match);
              return match;
            }
            return false;
          });

          // console.log("isUserParticipated:", isUserParticipated);

          if (isUserParticipated) {
            // 시간을 파싱해서 시간과 분 추출
            const timeMoment = moment.tz(timeString, "Asia/Seoul");
            const hour = timeMoment.format("HH");
            const minute = timeMoment.format("mm");

            // storeTimes에서 해당 시간의 인덱스 찾기
            const timeIndex = storeTimes.findIndex((storeTime) => {
              const storeHour = moment(storeTime, "HH:mm").format("HH");
              return storeHour === hour;
            });

            if (timeIndex !== -1) {
              // 분을 버튼 인덱스로 변환 (10분 단위)
              const buttonIndex = Math.floor(parseInt(minute) / 10);

              // userSelectedTimes 객체에 추가
              if (!userSelectedTimes[scheduleIndex]) {
                userSelectedTimes[scheduleIndex] = {};
              }
              if (!userSelectedTimes[scheduleIndex][timeIndex]) {
                userSelectedTimes[scheduleIndex][timeIndex] = {};
              }
              userSelectedTimes[scheduleIndex][timeIndex][buttonIndex] = true;
            }
          }
        });
      }
    });

    // selectedTimes state 업데이트
    const { setSelectedTimes } = useAppointmentStore.getState();
    if (typeof setSelectedTimes === "function") {
      setSelectedTimes(userSelectedTimes);

      // 현재 선택된 날짜의 모든 시간이 선택되었는지 확인
      const currentSelectedDate = useAppointmentStore.getState().selectedDate;
      const allTimesSelected = storeTimes.every((_, timeIndex) => {
        return [...Array(6)].every((_, buttonIndex) => {
          return (
            userSelectedTimes[currentSelectedDate]?.[timeIndex]?.[
              buttonIndex
            ] === true
          );
        });
      });

      setIsVisuallyChecked(allTimesSelected);
      setIsChecked(allTimesSelected);

      // 강제 리렌더링을 위한 업데이트
      setForceUpdate((prev) => prev + 1);
    }
  };

  const initializeUserSchedule = () => {
    if (!responseData) return;

    moment.locale("ko");
    const schedules = responseData.object.schedules;
    if (!schedules) {
      return;
    }

    // 재로그인 case
    if (responseData.firstLogin === false) {
      const userSelections = responseData.userSchedule.reduce(
        (acc, daySchedule) => {
          daySchedule.times.forEach((slot) => {
            const slotDate = moment
              .tz(slot.time, "Asia/Seoul")
              .format("YYYY-MM-DD");
            const slotHour = moment.tz(slot.time, "Asia/Seoul").format("HH");
            const slotMinute = moment.tz(slot.time, "Asia/Seoul").format("mm");
            if (!acc[slotDate]) acc[slotDate] = {};
            if (!acc[slotDate][slotHour]) acc[slotDate][slotHour] = [];

            acc[slotDate][slotHour].push(parseInt(slotMinute));
          });
          return acc;
        },
        {}
      );

      const savedTimes = {};

      const { dates: storeDates, times: storeTimes } =
        useAppointmentStore.getState();
      storeDates.forEach((dateInfo, dateIndex) => {
        const datePath = dateInfo.date;
        if (userSelections[datePath]) {
          if (!savedTimes[dateIndex]) savedTimes[dateIndex] = {};

          storeTimes.forEach((time, timeIndex) => {
            const hour = moment(time, "HH:mm").format("HH");
            const minutes = userSelections[datePath][hour];
            if (minutes) {
              savedTimes[dateIndex][timeIndex] = {};
              minutes.forEach((minute) => {
                const buttonIndex = minute / 10;
                savedTimes[dateIndex][timeIndex][buttonIndex] = true;
              });
            }
          });
        }
      });

      const { setSelectedTimes } = useAppointmentStore.getState();
      if (typeof setSelectedTimes === "function") {
        setSelectedTimes(savedTimes);
      }

      const allTimesSelected = storeTimes.every((_, timeIndex) => {
        return [...Array(6)].every((_, buttonIndex) => {
          return savedTimes[0]?.[timeIndex]?.[buttonIndex] === true;
        });
      });

      setIsVisuallyChecked(allTimesSelected);

      // 강제 리렌더링을 위한 업데이트
      setForceUpdate((prev) => prev + 1);
    }
  };

  // selectedTimes 변경 감지 (ft. selectedTimes)
  useEffect(() => {
    if (!selectedTimes || !selectedDate || !times) return;

    const allTimesSelected = times.every((_, timeIndex) => {
      return [...Array(6)].every((_, buttonIndex) => {
        return selectedTimes[selectedDate]?.[timeIndex]?.[buttonIndex] === true;
      });
    });

    setIsVisuallyChecked(allTimesSelected);
    setIsChecked(allTimesSelected);
  }, [selectedTimes, selectedDate, times]);

  // 저장 버튼 클릭 시: v2 로직으로 켜야 할 것과 꺼야 할 것을 분리해서 API 요청
  const handleSaveClick = async () => {
    // 현재 appointmentId 가져오기 (기존 방식 또는 새로운 사용자 캘린더 모드)
    const currentAppointmentId =
      appointmentId ||
      (userAppointments.length > 0
        ? userAppointments[selectedAppointmentIndex].id
        : null);

    if (!currentAppointmentId) {
      navigate("/");
      return;
    }

    // 현재 선택된 모든 timeslot들을 수집
    const store = useAppointmentStore.getState();
    const currentSelectedTimes = store.selectedTimes;
    const currentSelectedDate = store.selectedDate;
    const currentTimes = store.times;
    const currentDates = store.dates;
    const currentUserName = store.userName;
    const currentSchedules = store.schedules;

    const selectedDateInfo = dates[selectedDate];
    if (!selectedDateInfo) {
      return;
    }

    try {
      setLoading(true);

      // 1. 서버에서 받아온 기존 선택된 timeslot들 분석
      const originalSelectedTimes = new Set();
      const currentUserId = useUserStore.getState().userId || extractUserIdFromToken();
      
      if (currentSchedules && currentSchedules[currentSelectedDate]) {
        const schedule = currentSchedules[currentSelectedDate];
        if (schedule.times) {
          schedule.times.forEach((timeSlot) => {
            const users = timeSlot.users || [];
            const isUserParticipated = users.some((user) => {
              if (typeof user === "string") {
                return user === currentUserId || user === currentUserName;
              } else if (user && typeof user === "object") {
                return user.id === currentUserId || user.name === currentUserName;
              }
              return false;
            });

            if (isUserParticipated) {
              const timeString = timeSlot.time;
              const kstMoment = moment.tz(timeString, "Asia/Seoul");
              const formattedTime = kstMoment.format("YYYY-MM-DDTHH:mm:ss");
              originalSelectedTimes.add(formattedTime);
            }
          });
        }
      }

      // 2. 현재 UI에서 선택된 timeslot들 수집
      const currentUISelectedTimes = new Set();
      if (currentSelectedTimes[currentSelectedDate]) {
        Object.keys(currentSelectedTimes[currentSelectedDate]).forEach(
          (timeIndexStr) => {
            const timeIndex = parseInt(timeIndexStr);
            const timeSlots =
              currentSelectedTimes[currentSelectedDate][timeIndex];

            Object.keys(timeSlots).forEach((buttonIndexStr) => {
              const buttonIndex = parseInt(buttonIndexStr);
              const isSelected = timeSlots[buttonIndex];

              if (isSelected) {
                const hour = currentTimes[timeIndex].split(":")[0];
                const minute = buttonIndex * 10;
                const dateTime = `${
                  currentDates[currentSelectedDate].date
                }T${hour}:${String(minute).padStart(2, "0")}:00`;
                const kstMoment = moment.tz(dateTime, "Asia/Seoul");
                const sendTimeString = kstMoment.format("YYYY-MM-DDTHH:mm:ss");

                currentUISelectedTimes.add(sendTimeString);
              }
            });
          }
        );
      }

      // 3. 켜야 할 것들과 꺼야 할 것들 구분
      const timesToEnable = []; // 원래 선택되지 않았지만 현재 선택된 것들
      const timesToDisable = []; // 원래 선택되었지만 현재 선택 해제된 것들

      // 현재 선택된 것 중에서 원래 선택되지 않았던 것들 → 켜야 할 것들
      currentUISelectedTimes.forEach((time) => {
        if (!originalSelectedTimes.has(time)) {
          timesToEnable.push(time);
        }
      });

      // 원래 선택된 것 중에서 현재 선택되지 않은 것들 → 꺼야 할 것들
      originalSelectedTimes.forEach((time) => {
        if (!currentUISelectedTimes.has(time)) {
          timesToDisable.push(time);
        }
      });

      console.log("Original selected times:", Array.from(originalSelectedTimes));
      console.log("Current UI selected times:", Array.from(currentUISelectedTimes));
      console.log("Times to enable:", timesToEnable);
      console.log("Times to disable:", timesToDisable);

      // 4. 수정된 v2 API 호출 (두 개의 분리된 요청)
      if (timesToEnable.length > 0 || timesToDisable.length > 0) {
        await updateScheduleV2(
          selectedDateInfo.id,
          timesToEnable,
          timesToDisable,
          currentAppointmentId
        );
      }

      // bulkTimesArray 초기화
      setBulkTimesArray([]);

      navigate(`/eventCalendar?appointmentId=${currentAppointmentId}`);
    } catch (error) {
      console.error("Save error:", error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  //모든 시간 가능 버튼
  const handleAllTimeChange = async (e) => {
    const isChecked = e.target.checked; // 체크박스 체크 여부

    const newSelectedTimes = { ...selectedTimes };
    if (!newSelectedTimes[selectedDate]) {
      newSelectedTimes[selectedDate] = {};
    }

    setIsChecked(isChecked);
    setIsVisuallyChecked(isChecked);
    times.forEach((_, timeIndex) => {
      if (!newSelectedTimes[selectedDate][timeIndex]) {
        newSelectedTimes[selectedDate][timeIndex] = {};
      }
      [...Array(6)].forEach((_, buttonIndex) => {
        newSelectedTimes[selectedDate][timeIndex][buttonIndex] = isChecked;
      });
    });
    useAppointmentStore.getState().setSelectedTimes(newSelectedTimes);

    // 전체 시간대에 대한 times 배열 구성
    const timesArray = [];
    times.forEach((time, timeIndex) => {
      for (let buttonIndex = 0; buttonIndex < 6; buttonIndex++) {
        const hour = time.split(":")[0];
        const minute = buttonIndex * 10;
        const dateTime = `${dates[selectedDate].date}T${hour}:${String(
          minute
        ).padStart(2, "0")}:00`;
        const kstMoment = moment.tz(dateTime, "Asia/Seoul");
        const sendTimeString = kstMoment.format("YYYY-MM-DDTHH:mm:ss");

        timesArray.push(sendTimeString);
      }
    });

    const selectedDateInfo = dates[selectedDate];
    if (!selectedDateInfo) {
      return;
    }

    // 전체 시간 선택/해제에 따른 bulkTimesArray 설정
    if (isChecked) {
      // Store에서 현재 상태 가져오기
      const store = useAppointmentStore.getState();
      const currentTimes = store.times;
      const currentDates = store.dates;
      const currentSelectedDate = store.selectedDate;
      const currentUserName = store.userName;

      // 모든 timeblock에 대해 bulkTimesArray 생성
      const newBulkTimes = [];
      currentTimes.forEach((time, timeIndex) => {
        for (let buttonIndex = 0; buttonIndex < 6; buttonIndex++) {
          const hour = currentTimes[timeIndex].split(":")[0];
          const minute = buttonIndex * 10;
          const dateTime = `${
            currentDates[currentSelectedDate].date
          }T${hour}:${String(minute).padStart(2, "0")}:00`;
          const kstMoment = moment.tz(dateTime, "Asia/Seoul");
          const sendTimeString = kstMoment.format("YYYY-MM-DDTHH:mm:ss");
          newBulkTimes.push({
            time: sendTimeString,
            users: [currentUserName],
          });
        }
      });
      setBulkTimesArray(newBulkTimes);
    } else {
      // 선택 해제인 경우 해당 날짜의 모든 timeblock 제거
      const store = useAppointmentStore.getState();
      const currentDates = store.dates;
      const currentSelectedDate = store.selectedDate;

      setBulkTimesArray((prev) =>
        prev.filter(
          (item) =>
            !item.time.startsWith(currentDates[currentSelectedDate].date)
        )
      );
    }
  };

  const handleTimeClick = async (timeIndex, buttonIndex) => {
    // Store에서 현재 상태 가져오기
    const store = useAppointmentStore.getState();
    const currentSelectedTimes = store.selectedTimes;
    const currentSelectedDate = store.selectedDate;
    const currentTimes = store.times;
    const currentDates = store.dates;
    const currentUserName = store.userName;

    const isSelected =
      currentSelectedTimes[currentSelectedDate]?.[timeIndex]?.[buttonIndex];

    // UI 상태 업데이트 (토글)
    updateTimeSlot(timeIndex, buttonIndex, !isSelected, false, false);

    // 클릭된 timeslot을 bulkTimesArray에 추가 (이미 선택된 것도 포함)
    const hour = currentTimes[timeIndex].split(":")[0];
    const minute = buttonIndex * 10;
    const dateTime = `${
      currentDates[currentSelectedDate].date
    }T${hour}:${String(minute).padStart(2, "0")}:00`;
    const kstMoment = moment.tz(dateTime, "Asia/Seoul");
    const sendTimeString = kstMoment.format("YYYY-MM-DDTHH:mm:ss");

    // 항상 bulkTimesArray에 추가 (서버에서 토글 처리)
    setBulkTimesArray((prev) => [
      ...prev,
      { time: sendTimeString, users: [currentUserName] },
    ]);
  };

  // timeslot의 상태를 강제로 newValue(선택/해제)로 업데이트하는 함수 (드래그 전용)
  const updateTimeSlot = async (
    timeIndex,
    buttonIndex,
    newValue,
    forceUpdate = false,
    addToBulk = true
  ) => {
    // Store에서 현재 상태 가져오기
    const store = useAppointmentStore.getState();
    const currentSelectedTimes = store.selectedTimes;
    const currentSelectedDate = store.selectedDate;

    // 이미 원하는 상태이면 업데이트하지 않음
    const currentValue =
      currentSelectedTimes[currentSelectedDate]?.[timeIndex]?.[buttonIndex];
    if (!forceUpdate && currentValue === newValue) return;

    const newSelectedTimes = { ...currentSelectedTimes };
    if (!newSelectedTimes[currentSelectedDate]) {
      newSelectedTimes[currentSelectedDate] = {};
    }
    newSelectedTimes[currentSelectedDate][timeIndex] = {
      ...newSelectedTimes[currentSelectedDate][timeIndex],
      [buttonIndex]: newValue,
    };
    store.setSelectedTimes(newSelectedTimes);

    // bulkTimesArray에 추가 (드래그 완료시에만)
    if (addToBulk) {
      const currentTimes = store.times;
      const currentDates = store.dates;
      const hour = currentTimes[timeIndex].split(":")[0];
      const minute = buttonIndex * 10;
      const dateTime = `${
        currentDates[currentSelectedDate].date
      }T${hour}:${String(minute).padStart(2, "0")}:00`;
      const kstMoment = moment.tz(dateTime, "Asia/Seoul");
      const sendTimeString = kstMoment.format("YYYY-MM-DDTHH:mm:ss");

      setBulkTimesArray((prev) => [
        ...prev,
        { time: sendTimeString, users: [store.userName] },
      ]);
    }
  };

  if (loading) {
    return <Loading />;
  }

  // 데이터가 없으면 로딩 상태 표시
  if (!appointmentId && userAppointments.length === 0) {
    return <Loading />;
  }

  // appointmentId가 없고 사용자 캘린더는 있는 경우
  if (!appointmentId && userAppointments.length > 0) {
    return (
      <>
        <Helmet>
          <title>언제볼까? - 내 캘린더</title>
          <meta
            name="description"
            content="언제볼까? 서비스와 함께, 실시간으로 모두의 가능한 시간을 한눈에 확인해보세요"
          />
        </Helmet>
        <div
          className={`h-auto flex flex-col ${colorVariants({ bg: "gray-50" })}`}
        >
          <div
            className={`flex ${colorVariants({
              bg: "white",
            })} w-[36rem] pr-[2rem] mt-[2rem] h-[4.8rem] flex-row items-center gap-[0.8rem]`}
          >
            <img
              className="bg-none cursor-pointer pl-px-[1rem] pt-px-[0.8rem] transition-colors duration-200 ease-in active:scale-95"
              alt="이전 페이지로 돌아가기"
              src="backward.svg"
              onClick={() =>
                navigate(
                  `/getAppointment?appointmentId=${userAppointments[selectedAppointmentIndex]?.id}`
                )
              }
            />
            <div
              className={`
                ${typographyVariants({ variant: "h1-sb" })} 
                overflow-hidden 
                text-center 
                truncate
              `}
            >
              내 캘린더
            </div>
          </div>

          {/* 캘린더 선택 드롭다운 */}
          <div
            className={`flex flex-col px-[2rem] pt-[2rem] ${colorVariants({
              bg: "white",
            })}`}
          >
            <div
              className={`${typographyVariants({
                variant: "b1-sb",
              })} mb-[1rem]`}
            >
              참여중인 캘린더
            </div>
            <select
              value={selectedAppointmentIndex}
              onChange={(e) =>
                handleAppointmentChange(parseInt(e.target.value))
              }
              className={`w-full p-[1rem] border border-gray-300 rounded-md ${typographyVariants(
                { variant: "b1-rg" }
              )}`}
            >
              {userAppointments.map((appointment, index) => (
                <option key={appointment.id} value={index}>
                  {appointment.name}
                </option>
              ))}
            </select>
          </div>

          {/* 기존 캘린더 UI가 여기에 렌더링됩니다 */}
          {localDates?.length > 0 && localTimes?.length > 0 && (
            <>
              <div
                className={`
                  flex 
                  !justify-start
                  !overflow-x-auto 
                  px-0 
                  py-[1rem] 
                  pb-0
                  whitespace-nowrap 
                  scrollbar-hide 
                  ![&::-webkit-scrollbar]:hidden
                  hover:cursor-pointer
                  ${colorVariants({ bg: "white" })}
                  !min-h-[4rem]
                  border-b-[0.1rem] 
                  border-[var(--gray-500,#A8A8A8)]  
                  z-0  
                `}
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                aria-label="날짜 탭"
              >
                {localDates?.map(({ date, key }) => (
                  <div
                    key={key}
                    className={`
                       ${typographyVariants({ variant: "b1-sb" })} 
                       ${
                         selectedDate === key
                           ? `
                         !${colorVariants({ color: "gray-900" })} 
                         font-[600] 
                         border-b-[0.2rem] 
                         border-[var(--gray-900,#242424)]
                         -mb-0.3
                         z-20
                       `
                           : ``
                       }
                       tracking-[-0.35px]
                       p-[0.9rem]
                       w-[7.4rem]
                       text-center
                       flex-shrink-0
                       flex-grow-0
                       basis-[25%] 
                     `}
                    onClick={() => setSelectedDate(key)}
                  >
                    {moment(date, "YYYY-MM-DD").format("M/D(ddd)")}
                  </div>
                ))}
              </div>

              {/* 나머지 기존 UI */}
              <div
                className={`flex pt-[2rem] mb-[3.6rem] flex-col items-center ${colorVariants(
                  { bg: "gray-50" }
                )}`}
              >
                <div
                  className={`w-[27rem] ml-[4rem] flex items-center justify-end`}
                >
                  <div
                    className={`
                    ${typographyVariants({ variant: "d3-rg" })} 
                    ${colorVariants({ color: "gray-700" })}
                    flex items-center 
                    !text-[1.2rem]
                    gap-[1.8rem]
                    pb-[0.4rem]
                    w-[23.7rem]
                  `}
                  >
                    {minuteSlot.map((num, index) => (
                      <div
                        key={index}
                        className="flex !w-[2.8rem] p-auto !justify-center !items-center"
                      >
                        {num}
                      </div>
                    ))}
                    <div className="ml-[0.2rem] w-[1.1rem]">분</div>
                  </div>
                </div>
                {localTimes?.map((time, timeIndex) => (
                  <div key={timeIndex} className="flex items-center">
                    <div
                      className={`
                       ${typographyVariants({ variant: "d3-rg" })}
                       text-[var(--gray-800,#444)]
                       h-[2.8rem] 
                       w-[3.6rem] 
                       text-center 
                       mr-[0.6rem] 
                       flex 
                       items-center 
                       justify-center 
                       whitespace-nowrap
                     `}
                    >
                      {moment(time, "HH:mm").format("HH시")}
                    </div>
                    <div className="grid grid-cols-6 gap-0 !h-[2.8rem]">
                      {[...Array(6)].map((_, buttonIndex) => (
                        <Button
                          key={buttonIndex}
                          size={"XXS"}
                          data-time-index={timeIndex}
                          data-button-index={buttonIndex}
                          additionalClass={` 
                            ${
                              selectedTimes[selectedDate]?.[timeIndex]?.[
                                buttonIndex
                              ]
                                ? "!border-[var(--blue-200)] bg-[var(--blue-50)]"
                                : ""
                            } 
                            items-center !transform-none
                          `}
                          onMouseDown={(e) =>
                            handleButtonMouseDown(timeIndex, buttonIndex, e)
                          }
                          onMouseEnter={(e) =>
                            handleButtonMouseEnter(timeIndex, buttonIndex, e)
                          }
                          onTouchStart={(e) =>
                            handleTouchStart(timeIndex, buttonIndex, e)
                          }
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          style={{ touchAction: "none" }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center mb-[1.4rem]">
                <input
                  type="checkbox"
                  id="all-time"
                  className="screen-reader"
                  checked={isVisuallyChecked || isChecked}
                  onChange={(e) => {
                    setIsChecked(e.target.checked);
                    setIsVisuallyChecked(e.target.checked);
                    handleAllTimeChange(e);
                  }}
                />
              </div>
              <div className="flex !justify-center">
                <Button
                  label="내 참여시간 저장"
                  size={"L"}
                  onClick={handleSaveClick}
                  additionalClass="items-center !transform-none mb-[1.2rem]"
                />
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  // 기존 appointmentId가 있는 경우의 렌더링
  if (!dates || dates.length === 0) {
    return <Loading />;
  }

  return (
    <>
      <Helmet>
        <title>{eventName ? `언제볼까? - ${eventName} ` : "언제볼까?"}</title>
        <meta
          name="description"
          content="언제볼까? 서비스와 함께, 실시간으로 모두의 가능한 시간을 한눈에 확인해보세요"
        />
      </Helmet>
      <div
        className={`h-auto flex flex-col ${colorVariants({ bg: "gray-50" })}`}
      >
        <div
          className={`flex ${colorVariants({
            bg: "white",
          })} w-[36rem] pr-[2rem] mt-[2rem] h-[4.8rem] flex-row items-center gap-[0.8rem]`}
        >
          <img
            className="bg-none cursor-pointer pl-px-[1rem] pt-px-[0.8rem] transition-colors duration-200 ease-in active:scale-95"
            alt="이전 페이지로 돌아가기"
            src="backward.svg"
            onClick={() =>
              navigate(`/getAppointment?appointmentId=${appointmentId}`)
            }
          />
          <div
            className={`
            ${typographyVariants({ variant: "h1-sb" })} 
            overflow-hidden 
            text-center 
            truncate
          `}
          >
            {eventName}
          </div>
        </div>
        <div
          className={`
            flex 
            !justify-start
            !overflow-x-auto 
            px-0 
            py-[1rem] 
            pb-0
            whitespace-nowrap 
            scrollbar-hide 
            ![&::-webkit-scrollbar]:hidden
            hover:cursor-pointer
            ${colorVariants({ bg: "white" })}
            !min-h-[4rem]
            border-b-[0.1rem] 
            border-[var(--gray-500,#A8A8A8)]  
            z-0  
          `}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          aria-label="날짜 탭"
        >
          {dates?.map(({ date, key }) => (
            <div
              key={key}
              className={`
                ${typographyVariants({ variant: "b1-sb" })} 
                ${
                  selectedDate === key
                    ? `
                  !${colorVariants({ color: "gray-900" })} 
                  font-[600] 
                  border-b-[0.2rem] 
                  border-[var(--gray-900,#242424)]
                  -mb-0.3
                  z-20
                `
                    : ``
                }
                tracking-[-0.35px]
                p-[0.9rem]
                w-[7.4rem]
                text-center
                flex-shrink-0
                flex-grow-0
                basis-[25%] 
              `}
              onClick={() => setSelectedDate(key)}
            >
              {moment(date, "YYYY-MM-DD").format("M/D(ddd)")}
            </div>
          ))}
        </div>
        <div
          className={`flex pt-[2rem] mb-[3.6rem] flex-col items-center ${colorVariants(
            { bg: "gray-50" }
          )}`}
        >
          <div className={`w-[27rem] ml-[4rem] flex items-center justify-end`}>
            <div
              className={`
              ${typographyVariants({ variant: "d3-rg" })} 
              ${colorVariants({ color: "gray-700" })}
              flex items-center 
              !text-[1.2rem]
              gap-[1.8rem]
              pb-[0.4rem]
              w-[23.7rem]
            `}
            >
              {minuteSlot.map((num, index) => (
                <div
                  key={index}
                  className="flex !w-[2.8rem] p-auto !justify-center !items-center"
                >
                  {num}
                </div>
              ))}
              <div className="ml-[0.2rem] w-[1.1rem]">분</div>
            </div>
          </div>
          {times?.map((time, timeIndex) => (
            <div key={timeIndex} className="flex items-center">
              <div
                className={`
                ${typographyVariants({ variant: "d3-rg" })}
                text-[var(--gray-800,#444)]
                h-[2.8rem] 
                w-[3.6rem] 
                text-center 
                mr-[0.6rem] 
                flex 
                items-center 
                justify-center 
                whitespace-nowrap
              `}
              >
                {moment(time, "HH:mm").format("HH시")}
              </div>
              <div className="grid grid-cols-6 gap-0 !h-[2.8rem]">
                {[...Array(6)].map((_, buttonIndex) => (
                  <Button
                    key={buttonIndex}
                    size={"XXS"}
                    data-time-index={timeIndex}
                    data-button-index={buttonIndex}
                    additionalClass={` 
                      ${
                        selectedTimes[selectedDate]?.[timeIndex]?.[buttonIndex]
                          ? "!border-[var(--blue-200)] bg-[var(--blue-50)]"
                          : ""
                      } 
                      items-center !transform-none
                    `}
                    onMouseDown={(e) =>
                      handleButtonMouseDown(timeIndex, buttonIndex, e)
                    }
                    onMouseEnter={(e) =>
                      handleButtonMouseEnter(timeIndex, buttonIndex, e)
                    }
                    onTouchStart={(e) =>
                      handleTouchStart(timeIndex, buttonIndex, e)
                    }
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ touchAction: "none" }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center mb-[1.4rem]">
          <input
            type="checkbox"
            id="all-time"
            className="screen-reader"
            checked={isVisuallyChecked || isChecked}
            onChange={(e) => {
              setIsChecked(e.target.checked);
              setIsVisuallyChecked(e.target.checked);
              handleAllTimeChange(e);
            }}
          />
        </div>
        <div className="flex !justify-center">
          <Button
            label="내 참여시간 저장"
            size={"L"}
            onClick={handleSaveClick}
            additionalClass="items-center !transform-none mb-[1.2rem]"
          />
        </div>
      </div>
    </>
  );
};

export default IndividualCalendar;
