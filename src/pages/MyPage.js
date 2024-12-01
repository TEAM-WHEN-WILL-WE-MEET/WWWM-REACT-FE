import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

const MyPage = () => {
  const navigate = useNavigate();

  const menuItems = [
    { title: '9월 참여한 참가캘린더' },
    { title: '8월 참여한 참가캘린더' },
    { title: '이벤트 1' },
    { title: '이벤트 2' }
  ];

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <button 
          onClick={() => navigate(-1)}
          className="close-button"
        >
          ×
        </button>
      </div>
    <div className='mypage-title'>
        내 공유 캘린더
    </div>
      <div className="menu-list">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="menu-item"
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="bottom-buttons">
        <button 
            className="account-button"
            onClick={() => navigate('/account-management')}
        >
          계정 관리
        </button>
        <button className="logout-button">
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default MyPage;