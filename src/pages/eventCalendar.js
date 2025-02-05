import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { useLocation, useNavigate  } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/ko'; 
import { typographyVariants } from '../styles/typography.ts';
import { colorVariants, colors } from '../styles/color.ts';
import { cn } from '../utils/cn'; 
import { Button } from '../components/Button.tsx';
// import { CopyToClipboard } from "react-copy-to-clipboard";
import { AnimatePresence, motion } from 'framer-motion';

const EventCalendar = () => {
   
     // const { responseData, appointmentId, userSchedule } = location.state;
 
   // console.log("받은 전체 responseData 구조:", responseData);
   // console.log("responseData.object 구조:", responseData.object);
   //  console.log("user 스케줄정보: ", responseData.userSchedule);
   // console.log("user이름:",userName );
  
  // NODE_ENV에 기반하여 BASE_URL에 환경변수 할당
  const BASE_URL = process.env.NODE_ENV === "production" 
  ? process.env.REACT_APP_WWWM_BE_ENDPOINT 
  : process.env.REACT_APP_WWWM_BE_DEV_EP;
 
  //공유 key
  // const KAKAO_SHARE_KEY = process.env.REACT_APP_WWWM_FE_KAKAO_API_KEY_SHARE;
  //아니 왜 env에 넣은 값은 동작안합,,,니까..???
  const KAKAO_SHARE_KEY = '3f71531c7851261c37c07ccbb2fdc085';

   const [dates, setDates] = useState([]);
   const [times, setTimes] = useState([]);
   const [eventName, setEventName] = useState("");
   const [selectedDate, setSelectedDate] = useState(0);
   const [selectedTimes, setSelectedTimes] = useState({});
   const navigate = useNavigate(); 
   const location = useLocation();
   const[TotalUsers, setTotalUsers] = useState("");

   const state = location.state || {};
   const appointmentId = state.id;
    const userName= state.userName;
    // console.log("userName:: ",userName);
  const[userList, setUserList]=useState("");

  const [result, setResult] = useState('');


  const [showToast, setShowToast] = useState(false);

  const [isOpen, setIsOpen] = useState(false);



  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js"; // 카카오톡 SDK
    script.async = true;
    document.body.appendChild(script);
  
    return () => {
      document.body.removeChild(script); // return으로 제거
    };
  }, []);

  //Share 모달창 열기
const handleShare = () => {
  setIsOpen(true);
  
}
  // Share 모달 닫기 
  const closeModal = () => {
    setIsOpen(false);
  };
  // Share 공유 ( 클립보드 복사 , 카카오톡 공유)
const shareString = `https://when-will-we-meet.site/invite?appointmentId=${appointmentId}`;
const clipboardShare = async() =>{
  try{
    await navigator.clipboard.writeText(shareString);
    alert('초대코드 복사되었습니다~');
  }catch(e){
    alert('복사 실패 ㅠㅠ');
  }
}

