// individualCalendar.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate  } from 'react-router-dom';
// import moment from 'moment';
import moment from 'moment-timezone';

import 'moment/locale/ko';
import './individualCalendar.css';

const IndividualCalendar = () => {
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
  
      console.log("schedules 보호구역: ",schedules);
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
      console.log("datesArray: ", datesArray);
      setTimes(timesFormatted);
      console.log("timesFormatted????: ", timesFormatted);


      console.log("첫로그인?: ",responseData.firstLogin);
      console.log("responseData 원본?: ",responseData);

      //재로그인 case
      if (responseData.firstLogin === false) {
        console.log("사용자가 이전 로그인에서 저장했었던 times?: ", responseData.userSchedule[0].times);

        const userSelections = responseData.userSchedule[0].times.reduce((acc, slot) => {
            const slotDate = moment.tz(slot.time, "Asia/Seoul").format('YYYY-MM-DD');
            const slotHour = moment.tz(slot.time, "Asia/Seoul").format('HH');
            const slotMinute = moment.tz(slot.time, "Asia/Seoul").format('mm');
          if (!acc[slotDate]) acc[slotDate] = {};
          if (!acc[slotDate][slotHour]) acc[slotDate][slotHour] = [];
          
          acc[slotDate][slotHour].push(parseInt(slotMinute));
          return acc;
      }, {});
      
      console.log("정리된 사용자 선택:", userSelections);
        const savedTimes = {};
        
        datesArray.forEach((dateInfo, dateIndex) => {
          const datePath = dateInfo.date;
          console.log("처리중인 날짜:", {
            datePath,
            existingSelections: userSelections[datePath]
        });
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
        console.log("최종적으로 이전 로그인에서 저장했던 savedTimes:", savedTimes);
        setSelectedTimes(savedTimes);
    }
 } 
}, [responseData]);


useEffect(() => {
  if (selectedTimes) {
      console.log("selectedTimes가 업데이트됨:", selectedTimes);
  }
}, [selectedTimes]); 

  
  // 저장 버튼 클릭 시 이동하는 함수
  const handleSaveClick = () => {
    // 필요한 로직 처리 후 페이지 이동
    navigate('/eventCalendar');
  };

  const handleTimeClick = async (timeIndex, buttonIndex) => {
    const newSelectedTimes = { ...selectedTimes };
    if (!newSelectedTimes[selectedDate]) {
      newSelectedTimes[selectedDate] = {};
    }

    const isSelected = newSelectedTimes[selectedDate][timeIndex]?.[buttonIndex];
    newSelectedTimes[selectedDate][timeIndex] = {
      ...newSelectedTimes[selectedDate][timeIndex],
      [buttonIndex]: !isSelected,
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
      const response = await fetch('http://ec2-43-203-226-33.ap-northeast-2.compute.amazonaws.com:8080/api/v1/schedule/updateSchedule', {
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

  return (
    <div className="individual-calendar">
      <div className="individual-calendar-header">
        <h2>{eventName}</h2>
      </div>
      <div className="event-date-tabs">
        {dates.map(({ date, key }) => (
          <div key={key}
            className={`event-date-tab ${selectedDate === key ? 'active' : ''}`}
            onClick={() => setSelectedDate(key)}
          >
            {moment(date, 'YYYY-MM-DD').format('M/D(ddd)')}
          </div>
        ))}
      </div>
      <div className="time-selection">
        {times.map((time, timeIndex) => (
          <div key={timeIndex} className="time-row">
            <div className="time">{moment(time, 'HH:mm').format('HH시')}</div>
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
      <button className="save-button" onClick={handleSaveClick}>내 시간대 저장</button>

    </div>
  );
};

export default IndividualCalendar;