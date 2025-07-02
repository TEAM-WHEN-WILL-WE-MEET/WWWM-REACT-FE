// individualCalendar.js
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import "moment/locale/ko";
import "./individualCalendar.css";
import { typographyVariants } from "../styles/typography.ts";
import { colorVariants, colors } from "../styles/color.ts";
import { cn } from "../utils/cn";
import { Button } from "../components/Button.tsx";
import { Helmet } from "react-helmet-async";
import { useAppointmentStore } from "../store/appointmentStore";
import { useCalendarStore } from "../store/calendarStore";
import { useUserStore } from "../store/userStore";

// NODE_ENV에 기반하여 BASE_URL에 환경변수 할당
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_WWWM_BE_ENDPOINT
    : process.env.REACT_APP_WWWM_BE_DEV_EP;

const IndividualCalendar = () => {
  const [loading, setLoading] = useState(false);

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
    appointmentId,
    userName,
    dates,
    times,
    eventName,
    selectedDate,
    selectedTimes,
    setSelectedDate,
    setSelectedTimes,
    setEventName,
    setDates,
    setTimes,
    updateSchedule,
  } = useAppointmentStore();

  const navigate = useNavigate();
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
    setSelectedTimes(newSelectedTimes);
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
          updateTimeSlot(
            t,
            b,
            desiredValue,
            selectedTimes,
            setSelectedTimes,
            selectedDate,
            true
          );
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

        handleTimeClick(
          timeIndex,
          buttonIndex,
          selectedTimes,
          setSelectedTimes,
          selectedDate
        );
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
  }, [selectedTimes, setSelectedTimes, selectedDate, times, dates]);

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
          selectedTimes,
          setSelectedTimes,
          selectedDate,
          dates,
          times
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
          selectedTimes,
          setSelectedTimes,
          selectedDate
        );
        updatedSlotsRef.current.add(key);
      }
    }
  };
  useEffect(() => {
    //step1. appointment 전체의 스케줄 틀 불러옴
    if (responseData) {
      setEventName(responseData.object.name);
      moment.locale("ko");
      const schedules = responseData.object.schedules;
      if (!schedules) {
        console.error("schedules 비어있음");
        return;
      }

      // console.log("schedules 보호구역: ",schedules);
      console.log(
        "이거슨 individualCalendar 로드할때 appointment자체의 스케줄",
        schedules
      );
      // 날짜 및 시간 데이터 설정
      const datesArray = schedules.map((schedule, index) => {
        const dateString = schedule.date;

        const date = moment.tz(dateString, "Asia/Seoul").format("YYYY-MM-DD");

        return { date, key: index, id: schedule.id };
      });

      const startTimeString = responseData.object.startTime;
      const endTimeString = responseData.object.endTime;
      const startTimeH = moment.tz(startTimeString, "Asia/Seoul").format("HH");
      const endTimeHM = moment.tz(endTimeString, "Asia/Seoul").format("HH");

      const scheduleTimes = schedules[0]?.times;

      if (!scheduleTimes) {
        console.error("스케줄에 times가 없습니다.");
        return;
      }

      const timeSet = new Set();
      scheduleTimes.forEach((timeSlot) => {
        const timeString = timeSlot.time;
        // const timeHM = moment.utc(timeString).format('HH');
        const timeHM = moment.tz(timeString, "Asia/Seoul").format("HH");
        if (timeHM >= startTimeH && timeHM <= endTimeHM - 1) {
          //ex 09:00 ~ 20:00로 설정해놨다치면 19:00시간대까지만 사용자 화면에 보여야함
          timeSet.add(timeHM);
        }
      });

      const timesArray = Array.from(timeSet).sort((a, b) => {
        return moment(a, "HH").diff(moment(b, "HH"));
      });

      const timesFormatted = timesArray.map((timeHM) =>
        moment(timeHM, "HH").format("HH:mm")
      );

      setDates(datesArray);
      setTimes(timesFormatted);

      // console.log("첫로그인?: ",responseData.firstLogin);
      // console.log("responseData 원본?: ",responseData);

      //재로그인 case
      if (responseData.firstLogin === false) {
        // console.log("사용자가 이전 로그인에서 저장했었던 times?: ", responseData.userSchedule[0].times);

        // const userSelections = responseData.userSchedule[0].times.reduce((acc, slot) => {
        //개인용 스케줄 페이지
        const userSelections = responseData.userSchedule.reduce(
          (acc, daySchedule) => {
            daySchedule.times.forEach((slot) => {
              const slotDate = moment
                .tz(slot.time, "Asia/Seoul")
                .format("YYYY-MM-DD");
              const slotHour = moment.tz(slot.time, "Asia/Seoul").format("HH");
              const slotMinute = moment
                .tz(slot.time, "Asia/Seoul")
                .format("mm");
              if (!acc[slotDate]) acc[slotDate] = {};
              if (!acc[slotDate][slotHour]) acc[slotDate][slotHour] = [];

              acc[slotDate][slotHour].push(parseInt(slotMinute));
            });
            return acc;
          },
          {}
        );

        console.log("정리된 사용자 선택입니다~:", userSelections);
        const savedTimes = {};

        datesArray.forEach((dateInfo, dateIndex) => {
          const datePath = dateInfo.date;
          //   console.log("처리중인 날짜:", {
          //     datePath,
          //     existingSelections: userSelections[datePath]
          // });
          if (userSelections[datePath]) {
            if (!savedTimes[dateIndex]) savedTimes[dateIndex] = {};

            timesFormatted.forEach((time, timeIndex) => {
              const hour = moment(time, "HH:mm").format("HH"); // 시간만 추출해서 비교

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
        // console.log("최종적으로 이전 로그인에서 저장했던 savedTimes:", savedTimes);
        setSelectedTimes(savedTimes);
        const allTimesSelected = timesFormatted.every((_, timeIndex) => {
          return [...Array(6)].every((_, buttonIndex) => {
            return savedTimes[0]?.[timeIndex]?.[buttonIndex] === true;
          });
        });

        // 모든 시간대가 선택되어 있다면 체크박스 시각적으로 체크
        setIsVisuallyChecked(allTimesSelected);
      }
    }
  }, [responseData]);

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

  // 저장 버튼 클릭 시: 누적된 상태를 기반으로 서버 업데이트 후 페이지 이동
  const handleSaveClick = async () => {
    if (!appointmentId) {
      navigate("/");
      return;
    }

    const selectedDateInfo = dates[selectedDate];
    const timesArray = bulkTimesArray;
    const formattedDate =
      timesArray.length > 0
        ? timesArray[0].time
        : moment(selectedDateInfo.date, "YYYY-M-D").format(
            "YYYY-MM-DDT00:00:00.SSS"
          );

    const payload = {
      id: selectedDateInfo.id,
      date: formattedDate,
      times: timesArray,
      appointmentId: appointmentId,
    };

    try {
      await updateSchedule(payload);
      navigate(`/getAppointment?appointmentId=${appointmentId}`);
    } catch (error) {
      console.error("저장 요청 중 오류:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  //모든 시간 가능 버튼
  const handleAllTimeChange = async (e) => {
    const isChecked = e.target.checked; // 체크박스 체크 여부
    console.log("체크박스 상태 변경:", isChecked);

    const newSelectedTimes = { ...selectedTimes };
    if (!newSelectedTimes[selectedDate]) {
      newSelectedTimes[selectedDate] = {};
    }

    // 이전 상태를 깊은 복사로 저장
    // const prevState = JSON.parse(JSON.stringify(selectedTimes[selectedDate] || {}));
    // console.log("이전 상태:", prevState);
    // console.log("업데이트 전 현재 상태:", selectedTimes[selectedDate]);
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
    setSelectedTimes(newSelectedTimes);

    // 전체 시간대에 대한 payload 구성
    const timesPayload = [];
    times.forEach((time, timeIndex) => {
      for (let buttonIndex = 0; buttonIndex < 6; buttonIndex++) {
        const hour = time.split(":")[0];
        const minute = buttonIndex * 10;
        const dateTime = `${dates[selectedDate].date}T${hour}:${String(
          minute
        ).padStart(2, "0")}:00`;
        const kstMoment = moment.tz(dateTime, "Asia/Seoul");
        const sendTimeString = kstMoment.format("YYYY-MM-DDTHH:mm:ss.SSS");

        timesPayload.push({
          time: sendTimeString,
          users: [userName],
        });
      }
    });

    const selectedDateInfo = dates[selectedDate];
    const payload = {
      id: selectedDateInfo.id,
      date:
        timesPayload.length > 0
          ? timesPayload[0].time
          : moment(selectedDateInfo.date, "YYYY-M-D").format(
              "YYYY-MM-DDT00:00:00.SSS"
            ),
      times: timesPayload,
      appointmentId: appointmentId,
    };
    console.log("전체시간 가능 버튼 클릭시, payload", payload);
    // 모든 시간대에 대해 API 요청 (저장 버튼과 무관하게 바로 호출)
    try {
      await updateSchedule(payload);
    } catch (error) {
      console.error("전체 시간 API 요청 중 오류:", error);
    }
    // console.log("업데이트할 새로운 상태:", newSelectedTimes[selectedDate]);

    // // 변경된 시간 슬롯만을 bulkTimesArray에 모으기
    // for (let timeIndex = 0; timeIndex < times.length; timeIndex++) {
    //   if (!prevState[timeIndex]) {
    //     prevState[timeIndex] = {};
    //   }
    //   for (let buttonIndex = 0; buttonIndex < 6; buttonIndex++) {
    //     const prevSelected = prevState[timeIndex][buttonIndex] || false;
    //     const newSelected = newSelectedTimes[selectedDate][timeIndex][buttonIndex];

    //     // 상태가 변경된 경우에만 처리
    //     if (prevSelected !== newSelected) {
    //       // isChecked가 true이면 기존에 선택되지 않았던 시간( false -> true )만,
    //       // isChecked가 false이면 기존에 선택되어 있던 시간( true -> false )만 처리
    //       // (두 경우 모두 prevSelected !== newSelected 조건에 부합합니다.)
    //       const hour = times[timeIndex].split(':')[0];
    //       const minute = buttonIndex * 10;
    //       const dateTime = `${dates[selectedDate].date}T${hour}:${String(minute).padStart(2, '0')}:00`;
    //       const kstMoment = moment.tz(dateTime, "Asia/Seoul");
    //       const sendTimeString = kstMoment.format("YYYY-MM-DDTHH:mm:ss.SSS");

    //       const newItem = {
    //         time: sendTimeString,
    //         users: [userName],
    //       };

    //       setBulkTimesArray((prev) => [...prev, newItem]);

    //     }
    //   }
    // }
    if (isChecked) {
      // 모든 timeblock에 대해 bulkTimesArray 생성
      const newBulkTimes = [];
      times.forEach((time, timeIndex) => {
        for (let buttonIndex = 0; buttonIndex < 6; buttonIndex++) {
          const hour = times[timeIndex].split(":")[0];
          const minute = buttonIndex * 10;
          const dateTime = `${dates[selectedDate].date}T${hour}:${String(
            minute
          ).padStart(2, "0")}:00`;
          const kstMoment = moment.tz(dateTime, "Asia/Seoul");
          const sendTimeString = kstMoment.format("YYYY-MM-DDTHH:mm:ss.SSS");
          newBulkTimes.push({
            time: sendTimeString,
            users: [userName],
          });
        }
      });
      setBulkTimesArray(newBulkTimes);
    } else {
      // 선택 해제인 경우 해당 날짜의 모든 timeblock 제거
      setBulkTimesArray((prev) =>
        prev.filter((item) => !item.time.startsWith(dates[selectedDate].date))
      );
    }

    // console.log("모든 시간 가능 체크 후 bulkTimesArray:", bulkTimesArray);
    // 여기서 bulkTimesArray를 이용해 추후 handleSaveClick 등에서 서버에 일괄 업데이트 요청을 보내도록 처리리
  };

  const handleTimeClick = async (timeIndex, buttonIndex) => {
    const isSelected = selectedTimes[selectedDate]?.[timeIndex]?.[buttonIndex];
    updateTimeSlot(timeIndex, buttonIndex, !isSelected);

    const hour = times[timeIndex].split(":")[0];
    const minute = buttonIndex * 10;
    const dateTime = `${dates[selectedDate].date}T${hour}:${String(
      minute
    ).padStart(2, "0")}:00`;
    const kstMoment = moment.tz(dateTime, "Asia/Seoul");
    const sendTimeString = kstMoment.format("YYYY-MM-DDTHH:mm:ss.SSS");

    setBulkTimesArray((prev) => {
      if (!isSelected) {
        if (!prev.find((item) => item.time === sendTimeString)) {
          return [...prev, { time: sendTimeString, users: [userName] }];
        }
        return prev;
      } else {
        return prev.filter((item) => item.time !== sendTimeString);
      }
    });
  };

  // timeslot의 상태를 강제로 newValue(선택/해제)로 업데이트하는 함수 (드래그 전용)
  const updateTimeSlot = async (
    timeIndex,
    buttonIndex,
    newValue,
    selectedTimes,
    setSelectedTimes,
    selectedDate,
    forceUpdate = false
  ) => {
    // 이미 원하는 상태이면 업데이트하지 않음
    const currentValue =
      selectedTimes[selectedDate]?.[timeIndex]?.[buttonIndex];
    if (!forceUpdate && currentValue === newValue) return;

    const newSelectedTimes = { ...selectedTimes };
    if (!newSelectedTimes[selectedDate]) {
      newSelectedTimes[selectedDate] = {};
    }
    newSelectedTimes[selectedDate][timeIndex] = {
      ...newSelectedTimes[selectedDate][timeIndex],
      [buttonIndex]: newValue,
    };
    setSelectedTimes(newSelectedTimes);
    // 변경된 시간 슬롯을 bulkTimesArray에 저장
    const hour = times[timeIndex].split(":")[0];
    const minute = buttonIndex * 10;
    const dateTime = `${dates[selectedDate].date}T${hour}:${String(
      minute
    ).padStart(2, "0")}:00`;
    const kstMoment = moment.tz(dateTime, "Asia/Seoul");
    const sendTimeString = kstMoment.format("YYYY-MM-DDTHH:mm:ss.SSS");

    const newItem = {
      time: sendTimeString,
      users: [userName],
    };

    setBulkTimesArray((prev) => [...prev, newItem]);
  };

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
            alt="재로그인하러 돌아가기"
            src="backward.svg"
            onClick={() => navigate(-1)}
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
          {dates.map(({ date, key }) => (
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
          {times.map((time, timeIndex) => (
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
