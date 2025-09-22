import React, { useState } from 'react';
import { Button } from './Button';

interface TimeSelectionModalProps {
  className?: string;
}

const TimeSelectionModal: React.FC<TimeSelectionModalProps> = ({ className = '' }) => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [dateOnly, setDateOnly] = useState(false);
  
  // TimePicker 로직 재사용
  const startHour24Initial = parseInt(startTime.split(":")[0], 10);
  const endHour24Initial = parseInt(endTime.split(":")[0], 10);
  
  const [startHour24, setStartHour24] = useState(startHour24Initial);
  const [endHour24, setEndHour24] = useState(endHour24Initial);

  // TimePicker 유틸리티 함수들
  const getMeridiem = (hour24: number) => {
    return hour24 < 12 ? "오전" : "오후";
  };

  const to12Hour = (hour24: number) => {
    if (hour24 === 0) return 12;
    if (hour24 === 12) return 12;
    if (hour24 > 12) return hour24 - 12;
    return hour24;
  };

  const handleTimeSelect = (hour: number, isStart: boolean) => {
    const timeStr = `${String(hour).padStart(2, '0')}:00`;
    
    if (isStart) {
      setStartHour24(hour);
      setStartTime(timeStr);
    } else {
      setEndHour24(hour);
      setEndTime(timeStr);
    }
  };

  // 시간 선택 그리드 생성 (8시부터 20시까지)
  const timeOptions = [];
  for (let i = 8; i <= 20; i++) {
    timeOptions.push(i);
  }

  const isButtonEnabled = startTime && endTime;

  return (
    <div className={`bg-white rounded-t-3xl min-h-[500px] relative ${className}`}>
      {/* Handle bar */}
      <div className="flex justify-center pt-3 pb-6">
        <div className="w-12 h-1 bg-[#e5e7eb] rounded-full"></div>
      </div>

      {/* Title */}
      <div className="px-6 pb-6">
        <h2 className="text-[18px] font-semibold text-[#242424] tracking-[-0.45px] text-center">
          약속 시간을 정해주세요
        </h2>
      </div>

      {/* Time Grid */}
      <div className="px-6 mb-6">
        <div className="bg-[#f8f9fa] rounded-2xl p-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Time Options */}
            <div className="space-y-3">
              {timeOptions.filter((_, index) => index % 2 === 0).map((hour) => {
                const timeStr = `${String(hour).padStart(2, '0')}:00`;
                const isStartSelected = startTime === timeStr;
                const isEndSelected = endTime === timeStr;
                const hour12 = to12Hour(hour);
                
                return (
                  <div key={hour} className="text-center">
                    <div className="text-[14px] text-[#9ca3af] mb-1">
                      {timeStr}
                    </div>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleTimeSelect(hour, true)}
                        className={`
                          px-3 py-1 rounded-full text-[14px] font-semibold transition-colors
                          ${isStartSelected 
                            ? 'bg-[#4285f4] text-white' 
                            : 'bg-white border border-[#e5e7eb] text-[#4285f4] hover:border-[#4285f4]'
                          }
                        `}
                      >
                        <span className="text-[#4285f4] font-semibold">{hour12}:00</span>
                        <span className="text-[12px] text-[#767676] ml-1">
                          {isStartSelected ? '부터' : ''}
                        </span>
                      </button>
                      <button
                        onClick={() => handleTimeSelect(hour, false)}
                        className={`
                          px-3 py-1 rounded-full text-[14px] font-semibold transition-colors
                          ${isEndSelected 
                            ? 'bg-[#4285f4] text-white' 
                            : 'bg-white border border-[#e5e7eb] text-[#4285f4] hover:border-[#4285f4]'
                          }
                        `}
                      >
                        <span className="text-[#4285f4] font-semibold">{hour12}:00</span>
                        <span className="text-[12px] text-[#767676] ml-1">
                          {isEndSelected ? '까지' : ''}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column - Time Options */}
            <div className="space-y-3">
              {timeOptions.filter((_, index) => index % 2 === 1).map((hour) => {
                const timeStr = `${String(hour).padStart(2, '0')}:00`;
                const isStartSelected = startTime === timeStr;
                const isEndSelected = endTime === timeStr;
                const hour12 = to12Hour(hour);
                
                return (
                  <div key={hour} className="text-center">
                    <div className="text-[14px] text-[#9ca3af] mb-1">
                      {timeStr}
                    </div>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleTimeSelect(hour, true)}
                        className={`
                          px-3 py-1 rounded-full text-[14px] font-semibold transition-colors
                          ${isStartSelected 
                            ? 'bg-[#4285f4] text-white' 
                            : 'bg-white border border-[#e5e7eb] text-[#4285f4] hover:border-[#4285f4]'
                          }
                        `}
                      >
                        <span className="text-[#4285f4] font-semibold">{hour12}:00</span>
                        <span className="text-[12px] text-[#767676] ml-1">
                          {isStartSelected ? '부터' : ''}
                        </span>
                      </button>
                      <button
                        onClick={() => handleTimeSelect(hour, false)}
                        className={`
                          px-3 py-1 rounded-full text-[14px] font-semibold transition-colors
                          ${isEndSelected 
                            ? 'bg-[#4285f4] text-white' 
                            : 'bg-white border border-[#e5e7eb] text-[#4285f4] hover:border-[#4285f4]'
                          }
                        `}
                      >
                        <span className="text-[#4285f4] font-semibold">{hour12}:00</span>
                        <span className="text-[12px] text-[#767676] ml-1">
                          {isEndSelected ? '까지' : ''}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Currently Selected Times Display */}
      {(startTime || endTime) && (
        <div className="px-6 mb-4">
          <div className="flex justify-center gap-8 text-[16px] font-medium text-[#242424]">
            {startTime && (
              <div className="flex items-center gap-2">
                <span className="text-[#4285f4] font-semibold">{startTime}</span>
                <span className="text-[#767676]">부터</span>
              </div>
            )}
            {endTime && (
              <div className="flex items-center gap-2">
                <span className="text-[#4285f4] font-semibold">{endTime}</span>
                <span className="text-[#767676]">까지</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Date Only Checkbox */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-center gap-2">
          <input
            type="checkbox"
            id="date-only-checkbox"
            checked={dateOnly}
            onChange={(e) => setDateOnly(e.target.checked)}
            className="w-4 h-4 text-[#4285f4] rounded border-[#d1d5db] focus:ring-[#4285f4]"
          />
          <label 
            htmlFor="date-only-checkbox" 
            className="text-[14px] text-[#767676] tracking-[-0.35px]"
          >
            시간 없이 날짜만 정하기
          </label>
        </div>
      </div>

      {/* Create Calendar Button */}
      <div className="px-6 pb-6">
        <Button
          size="enter"
          disabled={!isButtonEnabled}
          className={`w-full ${
            isButtonEnabled 
              ? 'bg-[#4285f4] text-white' 
              : 'bg-[#cfcfcf] text-white'
          }`}
          label="약속 캘린더 만들기"
        />
      </div>
    </div>
  );
};

export default TimeSelectionModal;