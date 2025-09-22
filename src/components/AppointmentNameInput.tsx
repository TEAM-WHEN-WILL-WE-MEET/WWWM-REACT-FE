import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { typographyVariants } from '../styles/typography';
import { colors, colorVariants } from '../styles/color';

interface AppointmentNameInputProps {
  className?: string;
}

const AppointmentNameInput: React.FC<AppointmentNameInputProps> = ({ className = '' }) => {
  const [appointmentName, setAppointmentName] = useState('');
  const navigate = useNavigate();

  const keywords = ['프로젝트', '회의', '모임', '스터디'];

  const handleKeywordClick = (keyword: string) => {
    setAppointmentName(prev => prev ? `${prev} ${keyword}` : keyword);
  };

  const isButtonEnabled = appointmentName.trim() !== '';

  return (
    <div className={`bg-white min-h-screen relative ${className}`}>
      <div className="flex flex-col w-auto">
        <div className="min-w-[36rem] flex flex-col mx-auto">
          {/* Header - 기존 MonthViewCalendar와 동일한 구조 */}
          <div className="flex justify-between items-center w-full">
            <img
              alt="언제볼까? 서비스 로고"
              src="/wwmtLogo.svg"
              className="flex px-[1.2rem] py-[1.2rem] cursor-pointer"
              onClick={() => navigate("/")}
            />
            <img
              alt="메뉴 열기"
              src="/hambugerMenu.svg"
              className="cursor-pointer w-[2.4rem] h-[2.4rem] mr-[1.2rem]"
              onClick={() => navigate("/menu")}
            />
          </div>

          {/* Main Content */}
          <div className="pt-[11.2rem]">
        <h1 className={`${typographyVariants({ variant: "h1-sb" })} ${colorVariants({ color: "gray-900" })} !text-[2rem] mb-[2rem]  flex justify-center `}>
          약속 이름을 정해주세요
        </h1>

            {/* Input Field */}
            <div className=" mb-[2.6rem] mx-auto flex justify-center  w-[32rem] !h-[4.8rem] ">
              <input
                type="text"
                value={appointmentName}
                onChange={(e) => setAppointmentName(e.target.value)}
                className={`w-full ${typographyVariants({ variant: "h3-md" })} ${colorVariants({ color: "gray-900" })} px-[1.6rem] py-[0.8rem] rounded-[0.8rem] border border-[#aac4ff] focus:outline-none `}
                placeholder=""
              />
            </div>

            {/* Keyword Section */}
            <div className="flex flex-col items-center gap-[0.8rem]">
              <p className="text-[13px] font-medium text-[#767676] tracking-[-0.325px] leading-5">
                자동 완성 키워드
              </p>
              <div className="flex gap-1 flex-wrap justify-center">
                {keywords.map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => handleKeywordClick(keyword)}
                    className={`px-[1.6rem] py-[0.6rem] ${typographyVariants({ variant: "b1-sb" })} text-[1.4rem]  ${colorVariants({ color: "gray-700" })}  border rounded-[22px] ${colorVariants({ border: "gray-200" })}  `}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Button */}
            <div className="flex justify-center mt-[120px]">
              <Button
                variant="default"
                property="enter"
                disabled={!isButtonEnabled}
                label="약속 날짜 정하기"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentNameInput;