// individualCalendar.js
import React, { useState, useRef, useEffect,  useCallback  } from "react";
import { useLocation, useNavigate  } from 'react-router-dom';
// import moment from 'moment';
import moment from 'moment-timezone';

import 'moment/locale/ko';
import './individualCalendar.css';

import { typographyVariants } from '../styles/typography.ts';
import { colorVariants, colors } from '../styles/color.ts';
import { cn } from '../utils/cn'; 
import { Button } from '../components/Button.tsx';

// NODE_ENV에 기반하여 BASE_URL에 환경변수 할당
const BASE_URL = process.env.NODE_ENV === "production" 
    ? process.env.REACT_APP_WWWM_BE_ENDPOINT 
    : process.env.REACT_APP_WWWM_BE_DEV_EP;

const IndividualCalendar = () => {

  const dragStartRef = useRef(null); // 초기 마우스 좌표
  const isDraggingRef = useRef(false); // 드래그 여부 플래그
  const updatedSlotsRef = useRef(new Set()); // 업데이트한 셀 기록
  const initialCellRef = useRef(null); // { timeIndex, buttonIndex, intendedValue } : 처음 눌린 셀
  const draggedSlotsRef = useRef(new Set());
  const dragSelectModeRef = useRef(null);
  const hasDraggedRef = useRef(false); // 단순 클릭과 드래그 구분

  const touchStartTimeRef = useRef(null);
  const lastTouchedCellRef = useRef(null);
  const currentTouchRef = useRef(null);

  const processedCellsRef = useRef(new Set());
  const scheduledUpdateRef = useRef(null);
  const isTouchDeviceRef = useRef(false);
  const dragStartPointRef = useRef(null);
  const dragModeRef = useRef(null);
  const location = useLocation();
  const { responseData, appointmentId, userName } = location.state;
  
    // const { responseData, appointmentId, userSchedule } = location.state;

  // console.log("받은 전체 responseData 구조:", responseData);
  // console.log("responseData.object 구조:", responseData.object);
  //  console.log("user 스케줄정보: ", responseData.userSchedule);
  // console.log("user이름:",userName );


  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);
  const [eventName, setEventName] = useState("");
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTimes, setSelectedTimes] = useState({});
  const navigate = useNavigate(); 
  const [isChecked, setIsChecked] = useState(false);
  const [isVisuallyChecked, setIsVisuallyChecked] = useState(false);


