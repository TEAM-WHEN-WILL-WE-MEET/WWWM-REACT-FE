import React, { useState, useEffect } from 'react';
import './AccountManagement.css';

const AccountManagement = () => {
  const [formData, setFormData] = useState({
    name: '',
    password: ''
  });

  // 버튼 활성화 상태 관리
  const [isButtonActive, setIsButtonActive] = useState(false);

  // 비밀번호 길이를 체크하여 버튼 활성화 상태 업데이트
  useEffect(() => {
    setIsButtonActive(formData.password.length >= 10);
  }, [formData.password]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isButtonActive) {
      // 저장하기 로직 구현
    }
  };


  return (
    <div className="account-container">
      <div className="account-header">
        <button 
          onClick={() => window.history.back()}
          className="back-button"
        >
          &#8249;
        </button>
        <h1 className="header-title">계정 관리</h1>
      </div>

      <form onSubmit={handleSubmit} className="account-form">
        <div className="form-group">
          <label className="input-label">이름</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="input-field"
            placeholder="Username"
          />
        </div>

        <div className="form-group">
          <label className="input-label">비밀번호</label>
          <input
            type="password"
            value={formData.password}
            className="input-field"
            onChange={(e) => setFormData({...formData, password: e.target.value})}   
            placeholder="********"
          />
        </div>

        <button type="submit"
         className={`save-button ${isButtonActive ? 'active' : ''}`}
         disabled={!isButtonActive}     
         >
          저장하기
        </button>
      </form>
    </div>
  );
};

export default AccountManagement;