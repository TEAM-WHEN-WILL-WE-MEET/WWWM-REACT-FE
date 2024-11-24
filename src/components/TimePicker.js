import React, { useState } from 'react';
import './TimePicker.css';
import { useNavigate } from 'react-router-dom';

const TimePicker = ({ jsonData, startTime, endTime, setStartTime, setEndTime, onCreateCalendar }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectingStartTime, setIsSelectingStartTime] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);
  const navigate = useNavigate();
  const [touchStart, setTouchStart] = useState(null);

  // 시간을 분으로 변환하는 유틸리티 함수
  const timeToMinutes = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 선택 가능한 시간 범위를 결정하는 함수
  const isTimeSelectable = (hour, minute, isStart) => {
    const currentTime = hour * 60 + minute;
    
    if (isStart) {
      // startTime을 선택할 때는 endTime보다 이전이어야 함
      return endTime ? currentTime < timeToMinutes(endTime) : true;
    } else {
      // endTime을 선택할 때는 startTime보다 이후여야 함
      return startTime ? currentTime > timeToMinutes(startTime) : true;
    }
  };

  const handleTimeClick = (isStart) => {
    setIsSelectingStartTime(isStart);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  // 터치 이벤트 핸들러 추가
  const handleTouchStart = (e) => {
    // 모달 컨텐츠 영역을 터치한 경우는 무시
    if (e.target.closest('.modal-content')) return;
    
    // 터치 시작 위치 저장
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e) => {
    // 모달 컨텐츠 영역을 터치한 경우는 무시
    if (e.target.closest('.modal-content')) return;

    // 터치 종료 위치 계산
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
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
  const handleTimeSelect = (value, type) => {
    const formattedValue = value;

    if (type === 'hour') {
      const currentMinutes = isSelectingStartTime ? 
        (startTime ? startTime.split(':')[1] : '00') : 
        (endTime ? endTime.split(':')[1] : '00');

      // 선택하려는 시간이 유효한지 확인
      if (!isTimeSelectable(parseInt(value), parseInt(currentMinutes), isSelectingStartTime)) {
        return; // 유효하지 않은 선택은 무시
      }

      if (isSelectingStartTime) {
        setStartTime((prev) => {
          const [prevHour, prevMinute] = (prev || "00:00").split(':');
          return `${formattedValue}:${prevMinute}`;
        });
      } else {
        setEndTime((prev) => {
          const [prevHour, prevMinute] = (prev || "00:00").split(':');
          return `${formattedValue}:${prevMinute}`;
        });
      }
    } else if (type === 'minute') {
      const currentHour = isSelectingStartTime ?
        (startTime ? startTime.split(':')[0] : '00') :
        (endTime ? endTime.split(':')[0] : '00');

      // 선택하려는 분이 유효한지 확인
      if (!isTimeSelectable(parseInt(currentHour), parseInt(value), isSelectingStartTime)) {
        return; // 유효하지 않은 선택은 무시
      }

      if (isSelectingStartTime) {
        setStartTime((prev) => {
          const [prevHour, prevMinute] = (prev || "00:00").split(':');
          return `${prevHour}:${formattedValue}`;
        });
      } else {
        setEndTime((prev) => {
          const [prevHour, prevMinute] = (prev || "00:00").split(':');
          return `${prevHour}:${formattedValue}`;
        });
      }
    }
    setIsModalOpen(false);
  };

  const handleAllDayToggle = () => {
    setIsAllDay(!isAllDay);
  };

  // 선택 가능한 시간 옵션을 생성하는 함수
  const renderTimeOptions = (type) => {
    const options = type === 'hour' 
      ? Array.from({ length: 24 }, (_, i) => i)
      : Array.from({ length: 6 }, (_, i) => i * 10);
    
    return options.map(value => {
      const formattedValue = value < 10 ? `0${value}` : `${value}`;
      const isSelectable = isTimeSelectable(
        type === 'hour' ? value : parseInt(isSelectingStartTime ? startTime?.split(':')[0] : endTime?.split(':')[0]),
        type === 'minute' ? value : parseInt(isSelectingStartTime ? startTime?.split(':')[1] : endTime?.split(':')[1]),
        isSelectingStartTime
      );

      return (
        <div
          key={`${type}-${value}`}
          className={`time-option ${!isSelectable ? 'disabled' : ''}`}
          onClick={() => isSelectable && handleTimeSelect(formattedValue, type)}
        >
          {formattedValue}
        </div>
      );
    });
  };

  return (
    <div className="time-picker-container" disabled={isAllDay}>
      <div className="time-label">시간대 표시</div>

      <div className={`time-range ${isAllDay ? 'disabled' : ''}`}>
        <button className="time-button" onClick={() => handleTimeClick(true)} disabled={isAllDay}>
          {startTime}
        </button>
        <div className="time-separator"></div>
        <button className="time-button" onClick={() => handleTimeClick(false)} disabled={isAllDay}>
          {endTime}
        </button>
      </div>

      <div className="all-day-toggle">
        <label className="switch">
          <input type="checkbox" checked={isAllDay} onChange={handleAllDayToggle} />
          <span className="slider"></span>
        </label>
        <label>하루 종일</label>
      </div>

      <button className="create-calendar-button" onClick={onCreateCalendar}>
        이벤트 캘린더 만들기
      </button>

      {isModalOpen && (
        <div 
          className="modal-overlay"
          onClick={handleModalClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <div className="time-select-container">
              <div className="hour-select">
                {renderTimeOptions('hour')}
              </div>
              <div className="time-separator2">:</div>
              <div className="minute-select">
                {renderTimeOptions('minute')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
{/* 
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="time-select-container">
              <div className="hour-select">
                {renderTimeOptions('hour')}
              </div>
              <div className="time-separator2">:</div>
              <div className="minute-select">
                {renderTimeOptions('minute')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; */}

export default TimePicker;