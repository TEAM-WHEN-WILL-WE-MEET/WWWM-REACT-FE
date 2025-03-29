import React, { useState, useEffect } from 'react';
import MonthView from './MonthView';
import TimePicker from '../components/TimePicker';
import { useNavigate } from 'react-router-dom'; 
import { Helmet } from 'react-helmet-async';
import Loading from "../components/Loading";

const ParentMonth = () => {
  // NODE_ENV에 기반하여 BASE_URL에 환경변수 할당
  // console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);
  // // development로 출력됨
  const BASE_URL = process.env.NODE_ENV === "production" 
  ? process.env.REACT_APP_WWWM_BE_ENDPOINT 
  : process.env.REACT_APP_WWWM_BE_DEV_EP;
  // 정상작동 console.log("BASE_URL: ", BASE_URL);

  const [jsonData, setJsonData] = useState(null);
  const [startTime, setStartTime] = useState('09:00'); 
  const [endTime, setEndTime] = useState('20:00');
  const [isFormReady, setIsFormReady] = useState(false);
  const [eventName, setEventName] = useState("이름 없는 캘린더");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

   // handleCreateCalendar 함수가 필요한 곳에서 호출될 수 있도록 콜백 설정
   const handleCalendarCreation = async (data) => {
    if (!data) {
      console.error('jsonData가 아직 준비되지 않았습니다.');
      return;
    }
    setLoading(true); 
    try {
      //createAppointment, 캘린더 생성 요청
      const calendarResponse = await fetch(`${BASE_URL}/appointment/createAppointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!calendarResponse.ok) {
        console.error('서버 응답 에러:', calendarResponse.statusText);
        return;
      }

      const calendarData = await calendarResponse.json();
      // console.log("나는 캘린더data: ",calendarData);
      const appointmentId = calendarData.object.id;
      // console.log("왜안되는걸까?",appointmentId); //정상작동
      
      // invite 페이지로 이동하면서 appointmentId를 쿼리 파라미터로 전달
      navigate(`/getAppointment?appointmentId=${appointmentId}`);
      
    } catch (error) {
      console.error('Error:', error);
    }finally{
      setLoading(false); 
    }

  };

    
 

  
  return (
    <>
      <Helmet>
         <title>{'언제볼까?'}</title>
          <meta
            name="description"
            content="언제볼까? 서비스와 함께 원클릭 약속방 생성, 클릭 한 번으로 약속 잡기 시작! "
          />
      </Helmet>
      {loading && <Loading />} 
      <MonthView 
        setJsonData={(data) => {
        setJsonData(data);
        // handleCalendarCreation(data); // jsonData가 설정된 후에 호출
        }}
      // setJsonData={setJsonData}
      startTime={startTime}
      endTime={endTime}
      isFormReady={isFormReady}
      setIsFormReady={setIsFormReady}
      eventName={eventName}
      setEventName={setEventName}
       />
      <TimePicker
       jsonData={jsonData}
      //  startTime={startTime}
      //  endTime={endTime}
      startTime={startTime}
      endTime={endTime}
      setStartTime={setStartTime}
      setEndTime={setEndTime}
      onCreateCalendar={() => handleCalendarCreation(jsonData)}
      isFormReady={isFormReady}
      setIsFormReady={setIsFormReady}
      eventName={eventName}
        />
    </>
  );
};

export default ParentMonth;