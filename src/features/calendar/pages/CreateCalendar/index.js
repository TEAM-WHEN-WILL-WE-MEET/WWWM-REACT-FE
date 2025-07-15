import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MonthView from "../../components/MonthViewCalendar";
import TimePicker from "../../components/TimePicker";
import Loading from "../../../../components/Loading";
import { useCalendarStore } from "../../../../store/index.ts";

const CreateCalendar = () => {
  const navigate = useNavigate();
  const { isLoading, error, createCalendar } = useCalendarStore();

  const handleCalendarCreation = async () => {
    try {
      const appointmentId = await createCalendar();
      console.log("Calendar created successfully:", appointmentId);
      navigate("/eventCalendar", { 
        state: { 
          appointmentId: appointmentId,
          userName: "생성자" // 필요에 따라 실제 사용자 이름으로 변경
        }
      });
    } catch (error) {
      console.error("Failed to create calendar:", error);
      // 에러는 이미 store에서 처리되므로 여기서는 로깅만
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
      {isLoading && <Loading />}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md z-50">
          <p>{error}</p>
        </div>
      )}
      <MonthView />
      <TimePicker onCreateCalendar={handleCalendarCreation} />
    </>
  );
};

export default CreateCalendar;
