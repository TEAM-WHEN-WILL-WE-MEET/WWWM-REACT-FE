// Invite.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './invite.css';

const Invite = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const location = useLocation();
  
  // URL에서 appointmentId 추출
  const queryParams = new URLSearchParams(location.search);
  const appointmentId = queryParams.get('appointmentId') || '66c4948d11c1407794fb5c22'; // 기본값 설정

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.trim() === '') {
      setError(true); // 패스워드가 비어 있을 때 에러 처리
    } else {
      setError(false);
      // 서버로 POST 요청 보내기
      const data = {
        name: name,
        password: password,
        appointmentId: appointmentId,
      };
      console.log("데이터~~~",data);
      try {
        const response = await fetch('http://localhost:8080/api/v1/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          // 로그인 성공 시 처리
          setResponseMessage('로그인 성공!');

          // appointment 데이터 가져오기
          const appointmentResponse = await fetch(
            `http://localhost:8080/api/v1/appointment/getAppointment?appointmentId=${appointmentId}`
          );

          if (appointmentResponse.ok) {
            const appointmentData = await appointmentResponse.json();

            // eventCalendar 페이지로 이동하면서 데이터 전달
            navigate('/eventCalendar', { state: { responseData: appointmentData } });
          } else {
            setResponseMessage('약속 정보를 가져오는데 실패했습니다.');
          }
        } else {
          // 로그인 실패 시 처리
          setResponseMessage('로그인 실패: 이름이나 패스워드를 확인하세요.');
        }
      } catch (error) {
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
        {/* 서버 응답 메시지 표시 */}
        {responseMessage && <p>{responseMessage}</p>}
      </div>
    </div>
  );
};

export default Invite;
