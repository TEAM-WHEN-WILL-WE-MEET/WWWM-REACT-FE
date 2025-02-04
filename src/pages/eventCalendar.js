import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { useLocation, useNavigate  } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/ko'; 
import copyToClipboard from '../components/copyToClipBoard.ts';
import { share } from '../components/share.ts';
import { typographyVariants } from '../styles/typography.ts';
import { colorVariants, colors } from '../styles/color.ts';
import { cn } from '../utils/cn'; 
import { Button } from '../components/Button.tsx';
// import { CopyToClipboard } from "react-copy-to-clipboard";

import useUserAgent from "../hooks/useUserAgent";
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
  const { userAgent } = useUserAgent();

  const androidWebView = useUserAgent?.isAndroidWebView;

  const [showToast, setShowToast] = useState(false);

  const shareData = {
    title: "언제볼까?",
    text: "링크 공유로 초대하기: 공유만 하면 끝, 간편한 친구 초대",
    url: `https://when-will-we-meet.site/invite?appointmentId=${appointmentId}`,
  }; 
  //해당 url로 접속시, 정상적으로 작동함. 
  // 즉, url 자체는 문제없는디 공유 라이브러리 자체 문제임.


  // const handleShare = async () => {
  //   if (isShareSupported()) {
  //     try {
  //       await navigator.share(shareData);
  //       setResult("공유가 완료되었습니다. ");
  //       console.log("shareData 성공공: ", shareData);
  //     } catch (err) {
  //       setResult(`Error: ${err}`);
  //       console.log("shareData 실패: ", shareData);

  //     }
  // }
  // };
  const handleShare = async () => {
    const result = await share(shareData);
    if (result === "copiedToClipboard") {
      alert("링크를 클립보드에 복사했습니다.");
      console.log("링크 공유 성공공");
    } else if (result === "failed") {
      alert("공유하기가 지원되지 않는 환경입니다.");
    }
  };
  // const copyToClipboard = async (url) => {
  //   try {
  //     await navigator.clipboard.writeText(url);
  //     console.log("공유 완료!");
  //     setShowToast(true);

  //           // 3초 후 토스트 메시지 숨기기
  //           setTimeout(() => {
  //             setShowToast(false);
  //           }, 3000);
  //   } catch (err) {
  //     console.error('Failed to copy!', err);
  //   }
  // };
  
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
              alt="share-image1"
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
        onClick={() =>handleShare} 
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
              alt="share-image1"
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