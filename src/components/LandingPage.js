import React from "react";
import { useCallback } from "react";

import { useNavigate, useLocation } from 'react-router-dom';
import { typographyVariants } from '../styles/typography.ts';
import { colorVariants, colors } from '../styles/color.ts';
import { cn } from '../utils/cn.js'; 
import { Button } from './Button.tsx';
import { motion } from "framer-motion";



//빠른 약속 시간 체크할 때, 언제 볼까?
const Section1 = ({navigate }) => (
    <section className={`
        flex flex-col space-y-4 p-4
        h-[695px]
        bg-gradient-to-b from-[#CCE3FF] via-[#FFFFFF]/70 to-[#FFFFFF]
    `}>
        <div className={`  
            ${colorVariants({ color: 'gray-900' })}    
            px-[8px]
            flex
            flex-col
            bg-transparent
            justify-center items-center
            gap-14
            h-full
             text-[30px] text-[#020202] tracking-[-0.03em] leading-[40px] text-center     
        `}>
            <img className="text-[14px] w-[40px] h-[40px]" src="/wwmtLogo.svg" alt="언제볼까 로고"/>
            <div className="flex flex-col font-pretendard">
                <div className={`!font-semibold`}>빠른 약속 시간 체크할 때,</div>
                <div className={`!font-bold`}>언제 볼까?</div>
            </div>
            <Button label='새 약속 만들기'
                size={'participate'} 
                onClick={() => navigate('/MonthView')}                          
                additionalClass={`text-[16px] w-[142px] h-[48px]`}
            />
        </div>
  </section>
);
//지금까지 모임 날짜 잡느라 고생 많으셨죠?
const Section2 = () => {
    const cards = [
      {
        icon: "🥺",
        textParts: ["카톡방에서"," 언제 괜찮아요?", "무한 반복"],
        highlightIndex: 1
      },
      {
        icon: "📅",
        textParts: ["단체 채팅방에"," 캘린더 스크린샷", "올리기 지겨우신 분?"],
        highlightIndex: 1
      },
      {
        icon: "📝",
        textParts: ["투표 만들고,"," 결과 정리하느라 ", "시간 낭비하셨나요?"],
        highlightIndex: 2
      }
    ];
  
    return (
      <section className={`
            flex flex-col space-y-4 p-4
            h-[695px]
            gap-4
            bg-[linear-gradient(to_bottom,#007BE3_0%,#007BE3_70%,#30A0FF_100%)]
            p-8
            py-14
            rounded-[20px]
        `}>
            <div className={`  
                ${colorVariants({ color: 'white' })}    
                px-[8px]
                bg-transparent
                font-pretendard font-bold text-[30px] text-white tracking-[-0.02em] leading-[1.4em]        
            `}>
                <div className={``}>지금까지</div>
                <div className={``}>모임 날짜 잡느라</div>
                <div className={``}>고생 많으셨죠?</div>
            </div>
            <div className="flex gap-4 flex-col justify-center items-center">
                {cards.map((card, index) => (
                <Section2Card key={index} {...card} />
                ))}
            </div>
      </section>
    );
  };

  const Section2Card = ({ icon, textParts, highlightIndex }) => (
    <div className="
        w-[353px]
        h-[138px]
        rounded-[15px]
        justify-between
        bg-gradient-to-b from-[#FFFFFF] via-[#FFFFFF]/100 to-[#CCE3FF]
        rounded-lg p-4 flex items-center space-x-4 pl-[36px] pr-[1em] 
        font-pretendard font-semibold text-[18px] text-black tracking-[0em] leading-[28px]">
        <div className="text-[48px]" >{icon}</div>
        <div className="text-gray-800  ">
            <div className="text-gray-800 flex flex-col">
            <div>
                <span>  {textParts[0]}</span>
                <span className={highlightIndex === 1 ? "text-purple-600" : ""}>
                {textParts[1]}
                </span>
            </div>
            {textParts.length > 2 && (
                <div>
                    <span className={highlightIndex === 2 ? "text-purple-600" : ""}>{textParts[2]}</span>
                </div>
            )}
            </div>
        </div>
    </div>
  );
  

//언제볼까? 에서 이렇게 해결해드립니다!
const Section3 = () => (
    <section className={`
        flex flex-col 
        h-auto
        gap-8
        bg-[#FAFAFA]
        py-14
    `}>
        <div className={`  
            px-[8px]
            font-pretendard font-bold text-[30px]   tracking-[-0.03em]  text-[#002A4F] leading-[1.4em] text-left       
        `}>
            <div className={``} >언제볼까?에서</div>
            <div className={``} >이렇게 해결해드립니다!</div>
        </div>
        <Section3Card 
            title="원클릭 약속방 생성" 
            description={["클릭 한 번으로 약속 잡기 시작!"]} 
            imgURL="/section3card-1.svg" 
        />
        <Section3Card 
            title="링크 공유로 초대하기" 
            description={["공유만 하면 끝, 간편한 친구 초대!"]} 
            imgURL="/section3card-2.svg" 
        />
        <Section3Card 
            title="실시간 겹치는 시간 체크" 
            description={["모두의 시간을 한눈에 확인", "최적의 시간을 척척 찾아드려요!"]} 
            imgURL="/section3card-3.svg" 
        />
        <Section3Card 
            title="프라이버시 보장" 
            description={["안전하게 약속 잡고 자동 삭제, 걱정 끝!"]} 
            imgURL="/section3card-4.svg" 
        />
    </section>
);
const Section3Card = ({ title, description, imgURL }) => {
    return(
        <div className="
        min-w-[244px]
        min-h-[600px]
        justify-between gap-8
        py-4 flex flex-col items-center leading-[1.4em]
        font-pretendard font-semibold">
        <div className="flex flex-col gap-3 items-center justify-center">
            <div className={`text-[#002A4F] text-[24px] !font-bold tracking-[-0.04em] `} >{title}</div>
            <div className="flex flex-col items-center justify-center">
                <div className="text-[#2B85D9] text-[15px] tracking-[-0.03em]">
                        {description[0]}
                </div>
                {description[1] && (
                    <div className="text-[#2B85D9] text-[15px] tracking-[-0.03em]">
                            {description[1]}
                    </div>
                )}  
            </div>
        </div>
        <img src={imgURL} className="ml-0" alt="언제볼까? 서비스 UI" />
    </div>
    );
}

//팀 소개
//여기 디자인 갈아엎어질,,,예정,,,,ㅠㅠ
const Section4 = () => (
    <section className="
        flex flex-col  py-10
         bg-[#CFE9FF] min-h-[657px] h-auto rounded-[20px]">
            <div className=" 
                px-[8px] h-auto flex flex-col bg-transparent  justify-center items-center gap-14 
                " >
                <div className=" flex flex-col gap-2 font-pretendard  tracking-[-0.02em]  text-[#00183B] text-left">
                    <div className="font-bold text-[30px] "> 팀 소개 </div>
                    <div className="text-[16px] font-medium">
                        <div className=""> 저희는 이런 문제들 속에 있는 대학생입니다. </div>
                        <div className=""> 회의, 팀플, 동아리 활동... 매번 약속 잡기가 힘들었죠.</div>
                        <div className=""> 그 경험을 바탕으로 ‘언제볼까?’가 탄생하게 되었습니다.</div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-[16px] justify-between">
                    <Section4Card role="Infra Dev" name="민상연" profileURL="@judemin" flag="dev"/>
                    <Section4Card role="Frontend Dev" name="이현주" profileURL="@hyun1211"  flag="dev"/>
                    <Section4Card role="UX/UI Designer" name="장연우" profileURL="@디자인 포트폴리오"/>
                    <Section4Card role="UX/UI Designer" name="이시은" profileURL="@url이랑"/>
                    <Section4Card role="Backend Dev" name="강찬욱" profileURL="@github 아이디를..."  flag="dev"/>
                </div>
            </div>
    </section>
);

const Section4Card = ({ name, role, profileURL,flag }) => {
    const userId = profileURL.replace('@', '');

    // 조건에 따라 URL 설정
    const url = flag === "dev" 
        ? `https://github.com/${userId}`  // GitHub
        : `https://example.com/profile/${userId}`; // 디자인 포트폴리오 사이트?

    return (
    <div className={`bg-[#FFFFFF] flex flex-col justify-center 
        items-center gap-1 w-[191px] h-[172px] w-1/2 font-pretendard tracking-[0em] leading-[1.6em]
        rounded-[12px] border   border-[#86B9E3]
        `}>
        <div className="font-semibold text-[20px] text-[#191919]">{name}</div>
        <div className="font-semibold text-[12px] text-[#00183B]">{role}</div>
        <a 
            href={url}
            target="_blank" 
            rel="noopener noreferrer"
            className=" w-[120px]  text-center font-regular text-[14px] text-[#B3B3B3] border   
             rounded-[12px] border-1 border-[#F0F0F0] hover:underline"
        >
            {profileURL}
        </a>    
    </div>

);
}
//함께해요! 그래서 우리, 언제 볼까요?
const Section5 = ({handleScrollToTop}) => (
    <section className=" flex flex-col  py-10
         bg-[#FFFFF] min-h-[400px] font-pretendard pt-[19em] pb-[8em] gap-20">
        <div className=" font-semibold text-[20px] 
            text-[#007BE3] tracking-[-0.02em] leading-[1.8em] text-center">
            <div className="">저희 팀의 목표는</div>
            <div className="">약속 상황의 소소한 불편함을 해결하고,</div>
            <div className="">더 많은 만남과 추억을 만들 수 있도록 돕는 것!</div>
        </div>
        
        <div 
            className="font-bold text-[#003273] text-[28px] leading-[1.6em] text-center"
            onClick={handleScrollToTop}
            >
            <div className="" >함께해요!</div>
            <div className=""> 그래서 우리, 언제 볼까요?</div>
        </div>
    </section>
);
//연락처 탭
const Footer = () => (
    <footer className={`
        h-[90px] bg-[#171717] place-items-center
        grid grid-cols-3 grid-rows-2 gap-4 w-full p-4
        max-w-md text-center text-[#BDBDBD] text-center
        font-pretendard font-medium text-[14px] leading-[1.6em]
    `}>
        <div className="">연락처정보</div>
        <div className="">연락처정보</div>
        <div className="">연락처정보</div>
        <div className="">연락처정보</div>
        <div className="">연락처정보</div>

    </footer>
);

const LandingPage = () => {
    const navigate = useNavigate();

    const handleScrollToTop = useCallback(() => {
      let currentPosition = window.scrollY;
      let start = null;
  
      const easeOutExpo = (t) => 1 - Math.pow(2, -10 * t); // 점점 빠르게
  
      const scrollAnimation = (timestamp) => {
        if (!start) start = timestamp;
        let progress = (timestamp - start) / 1000; // 초 단위 변환
        let easing = easeOutExpo(progress);
  
        let newPosition = currentPosition * (1 - easing); // 점점 적게 스크롤 남기기
        window.scrollTo(0, newPosition);

        if (newPosition > 1) {
            requestAnimationFrame(scrollAnimation);
          } else {
            window.scrollTo(0, 0);

          }
      };

      requestAnimationFrame(scrollAnimation);
    }, []);

    return (
        <div className="!w-[430px] h-full">
                <Section1 navigate={navigate}/>
                <Section2 />
                <Section3 />
                <Section4 />
                <Section5 handleScrollToTop={handleScrollToTop}/>
            <Footer />

        </div>
    );
};

export default LandingPage;
