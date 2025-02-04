// Invite.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { typographyVariants } from '../styles/typography.ts';
import { colorVariants, colors } from '../styles/color.ts';
import { cn } from '../utils/cn'; 
import { Button } from '../components/Button.tsx';

// import { tryParse } from 'firebase-tools/lib/utils';

const Invite = () => {
  // NODE_ENV에 기반하여 BASE_URL에 환경변수 할당
  const BASE_URL = process.env.NODE_ENV === "production" 
  ? process.env.REACT_APP_WWWM_BE_ENDPOINT 
  : process.env.REACT_APP_WWWM_BE_DEV_EP;

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const appointmentId = queryParams.get('appointmentId');
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState(false);
  const [eventname, setEventname]= useState('언제볼까?');

  const [buttonText, setButtonText] = useState('회원가입');

  useEffect(() => {
    // localStorage에서 로그인 여부 확인
    const isLoggedIn = localStorage.getItem(`loggedInFlag_${appointmentId}`);

    if (isLoggedIn === 'true') {
        setButtonText('로그인'); // 이전에 로그인한 사용자
        // console.log(`Logged-in flag for appointmentId ${appointmentId}: true`);
    } else {
        setButtonText('새로 참여하기'); // 신규 사용자
        // console.log(`Logged-in flag for appointmentId ${appointmentId}: false`);
    }
}, [appointmentId]);

  const handleSetName = async() => {
    const appointmentResponse = await fetch(
      `${BASE_URL}/appointment/getAppointment?appointmentId=${appointmentId}`
    ); 
    const data = await appointmentResponse.json(); 
  const eventName = data?.object?.name;
    setEventname(eventName);
  };

  useEffect(()=> {
    handleSetName();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.trim() === '') {
      setError(true);
    } else {
      setError(false);
      
      const data = {
        name: name,
        password: password,
        appointmentId: appointmentId,
      };
 
      try {
        const response = await fetch(`${BASE_URL}/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
 
        if (response.ok) {
          const responseData = await response.json(); 
          setResponseMessage('로그인(or 회원가입) 성공!');
            // console.log("response: ", responseData);
            const appointmentResponse = await fetch(
              `${BASE_URL}/appointment/getAppointment?appointmentId=${appointmentId}`
            ); 

            // 사용자 이전 로그인 여부를 flag로 localStorage에 저장,
            //  appointmentId와 쌍으로 저장해 정확히 일치할때만 재로그인으로 간주
            if (responseData.object.name) {
              const key = `loggedInFlag_${appointmentId}`;
              localStorage.setItem(key, 'true'); // 로그인 플래그 설정
              // console.log(`Login flag saved to localStorage for appointmentId ${appointmentId}: true`);
          }
              if (appointmentResponse.ok) {

                const appointmentData = await appointmentResponse.json();
                //  console.log("저쪽 invite.js 신사 분이 보내주신 전체 인원의 스케줄 정보: ", appointmentData);
                


                const userScheduleResponse = await fetch(
                  `${BASE_URL}/schedule/getUserSchedule?appointmentId=${appointmentId}&userName=${name}`,
                  {
                    method: 'GET',
                    headers: {

                      'Cache-Control': 'no-cache'
                    }
                  }
                );
       
                let responseData;
                // console.log("userScheduleResponse: ", userScheduleResponse);
      
                if (userScheduleResponse.ok) {
                  const userScheduleData = await userScheduleResponse.json();
                  // console.log('invite.js, 서버에서 받아온 유저 개인 스케줄정보:', userScheduleData);

                //재로그인 case
                if (userScheduleData.object && userScheduleData.object.length > 0) {
                  // responseData = userScheduleData;
                  // responseData.firstLogin = false;
                  // console.log("[재로그인 사용자]");
                  // console.log("응답데이터::: ", responseData);
                  // console.log("약속id:", appointmentId);
                  // console.log("재로그인한 사용자 이름", name);
                  responseData = {
                    ...appointmentData,
                    userSchedule: userScheduleData.object,
                    firstLogin: false
                  };
                  
                //   console.log("(((재로그인))))저쪽 invite.js 신사 분이 보내주신 재로그인시의 responseData 구조:", {
                //     ...appointmentData,
                //     userSchedule: userScheduleData.object,
                //     firstLogin: false
                // });
                // console.log("invite.js가 보낸 userSchedule: ", userScheduleData.object);

                } else { //첫로그인 case
                  responseData = {
                    ...appointmentData,
                    firstLogin: true
                  };
                }

              } else {
                setResponseMessage('약속 정보를 가져오는데 실패했습니다.');
                return;
              }
              navigate('/individualCalendar', { state: { responseData, appointmentId, userName: name } });
            } else {
              setResponseMessage('사용자 스케줄을 가져오는데 실패했습니다.');
            }
          } else {
            setResponseMessage( '이름이나 패스워드를 확인하세요.');
          }
      } catch(error) {
        console.error('Error:', error);
        setResponseMessage('서버 오류가 발생했습니다.');
      }
    }
 };   

 
 
 
  return (
<div className="flex justify-center items-center h-[800px] bg-[var(--gray-50,#FBFBFB)] flex-col">
<div className={`
          ${typographyVariants({ variant: 'h1-sb' })} 
          ${colorVariants({ color: 'gray-800' })} 
          flex 
          bg-transparent
         !mb-[16px]

        `}>
        {eventname}
      </div>
      <div className={`
            ${colorVariants({ bg: 'white' })} 
            ${colorVariants({ color: 'gray-800' })} 
            w-[312px] 
            h-[258px] 
            flex-shrink-0 
            rounded-[12px] 
            border-[1px] 
            border-[var(--gray-800,#444)] 
            shadow-[1px_1px_0px_0px_var(--gray-800,#444)]
            pt-[28px] 
            px-[32px]
            items-center
            justify-between
            flex
          `}
        >
        <form onSubmit={handleSubmit}   
              className="flex flex-col items-center justify-center w-full !h-auto "
        >
          <div className="mb-[18px]">
            <label htmlFor="name"
              className={`
                ${typographyVariants({ variant: 'd1-sb' })} 
                ${colorVariants({ color: 'gray-800' })} 
                tracking-[-0.3px]
              `}>
                참여자 이름
                </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`
                ${colorVariants({ bg: 'gray-50' })} 
                ${colorVariants({ color: 'gray-300' })} 
                flex 
                w-[248px] 
                h-[40px] 
                px-[12px] 
                py-[11px] 
                items-center 
                flex-shrink-0 
                rounded-[6px] 
                border-[1px] 
                border-[var(--gray-300,#E0E0E0)]
                ${typographyVariants({ variant: 'b2-md' })} 

              `}
              placeholder="이름을 입력해주세요"
              
            />
          </div>
          <div className="">
            <label htmlFor="password"   className={`
              ${typographyVariants({ variant: 'd1-sb' })} 
              ${colorVariants({ color: 'gray-800' })} 
              tracking-[-0.3px]
            `}>
              패스워드
              </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="패스워드를 입력해주세요"
              className={`
                ${colorVariants({ bg: 'gray-50' })} 
                ${colorVariants({ color: 'gray-300' })} 
                ${typographyVariants({ variant: 'b2-md' })} 
                flex 
                w-[248px] 
                h-[40px] 
                px-[12px] 
                py-[11px] 
                items-center 
                gap-[10px] 
                flex-shrink-0 
                rounded-[6px] 
                border-[1px] 
                border-[var(--gray-300,#E0E0E0)] 
                ${error ? '!outline-[1px] !outline-[#ff0000] !outline-none' : ''}
                `}              
              
            />

          </div>
          <Button label={buttonText}
                size={'participate'} 
                additionalClass=
                '!mt-[28px]  items-center !transform-none'        
            />  
         </form>

      </div>
      {responseMessage && (
              <p className={`
                ${colorVariants({ color: 'red-300' })} 
                ${typographyVariants({ variant: 'b2-md' })} 
                bg-transparent
                p-2
                `}>
                {responseMessage}
              </p>
            )}
    </div>
  );
};

export default Invite;
