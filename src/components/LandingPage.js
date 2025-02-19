import React from "react";
import { useCallback, useEffect, useState} from "react";
import Lottie from "lottie-react";

import { useNavigate, useLocation } from 'react-router-dom';
import { colorVariants, colors } from '../styles/color.ts';
import { Button } from './Button.tsx';
import { motion } from "framer-motion";
import { Helmet } from 'react-helmet-async';


//빠른 약속 시간 체크할 때, 언제 볼까?
const Section1 = ({navigate }) => (
    <section className={`
      flex flex-col p-4
      h-[69.5rem]
      bg-gradient-to-b from-[#CCE3FF] via-35% via-[#FFFFFF] to-[#FFFFFF]
    `}
      aria-label="빠른 약속 시간 체크할 때, 언제 볼까?"
    >
      <div className={`  
        ${colorVariants({ color: 'gray-900' })}    
        px-[0.8rem]
        flex
        flex-col
        bg-transparent
        justify-center items-center
        gap-9
        pt-[5em]
        text-[3rem] text-[#020202] tracking-[-0.03em] leading-[4rem] text-center     
      `}>
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{
            opacity: 1, scale: 1,
            transition:{
              duration: 1.6,
              ease: [0.000, 1.180, 0.000, 0.960],
            }
          }}
        >
          <img 
            className="text-[1.4rem] w-[4rem] h-[4rem]" 
            src="/wwmtLogo.svg" 
            alt="언제볼까? 서비스 로고"
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { delay: 0.5, duration: 1.2, ease: [0.25, 1, 0.5, 1], },
          }}         
        >
          <div className="flex flex-col font-pretendard">
            <div className={`!font-semibold`}>빠른 약속 시간 체크할 때,</div>
            <div className={`!font-bold`}>언제 볼까?</div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { delay: 0.8, duration: 1.2, ease: [0.25, 1, 0.5, 1],},
          }}          
        >
          <Button 
            label='새 약속 만들기'
            size={'participate'} 
            onClick={() => navigate('/MonthView')}                          
            additionalClass={`hover:opacity-80 text-[1.6rem] w-[14.2rem] h-[4.8rem]`}
            aria-role="button"
            aria-label="새 약속 만들기 버튼"
          />
        </motion.div>
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
        h-[69.5rem]
        gap-4
        bg-[linear-gradient(to_bottom,#007BE3_0%,#007BE3_70%,#30A0FF_100%)]
        p-8
        py-14
        rounded-[2rem]
      `}
        aria-label="지금까지모임 날짜 잡느라고생 많으셨죠?
          카톡방에서언제 괜찮아요?무한 반복
          단체 채팅방에캘린더 스크린샷올리기 지겨우신 분?
          투표 만들고,결과 정리하느라시간 낭비하셨나요?"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.9, ease: [0.25, 1, 0.5, 1],},
          }}          
        >         
          <div className={`  
            ${colorVariants({ color: 'white' })}    
            px-[0.8rem]
            bg-transparent
            font-pretendard font-bold text-[3rem] text-white tracking-[-0.02em] leading-[1.4em]        
          `}>
            <div className={` whitespace-nowrap `}>지금까지</div>
            <div className={` whitespace-nowrap `}>모임 날짜 잡느라</div>
            <div className={` whitespace-nowrap `}>고생 많으셨죠?</div>
          </div>
        </motion.div>  
        <div className="flex gap-4 flex-col justify-center items-center">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: { 
                  delay: 0.14 * index,  
                  duration: 1.5, 
                  ease: [0.25, 1, 0.5, 1],
                },
              }}          
            >                   
              <Section2Card key={index} {...card} />
            </motion.div>
          ))}
        </div>
      </section>
    );
  };
  
  const Section2Card = ({ icon, textParts, highlightIndex }) => (
    <div className="
      w-[32.3rem]
      h-[13.8rem]
      rounded-[1.5rem]
      justify-between
      bg-gradient-to-b from-[#FFFFFF] via-[#FFFFFF]/100 to-[#CCE3FF]
      rounded-lg p-4 flex items-center space-x-4 pl-[3.6rem] pr-[1em] 
      font-pretendard font-semibold text-[1.8rem] text-black tracking-[0em] leading-[2.8rem]">
      <div className="text-[3.6rem]">{icon}</div>
      <div className="text-gray-800">
        <div className=" whitespace-nowrap  text-gray-800 flex flex-col">
          <div>
            <span>{textParts[0]}</span>
            <span className={highlightIndex === 1 ? "text-[#A32EB2]" : ""}>
              {textParts[1]}
            </span>
          </div>
          {textParts.length > 2 && (
            <div>
              <span className={highlightIndex === 2 ? "text-[#A32EB2]" : ""}>{textParts[2]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  

//언제볼까? 에서 이렇게 해결해드립니다!
const Section3 = () => {
    const cards = [
      {
        title: "원클릭 약속방 생성",
        description: ["클릭 한 번으로 약속 잡기 시작!"],
        imgURL: "/section3card-1.svg"
      },
      {
        title: "링크 공유로 초대하기",
        description: ["공유만 하면 끝, 간편한 친구 초대!"],
        imgURL: "/section3card-2.svg"
      },
      {
        title: "실시간 겹치는 시간 체크",
        description: ["모두의 시간을 한눈에 확인", "최적의 시간을 척척 찾아드려요!"],
        imgURL: "/section3card-3.svg"
      },
      {
        title: "프라이버시 보장",
        description: ["안전하게 약속 잡고 자동 삭제, 걱정 끝!"],
        imgURL: "/section3card-4.svg"
      }
    ];
  
    return (
      <section className={`
        flex flex-col 
        h-auto
        gap-8
        bg-[#FAFAFA]
        py-14
      `}
        aria-label="언제볼까?에서 이렇게 해결해드립니다!
         원클릭 약속방 생성, 링크 공유로 초대하기, 실시간 겹치는 시간 체크, 안전하게 약속 잡고 자동 삭제"      
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.9, ease: [0.25, 1, 0.5, 1],},
          }}          
        >  
          <div className={`
            px-[0.8rem]
            font-pretendard font-bold text-[3rem] tracking-[-0.03em] 
            text-[#002A4F] leading-[1.4em] text-left
          `}>
            <div>언제볼까?에서</div>
            <div>이렇게 해결해드립니다!</div>
          </div>
        </motion.div>
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{
              opacity: 1,
              y: 0,
              transition: { 
                delay: 0.2 * index,  // 각 카드마다 0.2초씩 딜레이 증가
                duration: 1.2, 
                ease: [0.000, 1.180, 0.740, 0.810],
              },
            }}
          >
            <Section3Card {...card} />
          </motion.div>
        ))}
      </section>
    );
  };
  
  const Section3Card = ({ title, description, imgURL }) => {
    return(
      <div className="
        min-w-[24.4rem]
        min-h-[60rem]
        justify-between gap-8
        py-4 flex flex-col items-center leading-[1.4em]
        font-pretendard font-semibold"
      >
        <div className="flex flex-col gap-3 items-center justify-center">
          <div className={`text-[#002A4F] text-[2.4rem] !font-bold tracking-[-0.04em]`}>{title}</div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-[#2B85D9] text-[1.5rem] tracking-[-0.03em]">
              {description[0]}
            </div>
            {description[1] && (
              <div className="text-[#2B85D9] text-[1.5rem] tracking-[-0.03em]">
                {description[1]}
              </div>
            )}  
          </div>
        </div>
        <img src={imgURL} className="ml-0" alt="언제볼까? 서비스 화면" />
      </div>
    );
  }
//팀 소개

const Section4 = () => {
    const positions = [
        { x: 40, y: -48, name: "민상연", role: "Developer", profileURL: "@judemin", flag: "dev" },
        { x: 130, y: 50, name: "강찬욱", role: "Developer", profileURL: "@chanwookK", flag: "dev" },
        { x: 65, y: 135, name: "장연우", role: "Designer", profileURL: "@hyunju1112", flag: "design" },
        { x: -70, y: 90, name: "이시은", role: "Designer", profileURL: "@hyunju1112", flag: "design" },
        { x: -75, y: 10, name: "이현주", role: "Developer", profileURL: "@hyun1211", flag: "dev" },
      ];
    // 중심점 계산 (원의 중심을 (0,0)으로 가정)
    const centerX = 40;
    const centerY = 140;
  
    // 각 위치에서 중심을 향해 이동하는 거리 계산
    const calculateMovement = (x, y, index) => {
      // 현재 위치에서 중심까지의 벡터 계산
      const vectorX = centerX - x;
      const vectorY = centerY - y;
      
      // 벡터의 크기 계산
      const magnitude = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
      
      // 이동할 거리 (예: 전체 거리의 20%)
      const moveDistance = magnitude * 0.15;
      
      // 정규화된 벡터에 이동 거리를 곱해 최종 이동량 계산
      const moveX = (vectorX / magnitude) * moveDistance;
      const moveY = (vectorY / magnitude) * moveDistance;
      
      return {
        x: x + moveX,
        y: y + moveY
      };
    };
  
    return(
      <section className="
        flex flex-col justify-center py-10
        bg-[#0087FC] min-h-[65.7rem] h-auto rounded-[2rem]
      "
        aria-label="언제볼까? 팀 소개"
      >
        
        <div className="
          px-[0.8rem] h-auto flex flex-col bg-transparent gap-24 text-left
        ">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.9, ease: [0.25, 1, 0.5, 1], },
            }}          
          >  
            <div className="justify-start items-start !px-[2rem] flex flex-col gap-6 font-pretendard text-white tracking-[-0.03em] leading-[1.4em]">
              <div className="font-bold text-[3rem]">팀 소개</div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: { 
                    delay: 0.3, // 팀 소개가 나타난 후 0.3초 뒤에 등장
                    duration: 0.9,
                    ease: [0.25, 1, 0.5, 1]
                  },
                }}
              >
                <div className="!font-semibold text-[1.6rem] tracking-[-0.04em] leading-[1.6em]">
                  <div className=" whitespace-nowrap ">저희는 이런 문제들 속에 있는 대학생입니다.</div>
                  <div className=" whitespace-nowrap ">회의, 팀플, 동아리 활동... 매번 약속 잡기가 힘들었죠.</div>
                  <div className=" whitespace-nowrap ">그 경험을 바탕으로 '언제볼까?'가 탄생하게 되었습니다.</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
          <div className="relative flex items-center justify-center">
            <div className="w-60 h-60 bg-[#299BFF] rounded-full">
              {positions.map((item, index) => {
                const targetPosition = calculateMovement(item.x, item.y, index);
                return(
                  <motion.div
                    key={index}
                    initial={{ x: item.x, y: item.y, opacity: 1 }}
                    whileInView={{ 
                      x: targetPosition.x, y: targetPosition.y, 
                    }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.4,
                      ease: [0.42, 0.0, 0.58, 1.0],
                    }}
                    className="absolute"
                  >
                    <div className="">
                      <Section4Card {...item} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  };

  const Section4Card = ({ name, role, profileURL, flag }) => {
    const userId = profileURL.replace("@", "");
    const url =
      flag === "dev"
        ? `https://github.com/${userId}` // GitHub
        : `https://www.instagram.com/${userId}`; // 디자인 포트폴리오 사이트?
    return (
      <div
        className={`
          !w-[10rem] !h-[3.6rem] bg-white text-center
          flex items-center rounded-[1.8rem]
          hover:bg-[#094A82]
          !hover:text-[#FFFFFF] !hover:text-[white]
          transition-colors duration-300 ease-in-out
        `}
      >
        <div className={`
          absolute mt-[-4.5em] ml-[1em]
          font-pretendard font-medium text-[1.2rem] tracking-[-0.04em] leading-[1.2em] text-left           
          ${flag === "dev" ? "text-[#C4FFF1]" : "text-[#F4CCFF]"} 
        `}
        >
          {role}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-[12rem] 
            font-pretendard font-semibold text-[1.4rem] text-[#0D5A9E] 
             tracking-[-0.04em] leading-[1.2em]  text-center
            hover:text-[white]
            "
        >
          {name}
        </a>
      </div>
    );
  };
    
  const Section5 = ({handleScrollToTop, animationData}) => {
    const messages = [
      "저희 팀의 목표는",
      "약속 상황의 소소한 불편함을 해결하고,",
      "더 많은 만남과 추억을 만들 수 있도록 돕는 것!"
    ];
    
    return(
      <section className="flex flex-col py-10
        bg-[#FFFFF] min-h-[40rem] font-pretendard pt-[19em] pb-[1em] gap-20"
        aria-label="함께해요! 그래서 우리, 언제 볼까요?"
      >
        <div className="font-semibold text-[2rem] 
          text-[#007BE3] tracking-[-0.02em] leading-[1.8em] text-center"
        >
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: { 
                  delay: 0.2 * index,
                  duration: 0.8,
                  ease: [0.25, 1, 0.5, 1],
                },
              }}
            >
              {message}
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { 
              delay: 0.75,
              duration: 0.8,
              ease: [0.25, 1, 0.5, 1],
            },
          }}
        >        
          <div className="
            flex flex-col items-center justify-center
            font-bold text-[#003273] text-[2.8rem] leading-[1.6em] text-center"
          >
            <div className="">함께해요!</div>
            <div className="">그래서 우리, 언제 볼까요?</div>
            <div 
              aria-role="button"
              aria-label="페이지 맨 위로 이동" 
              onClick={(e) => handleScrollToTop(e)} 
              className={`w-[10.6rem] h-[10.6rem] hover:cursor-pointer`}
            >
              {animationData ? (
                <Lottie animationData={animationData} loop={true} />
              ) : (
                <p>Loadding...</p>
              )}
            </div>
          </div>
        </motion.div>
      </section>
    );
  };
//연락처 탭
const Footer = () => (
    <footer className={`
      h-[9rem] bg-[#171717] place-items-center
      grid grid-cols-3 grid-rows-2 gap-4 w-full p-4
       text-center text-[#BDBDBD] text-center
      font-pretendard font-medium text-[1.4rem] leading-[1.6em]
    `}>
      <div className="">연락처정보</div>
      <div className="">연락처정보</div>
      <div className="">연락처정보</div>
      <div className="">연락처정보</div>
      <div className="">연락처정보</div>
    </footer>
  );

const LandingPage = () => {
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
      fetch("/upArrow.json") 
        .then((response) => response.json())
        .then((data) => setAnimationData(data));
    }, []);

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
    <div className=" overflow-x-hidden  mx-0 !bg-[var(--white)]">
            <Helmet>
               <title>{'언제볼까?'}</title>
                <meta
                  name="description"
                  content="언제볼까? 약속 잡기 힘든 시람들이 만든, 더 많은 만남을 위한 서비스! "
                />
            </Helmet>
                <Section1 navigate={navigate}/>
                <Section2 />
                <Section3 />
                <Section4 />
                <Section5 handleScrollToTop={handleScrollToTop} animationData={animationData}/>
            <Footer />

        </div>
    );
};

export default LandingPage;
