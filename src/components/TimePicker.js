import React, { useState, useRef, useEffect   } from 'react';
import './TimePicker.css';


const TimePicker = ({ startTime, endTime, setStartTime, setEndTime, onCreateCalendar  }) => {
  const [touchStart, setTouchStart] = useState(null);

  const [startHour, setStartHour] = useState(9);
  const [startMeridiem, setStartMeridiem] = useState('오전'); 
  const [endHour, setEndHour] = useState(9);
  const [endMeridiem, setEndMeridiem] = useState('오전'); 

  const startMeridiemDialRef = useRef(null);
  const startHourDialRef = useRef(null);
  const endMeridiemDialRef = useRef(null);
  const endHourDialRef = useRef(null);

  const [isStartOpen, setIsStartOpen] = useState(false);
  const dialContainerRef = useRef(null);

  const [isEndOpen, setIsEndOpen] = useState(false);
  const endDialContainerRef = useRef(null);

  useEffect(() => {
    // 문서 전체에 클릭 이벤트 감지
    const handleClickOutside = (e) => {
      // 다이얼이 열려 있고,
      // dialContainerRef.current 안에 클릭 대상(e.target)이 없는 경우 → 바깥 클릭
      if (
        isStartOpen &&
        dialContainerRef.current &&
        !dialContainerRef.current.contains(e.target)
      ) {
        setIsStartOpen(false);
      }
      if (
        isEndOpen &&
        endDialContainerRef.current &&
        !endDialContainerRef.current.contains(e.target)
      ) {
        setIsEndOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStartOpen, isEndOpen]);

  const toggleStartOpen = () => {
    setIsStartOpen(!isStartOpen);
    setIsEndOpen(false);

  };
  const toggleEndOpen = () => {
    setIsEndOpen(!isEndOpen);
    setIsStartOpen(false);
  };

  const handleTimeChange = (newHour, isStart) => {
    if (isStart) {
      // --- 시작 시간 로직 ---
      let nextHour = newHour;
      let nextMeridiem = startMeridiem;

      if (newHour > 12) {
        nextHour = 1;
        nextMeridiem = (startMeridiem === '오전') ? '오후' : '오전';
        scrollToTop(true);  // 시작 다이얼들 scrollTop
      } else if (newHour < 1) {
        nextHour = 12;
        nextMeridiem = (startMeridiem === '오전') ? '오후' : '오전';
        scrollToTop(true);
      }
      // 오후인 경우 12를 더함 (단, 12시는 제외)
    let displayHour = nextHour;
    if (nextMeridiem === '오후' && nextHour !== 12) {
      displayHour = nextHour + 12;
    }

      // 숫자를 문자열로 변환 + padStart(2, '0')
      const formattedTime = `${String(displayHour).padStart(2, '0')}:00`;
      console.log("formattedTime: ", formattedTime);
      setStartHour(nextHour);
      setStartMeridiem(nextMeridiem);
      setStartTime(formattedTime);

    } else {
      // --- 종료 시간 로직 ---
      let nextHour = newHour;
      let nextMeridiem = endMeridiem;

      if (newHour > 12) {
        nextHour = 1;
        nextMeridiem = (endMeridiem === '오전') ? '오후' : '오전';
        scrollToTop(false); // 종료 다이얼들 scrollTop
      } else if (newHour < 1) {
        nextHour = 12;
        nextMeridiem = (endMeridiem === '오전') ? '오후' : '오전';
        scrollToTop(false);
      }
      let displayHour = nextHour;
      if (nextMeridiem === '오후' && nextHour !== 12) {
        displayHour = nextHour + 12;
      }
  

      const formattedTime = `${String(displayHour).padStart(2, '0')}:00`;
      console.log("formattedTime: ", formattedTime);

      setEndHour(nextHour);
      setEndMeridiem(nextMeridiem);
      setEndTime(formattedTime);
    }
  };

    // 다이얼 스크롤을 제어하기 위한 ref
    const meridiemDialRef = useRef(null);
    const hourDialRef = useRef(null);
  // 오전/오후 상태
  // 시간 상태 (1 ~ 12)

  const meridiemList = ['오전', '오후'];
  const hourList = Array.from({ length: 12 }, (_, i) => i + 1); // [1..12]
  const MorninghourList = Array.from({ length: 13 }, (_, i) => i );
  const AfternoonhourList = Array.from({ length: 11 }, (_, i) => i + 1);


  
    const scrollToTop = (isStart) => {
      if (isStart) {
        if (startHourDialRef.current) {
          startHourDialRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
        if (startMeridiemDialRef.current) {
          startMeridiemDialRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
      } else {
        if (endHourDialRef.current) {
          endHourDialRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
        if (endMeridiemDialRef.current) {
          endMeridiemDialRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
      }
    };

  const handleMeridiemChange = (selected, isStart) => {
    if (isStart) {
      setStartMeridiem(selected);
      scrollToTop(true);
    } else {
      setEndMeridiem(selected);
      scrollToTop(false);
    }
  };
  
  const onWheelHour = (e, isStart) => {
    e.preventDefault();
    
    if (isStart) {
      if (e.deltaY > 0) { // 아래로 스크롤
        if (startMeridiem === "오전") {
          if (startHour === 0) {
            setStartMeridiem("오후");
            handleTimeChange(1, true);
          } else {
            handleTimeChange(startHour + 1, true);
          }
        } else { // 오후
          if (startHour === 11) {
            setStartMeridiem("오전");
            handleTimeChange(0, true);
          } else {
            handleTimeChange(startHour + 1, true);
          }
        }
      } else { // 위로 스크롤
        if (endMeridiem === "오전") {
          if (endHour === 0) {
            setStartMeridiem("오후");
            handleTimeChange(11, false);
          } else {
            handleTimeChange(endHour - 1, false);
          }
        } else { // 오후
          if (endHour === 11) {
            setStartMeridiem("오전");
            handleTimeChange(12, false);
          } else {
            handleTimeChange(endHour - 1, false);
          }
        }
      }
    } else { // 종료 시간
      if (e.deltaY > 0) { // 아래로 스크롤
        if (endMeridiem === "오전") {
          if (endHour === 12) {
            setEndMeridiem("오후");
            handleTimeChange(1, false);
          } else {
            handleTimeChange(endHour + 1, false);
          }
        } else { // 오후
          if (endHour === 11) {
            setEndMeridiem("오전");
            handleTimeChange(0, false);
          } else {
            handleTimeChange(endHour + 1, false);
          }
        }
      } else { // 위로 스크롤
        if (endMeridiem === "오전") {
          if (endHour === 0) {
            setEndMeridiem("오후");
            handleTimeChange(11, false);
          } else {
            handleTimeChange(endHour - 1, false);
          }
        } else { // 오후
          if (endHour === 1) {
            setEndMeridiem("오전");
            handleTimeChange(12, false);
          } else {
            handleTimeChange(endHour - 1, false);
          }
        }
      }
    }
   };

  const onWheelMeridiem = (e, isStart) => {
    e.preventDefault();
    if (isStart) {
      // 시작 “오전/오후” 휠
      const newValue = (startMeridiem === '오전') ? '오후' : '오전';
      handleMeridiemChange(newValue, true);
    } else {
      // 종료 “오전/오후” 휠
      const newValue = (endMeridiem === '오전') ? '오후' : '오전';
      handleMeridiemChange(newValue, false);
    }
  };

  // // 터치 이벤트 핸들러 추가
  // const handleTouchStart = (e) => {
  //       // 모달 컨텐츠 영역을 터치한 경우는 무시
  //   if (e.target.closest('.modal-content')) return;

  //   setTouchStart({
  //     x: e.touches[0].clientX,
  //     y: e.touches[0].clientY,
  //   });
  // };

  
  // // 터치 종료 위치 계산
  // const handleTouchEnd = (e) => {
  //   if (e.target.closest('.modal-content')) return;

  //   const touchEnd = {
  //     x: e.changedTouches[0].clientX,
  //     y: e.changedTouches[0].clientY,
  //   };

  //   // 터치 시작점이 있고, 이동 거리가 작은 경우(탭으로 간주)에만 모달 닫기
  //   if (touchStart) {
  //     const deltaX = Math.abs(touchEnd.x - touchStart.x);
  //     const deltaY = Math.abs(touchEnd.y - touchStart.y);

  //     // 10픽셀 이내의 이동은 탭으로 간주
  //     if (deltaX < 10 && deltaY < 10) {
  //       handleModalClose();
  //     }
  //   }
  //   // 터치 시작점 초기화
  //   setTouchStart(null);
  // };

  return (
    <div className="time-picker-container">
      <div className="flex flex-col items-start space-y-4 p-4 w-[200px]">

      {/* “시작 시간” 표시부 */}
      <div className="flex justify-between w-full"  onClick={toggleStartOpen}>
        <span className="font-semibold">시작 시간</span>
        <span>
          {startMeridiem} {startHour}:00
        </span>
      </div>

      {/* 다이얼 영역 */}
      {isStartOpen && (      
        <div ref={dialContainerRef} className="flex w-full space-x-2">
        {/* 오전/오후 Dial */}
        <div
          className="relative w-1/2 h-40 overflow-y-auto border border-gray-300 
                    rounded-md scroll-snap-y scroll-snap-mandatory"
          onWheel={(e) => onWheelMeridiem(e, true)}

          ref={meridiemDialRef}  
        >
          {meridiemList.map((m) => (
            <div
              key={m}
              className={`h-10 flex items-center justify-center 
                        cursor-pointer scroll-snap-align-start
                ${
                  m === startMeridiem
                    ? 'bg-blue-200 text-blue-900 font-semibold'
                    : 'bg-white text-gray-700'
                }`}
              // onClick={() => handleMeridiemChange(m)}
              onClick={() => handleMeridiemChange(m, true) }

            >
              {m}
            </div>
          ))}
        </div>

        {/* 시간 Dial (1~12) */}
        <div
          className="relative w-1/2 h-40 overflow-y-auto border border-gray-300 
                    rounded-md scroll-snap-y scroll-snap-mandatory"
          // onWheel={onWheelStartHour}
          // onWheel={onWheelHour}
          onWheel={(e) => onWheelHour(e, true)}

          ref={hourDialRef}
        >
          
          {startMeridiem === "오전" ? (
              MorninghourList.map((h) => (
                <div
                  key={h}
                  className={`h-10 flex items-center justify-center cursor-pointer scroll-snap-align-start ${
                    h === startHour ? 'bg-blue-200 text-blue-900 font-semibold' : 'bg-white text-gray-700'
                  }`}
                  onClick={() => handleTimeChange(h, true)}
                >
                  {h}
                </div>
              ))
              ) : (
              AfternoonhourList.map((h) => (
                <div
                  key={h} 
                  className={`h-10 flex items-center justify-center cursor-pointer scroll-snap-align-start ${
                    h === startHour ? 'bg-blue-200 text-blue-900 font-semibold' : 'bg-white text-gray-700'
                  }`}
                  onClick={() => handleTimeChange(h, true)}
                >
                  {h}
                </div>
              ))
          )}
        </div>
      </div>)}
    </div>
    <div className="flex flex-col items-start space-y-4 p-4 w-[200px]">

      {/* “종료 시간” 표시부 */}
      <div className="flex justify-between w-full" onClick={toggleEndOpen}>
        <span className="font-semibold">종료 시간</span>
        <span>
          {endMeridiem} {endHour}:00
        </span>
      </div>

      {/* 다이얼 영역 */}
      {isEndOpen && (      

      <div className="flex w-full space-x-2 "   ref={endDialContainerRef}>
        {/* 오전/오후 Dial */}
        <div
          className="relative w-1/2 h-40 overflow-y-auto border border-gray-300 
                    rounded-md scroll-snap-y scroll-snap-mandatory"
                    onWheel={(e) => onWheelMeridiem(e, false)}
                    ref={endMeridiemDialRef}  
        >
          {meridiemList.map((m) => (
            <div
              key={m}
              className={`h-10 flex items-center justify-center 
                        cursor-pointer scroll-snap-align-start
                ${
                  m === endMeridiem
                    ? 'bg-blue-200 text-blue-900 font-semibold'
                    : 'bg-white text-gray-700'
                }`}
                onClick={() => handleMeridiemChange(m, false)}
                >
              {m}
            </div>
          ))}
        </div>

        {/* 시간 Dial (1~12) */}
        <div
          className="relative w-1/2 h-40 overflow-y-auto border border-gray-300 
                    rounded-md scroll-snap-y scroll-snap-mandatory"
                    onWheel={(e) => onWheelHour(e, false)}

          ref={hourDialRef}
        >
          {endMeridiem === "오전" ? (
              MorninghourList.map((h) => (
                <div
                  key={h}
                  className={`h-10 flex items-center justify-center cursor-pointer scroll-snap-align-start ${
                    h === endHour ? 'bg-blue-200 text-blue-900 font-semibold' : 'bg-white text-gray-700'
                  }`}
                  onClick={() => handleTimeChange(h, false)}
                >
                  {h}
                </div>
              ))
              ) : (
              AfternoonhourList.map((h) => (
                <div
                  key={h} 
                  className={`h-10 flex items-center justify-center cursor-pointer scroll-snap-align-start ${
                    h === endHour ? 'bg-blue-200 text-blue-900 font-semibold' : 'bg-white text-gray-700'
                  }`}
                  onClick={() => handleTimeChange(h, false)}
                >
                  {h}
                </div>
              ))
          )}
        </div>
      </div>)}
      </div>

      <button className="create-calendar-button" onClick={onCreateCalendar}>
        캘린더 만들기
      </button>
    </div>
  );
};





export default TimePicker;
