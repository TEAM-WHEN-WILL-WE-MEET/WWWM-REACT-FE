import React, { useState } from 'react';
import './TimePicker.css';

const TimePicker = ({ startTime, endTime, setStartTime, setEndTime, onCreateCalendar  }) => {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  // 아코디언 토글 함수
  const toggleStartAccordion = () => {
    setIsStartOpen((prev) => !prev);
    setIsEndOpen(false); 
  };

  const toggleEndAccordion = () => {
    setIsEndOpen((prev) => !prev);
    setIsStartOpen(false); 
  };
  const timeToMinutes = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  // 기존 로직 유지: 선택 가능한 시간 범위 확인
  const isTimeSelectable = (hour, minute, isStart, startTime, endTime) => {
    const currentTime = hour * 60 + minute;
  
    if (isStart) {
       // startTime을 선택할 때는 endTime보다 이전이어야 함
      return endTime ? currentTime < timeToMinutes(endTime) : true;
    } else {
        // endTime을 선택할 때는 startTime보다 이후여야 함
        return startTime ? currentTime > timeToMinutes(startTime) : true;
    }
  };

  
  // 시간 선택 처리 함수
  const handleTimeSelect = (hour, isStart) => {
    const formattedTime = `${hour < 10 ? `0${hour}` : hour}:00`;

    if (isStart) {
      // 선택하려는 시간이 유효한지 확인
      if (!isTimeSelectable(hour, 0, true, startTime, endTime)) return; // 유효하지 않은 선택은 무시
      setStartTime(formattedTime); 
    } else {
      // 선택하려는 시간이 유효한지 확인
      if (!isTimeSelectable(hour, 0, false, startTime, endTime)) return; // 유효하지 않은 선택은 무시
      setEndTime(formattedTime);
    }

    // 선택 후 아코디언 닫기
    if (isStart) {
      setIsStartOpen(false);
    } else {
      setIsEndOpen(false);
    }
  };

  // 선택 가능한 시간 옵션을 생성하는 함수
  const renderTimeOptions = (isStart) => {
    return Array.from({ length: 24 }, (_, i) => (
      <div
        key={i}
        className={`time-option ${
          !isTimeSelectable(i, 0, isStart, startTime, endTime) ? 'disabled' : ''
        }`}
        onClick={() => isTimeSelectable(i, 0, isStart, startTime, endTime) && handleTimeSelect(i, isStart)}
      >
        {/* {i < 12 ? `오전 ${i === 0 ? 12 : i}` : `오후 ${i > 12 ? i - 12 : i}`} */}
     
        {i < 12 ? ` ${i === 0 ? 12 : i}` : ` ${i > 12 ? i - 12 : i}`}

      </div>
    ));
  };

  const handleModalClose = () => {
    setIsStartOpen(false);
    setIsEndOpen(false);
  };

  // 터치 이벤트 핸들러 추가
  const handleTouchStart = (e) => {
        // 모달 컨텐츠 영역을 터치한 경우는 무시
    if (e.target.closest('.modal-content')) return;

    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  
  // 터치 종료 위치 계산
  const handleTouchEnd = (e) => {
    if (e.target.closest('.modal-content')) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    // 터치 시작점이 있고, 이동 거리가 작은 경우(탭으로 간주)에만 모달 닫기
    if (touchStart) {
      const deltaX = Math.abs(touchEnd.x - touchStart.x);
      const deltaY = Math.abs(touchEnd.y - touchStart.y);

      // 10픽셀 이내의 이동은 탭으로 간주
      if (deltaX < 10 && deltaY < 10) {
        handleModalClose();
      }
    }
    // 터치 시작점 초기화
    setTouchStart(null);
  };

  return (
    <div className="time-picker-container">
      {/* 시작 시간 */}
      <div className="time-section">
        <div className="time-label" onClick={toggleStartAccordion}>
          <span>시작 시간    </span>
          <span>{startTime}</span>
        </div>
        {isStartOpen && (
          <div
            className="time-options"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {renderTimeOptions(true)}
          </div>
        )}
      </div>

      {/* 종료 시간 */}
      <div className="time-section">
        <div className="time-label" onClick={toggleEndAccordion}>
          <span>종료 시간   </span>
          <span>{endTime}</span>
        </div>
        {isEndOpen && (
        <div
         className="time-options"
         onTouchStart={handleTouchStart}
         onTouchEnd={handleTouchEnd}>
          {renderTimeOptions(false)}
          </div>
        )}
      </div>
      <button className="create-calendar-button" onClick={onCreateCalendar}>
        이벤트 캘린더 만들기
      </button>
    </div>
  );
};





export default TimePicker;
