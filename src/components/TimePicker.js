import React, { useState } from 'react';
import './TimePicker.css'; // 스타일링을 위한 css 파일

const TimePicker = () => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("20:00");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectingStartTime, setIsSelectingStartTime] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);

  const [selectedHourIndex, setSelectedHourIndex] = useState(0);  // 선택된 시간 인덱스
const [selectedMinuteIndex, setSelectedMinuteIndex] = useState(0);  // 선택된 분 인덱스

  const handleTimeClick = (isStart) => {
    setIsSelectingStartTime(isStart);
    setIsModalOpen(true); // 모달창 열기
  };

  const handleModalClose = () => {
    setIsModalOpen(false); // 모달창 닫기
  };

//     const handleTimeSelect = (value, type) => {
//     // value가 1자리일 경우 0을 앞에 붙여서 두 자릿수로 만듭니다.
//     const formattedValue = value.toString().padStart(2, '0');

//     if (type === 'hour') {
//         if (isSelectingStartTime) {
//             setStartTime((prev) => `${formattedValue}:${prev.split(':')[1]}`);
//         } else {
//             setEndTime((prev) => `${formattedValue}:${prev.split(':')[1]}`);
//         }
//     } else if (type === 'minute') {
//         if (isSelectingStartTime) {
//             setStartTime((prev) => `${prev.split(':')[0]}:${formattedValue}`);
//         } else {
//             setEndTime((prev) => `${prev.split(':')[0]}:${formattedValue}`);
//         }
//     }
//     setIsModalOpen(false); // 선택 후 모달 닫기
// };

const handleTimeSelect = (value, type) => {
  // value는 이미 패딩된 문자열이므로 그대로 사용
  const formattedValue = value;

  if (type === 'hour') {
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
  setIsModalOpen(false); // 선택 후 모달 닫기
};
// const handleTimeSelect = (value, type) => {
//     const formattedValue = value.toString().padStart(2, '0');

//     if (type === 'hour') {
//         if (isSelectingStartTime) {
//             setStartTime((prev) => {
//                 // prev가 없으면 기본값 "00:00" 사용
//                 const [prevHour, prevMinute] = (prev || "00:00").split(':');
//                 return `${formattedValue}:${prevMinute}`;
//             });
//         } else {
//             setEndTime((prev) => {
//                 const [prevHour, prevMinute] = (prev || "00:00").split(':');
//                 return `${formattedValue}:${prevMinute}`;
//             });
//         }
//     } else if (type === 'minute') {
//         if (isSelectingStartTime) {
//             setStartTime((prev) => {
//                 const [prevHour, prevMinute] = (prev || "00:00").split(':');
//                 return `${prevHour}:${formattedValue}`;
//             });
//         } else {
//             setEndTime((prev) => {
//                 const [prevHour, prevMinute] = (prev || "00:00").split(':');
//                 return `${prevHour}:${formattedValue}`;
//             });
//         }
//     }
//     setIsModalOpen(false); // 선택 후 모달 닫기
// };

  
  const handleAllDayToggle = () => {
    setIsAllDay(!isAllDay); // 하루종일 여부 토글
  };

  return (
    <div className="time-picker-container" disabled={isAllDay}>
      {/* 시간대 표시 텍스트 */}
      <div className="time-label">시간대 표시</div>

      {/* 시간대 설정 */}
        <div className={`time-range ${isAllDay ? 'disabled' : ''}`}>
        <button className="time-button" onClick={() => handleTimeClick(true)} disabled={isAllDay}>
            {startTime}
        </button>
        <div className="time-separator"></div>
        <button className="time-button" onClick={() => handleTimeClick(false)} disabled={isAllDay}>
            {endTime}
        </button>
        </div>

      {/* 하루 종일 여부 토글 */}
      <div className="all-day-toggle">
         <label className="switch">
            <input type="checkbox" checked={isAllDay} onChange={handleAllDayToggle} />
            <span className="slider"></span>
        </label>
        <label>하루 종일</label>
        </div>


      {/* 이벤트 캘린더 만들기 버튼 */}
      <button className="create-calendar-button">이벤트 캘린더 만들기</button>

      {/* {isModalOpen && (
  <div className="modal-overlay" onClick={handleModalClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="time-select-container">
        <div className="hour-select">
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={`hour-${i}`}
              className={`time-option ${i === selectedHourIndex ? 'selected' : ''}`}
              onClick={() => handleTimeSelect(i < 10 ? `0${i}` : `${i}`, 'hour')}
            >
              {i < 10 ? `0${i}` : `${i}`}
            </div>
          )).slice(Math.max(selectedHourIndex - 1, 0), Math.min(selectedHourIndex + 2, 24))} 
        </div>
        <div className="minute-select">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={`minute-${i}`}
              className={`time-option ${i === selectedMinuteIndex ? 'selected' : ''}`}
              onClick={() => handleTimeSelect(i * 10 < 10 ? `0${i * 10}` : `${i * 10}`, 'minute')}
            >
              {i * 10 < 10 ? `0${i * 10}` : `${i * 10}`}
            </div>
          )).slice(Math.max(selectedMinuteIndex - 1, 0), Math.min(selectedMinuteIndex + 2, 6))} 
        </div>
      </div>
    </div>
  </div> */}
{/* )} */}

    {isModalOpen && (
    <div className="modal-overlay" onClick={handleModalClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="time-select-container">
            <div className="hour-select">
            {Array.from({ length: 24 }, (v,i) => (
                <div
                key={`hour-${i}`}
                className="time-option"
                // onClick={() => handleTimeSelect(i < 10 ? `0${i}` : `${i}`, 'hour')}
                onClick={() => handleTimeSelect(i < 10 ? `0${i}` : `${i}`, 'hour')}
                >
                    {i < 10 ? `0${i}` : `${i}`}

                </div>
            ))}
            </div>
            <div className="time-separator2">:</div>
            <div className="minute-select">
            {Array.from({ length: 6 }, (_, i) => (
                <div
                key={`minute-${i}`}
                className="time-option"
                onClick={() => handleTimeSelect(i * 10 < 10 ? `0${i * 10}` : `${i * 10}`, 'minute')}
                >
                {/* {i * 10 < 10 ? `0${i * 10}` : `${i * 10}`} */}
                {i * 10 < 10 ? `0${i * 10}` : `${i * 10}`}

                </div>
            ))}
            </div>
        </div>
        </div>
    </div>
    )}

    </div>
  );
};

export default TimePicker;
