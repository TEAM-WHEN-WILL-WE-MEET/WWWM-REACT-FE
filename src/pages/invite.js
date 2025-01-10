// Invite.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './invite.css';

const Invite = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const appointmentId = queryParams.get('appointmentId');
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState(false);

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
        const response = await fetch('http://localhost:8080/api/v1/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
 
        if (response.ok) {
          setResponseMessage('로그인 성공!');
          const userScheduleResponse = await fetch(
            `http://localhost:8080/api/v1/schedule/getUserSchedule?appointmentId=${appointmentId}&userName=${name}`,
            {
              method: 'GET',
              headers: {
                'Cache-Control': 'no-cache'
              }
            }
          );
 
          let responseData;
 
          if (userScheduleResponse.ok) {
            const userScheduleData = await userScheduleResponse.json();
            console.log('invite.js, 유저 개인 스케?줄정보:', userScheduleData);
            
            const appointmentResponse = await fetch(
              `http://localhost:8080/api/v1/appointment/getAppointment?appointmentId=${appointmentId}`
            ); 
              if (appointmentResponse.ok) {
                const appointmentData = await appointmentResponse.json();
                // console.log("저쪽 invite.js 신사 분이 보내주신 appointmentData입니다다: ", appointmentData);

                //재로그인 case
                if (userScheduleData.object && userScheduleData.object.length > 0) {
                  // responseData = userScheduleData;
                  // responseData.firstLogin = false;
                  console.log("재로그인이네?");
                  // console.log("응답데이터::: ", responseData);
                  // console.log("약속id:", appointmentId);
                  // console.log("재로그인한 사용자 이름", name);
                  responseData = {
                    ...appointmentData,
                    userSchedule: userScheduleData.object,
                    firstLogin: false
                  };
                  
                  console.log("(((재로그인))))저쪽 invite.js 신사 분이 보내주신 재로그인시의 responseData 구조:", {
                    ...appointmentData,
                    userSchedule: userScheduleData.object,
                    firstLogin: false
                });
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
            setResponseMessage('로그인 실패: 이름이나 패스워드를 확인하세요.');
          }
      } catch(error) {
        console.error('Error:', error);
        setResponseMessage('서버 오류가 발생했습니다.');
      }
    }
 };   

 
 
  return (
    <div className="modal">
      <div className="modal-header">
        9월 동아리 정기회의
        <img src="exitBtn.svg" alt="Exit" className="inviteExit" />
      </div>
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name" className="invite-user-name">참여자 이름</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해주세요"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password" className="invite-user-pw">패스워드</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="패스워드를 입력해주세요"
              className={error ? 'errorPW' : ''}
              required
            />
          </div>
          <button type="submit" className="submit-button">참여하기</button>
        </form>
        {responseMessage && <p>{responseMessage}</p>}
      </div>
    </div>
  );
};

export default Invite;
