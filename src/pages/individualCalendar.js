// individualCalendar.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate  } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/ko';
import './individualCalendar.css';

const IndividualCalendar = () => {
  const location = useLocation();
  const { responseData, appointmentId, userName } = location.state;
  
    // const { responseData, appointmentId, userSchedule } = location.state;

  console.log("받은 전체 responseData 구조:", responseData);
  console.log("responseData.object 구조:", responseData.object);
   console.log("user 스케줄정보: ", responseData.userSchedule);
  console.log("user이름:",userName );


  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);
  const [eventName, setEventName] = useState("");
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTimes, setSelectedTimes] = useState({});
  const navigate = useNavigate(); 

  console.log("appointmentId는 이것: ", appointmentId); //정상작동

  useEffect(() => {

    //step1. appointment 전체의 스케줄 틀 불러옴옴
    if (responseData) {
      setEventName(responseData.object.name);
      moment.locale('ko');

      // const schedules = responseData.object;
      // const schedules = Array.isArray(responseData.object) ? 
      // responseData.object : 
      // [responseData.object];
      const schedules = responseData.object.schedules;

      console.log("schedules의 타입:", typeof schedules);
      console.log("schedules는는 배열?:", Array.isArray(schedules));
      console.log("schedules의 내용", schedules);
      //빈 스케줄 받았을 때 에외처리
      if(!schedules){
        console.error('schedules 비어있음');
        return;
      }
  

      console.log("이거슨 사용자의 스케줄", schedules);


      // 날짜 및 시간 데이터 설정
      
      const datesArray = schedules.map((schedule, index) => {
        const dateString = schedule.date;
        const date = moment.utc(dateString).format('YYYY-MM-DD');
        console.log("이거슨 date:", date);
        console.log("이거슨 key:", index);
        console.log("이거슨 id:", schedule.id);

        return { date, key: index, id: schedule.id };
      });

      const startTimeString = responseData.object.startTime;
      const endTimeString = responseData.object.endTime;
      const startTimeH = moment.utc(startTimeString).format('HH');
      const endTimeHM = moment.utc(endTimeString).format('HH:mm');

      const scheduleTimes = schedules[0]?.times;

      if (!scheduleTimes) {
        console.error('스케줄에 times가 없습니다.');
        return;
      }

      const timeSet = new Set();
      scheduleTimes.forEach(timeSlot => {
        const timeString = timeSlot.time;
        const timeHM = moment.utc(timeString).format('HH');
        if (timeHM >= startTimeH && timeHM <= endTimeHM) {
          timeSet.add(timeHM);
        }
      });

      const timesArray = Array.from(timeSet).sort((a, b) => {
        return moment(a, 'HH').diff(moment(b, 'HH'));
      });

      const timesFormatted = timesArray.map(timeHM => moment(timeHM, 'HH').format('HH:mm'));

      setDates(datesArray);
      setTimes(timesFormatted);


    //step2. 사용자가 이전에 저장된 선택된 시간 불러옴옴
      if (responseData.firstLogin === false && responseData.object.times) {
        const savedTimes = {};
        responseData.object.times.forEach(timeSlot => {
          const dateIndex = datesArray.findIndex(dateObj => dateObj.date === moment.utc(timeSlot.date).format('YYYY-MM-DD'));
          if (dateIndex !== -1) {
            savedTimes[dateIndex] = savedTimes[dateIndex] || {};
            timeSlot.times.forEach((time, index) => {
              const timeIndex = timesFormatted.indexOf(moment(time.time).format('HH시'));
              if (timeIndex !== -1) {
                savedTimes[dateIndex][timeIndex] = {
                  ...savedTimes[dateIndex][timeIndex],
                  [index]: true,
                };
              }
            });
          }
        });
        setSelectedTimes(savedTimes);
      }
    }
  }, [responseData]);

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
    console.log('지금 선택한 buttonIndex:', buttonIndex);

    const selectedDateInfo = dates[selectedDate];


    // 백엔드 서버에 업데이트된 스케줄, 양식에 맞게 가공해서 보내는 logic
    const hour = times[timeIndex].split(':')[0];  // 시간만 추출 (예: "15")
    const minute = buttonIndex * 10;  // 분 계산 (예: 10)
    const dateTime = `${selectedDateInfo.date}T${hour}:${String(minute).padStart(2, '0')}:00`;
    console.log('생성된 dateTime:', dateTime);
    console.log('UTC 변환 후:', moment.utc(dateTime, "YYYY-MM-DDTHH:mm:ss").format("YYYY-MM-DDTHH:mm:ss"));
    const payload = {
      id: selectedDateInfo.id,
      date: moment.utc(dateTime, "YYYY-MM-DDTHH:mm:ss").format("YYYY-MM-DDTHH:mm:ss"),
      times: [
        {
          time: moment.utc(dateTime, "YYYY-MM-DDTHH:mm:ss").format("YYYY-MM-DDTHH:mm:ss"),
          users: [userName]
        }
      ],
      appointmentId: appointmentId
    };

    console.log("저장할 데이터:", payload);

    try {
      const response = await fetch('http://localhost:8080/api/v1/schedule/updateSchedule', {
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