const KakaoShare = async() => {
  
  if (window.Kakao === undefined) {
    return;
  }

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_SHARE_KEY); 
  }


  window.Kakao.Link.sendDefault({
    objectType: 'feed',
    content: {
        title: '언제볼까?',
        description: '약속 잡기 힘든 시람들이 만든, 더 많은 만남을 위한 서비스',
        imageUrl: 'https://ifh.cc/g/ccKapj.jpg',
        link: {
            mobileWebUrl: shareString,
            webUrl: shareString,
        },
    },
    buttons: [
        {
            title: '참여하기', 
            link: {
                mobileWebUrl: shareString, 
                webUrl: shareString,
            },
        },
    ],
});

}

  
   useEffect(() => {
    const fetchData = async () => {
        try {
            if (!appointmentId) {
                console.error('appointmentId가 없습니다');
                return;
            }

            const appointmentResponse = await fetch(
                `${BASE_URL}/appointment/getAppointment?appointmentId=${appointmentId}`
            );
            const responseData = await appointmentResponse.json();

            // console.log("responseData 전체: ", responseData);
            if (!responseData || !responseData.object) {
                console.error('응답 데이터가 올바르지 않습니다');
                return;
            }

            // step1. appointment 전체의 스케줄 틀 불러옴
            if (responseData) {
                setEventName(responseData.object.name);
                moment.locale('ko');
                const schedules = responseData.object.schedules;
                if (!schedules) {
                    console.error('schedules 비어있음');
                    return;
                }

                // console.log("schedules 보호구역: ", schedules); //정상작동

                // 날짜 및 시간 데이터 설정
                const datesArray = schedules.map((schedule, index) => {
                    const dateString = schedule.date;
                    const date = moment
                        .tz(dateString, 'Asia/Seoul')
                        .format('YYYY-MM-DD');

                    return { date, key: index, id: schedule.id };
                });

                const startTimeString = responseData.object.startTime;
                const endTimeString = responseData.object.endTime;
                const startTimeH = moment.tz(startTimeString, "Asia/Seoul").format('HH');
                const endTimeHM = moment.tz(endTimeString, "Asia/Seoul").format('HH');

                const scheduleTimes = schedules[0]?.times;

                if (!scheduleTimes) {
                    console.error('스케줄에 times가 없습니다.');
                    return;
                }

                const timeSet = new Set();
                scheduleTimes.forEach((timeSlot) => {
                    const timeString = timeSlot.time;
                    const timeHM = moment
                        .tz(timeString, "Asia/Seoul")
                        .format('HH');
                    if (timeHM >= startTimeH && timeHM <= endTimeHM - 1) {
                        timeSet.add(timeHM);
                    }
                });

                const timesArray = Array.from(timeSet).sort((a, b) => {
                    return moment(a, 'HH').diff(moment(b, 'HH'));
                });

                const timesFormatted = timesArray.map((timeHM) =>
                    moment(timeHM, 'HH').format('HH:mm')
                );

                setDates(datesArray);
                setTimes(timesFormatted);
                
                // console.log("그냥 responseData.object: ", responseData.object);
                // console.log("responseData.object.schedules: ", responseData.object.schedules);

                // 공용 스케줄 페이지 - 화면에 색 입힐 유저 몇명인지 찾는 과정
                const userSelections = responseData.object.schedules.reduce((acc, daySchedule) => {
                    daySchedule.times.forEach((slot) => {
                        const slotDate = moment.tz(slot.time, "Asia/Seoul").format('YYYY-MM-DD');
                        const slotHour = moment.tz(slot.time, "Asia/Seoul").format('HH');
                        const slotMinute = moment.tz(slot.time, "Asia/Seoul").format('mm');
                                          
                        if (!acc[slotDate]) {
                            acc[slotDate] = {};
                        }
                        if (!acc[slotDate][slotHour]) {
                            acc[slotDate][slotHour] = [];
                        }

                        if(slot.users.length > 0){
                          acc[slotDate][slotHour].push({
                              minute: slotMinute,
                              users: slot.users,
                              count: slot.users.length,
                        });
                      }
                    });
                    return acc;
                }, {});

                // console.log("userSelections입니다 ~!!: ", userSelections);


                // const TotalUsers = responseData.object.users.length;
                // console.log("responseData.object.users: ", responseData.object.users);
                // console.log("TotalUsers: ", TotalUsers);
                
                setTotalUsers(responseData.object.users.length);
                setUserList(responseData.object.users);

                const savedTimes = {};
                
                datesArray.forEach((dateInfo, dateIndex) => {
                    const datePath = dateInfo.date;
                    // console.log("처리중인 날짜:", {
                    //     datePath,
                    //     existingSelections: userSelections[datePath],
                    // });

                    if (userSelections[datePath]) {
                        if (!savedTimes[dateIndex]) {
                            savedTimes[dateIndex] = {};
                        }


                        timesFormatted.forEach((time, timeIndex) => {
                            const hour = moment(time, 'HH:mm').format('HH');
                            const mm = moment(time, 'HH:mm').format('mm');

                            const minutesArray = userSelections[datePath][hour];
                            // console.log("minutesArray: ", minutesArray);
                            if (minutesArray) {
                                savedTimes[dateIndex][timeIndex] = {};
                                minutesArray.forEach((minuteObj) => {
                                    if (minuteObj && minuteObj.minute !== undefined) {
                                        const minuteInt = parseInt(minuteObj.minute, 10);
                                        const buttonIndex = minuteInt / 10;
                                        savedTimes[dateIndex][timeIndex][buttonIndex] = {
                                            userCount: minuteObj.count||0,
                                            userList: minuteObj.users||[],
                                        };
                                    }
                                });
                            }
                        });
                    }
                });
                // console.log("최종 savedTimes:", savedTimes);
                setSelectedTimes(savedTimes);
            }
        } catch (error) {
            console.error(error);
        }
    };
    fetchData();
}, [appointmentId]);

