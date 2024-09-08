import React, { useState } from 'react';
import './invite.css'; 

const Invite = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim() === '') {
      setError(true); // 패스워드가 비어 있을 때 에러 처리
    } else {
      setError(false);
      // 제출 처리 로직 작성 (서버로 전송 등)
      console.log("참여자 이름:", name);
      console.log("패스워드:", password);
    }
  };
  return (
    <div className="modal">
    <div className='modal-header'>
        9월 동아리 정기회의    
        <img src="exitBtn.svg" className="inviteExit"/>
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
            <label htmlFor="password" className='invite-user-pw'>패스워드</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={error ? '패스워드를 입력해주세요' : '패스워드를 입력해주세요'}
              className={error ? 'errorPW' : ''}
            />
          </div>
          <button type="submit" className="submit-button">참여하기</button>
        </form>
      </div>
    </div>
  );
};

export default Invite;
