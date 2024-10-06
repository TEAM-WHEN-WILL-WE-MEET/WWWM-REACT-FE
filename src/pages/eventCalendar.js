import React, { useState, useEffect } from "react";
import './eventCalendar.css'; 
import { useSwipeable } from "react-swipeable";
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/ko'; 

const EventCalendar = () => {
  const location = useLocation();
  const responseData = location.state?.responseData;


  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);


  // useEffect(() => {
  //   if (responseData) {
  //     console.log('서버로부터 받은 응답 데이터:', responseData);
  
  //     moment.locale('ko');
  
  //     const schedules = responseData.object.schedules;
  
  //     // dates 배열 생성
  //     const datesArray = schedules.map((schedule, index) => {
  //       const dateString = schedule.date;
  //       const date = moment(dateString);
  //       const formattedDate = date.format('M/D(ddd)');
  //       return { date: formattedDate, key: index };
  //     });
  
  //     // 시간 부분만 추출하여 중복 제거
  //     const hoursSet = new Set();
  //     schedules.forEach((schedule) => {
  //       schedule.times.forEach((timeSlot) => {
  //         const timeString = timeSlot.time; // 예: "2024-08-19T09:00:00"
  //         const time = moment(timeString);
  //         const hour = time.format('H'); // 24시간 형식의 시간 (0~23)
  //         hoursSet.add(hour);
  //       });
  //     });
  
  //     const uniqueHoursArray = Array.from(hoursSet);
  //     uniqueHoursArray.sort((a, b) => Number(a) - Number(b)); // 숫자형으로 정렬
  
  //     // times 배열 생성
  //     const timesFormatted = uniqueHoursArray.map((hour) => `${hour}시`);
  
  //     // 상태 업데이트
  //     setDates(datesArray);
  //     setTimes(timesFormatted);
  
  //     // 디버그 로그
  //     console.log('dates:', datesArray);
  //     console.log('times:', timesFormatted);
  //   } else {
  //     console.log('응답 데이터가 없습니다.');
  //   }
  // }, [responseData]);
  
  // useEffect(() => {
  //   if (responseData) {
  //     console.log('서버로부터 받은 응답 데이터:', responseData);
  
  //     // 한국어 로케일 설정
  //     moment.locale('ko');
  //     const eventName = responseData.object.name;
  //     console.log("ㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹ",eventName);

  //     const schedules = responseData.object.schedules;
  
  //     // dates 배열 생성
  //     const datesArray = schedules.map((schedule, index) => {
  //       const dateString = schedule.date; // 예: "2024-08-27T00:00:00"
  //       const date = moment.utc(dateString);
  //       const formattedDate = date.format('M/D(ddd)'); // 예: "8/27(화)"
  //       return { date: formattedDate, key: index };
  //     });
  
  //     // startTime과 endTime 추출 및 시간 부분만 사용
  //     const startTimeString = responseData.object.startTime; // 예: "2024-08-19T09:00:00Z"
  //     const endTimeString = responseData.object.endTime; // 예: "2024-08-19T17:00:00Z"
  
  //     const startTime = moment.utc(startTimeString);
  //     const endTime = moment.utc(endTimeString);
  
  //     const startHourMinute = startTime.format('HH:mm');
  //     const endHourMinute = endTime.format('HH:mm');
  
  //     // times 배열 생성
  //     // 첫 번째 스케줄의 times를 사용하여 시간 목록 생성
  //     const scheduleTimes = schedules[0]?.times;
  //     const timesSet = new Set();
  
  //     if (scheduleTimes && scheduleTimes.length > 0) {
  //       scheduleTimes.forEach((timeSlot) => {
  //         const timeString = timeSlot.time; // 예: "2024-08-19T09:00:00"
  //         const time = moment.utc(timeString);
  
  //         // 시간 부분만 추출하여 비교
  //         const timeHourMinute = time.format('HH:mm');
  
  //         // startTime과 endTime 사이의 시간인지 확인
  //         if (
  //           timeHourMinute >= startHourMinute &&
  //           timeHourMinute <= endHourMinute
  //         ) {
  //           timesSet.add(timeHourMinute);
  //         }
  //       });
  //     }
  
  //     // timesSet을 배열로 변환하고 정렬
  //     const timesArray = Array.from(timesSet);
  //     timesArray.sort((a, b) => {
  //       return moment(a, 'HH:mm').diff(moment(b, 'HH:mm'));
  //     });
  
  //     // timesFormatted 배열 생성
  //     const timesFormatted = timesArray.map((timeStr) => {
  //       if (timeStr === startHourMinute || timeStr === endHourMinute) {
  //         return moment(timeStr, 'HH:mm').format('H시mm분');
  //       } else {
  //         return moment(timeStr, 'HH:mm').format('H시');
  //       }
  //     });
  
  //     // 상태 업데이트
  //     setDates(datesArray);
  //     setTimes(timesFormatted);
  
  //     // 디버그 로그
  //     console.log('dates:', datesArray);
  //     console.log('times:', timesFormatted);
  //   } else {
  //     console.log('응답 데이터가 없습니다.');
  //   }
  // }, [responseData]);

  const [eventName, setEventName] = useState("");
  useEffect(() => {
    if (responseData) {
      console.log('서버로부터 받은 응답 데이터:', responseData);
  
      // 한국어 로케일 설정
      moment.locale('ko');

    // 이벤트 이름 상태 업데이트
    setEventName(responseData.object.name);
    // console.log(responseData.object.name);

      const schedules = responseData.object.schedules;
  
      // dates 배열 생성
      const datesArray = schedules.map((schedule, index) => {
        const dateString = schedule.date; // 예: "2024-08-27T00:00:00"
        const date = moment.utc(dateString);
        const formattedDate = date.format('M/D(ddd)'); // 예: "8/27(화)"
        return { date: formattedDate, key: index };
      });
  
      // startTime과 endTime의 시간 부분만 추출
      const startTimeString = responseData.object.startTime; // 예: "2024-08-19T13:00:00Z"
      const endTimeString = responseData.object.endTime; // 예: "2024-08-19T20:00:00Z"
  
      // 시간 부분만 추출
      const startTimeH = moment.utc(startTimeString).format('HH');

      const startTimeHM = moment.utc(startTimeString).format('HH:mm');
      const endTimeHM = moment.utc(endTimeString).format('HH:mm');
      console.log("스타트타임의 hh mm",startTimeHM);
      console.log("엔드타임의 hh mm",endTimeHM);

      // 첫 번째 스케줄의 times 배열에서 시간대 추출
      const scheduleTimes = schedules[0]?.times;
      if (!scheduleTimes) {
        console.error('스케줄에 times가 없습니다.');
        return;
      }
  
      // 시간대 추출 및 중복 제거
      const timeSet = new Set();
  
      scheduleTimes.forEach(timeSlot => {
        const timeString = timeSlot.time; // 예: "2024-08-19T09:00:00"
        const timeHM = moment.utc(timeString).format('HH');
  
        // 시간대가 startTimeHM과 endTimeHM 사이에 있는지 확인
        if (timeHM >= startTimeH && timeHM <= endTimeHM) {
          timeSet.add(timeHM);
        }
      });
  
      // Set을 배열로 변환하고 정렬
      const timesArray = Array.from(timeSet).sort((a, b) => {
        return moment(a, 'HH:mm').diff(moment(b, 'HH:mm'));
      });
  
      // timesFormatted 배열 생성
      const timesFormatted = timesArray.map(timeHM => {
          return moment(timeHM, 'HH:mm').format('H시'); 
      });
  
      // 상태 업데이트
      setDates(datesArray);
      setTimes(timesFormatted);
  
      // 디버그 로그
      console.log('dates:', datesArray);
      console.log('times:', timesFormatted);
    } else {
      console.log('응답 데이터가 없습니다.');
    }
  }, [responseData]);
  // 시간 슬롯 간격 계산
  
 


  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  //로컬용
  // const dates = [
  //   { date: "9/7(토)", key: 0 },
  //   { date: "9/14(토)", key: 1 },
  //   { date: "9/15(일)", key: 2 },
  //   { date: "9/21(토)", key: 3 },
  //   { date: "9/22(일)", key: 4 },
  //   { date: "9/23(월)", key: 5 },
  // ];

  // const times = ["9시", "10시", "11시", "12시", "1시", "2시", "3시", "4시", "5시", "6시", "7시", "8시"];

  const handleRowClick = (timeIndex) => {
    const newState = {...selectedTimes};
    const allSelected = newState[timeIndex]?.every(Boolean); // 모든 버튼이 선택되었는지 검사

    newState[timeIndex] = new Array(6).fill(!allSelected);  // 모든 버튼의 상태를 토글

    setSelectedTimes(newState);
  };
  const handleSwipeLeft = () => {
    if (selectedDate < dates.length - 1) {
      setSelectedDate((prev) => prev + 1);
    }
  };

  const handleSwipeRight = () => {
    if (selectedDate > 0) {
      setSelectedDate((prev) => prev - 1);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true, //  pc 테스트용 
  });

  const handleTimeClick = (timeIndex, buttonIndex) => {
    const newSelectedTimes = { ...selectedTimes };
    if (!newSelectedTimes[selectedDate]) {
      newSelectedTimes[selectedDate] = {};
    }
    newSelectedTimes[selectedDate][timeIndex] = {
      ...newSelectedTimes[selectedDate][timeIndex],
      [buttonIndex]: !newSelectedTimes[selectedDate][timeIndex]?.[buttonIndex],
    };
    setSelectedTimes(newSelectedTimes);
  };

  return (
    <div className="event-calendar">

      <div className="event-calendar-header">
        <div className="event-calendar-header-text">{eventName}</div>
      <div className="dropdown-container">
      <button className="dropdown-button" onClick={toggleDropdown}>
        1명 참여
        <img
          src={isOpen ? '/downArrow.svg' : '/upArrow.svg'}
          alt="arrow"
          className="arrow-icon"
          onClick={toggleDropdown}
        />
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-item">
            <span className="user-icon">나</span> 모임장
          </div>
        </div>
      )}
    </div>
    </div>
      <div {...swipeHandlers} className="event-date-tabs">
       
        {dates.map(({ date, key }) => (
          <div key={key}
          className={`event-date-tab ${selectedDate === key ? 'active' : ''}`}
            onClick={() => setSelectedDate(key)}
           >
            {date}
          </div>
        ))}
      </div>

      <div className="time-selection">
        {times.map((time, timeIndex) => (
          <div key={timeIndex} className="time-row">
            <div className="time">{time}</div>
            <div className="eventCalendar-time-buttons">
              {[...Array(6)].map((_, buttonIndex) => (
                <button
                  key={buttonIndex}
                  className={`eventCalendar-time-button ${
                    selectedTimes[selectedDate]?.[timeIndex]?.[buttonIndex]
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleTimeClick(timeIndex, buttonIndex)}
                />
              ))}
          
    </div>
  </div>
))}
      </div>

      <button className="save-button">내 시간대 저장</button>
    </div>
  );
};

export default EventCalendar;