// useEffect(() => {
//     if (selectedTimes) {
//         console.log("selectedTimes가 업데이트됨:", selectedTimes);
//     }
// }, [selectedTimes]);


 
   
   // 수정 버튼 클릭 시 invite페이지로 이동
   const handleSaveClick = () => {
     // 필요한 로직 처리 후 페이지 이동
     navigate(`/getAppointment?appointmentId=${appointmentId}`);
    };

   return (
    <div className={`h-[800px] flex flex-col    ${colorVariants({ bg: 'gray-50' })}`}>
      <div className={`flex items-center flex-row justify-between  ${colorVariants({ bg: 'white' })} w-[360px] pr-[20px] mt-[20px] h-[48px]  flex-row  items-start gap-[8px]`}>
         {/* <h2>{eventName}</h2> */}
         <div className="flex flex-row items-center">
            <img 
              src="/home.svg" 
              className="hover:cursor-pointer"
              alt="홈으로 돌아가기기"
              onClick={() => navigate('/MonthView')} 
              />
            <div className={`
                ${typographyVariants({ variant: 'h1-sb' })}
            `}>
              {eventName}
            </div>
        </div>
        <img 
        src="/copyLink.svg" 
        className="hover:cursor-pointer"
        alt="share-image2"
        // onClick={() =>handleShare(shareString)} 
        onClick={handleShare}
        />
       </div>
          <div
            className={`
              flex 
              !justify-start
              !overflow-x-auto 
              px-0 
              py-[10px] 
              pb-0
              whitespace-nowrap 
              scrollbar-hide 
              ![&::-webkit-scrollbar]:hidden
              ${colorVariants({ bg: 'white' })}
              !min-h-[40px]
            `}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              }}
          >         
          {dates.map(({ date, key }) => (
            <div
              key={key}
              className={`
                ${typographyVariants({ variant: 'b1-sb' })} 
                ${selectedDate === key ? `
                  !${colorVariants({ color: 'gray-900' })} 
                  font-[600] 
                  border-b-[2px] 
                  border-[var(--gray-900,#242424)]
                ` : `
                  ${colorVariants({ color: 'gray-500' })} 
                  font-[500]
                  border-b-[2px] 
                  border-[var(--gray-500,#A8A8A8)]
                `}
                tracking-[-0.35px]
                p-[9px]
                w-[74px]
                text-center
                flex-shrink-0
                flex-grow-0
                basis-[25%] 
              `}

              onClick={() => setSelectedDate(key)}
            >
             {moment(date, 'YYYY-MM-DD').format('M/D(ddd)')}
           </div>
         ))}
       </div>
        <div className={`flex mb-[36px] mt-[28px] flex-col items-center ${colorVariants({ bg: 'gray-50' })}`}>      
          {times.map((time, timeIndex) => (
          <div key={timeIndex} className="flex items-center">
            <div
              className={`
                ${typographyVariants({ variant: 'd3-rg' })}
                text-[var(--gray-800,#444)]
                h-[28px] 
                w-[36px] 
                text-center 
                mr-[6px] 
                flex 
                items-center 
                justify-center 
              `}
            >                 
            {moment(time, 'HH:mm').format('HH시')}
            </div>
            <div className="grid grid-cols-6 gap-0 !h-[28px]">  
                {[...Array(6)].map((_, buttonIndex) => {
          const userCount = selectedTimes[selectedDate]?.[timeIndex]?.[buttonIndex]?.userCount || 0;
  
          // 색상 클래스 결정
          let colorClass = '';
          if (userCount/TotalUsers > 0 && userCount/TotalUsers <= 0.3) {
            colorClass = `${colorVariants({ bg: 'blue-50' })} border-[var(--blue-100)]`;
          } else if (userCount/TotalUsers > 0.3 && userCount/TotalUsers <= 0.6) {
            colorClass = `${colorVariants({ bg: 'blue-100' })} border-[var(--blue-200)]`;
          } else if (userCount/TotalUsers > 0.6 && userCount/TotalUsers < 0.99) {
            colorClass = `${colorVariants({ bg: 'blue-200' })} border-[var(--blue-300)]`;
          } else if (userCount/TotalUsers === 1) {
            colorClass = `${colorVariants({ bg: 'magen-50' })} border-[var(--magen-300)]`;
          }
        
          return (
            <Button
              key={buttonIndex}
              size={"XXS"}
              additionalClass={`
                ${colorClass}

                items-center !transform-none
              `}
            />
          );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex !justify-center">
         <Button 
             label="내 참여시간 수정"
             size={'M'} 
             onClick={handleSaveClick}
             additionalClass=
             '  items-center !transform-none  '        
          /> 
        </div>      
        <div className="flex flex-col  h-full justify-end ">
          <div className={`h-[190px] px-[24px] ${colorVariants({ bg: 'white' })} `} >
          <div className="flex justify-between items-center mb-[20px]   ">
            <div className={`flex flex-row items-center 
            ${typographyVariants({ variant: 'b2-md' })}
            ${colorVariants({ color: 'gray-900' })}
            `}>            
               <img 
              src="participant.svg" 
              className="hover:cursor-pointer"
              alt="참여인원"
              />
              참여인원  
            </div>
             <div className={`    
              ${typographyVariants({ variant: 'b2-md' })}
              ${colorVariants({ color: 'gray-900' })}
              `}> {TotalUsers}명 </div>
            </div>
            <div className="flex flex-wrap  max-w-[316px]  items-start content-start !gap-x-[1px] gap-y-[12px] self-stretch">
            {Object.values(userList).map((user) => {
                // 정상동작 --> console.log('Comparison result:', user.name === userName.toString());
                
                return (
                  <div
                    key={user.name} 
                    className={`
                    ${typographyVariants({ variant: 'b2-md' })}
                    min-w-[60px] text-[var(--gray-700)] justify-center text-center
                    ${user.name === userName.toString() 
                      ? `${typographyVariants({ variant: 'b2-sb' })} !text-[var(--gray-900)]`
                      : ''}
                  `}>
                    {user.name.length > 4 ? user.name.slice(0, 4) + '...' : user.name}
                  </div>
                );
              })}
            </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          // 배경(반투명) 영역
          <motion.div
            className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50 z-50"
            onClick={closeModal}
            // 초기 상태, 마운트 시 애니메이션, 언마운트 시 애니메이션
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 모달 컨테이너(슬라이드 업 애니메이션) */}
            <motion.div
              className="bg-white w-[360px] h-[158px] justify-center rounded-t-xl flex flex-col items-center p-4 pt-0"
              onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <img className="w-auto mb-[20px]" alt = "공유창 손잡이"src="/tabEdge.svg" />
               <Button label='카카오톡으로 공유하기'
                              size={'share'} 
                              onClick={KakaoShare} 
              >
                  <img src="/arcticons_kakaotalk.svg" alt="카카오톡 아이콘" />
              </Button>
               <Button label='링크 복사하기'
                              size={'share'} 
                              onClick={clipboardShare} 
                              additionalClass="mt-[10px] !border border-gray-300 bg-white text-gray-900"
              >
                  <img src="/tabler_link.svg" alt="링크 복사" />              
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {showToast && (
        <div className="fixed bottom-4 right-4 flex items-center bg-white rounded-lg shadow-lg p-4 transition-opacity duration-300">
          <img 
            src="/Toast_CopyLink.svg" 
            alt="Copy Success"
            className="w-6 h-6 mr-2"
          />
      </div>
      )}
      </div>
      </div>
      
   );
 };
 
export default EventCalendar;