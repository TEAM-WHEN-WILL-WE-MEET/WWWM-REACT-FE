import React, { useState, useEffect } from "react";
import './eventCalendar.css'; 
import { useSwipeable } from "react-swipeable";
import { useLocation, useNavigate  } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/ko'; 

const EventCalendar = () => {
   
     // const { responseData, appointmentId, userSchedule } = location.state;
 
   // console.log("받은 전체 responseData 구조:", responseData);
   // console.log("responseData.object 구조:", responseData.object);
   //  console.log("user 스케줄정보: ", responseData.userSchedule);
   // console.log("user이름:",userName );
 
 
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
  const[userList, setUserList]=useState("");
  const [result, setResult] = useState('');


  const shareData = {
    title: "언제볼까?",
    text: "링크 공유로 초대하기: 공유만 하면 끝, 간편한 친구 초대",
    url: `https://when-will-we-meet.site/invite?appointmentId=${appointmentId}`,
  };

  
  const isShareSupported = () => navigator.share ?? false;

  const handleShare = async () => {
    if (isShareSupported()) {
      try {
        await navigator.share(shareData);
        setResult("공유가 완료되었습니다. ");
      } catch (err) {
        setResult(`Error: ${err}`);
      }
  }
  };
  
   useEffect(() => {
    const fetchData = async () => {
        try {
            if (!appointmentId) {
                console.error('appointmentId가 없습니다');
                return;
            }

            const appointmentResponse = await fetch(
                `http://ec2-43-202-1-21.ap-northeast-2.compute.amazonaws.com:8080/api/v1/appointment/getAppointment?appointmentId=${appointmentId}`
            );
            const responseData = await appointmentResponse.json();

            console.log("responseData 전체: ", responseData);
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

                console.log("schedules 보호구역: ", schedules); //정상작동

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
                
                console.log("그냥 responseData.object: ", responseData.object);
                console.log("responseData.object.schedules: ", responseData.object.schedules);

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

                console.log("userSelections입니다 ~!!: ", userSelections);


                // const TotalUsers = responseData.object.users.length;
                // console.log("responseData.object.users: ", responseData.object.users);
                // console.log("TotalUsers: ", TotalUsers);
                
                setTotalUsers(responseData.object.users.length);
                setUserList(responseData.object.users);


                const savedTimes = {};
                
                datesArray.forEach((dateInfo, dateIndex) => {
                    const datePath = dateInfo.date;
                    console.log("처리중인 날짜:", {
                        datePath,
                        existingSelections: userSelections[datePath],
                    });

                    if (userSelections[datePath]) {
                        if (!savedTimes[dateIndex]) {
                            savedTimes[dateIndex] = {};
                        }


                        timesFormatted.forEach((time, timeIndex) => {
                            const hour = moment(time, 'HH:mm').format('HH');
                            const mm = moment(time, 'HH:mm').format('mm');

                            const minutesArray = userSelections[datePath][hour];
                            console.log("minutesArray: ", minutesArray);
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
                console.log("최종 savedTimes:", savedTimes);
                setSelectedTimes(savedTimes);
            }
        } catch (error) {
            console.error(error);
        }
    };
    fetchData();
}, [appointmentId]);

useEffect(() => {
    if (selectedTimes) {
        console.log("selectedTimes가 업데이트됨:", selectedTimes);
    }
}, [selectedTimes]);


 
   
   // 저장 버튼 클릭 시 이동하는 함수
   const handleSaveClick = () => {
     // 필요한 로직 처리 후 페이지 이동
     navigate(-1);
   };
 

   return (
     <div className="event-calendar">
       <div className="event-calendar-header">
         {/* <h2>{eventName}</h2> */}
         
         <img 
        src="/Share.svg" 
        className="share-image"
        alt="share-image1"
        onClick={() =>handleShare} 
        />
        <img 
        src="/copyLink.svg" 
        className="share-image"
        alt="share-image2"
        onClick={() =>handleShare} 
        />
       </div>
       <div className="event-date-tabs">
         {dates.map(({ date, key }) => (
           <div key={key}
             className={`event-date-tab ${selectedDate === key ? 'active' : ''}`}
             onClick={() => setSelectedDate(key)}
           >
             {moment(date, 'YYYY-MM-DD').format('M/D(ddd)')}
           </div>
         ))}
       </div>
       <div className="time-selection">
          {times.map((time, timeIndex) => (
            <div key={timeIndex} className="time-row">
              <div className="time">{moment(time, 'HH:mm').format('HH시')}</div>
              <div className="eventCalendar-time-buttons">
                {[...Array(6)].map((_, buttonIndex) => {
                  const userCount = selectedTimes[selectedDate]?.[timeIndex]?.[buttonIndex]?.userCount || 0;

                  // 기본 버튼 클래스
                  let buttonClass = "eventCalendar-time-button";
                  
                  // userCount에 따라 색상 적용
                    
                    if (userCount/ TotalUsers > 0 && userCount/ TotalUsers <= 0.3)  {
                      buttonClass += " bg-blue-50";
                      console.log("buttonClass: ",buttonClass);
                    } else if (userCount /TotalUsers > 0.3 && userCount/ TotalUsers <= 0.6) {
                      buttonClass += " bg-blue-100"; 

                    } else if (userCount /TotalUsers > 0.6 && userCount/ TotalUsers <0.99 ) {
                      buttonClass += " bg-blue-200";

                    }else if(userCount/ TotalUsers === 1){
                      buttonClass += " bg-magen-50";
                    }
                  
                  
                  return (
                    <button
                      key={buttonIndex}
                      // className={buttonClass}
                      className={`${buttonClass}`}
                      // onClick={() => handleTimeClick(timeIndex, buttonIndex)}
                    >
                      {/* userCount가 있을 경우 (n명) 표기 예시 */}
                      {/* {userCount > 0 && `${userCount/TotalUsers} 정도도 참여`} */}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
       <button className="save-button" onClick={handleSaveClick}>참여시간 수정</button>
      <div className="event-calendar-footer">
        <div className="number-participants-header">
          참여인원 수 :
          {TotalUsers}명
        </div>
        <div className="number-participants">
        {Object.values(userList).map((user) => (
            <div className="">{user.name}</div>
          ))}
        </div>
      </div>
     </div>
   );
 };
 
export default EventCalendar;