import React, { useState } from "react";
import MonthView from "../../components/MonthViewCalendar";
import TimePicker from "../../components/TimePicker";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Loading from "../../../../components/Loading";
import { useCalendarStore } from "../../../../store/index.ts";

const CreateCalendar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { jsonData } = useCalendarStore();

  // NODE_ENV에 기반하여 BASE_URL에 환경변수 할당
  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_WWWM_BE_ENDPOINT
      : process.env.REACT_APP_WWWM_BE_DEV_EP;

  const handleCalendarCreation = async (data) => {
    if (!data) {
      console.error("jsonData가 아직 준비되지 않았습니다.");
      return;
    }
    setLoading(true);
    try {
      const calendarResponse = await fetch(
        `${BASE_URL}/appointment/createAppointment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!calendarResponse.ok) {
        console.error("서버 응답 에러:", calendarResponse.statusText);
        return;
      }

      const calendarData = await calendarResponse.json();
      const appointmentId = calendarData.object.id;
      navigate(`/getAppointment?appointmentId=${appointmentId}`);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{"언제볼까?"}</title>
        <meta
          name="description"
          content="언제볼까? 서비스와 함께 원클릭 약속방 생성, 클릭 한 번으로 약속 잡기 시작! "
        />
      </Helmet>
      {loading && <Loading />}
      <MonthView />
      <TimePicker onCreateCalendar={() => handleCalendarCreation(jsonData)} />
    </>
  );
};

export default CreateCalendar;