// 연속된 업데이트 처리를 위한 디바운스 함수
const debouncedUpdate = useCallback((timeIndex, buttonIndex, newValue) => {
  if (scheduledUpdateRef.current) {
    clearTimeout(scheduledUpdateRef.current);
  }

  scheduledUpdateRef.current = setTimeout(() => {
    updateTimeSlot(
      timeIndex,
      buttonIndex,
      newValue,
      selectedTimes,
      setSelectedTimes,
      selectedDate,
      dates,
      times,
      userName,
      appointmentId,
      BASE_URL
    );
  }, 16); // 약 1프레임 (60fps) 딜레이
}, [selectedTimes, setSelectedTimes, selectedDate, dates, times]);
 // 드래그 상태 초기화
 const resetDragState = useCallback(() => {
  isDraggingRef.current = false;
  dragStartPointRef.current = null;
  dragModeRef.current = null;
  processedCellsRef.current.clear();
  if (scheduledUpdateRef.current) {
    clearTimeout(scheduledUpdateRef.current);
    scheduledUpdateRef.current = null;
  }
}, []);

  //timeslot drag 관련
  useEffect(() => {
    const handleWindowMouseUp = () => {
      isDraggingRef.current = false;
      draggedSlotsRef.current.clear();
      dragSelectModeRef.current = null;
      hasDraggedRef.current = false;
    };
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, []);
    // 드래그 시작 시 해당 timeslot의 현재 상태를 반전한 값을 기준으로 드래그 모드를 설정
    const handleMouseDown = (timeIndex, buttonIndex) => {
      isDraggingRef.current = true;
      hasDraggedRef.current = false; // 클릭과 드래그를 구분하기 위한 플래그 초기화
      // 현재 timeslot의 상태를 확인한 후, 반전값을 drag 모드 값으로 지정
      const currentValue = selectedTimes[selectedDate]?.[timeIndex]?.[buttonIndex];
      const newValue = !currentValue;
      dragSelectModeRef.current = newValue;
      // 해당 timeslot을 드래그 내에서 업데이트했음을 기록
      draggedSlotsRef.current.add(`${timeIndex}-${buttonIndex}`);
      updateTimeSlot(timeIndex, buttonIndex, newValue, selectedTimes, setSelectedTimes, selectedDate);
    };
  
    // 드래그 중 다른 timeslot에 진입 시, 아직 업데이트하지 않은 경우 dragSelectMode의 값으로 업데이트
    const handleMouseEnter = (timeIndex, buttonIndex) => {
      if (isDraggingRef.current) {
        hasDraggedRef.current = true;
        const key = `${timeIndex}-${buttonIndex}`;
        if (!draggedSlotsRef.current.has(key)) {
          draggedSlotsRef.current.add(key);
          updateTimeSlot(timeIndex, buttonIndex, dragSelectModeRef.current, selectedTimes, setSelectedTimes, selectedDate);
        }
      }
    };
  
    // 마우스 버튼을 떼면 드래그 상태 초기화
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      draggedSlotsRef.current.clear();
      dragSelectModeRef.current = null;
      hasDraggedRef.current = false;
    };


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
          selectedDate,
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
    window.addEventListener('mouseup', handleGlobalEnd);
     // 모바일 이벤트
     window.addEventListener('touchend', handleGlobalEnd);
     window.addEventListener('touchcancel', handleGlobalEnd);

    return () => {
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchend', handleGlobalEnd, );
      window.removeEventListener('touchcancel', handleGlobalEnd);
    };
  }, [selectedTimes, setSelectedTimes, selectedDate]);

  const findCellFromPoint = (x, y) => {
    // document.elementFromPoint를 사용하여 현재 터치/마우스 포인트 아래의 요소 찾기
    const element = document.elementFromPoint(x, y);
    if (!element) return null;

    // 타임슬롯 버튼 찾기
    const button = element.closest('[data-time-index]');
    if (!button) return null;

    const timeIndex = parseInt(button.getAttribute('data-time-index'));
    const buttonIndex = parseInt(button.getAttribute('data-button-index'));

    return { timeIndex, buttonIndex };
  };
  const handleDragStart = (timeIndex, buttonIndex) => {
    const currentValue = selectedTimes[selectedDate]?.[timeIndex]?.[buttonIndex];
    dragSelectModeRef.current = !currentValue; // 현재 값의 반대값으로 설정
    
    // 초기 셀 정보 저장
    initialCellRef.current = {
      timeIndex,
      buttonIndex,
      intendedValue: !currentValue
    };

    // 첫 번째 셀 업데이트
    updateTimeSlot(
      timeIndex,
      buttonIndex,
      dragSelectModeRef.current,
      selectedTimes,
      setSelectedTimes,
      selectedDate
    );
    updatedSlotsRef.current.add(`${timeIndex}-${buttonIndex}`);
  };

  const handleDragMove = (timeIndex, buttonIndex) => {
    if (!initialCellRef.current) return;
    
    const key = `${timeIndex}-${buttonIndex}`;
    if (!updatedSlotsRef.current.has(key)) {
      updateTimeSlot(
        timeIndex,
        buttonIndex,
        dragSelectModeRef.current,
        selectedTimes,
        setSelectedTimes,
        selectedDate
      );
      updatedSlotsRef.current.add(key);
      hasDraggedRef.current = true;
    }
  };
  const findTimeSlotFromPoint = (x, y) => {
    const element = document.elementFromPoint(x, y);
    if (!element) return null;

    const timeSlot = element.closest('[data-timeslot]');
    if (!timeSlot) return null;

    return {
      timeIndex: parseInt(timeSlot.getAttribute('data-time-index')),
      buttonIndex: parseInt(timeSlot.getAttribute('data-button-index'))
    };
  };
    // 모바일 이벤트 핸들러
    const handleTouchStart = (timeIndex, buttonIndex, event) => {
      event.preventDefault();
      const touch = event.touches[0];
      currentTouchRef.current = { x: touch.clientX, y: touch.clientY };
      handleDragStart(timeIndex, buttonIndex);
    };
  
    const handleTouchMove = (event) => {
      event.preventDefault();
      if (!isDraggingRef.current) return;
  
      const touch = event.touches[0];
      const timeSlot = findTimeSlotFromPoint(touch.clientX, touch.clientY);
      
      if (timeSlot) {
        handleDragMove(timeSlot.timeIndex, timeSlot.buttonIndex);
      }
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
    const remThreshold = 0.5 * parseFloat(getComputedStyle(document.documentElement).fontSize); // ==0.5rem

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
          times,
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
          selectedDate,
        );
        updatedSlotsRef.current.add(key);
      }
    }
  };
  useEffect(() => {
    //step1. appointment 전체의 스케줄 틀 불러옴
    if (responseData) {
      setEventName(responseData.object.name);
      moment.locale('ko');
      const schedules = responseData.object.schedules;
      if(!schedules){
        console.error('schedules 비어있음');
        return;
      }
  
      // console.log("schedules 보호구역: ",schedules);
      // console.log("이거슨 appointment자체의 스케줄", schedules);
      // 날짜 및 시간 데이터 설정
      const datesArray = schedules.map((schedule, index) => {
        const dateString = schedule.date;
   
        const date = moment
                    .tz(dateString, 'Asia/Seoul')
                    .format('YYYY-MM-DD');


        
        return { date, key: index, id: schedule.id };
      });

      const startTimeString = responseData.object.startTime;
      const endTimeString = responseData.object.endTime;
      const startTimeH = moment.tz(startTimeString, "Asia/Seoul").format('HH');
      const endTimeHM   = moment.tz(endTimeString, "Asia/Seoul").format('HH');

      const scheduleTimes = schedules[0]?.times;

      if (!scheduleTimes) {
        console.error('스케줄에 times가 없습니다.');
        return;
      }

      const timeSet = new Set();
      scheduleTimes.forEach(timeSlot => {
        const timeString = timeSlot.time;
        // const timeHM = moment.utc(timeString).format('HH');
        const timeHM = moment
                      .tz(timeString, "Asia/Seoul")
                      .format('HH');
        if (timeHM >= startTimeH && timeHM <= endTimeHM-1) { //ex 09:00 ~ 20:00로 설정해놨다치면 19:00시간대까지만 사용자 화면에 보여야함
          timeSet.add(timeHM);
        }
      });

      const timesArray = Array.from(timeSet).sort((a, b) => {
        return moment(a, 'HH').diff(moment(b, 'HH'));
      });

      const timesFormatted = timesArray.map(timeHM => moment(timeHM, 'HH').format('HH:mm'));

      setDates(datesArray);
      // console.log("datesArray: ", datesArray);
      setTimes(timesFormatted);
      // console.log("timesFormatted????: ", timesFormatted);


      // console.log("첫로그인?: ",responseData.firstLogin);
      // console.log("responseData 원본?: ",responseData);

      //재로그인 case
      if (responseData.firstLogin === false) {
        // console.log("사용자가 이전 로그인에서 저장했었던 times?: ", responseData.userSchedule[0].times);

        // const userSelections = responseData.userSchedule[0].times.reduce((acc, slot) => {
         //개인용 스케줄 페이지 
          const userSelections = responseData.userSchedule.reduce((acc, daySchedule) => {
            daySchedule.times.forEach((slot) => {
            const slotDate = moment.tz(slot.time, "Asia/Seoul").format('YYYY-MM-DD');
            const slotHour = moment.tz(slot.time, "Asia/Seoul").format('HH');
            const slotMinute = moment.tz(slot.time, "Asia/Seoul").format('mm');
          if (!acc[slotDate]) acc[slotDate] = {};
          if (!acc[slotDate][slotHour]) acc[slotDate][slotHour] = [];
          
          acc[slotDate][slotHour].push(parseInt(slotMinute));
            });
          return acc;
      }, {});
      
      // console.log("정리된 사용자 선택입니다~:", userSelections);
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
                const hour = moment(time, 'HH:mm').format('HH'); // 시간만 추출해서 비교


                  const minutes = userSelections[datePath][hour];
                  if (minutes) {
                      savedTimes[dateIndex][timeIndex] = {};
                      minutes.forEach(minute => {
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
  
  // 저장 버튼 클릭 시 이동하는 함수
  const handleSaveClick = () => {
    // 필요한 로직 처리 후 페이지 이동
    navigate('/eventCalendar', {state: {id: appointmentId , userName:userName }} );
  };


  const handleAllTimeChange = async (e) => {
    const isChecked = e.target.checked; //체크박스 check 여부
    console.log("체크박스 상태 변경:", isChecked);
    // console.log("selectedDate:", selectedDate);
    
    const newSelectedTimes = { ...selectedTimes };

    if (!newSelectedTimes[selectedDate]) {
      newSelectedTimes[selectedDate] = {};
    }

     // 이전 상태를 깊은 복사로 저장
  const prevState = JSON.parse(JSON.stringify(selectedTimes[selectedDate] || {}));
  console.log("이전 상태:", prevState);
    console.log("업데이트 전 현재 상태:", selectedTimes[selectedDate]);


    
    times.forEach((_, timeIndex) => {
      if (!newSelectedTimes[selectedDate][timeIndex]) {
        newSelectedTimes[selectedDate][timeIndex] = {};
      }
      [...Array(6)].forEach((_, buttonIndex) => {

        newSelectedTimes[selectedDate][timeIndex][buttonIndex] = isChecked;

      });
      });


    console.log("업데이트할 새로운 상태:", newSelectedTimes[selectedDate]);
    setSelectedTimes(newSelectedTimes);

    // 상태 변경 전 비교
  times.forEach((_, timeIndex) => {
    // prevState의 해당 timeIndex가 없으면 빈 객체로 초기화
    if (!prevState[timeIndex]) {
      prevState[timeIndex] = {};
    }

    [...Array(6)].forEach((_, buttonIndex) => {
      const prevSelected = prevState[timeIndex]?.[buttonIndex] || false;
      const newSelected = newSelectedTimes[selectedDate][timeIndex][buttonIndex];
      console.log(`[${timeIndex}][${buttonIndex}] 상태 비교:`, 
        prevSelected, "->", newSelected, 
        "변경 필요:", prevSelected !== newSelected
      ); //정상작동
    });
  });

         // 체크하려고 할 때는 현재 선택되지 않은 시간대만 처리
      // 체크 해제하려고 할 때는 현재 선택된 시간대만 처리?
    // 모든 시간대에 대해 서버 업데이트
    for (let timeIndex = 0; timeIndex < times.length; timeIndex++) {
      if (!prevState[timeIndex]) {
        prevState[timeIndex] = {};
      }

      
      for (let buttonIndex = 0; buttonIndex < 6; buttonIndex++) {
        // 이전 상태와 새로운 상태 비교
        const prevSelected = prevState[timeIndex]?.[buttonIndex] || false;
        const newSelected = newSelectedTimes[selectedDate][timeIndex][buttonIndex];
        
        console.log(`[${timeIndex}][${buttonIndex}] 상태:`, prevSelected, "->", newSelected);
  
        // 상태가 변경된 경우에만 서버 요청
        if (prevSelected !== newSelected) {
          console.log(`서버 요청 - [${timeIndex}][${buttonIndex}]:`, prevSelected, "->", newSelected);
          
          const hour = times[timeIndex].split(':')[0];
          const minute = buttonIndex * 10;
          const dateTime = `${dates[selectedDate].date}T${hour}:${String(minute).padStart(2, '0')}:00`;
          const kstMoment = moment.tz(dateTime, "Asia/Seoul");
          const sendTimeString = kstMoment.format("YYYY-MM-DDTHH:mm:ss");
  
          const payload = {
            id: dates[selectedDate].id,
            date: sendTimeString,
            times: [{
              time: sendTimeString,
              users: [userName]
            }],
            appointmentId: appointmentId
          };
  
          console.log("payload: ", payload.times);
          try {
            await fetch(`${BASE_URL}/schedule/updateSchedule`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } catch (error) {
            console.error("저장 요청 중 오류:", error);
          }
        }
      }
    }
  };
  const handleTimeClick = async (timeIndex, buttonIndex) => {
    const newSelectedTimes = { ...selectedTimes };
    if (!newSelectedTimes[selectedDate]) {
      newSelectedTimes[selectedDate] = {};
    }

    const isSelected = newSelectedTimes[selectedDate][timeIndex]?.[buttonIndex];
    newSelectedTimes[selectedDate][timeIndex] = {
      ...newSelectedTimes[selectedDate][timeIndex],[buttonIndex]: !isSelected,
    };
    setSelectedTimes(newSelectedTimes);

    const selectedDateInfo = dates[selectedDate];


    // 백엔드 서버에 업데이트된 스케줄, 양식에 맞게 가공해서 보내는 logic
    const hour = times[timeIndex].split(':')[0];  // 시간만 추출 (예: "15")
    const minute = buttonIndex * 10;  // 분 계산 (예: 10)
    const dateTime = `${selectedDateInfo.date}T${hour}:${String(minute).padStart(2, '0')}:00`;
    const kstMoment = moment.tz(dateTime, "Asia/Seoul");
    const sendTimeString = kstMoment.format("YYYY-MM-DDTHH:mm:ss"); 
    // const sendTimeString = dateTime.format("YYYY-MM-DDTHH:mm:ss"); 

    console.log("dateTime", dateTime);
    const payload = {
      id: selectedDateInfo.id,
      date: sendTimeString,
      times: [
        {
          time: sendTimeString,
          users: [userName]
        }
      ],
      appointmentId: appointmentId
    };

    console.log("timeslot 클릭시 서버에 보낼 데이터:", payload);

    try {
      const response = await fetch(`${BASE_URL}/schedule/updateSchedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("스케줄 저장 성공");
      } else {
        console.log("스케줄 저장 실패");
        alert("스케줄 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("저장 요청 중 오류:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };
// timeslot의 상태를 강제로 newValue(선택/해제)로 업데이트하는 함수 (드래그 전용)
const updateTimeSlot = async (timeIndex, buttonIndex, newValue, selectedTimes, setSelectedTimes, selectedDate) => {
  // 이미 원하는 상태이면 업데이트하지 않음
  const currentValue = selectedTimes[selectedDate]?.[timeIndex]?.[buttonIndex];
  if (currentValue === newValue) return;

  const newSelectedTimes = { ...selectedTimes };
  if (!newSelectedTimes[selectedDate]) {
    newSelectedTimes[selectedDate] = {};
  }
  newSelectedTimes[selectedDate][timeIndex] = {
    ...newSelectedTimes[selectedDate][timeIndex],
    [buttonIndex]: newValue,
  };
  setSelectedTimes(newSelectedTimes);

  const selectedDateInfo = dates[selectedDate];
  const hour = times[timeIndex].split(':')[0];
  const minute = buttonIndex * 10;
  const dateTime = `${selectedDateInfo.date}T${hour}:${String(minute).padStart(2, '0')}:00`;
  const kstMoment = moment.tz(dateTime, 'Asia/Seoul');
  const sendTimeString = kstMoment.format('YYYY-MM-DDTHH:mm:ss');

  console.log('dateTime', dateTime);
  const payload = {
    id: selectedDateInfo.id,
    date: sendTimeString,
    times: [
      {
        time: sendTimeString,
        users: [userName],
      },
    ],
    appointmentId: appointmentId,
  };

  console.log('timeslot 업데이트 (드래그) 시 서버에 보낼 데이터:', payload);

  try {
    const response = await fetch(`${BASE_URL}/schedule/updateSchedule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('스케줄 저장 성공');
    } else {
      console.log('스케줄 저장 실패');
      alert('스케줄 저장에 실패했습니다.');
    }
  } catch (error) {
    console.error('저장 요청 중 오류:', error);
    alert('서버 오류가 발생했습니다.');
  }
};


  return (
    <div className={`h-auto flex flex-col ${colorVariants({ bg: 'gray-50' })}`}>
      <div className={`flex ${colorVariants({ bg: 'white' })} w-[36rem] pr-[2rem] mt-[2rem] h-[4.8rem] flex-row items-center gap-[0.8rem]`}>
        <img 
          className="bg-none cursor-pointer pl-px-[1rem] pt-px-[0.8rem] transition-colors duration-200 ease-in 
            active:scale-95"
          alt="재로그인하러 돌아가기"
          src="backward.svg"
          onClick={() => navigate(-1)}
        />
        <div
          className={`
            ${typographyVariants({ variant: 'h1-sb' })} 
            overflow-hidden 
            text-center 
            truncate
          `}
        >
          {eventName}
        </div>
      </div>
      {/* date-tabs */}
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
          ${colorVariants({ bg: 'white' })}
            !min-h-[4rem]
            border-b-[0.1rem] 
            border-[var(--gray-500,#A8A8A8)]  
            z-0  
        `}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        aria-label="날짜 탭"
      >
        {dates.map(({ date, key }) => (
          <div
            key={key}
            className={`
              ${typographyVariants({ variant: 'b1-sb' })} 
                ${selectedDate === key ? 
                  `
                  !${colorVariants({ color: 'gray-900' })} 
                  font-[600] 
                  border-b-[0.2rem] 
                  border-[var(--gray-900,#242424)]
                  -mb-0.3
                  z-20
                ` :
                 ``
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
            {moment(date, 'YYYY-MM-DD').format('M/D(ddd)')}
          </div>
        ))}
      </div>
      <div className={`flex pt-[2.8rem] mb-[3.6rem] flex-col items-center ${colorVariants({ bg: 'gray-50' })}`}>      
        <div className="flex items-center gap-2">
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
          <div className="label-box">
            <label 
              htmlFor="all-time" 
              className={`${typographyVariants({ variant: 'b2-md' })} 
              ${(isVisuallyChecked || isChecked) ? colorVariants({ color: 'gray-900' }) : colorVariants({ color: 'gray-600' })}`}
            >  
              <span className="check-icon" aria-hidden="true"></span>
              모든 시간 가능
            </label>
          </div>
        </div> 
        {times.map((time, timeIndex) => (
          <div key={timeIndex} className="flex items-center">
            <div
              className={`
                ${typographyVariants({ variant: 'd3-rg' })}
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
              {moment(time, 'HH:mm').format('HH시')}
            </div>
            <div className="grid grid-cols-6 gap-0 !h-[2.8rem]">  
              {[...Array(6)].map((_, buttonIndex) => (
                <Button
                  key={buttonIndex}
                  size={"XXS"}
                  additionalClass={` 
                    ${selectedTimes[selectedDate]?.[timeIndex]?.[buttonIndex] ? '!border-[var(--blue-200)] bg-[var(--blue-50)]' : ""} 
                    items-center !transform-none
                  `}
                  // onMouseUp={handleMouseUp}
                  // onClick={(e) => {
                  //   if (hasDraggedRef.current) {
                  //     e.preventDefault();
                  //     return;
                  //   }
                  //   handleTimeClick(timeIndex, buttonIndex, selectedTimes, setSelectedTimes, selectedDate, dates, times, appointmentId, userName, BASE_URL);
                  // }}
                  onMouseDown={(e) => handleButtonMouseDown(timeIndex, buttonIndex, e)}
                  onMouseEnter={(e) => handleButtonMouseEnter(timeIndex, buttonIndex, e)}
                  onTouchStart={(e) => handleTouchStart(timeIndex, buttonIndex, e)}
                  onTouchMove={handleTouchMove}

                  style={{ touchAction: 'none' }}
               
                  />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex !justify-center">
        <Button 
          label="내 참여시간 저장"
          size={'L'} 
          onClick={handleSaveClick}
          additionalClass='items-center !transform-none mb-[1.2rem]'        
        /> 
      </div>
    </div>
  );
};
  
export default IndividualCalendar;
  