import React, { useState, useRef, useEffect   } from 'react';
import './TimePicker.css';
import { typographyVariants } from '../styles/typography.ts';
import { colorVariants, colors } from '../styles/color.ts';
import { Button } from './Button.tsx';
import { cn } from '../utils/cn'; 


const TimePicker = ({ startTime, endTime, setStartTime, setEndTime, onCreateCalendar,isFormReady, setIsFormReady  }) => {

  console.log('[TimePicker] isFormReady:', isFormReady);

  const startMeridiemDialRef = useRef(null);
  const startHourDialRef = useRef(null);
  const endMeridiemDialRef = useRef(null);
  const endHourDialRef = useRef(null);

  const [startHour24, setStartHour24] = useState(9);   // 기본 09:00
  const [endHour24, setEndHour24] = useState(13);  // 기본 13:00 (오후 1시)
  const startMeridiem = getMeridiem(startHour24); // '오전' or '오후'
  const startHour12   = to12Hour(startHour24);    // 1..12
  const endMeridiem   = getMeridiem(endHour24);
  const endHour12     = to12Hour(endHour24);

  const [isStartOpen, setIsStartOpen] = useState(false);
  const [startClicked, setStartClicked] = useState(false);

  const [isEndOpen, setIsEndOpen] = useState(false);
  const [endClicked, setEndClicked] = useState(false);


  const startDialRef = useRef(null);
  const endDialRef = useRef(null);
  useEffect(() => {
    // 문서 전체에 클릭 이벤트 감지
    const handleClickOutside = (e) => {
      // 다이얼이 열려 있고,
      // dialContainerRef.current 안에 클릭 대상(e.target)이 없는 경우 → 바깥 클릭
      if (
        isStartOpen &&
        startDialRef.current &&
        !startDialRef.current.contains(e.target)
      ) {
        setIsStartOpen(false);
        setStartClicked(false); 

      }
      if (
        isEndOpen &&
        endDialRef.current &&
        !endDialRef.current.contains(e.target)
      ) {
        setIsEndOpen(false);
        setEndClicked(false);

      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStartOpen, isEndOpen]);

  const handleStartClick = () => {
    //다이얼 열림/닫힘 토글
    setIsStartOpen((prev) => !prev);
    // 클릭시 글자색 토글
    setStartClicked((prev) => !prev);
  };

  const handleEndClick = () => {
    setIsEndOpen((prev) => !prev);
    setEndClicked((prev) => !prev);

  };

  
  const handleHourChange = (newHour24, isStart) => {
    // 0..23 범위 벗어나면 순환 처리(예: 24->0, -1->23)도 가능
    let nextH = newHour24;
    if (nextH < 0) nextH = 23;
    if (nextH > 23) nextH = 0;

    if (isStart) {
      setStartHour24(nextH);
      // 상위에 넘길 때 "HH:00" 형태로
      const hh = String(nextH).padStart(2, '0');
      setStartTime(`${hh}:00`);
    } else {
      setEndHour24(nextH);
      const hh = String(nextH).padStart(2, '0');
      setEndTime(`${hh}:00`);
    }
  };

    // 다이얼 스크롤을 제어하기 위한 ref
    const meridiemDialRef = useRef(null);
    const hourDialRef = useRef(null);
  // 오전/오후 상태
  // 시간 상태 (1 ~ 12)

  const meridiemList = ['오전', '오후'];
  const hourList = Array.from({ length: 12 }, (_, i) => i + 1); // [1..12]
  const morningHours = Array.from({ length: 12 }, (_, i) => i);     // 0..11
  const afternoonHours = Array.from({ length: 12 }, (_, i) => i+12); // 12..23


  
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
  // 24시간 => '오전'/'오후'
  function getMeridiem(hour24) {
    return hour24 < 12 ? '오전' : '오후';
  }

  // 24시간 => 12시간제 시 (1..12)
  function to12Hour(hour24) {
    if (hour24 === 0) return 12; // 0시는 '오전 12'
    if (hour24 === 12) return 12; // 12시는 '오후 12'
    if (hour24 > 12) return hour24 - 12;
    return hour24;
  }

  const handleMeridiemChange = (meridiem, isStart) => {
    if (isStart) {
      const currentHour24 = startHour24;
      const currentIsMorning = currentHour24 < 12; // true=오전
      const wantMorning = (meridiem === '오전');

      if (currentIsMorning && !wantMorning) {
        // 오전 -> 오후
        handleHourChange(currentHour24 + 12, true);
      } else if (!currentIsMorning && wantMorning) {
        // 오후 -> 오전
        handleHourChange(currentHour24 - 12, true);
      }
    } else {
      const currentHour24 = endHour24;
      const currentIsMorning = currentHour24 < 12;
      const wantMorning = (meridiem === '오전');

      if (currentIsMorning && !wantMorning) {
        // 오전 -> 오후
        handleHourChange(currentHour24 + 12, false);
      } else if (!currentIsMorning && wantMorning) {
        // 오후 -> 오전
        handleHourChange(currentHour24 - 12, false);
      }
    }
  };

  const onWheelHour = (e, isStart) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      if (isStart) handleHourChange(startHour24 + 1, true);
      else handleHourChange(endHour24 + 1, false);
    } else {
      if (isStart) handleHourChange(startHour24 - 1, true);
      else handleHourChange(endHour24 - 1, false);
    }
  };

  const onWheelMeridiem = (e, isStart) => {
    e.preventDefault();
    // 현재가 오전이면 오후로, 오후면 오전으로 토글
    if (isStart) {
      const newVal = (startHour24 < 12) ? '오후' : '오전';
      handleMeridiemChange(newVal, true);
    } else {
      const newVal = (endHour24 < 12) ? '오후' : '오전';
      handleMeridiemChange(newVal, false);
    }
  };


  return (
    <div className="flex flex-col items-center mt-5 p-5">
      <div className="flex flex-col items-start space-y-4 p-0 w-[320px] h-[224px]">
        {/* "시작 시간" 표시부 */}
        <div className={cn(
          "flex justify-between w-full cursor-pointer",
          "border-b-[2px]",
          "pb-[12px]",          
          `border-b-[${colors.gray[300]}]`
            )}       
         onClick={handleStartClick}
        >
        <div className={
          `${typographyVariants({ variant: 'b2-md' })}
         ${startClicked ? colorVariants({ color: 'gray-700'}) : colorVariants({ color: 'gray-900'})}

         `
        }>  
         시작 시간
       </div>
        <div className={
          `${typographyVariants({ variant: 'b2-md' })}
         ${startClicked ? colorVariants({ color: 'gray-700'}) : colorVariants({ color: 'gray-900'})}`
        }>    
                  {startMeridiem} {startHour12}:00
        </div>
        </div>

        {/* 다이얼 영역 */}
        {isStartOpen && (      
          <div ref={startDialRef} className={`${colorVariants({ bg: 'gray-50' })} flex w-full space-x-2 !h-[112px]`}>
            {/* 오전/오후 Dial */}
            <div
              className="relative w-1/2 h-40 overflow-y-auto border border-none
                        rounded-md scroll-snap-y scroll-snap-mandatory h-auto"
              onWheel={(e) => onWheelMeridiem(e, true)}
              ref={meridiemDialRef}  
            >
              {['오전', '오후'].map((m) => {
                const isActive = (startMeridiem === m);
                return (
                  <div
                    key={m}
                    className={`h-10 flex items-center justify-center 
                              cursor-pointer scroll-snap-align-start
                      ${
                        m === startMeridiem
                          ? ` ${typographyVariants({ variant: 'h3-md' })} ${colorVariants({ color: 'blue-400' , bg: 'white'})} !text-[var(--blue-400)]`
                          : ` ${typographyVariants({ variant: 'h4-md' })} ${colorVariants({ color: 'gray-600', bg:'gray-50' })} !text-[var(--gray-600)]`
                      }
                      
                      `}
                    onClick={() => handleMeridiemChange(m, true)}
                  >
                    {m}
                  </div>
                );
              })}
            </div>

            {/* 시간 Dial (1~12) */}
            <div
              className="relative w-1/2 h-40 overflow-y-auto border 
                        border-none overflow-scroll [&::-webkit-scrollbar]:hidden
                         scroll-snap-y scroll-snap-mandatory h-[112px]"
              onWheel={(e) => onWheelHour(e, true)}
              ref={hourDialRef}
              style={{
                scrollbarWidth: 'none',
                 msOverflowStyle: 'none',
                }}
            >
              {(startHour24 < 12 ? morningHours : afternoonHours).map((h24) => {
                const displayH = to12Hour(h24);
                const isActive = (startHour24 === h24);
                const isDisabled = (endHour24 != null) && (h24 >= endHour24);

                return (
                  <div  key={h24} className="flex justify-between">
                    {/* hour  */}
                    <div
                      onClick={() => {
                        if (!isDisabled) {
                          handleHourChange(h24, true);
                        }
                      }}
                      className={`h-10 w-1/2 flex items-center justify-center cursor-pointer scroll-snap-align-start 
                        ${
                          isDisabled
                            ? ` ${colorVariants({ bg: 'gray-100' })} !text-[var(--gray-400)] cursor-not-allowed`
                            : isActive
                            ? ` ${typographyVariants({ variant: 'h3-md' })} ${colorVariants({ color: 'blue-400',  bg: 'white' })} !text-[var(--blue-400)]`
                            : ` ${typographyVariants({ variant: 'h4-md' })} ${colorVariants({ color: 'gray-600' })} !text-[var(--gray-600)]`
                        }
                      `}
                    >
                    {displayH} 
                  </div>
                  {/* 00 min */}
                  <div
                      onClick={() => {
                        if (!isDisabled) {
                          handleHourChange(h24, true);
                        }
                      }}
                      className={`h-10 w-1/2 flex items-center justify-center cursor-pointer scroll-snap-align-start 
                        ${
                          isDisabled
                            ? `${colorVariants({ bg: 'gray-100' })}  !text-[var(--gray-400)] cursor-not-allowed`
                            : isActive
                            ? ` ${typographyVariants({ variant: 'h3-md' })} ${colorVariants({ color: 'blue-400',  bg: 'white' })} !text-[var(--blue-400)]`
                            : ` ${typographyVariants({ variant: 'h4-md' })} ${colorVariants({ color: 'gray-600' })} !text-[var(--gray-600)]`
                        }
                      `}
                    >
                     00
                  </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* "종료 시간" 표시부 */}
        <div className={cn(
          "flex justify-between w-full cursor-pointer",
          "border-b-[2px]",
          "pb-[12px]",
          `border-b-[${colors.gray[300]}]`,
          
            )}       
        onClick={handleEndClick}>
        <div className={
          `${typographyVariants({ variant: 'b2-md' })}
         ${endClicked ? colorVariants({ color: 'gray-700'}) : colorVariants({ color: 'gray-900'})}
         `
        }> 종료 시간</div>
        <div className={
          `${typographyVariants({ variant: 'b2-md' })}
         ${endClicked ? colorVariants({ color: 'gray-700'}) : colorVariants({ color: 'gray-900'})}`
        }>  
                  {endMeridiem} {endHour12}:00
          </div>
        </div>

        {/* 다이얼 영역 */}
        {isEndOpen && (
          <div ref={endDialRef} className={`${colorVariants({ bg: 'gray-50' })} flex w-full space-x-2 !h-[112px]  `}>
            {/* 오전/오후 Dial */}
            <div
              className="relative w-1/2 h-40 overflow-y-auto border border-none 
                        rounded-md scroll-snap-y scroll-snap-mandatory  "
              onWheel={(e) => onWheelMeridiem(e, false)} // 종료시간 휠
              ref={endMeridiemDialRef}
            >
              {['오전', '오후'].map((m) => {
                // 현재 종료시간의 meridiem이 m과 같으면 하이라이트
                const isActive = (endMeridiem === m);
                return (
                  <div
                    key={m}
                    onClick={() => handleMeridiemChange(m, false)} // 종료시간 meridiem 변경
                    className={`h-10 flex items-center justify-center 
                              cursor-pointer scroll-snap-align-start 
                      ${
                        isActive
                        ? ` ${typographyVariants({ variant: 'h3-md' })} ${colorVariants({ color: 'blue-400' , bg: 'white'})} !text-[var(--blue-400)]`
                          : ` ${typographyVariants({ variant: 'h4-md' })} ${colorVariants({ color: 'gray-600' })} !text-[var(--gray-600)]`
                      }
                      `}
                  >
                    {m}
                  </div>
                );
              })}
            </div>

            {/* 시간 Dial */}
            <div
              className="relative w-1/2 h-40 overflow-y-auto  border-none 
                        scroll-snap-y overflow-scroll [&::-webkit-scrollbar]:hidden h-[112px]"
              onWheel={(e) => onWheelHour(e, false)} // 종료시간 휠
              ref={endHourDialRef}
              style={{
                scrollbarWidth: 'none',
                 msOverflowStyle: 'none',
                }}
            >
              {/** 
               * 만약 endHour24<12면 오전배열(morningHours),
               * 그 외(>=12)면 오후배열(afternoonHours) 
               */}
              {(endHour24 < 12 ? morningHours : afternoonHours).map((h24) => {
                const displayH = to12Hour(h24); // 24시간 -> 12시간제 변환
                const isActive = (endHour24 === h24);
                const isDisabled = (startHour24 != null) && (h24 <= startHour24);

                return (
                  <div key={h24} className=" flex justify-between ">
                  {/* hour  */}
                    <div
                      onClick={() => {
                        if (!isDisabled) {
                          handleHourChange(h24, false);
                        }
                      }}
                      className={`h-10 w-1/2 flex items-center justify-center cursor-pointer scroll-snap-align-start  
                        ${
                          isDisabled
                            ? ` ${colorVariants({ bg: 'gray-100' })} !text-[var(--gray-400)] cursor-not-allowed`
                            : isActive
                            ? ` ${typographyVariants({ variant: 'h3-md' })} ${colorVariants({ color: 'blue-400',  bg: 'white' })} !text-[var(--blue-400)]`
                            : ` ${typographyVariants({ variant: 'h4-md' })} ${colorVariants({ color: 'gray-600', bg:'gray-50' })} !text-[var(--gray-600)] ${colorVariants({ bg: 'gray-50' })}`
                        }
                      `}
                    >
                    {displayH} 
                  </div>
                  {/* 00 min */}
                  <div
                      onClick={() => {
                        if (!isDisabled) {
                          handleHourChange(h24, true);
                        }
                      }}
                      className={`h-10 w-1/2 flex items-center justify-center cursor-pointer scroll-snap-align-start 
                        ${
                          isDisabled
                            ? `${colorVariants({ bg: 'gray-100' })}  !text-[var(--gray-400)] cursor-not-allowed`
                            : isActive
                            ? ` ${typographyVariants({ variant: 'h3-md' })} ${colorVariants({ color: 'blue-400',  bg: 'white' })} !text-[var(--blue-400)]`
                            : ` ${typographyVariants({ variant: 'h4-md' })} ${colorVariants({ color: 'gray-600' })} !text-[var(--gray-600)]`
                        }
                      `}
                    >
                     00
                  </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <Button label='캘린더 만들기'
                disabled={!isFormReady} 
                size={'XL'} 
                onClick={onCreateCalendar} 
                additionalClass='!mt-[44px]'

                />

      </div>
    </div>
);
};
export default TimePicker;
