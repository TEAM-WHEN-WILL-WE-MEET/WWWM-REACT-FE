// Invite.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { typographyVariants } from '../styles/typography.ts';
import { colorVariants, colors } from '../styles/color.ts';
import { cn } from '../utils/cn'; 
import { Button } from '../components/Button.tsx';
import { Helmet } from 'react-helmet-async';
import './invite.css';
import { AnimatePresence, motion } from 'framer-motion';
import Loading from "../components/Loading";
import CryptoJS from 'crypto-js';
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
  const [autoLogin, setAutoLogin] = useState(false);

  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState(false);
  const [touched, setTouched] = useState(false); 
  const [showToast, setShowToast]=useState(false);
  const [buttonText, setButtonText] = useState('회원가입');
  const [isChecked, setIsChecked] = useState(false);
  const [isVisuallyChecked, setIsVisuallyChecked] = useState(false);

  //form 유효한지 검사
  const isFormValid = name.trim().length > 0 && password.trim().length > 0 && !responseMessage;

  
  const secretKey = 'mySecretKey';

 // 로컬 스토리지에서 암호화된 name과 password를 불러와 복호화 후 state에 할당 및 autoLogin 플래그 설정
 useEffect(() => {
  const storedNameCipher = localStorage.getItem(`name_${appointmentId}`);
  const storedPWCipher = localStorage.getItem(`password_${appointmentId}`);
  if (storedNameCipher && storedPWCipher) {
    const bytesName = CryptoJS.AES.decrypt(storedNameCipher, secretKey);
    const decryptedName = bytesName.toString(CryptoJS.enc.Utf8);
    const bytesPW = CryptoJS.AES.decrypt(storedPWCipher, secretKey);
    const decryptedPW = bytesPW.toString(CryptoJS.enc.Utf8);
    if (decryptedName && decryptedPW) {
      setName(decryptedName);
      setPassword(decryptedPW);
      setAutoLogin(true); // 암호화된 값이 있으면 자동 로그인 진행
    }
  }
}, [appointmentId, secretKey]);

    // 자동 로그인 실행: 폼 채워지면 handleSubmit 자동 호출
  useEffect(() => {
    if (autoLogin && name && password) {
      // synthetic event: preventDefault 호출 가능한 객체 전달
      handleSubmit({ preventDefault: () => {} });
      setAutoLogin(false); // 한 번 실행 후 재실행 방지
    }
  }, [autoLogin, name, password]);

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
          setShowToast(true);
            // console.log("response: ", responseData);
            const appointmentResponse = await fetch(
              `${BASE_URL}/appointment/getAppointment?appointmentId=${appointmentId}`
            ); 
            
            //백엔드 ver2 붙이고  토큰 도입시 다시 아래 로직으로 롤백할 수 있으므로, 아직은은 남겨두겠음음
              // 사용자 이전 로그인 여부를 flag로 localStorage에 저장,
              //  appointmentId와 쌍으로 저장해 정확히 일치할때만 재로그인으로 간주
            if (responseData.object.name) {
              localStorage.setItem(`loggedInFlag_${appointmentId}`, 'true');
              localStorage.setItem(
                `name_${appointmentId}`, 
                CryptoJS.AES.encrypt(data.name, secretKey).toString()
              );
              localStorage.setItem(
                `password_${appointmentId}`, 
                CryptoJS.AES.encrypt(data.password, secretKey).toString()
              );
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
              navigate('/eventCalendar', { state: { responseData, appointmentId, userName: name } });
            } else {
              setResponseMessage('사용자 스케줄을 가져오는데 실패했습니다.');
            }
          } else {
            setResponseMessage( '위 이름으로 설정했던 비밀번호를 입력해주세요.');
          }
      } catch(error) {
        console.error('Error:', error);
        setResponseMessage('서버 오류가 발생했습니다.');
      }
    }
 };   

 
 const inputClasses = (isEmpty, hasError) => 
  cn(
    "flex w-96 h-16 px-5 py-4",
    "items-center flex-shrink-0 rounded-lg",
    "border border-gray-300",
    typographyVariants({ variant: 'b2-md' }),
    {
      'input-empty': isEmpty,
      'input-filled': !isEmpty,
      'outline outline-1 outline-red-500 outline-offset-0': hasError
    }
  );
 
 return (
  <>
  <Helmet>
    <title>언제볼까?</title>
    <meta
      name="description"
      content="언제볼까?와 함께 약속방을 링크 공유로 초대하세요. 공유만 하면 끝, 간편한 친구 초대!"
    />
  </Helmet>
  <div className="flex px-[2rem] justify-between  items- h-[80rem] bg-[var(--white)] flex-col ">
    <div className='flex flex-col justify-center '>
    <img 
        src="/home_noPadding.svg" 
        className="hover:cursor-pointer items-start mt-[1.6rem] w-[2.4rem] h-[2.4rem]"
        alt="홈으로 돌아가기"
        onClick={() => navigate('/MonthView')} 
     />
    <div className={
      cn(typographyVariants({ variant: 'h1-sb' }), colorVariants({ color: 'gray-900' }),
      `!text-[2rem] !items-start !w-full mt-[2.3rem] `  )}>
      <div className={`
      !text-left
      !self-start
      `}>
        이 캘린더에 참여하려면
      </div>
      <div className={`
      !text-left
      !self-start
      `}>
        아래 정보를 입력해주세요.
      </div>
    </div>
   
    <div className={`
      ${colorVariants({ bg: 'white' })} 
      ${colorVariants({ color: 'gray-800' })} 
      w-[32rem] 
      mt-[3.2rem]
      items-center
      
      flex
      flex-col
      !gap-y-[2rem]
    `}>
      <form 
        onSubmit={handleSubmit}   
        className="flex flex-col items-center justify-center w-full !h-auto flex gap-y-[2rem]"
      >
        <div className=" flex flex-col ">
          <label 
            htmlFor="name"
            className={`
              ${typographyVariants({ variant: 'd1-sb' })} 
              ${colorVariants({ color: 'gray-800' })} 
              tracking-[-0.3px]
              p-0
              !text-[var(--font-size-12)]
            `}
          >
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)} // input을 떠날 때 touched 활성화
            onFocus={() => setTouched(true)} // input을 클릭했을 때 touched 활성화
            className={`
              border
              border-[var(--gray-300,#E0E0E0)] 
              ${!name
              ? `
                placeholder-[var(--gray-700,#E0E0E0)] 
                `
              : ` 
                placeholder-[var(--gray-900,#E0E0E0)] 
                `
            }
          ${typographyVariants({ variant: 'b2-md' })} 
          flex 
          w-[32rem] 
          px-[0.4rem] 
          py-[1.2rem] 
          items-center 
          gap-[1rem] 
          flex-shrink-0
          border-[var(--white)] 
          border-b-[var(--gray-300,#E0E0E0)] 
            ${touched && (!name || name.trim().length === 0) ? '!border-b-[var(--red-300)]' : ''}
            `}
            placeholder="참여자 이름"
            aria-label="참여자 이름 작성란"
          />
          {touched &&(!name || name.trim().length === 0) && (
            <p className={`
              ${colorVariants({ color: 'red-300' })} 
              ${typographyVariants({ variant: 'b2-md' })} 
              bg-transparent
              pt-[0.8rem]
              pl-[0.4rem]
            `}
              aria-live="assertive" //에러 메시지가 발생하자마자 스크린 리더가 바로 내용을 읽음
            >
             이름을 1자 이상 입력해주세요.
            </p>
          )}
        </div>
        <div className="">
          <label 
            htmlFor="password"   
            className={`
              ${typographyVariants({ variant: 'd1-sb' })} 
              ${colorVariants({ color: 'gray-800' })} 
              tracking-[-0.3px]
              p-0
            `}
          >
          </label>
  
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="내 비밀번호 설정"
            className={`
                  border
                  border-[var(--gray-300,#E0E0E0)] 
                  ${!password
                  ? `
                    placeholder-[var(--gray-700,#E0E0E0)] 
                    `
                  : ` 
                    placeholder-[var(--gray-900,#E0E0E0)] 
                    `
                }
              ${typographyVariants({ variant: 'b2-md' })} 
              flex 
              w-[32rem] 
              h-[4rem] 
              px-[0.4rem] 
              py-[1.2rem] 
              items-center 
              gap-[1rem] 
              flex-shrink-0
              border-[var(--white)] 
              border-b-[var(--gray-300,#E0E0E0)] 
              ${responseMessage ? '!  !border-b-[var(--red-300)] ' : ''}
            `}              
            aria-label="참여자 비밀번호 작성란"
          />
          {responseMessage && (
            <p className={`
              ${colorVariants({ color: 'red-300' })} 
              ${typographyVariants({ variant: 'b2-md' })} 
              bg-transparent
              pt-[0.8rem]
              pl-[0.4rem]
            `}
              aria-live="assertive" //에러 메시지가 발생하자마자 스크린 리더가 바로 내용을 읽음
            >
              {responseMessage}
            </p>
          )}
        </div>
        
        
      </form>
      <div className="w-full flex flex-col !items-end !justify-end  ">
        <input 
          type="checkbox" 
          id="Keep-logged-in" 
          className="invite-screen-reader" 
          checked={isVisuallyChecked || isChecked}
          onChange={(e) => {
            setIsChecked(e.target.checked);
            setIsVisuallyChecked(e.target.checked); 
          }}   
        />
        <div className="invite-label-box">
          <label 
            htmlFor="Keep-logged-in" 
            className={`${typographyVariants({ variant: 'b2-md' })} 
            !text-[1.4rem]
            ${(isVisuallyChecked || isChecked) ? colorVariants({ color: 'gray-900' }) : colorVariants({ color: 'gray-700' })}`}
          >  
            <span className="invite-check-icon" aria-hidden="true"></span>
            로그인 유지하기
          </label>
        </div>
      </div>

    </div>
    </div>
    <div className="">
    <AnimatePresence>
            {showToast && (
              <motion.div 
                className="  mb-[1.6rem] left-0 right-0 flex justify-center "
                initial={{ y: '800%' }}
                animate={{ y: 0 }}
                exit={{ y: '400%' }}
                transition={{ duration: 0.01, ease: 'easeOut' }}
              >
                <Button 
                  label="로그인 성공!" 
                  size={'toast'}
                  // onClick={handleSaveClick} 
                  additionalClass={`
                    z-50 pointer-events-none 
                    py-[0.8rem]
                    px-[1.2rem]
                    rounded-[0.8rem] border !bg-white,
                    !text-[var(--blue-400)]
                    border-[var(--blue-300)]
                    shadow-[0px_0px_8px_0px_var(--blue-100)]
                    ${typographyVariants({ variant: "d1-sb" })}, 
                    text-center tracking-[-0.3px]
                    !text-[1.2rem]
                    gap-[0.4rem]
                     !justify-end
                     !items-center
                    w-[10.1rem]
                    h-[3.2rem]
                    whitespace-nowrap
                    `
                  }
                >
                  <img src="check_blue.svg" alt="체크모양 아이콘" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

    <Button 
          label={buttonText}
          size={'XL'} 
          disabled={!isFormValid}  // 폼이 유효하지 않으면 버튼 비활성화
          onClick={handleSubmit}
          additionalClass={` 
            ${colorVariants({ bg: 'blue-400' })} !text-[var(--white)] !mb-[4rem]  items-center !transform-none`}  
          a
          ria-label="새로 참여하기 버튼"      
    />  
    </div>
    
  </div>
  </>
 );
};

export default Invite;
