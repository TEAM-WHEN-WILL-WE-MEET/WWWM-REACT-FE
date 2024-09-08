import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const Header = () => (
  <header className="landing-header">
    <img src="/logo_ci.svg" alt="CI 로고" className="ci-logo" />
  </header>
);

const Problem = () => (
  <section className="problem">
    <div className="problem-logo-div"></div>
    <h3>다들 한번쯤 이런 적 있으시죠? 😫</h3>
    <p>카톡에서 "언제 괜찮아요?" 무한 반복하기</p>
    <p>매번 지겹게 캘린더 스크린샷 올리기</p>
    <p>투표 만들고 결과 정리하느라 시간 쓰기</p>
  </section>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card">
    <span className="feature-icon">{icon}</span>
    <h4>{title}</h4>
    <p>{description}</p>
  </div>
);

const Features = () => (
  <section className="features">
    <h3>이렇게 해결해 드려요! 💪</h3>
    <FeatureCard
      icon="🚀"
      title="원터치
       약속방 생성"
      description="클릭 한 번으로 약속 잡기 시작!"
    />
    <FeatureCard
      icon="🔗"
      title="링크 공유로 초대"
      description="공유만 하면 끝, 간편한 친구 초대!"
    />
    <FeatureCard
      icon="👀"
      title="실시간 가능 시간 체크"
      description="모두의 시간을 한눈에 확인!"
    />
    <FeatureCard
      icon="🎯"
      title="자동 결과 정리"
      description="최적의 시간을 척척 찾아드려요!"
    />
    <FeatureCard
      icon="🔒"
      title="프라이버시 보장"
      description="안전하게 약속 잡고 자동 삭제, 걱정 끝!"
    />
  </section>
);

const Hero = () => (
  <section className="hero">
    <p>이제는 쉽고 빠르게 약속을 잡아보세요!</p>
    <Link to="/main" className="cta-button">시작하기</Link>
  </section>
);


const Team = () => (
  <section className="team">
    <h3>팀 소개</h3>
    <div className="team-content">
      <h4>약속 잡기 힘들었던 사람들이 만든 서비스</h4>
      <p>회의, 팀플, 동아리 활동...</p>
      <p>많은 상황에서 매번 약속 잡기가 힘들었죠</p>
      <p>이러한 경험을 가진 사람들이 모여</p>
      <p>“언제볼까?”가 탄생하게 되었습니다.</p>
    </div>
    <br/>
    <div className="team-content">
      <p>🧑‍💻민상연 (Team Lead): BE/Infra 개발</p>
      <p>👩‍💻이현주 (FE Dev): FE 개발, 배포</p>
      <p>👩‍🎨이시은 (Designer): 웹 버전 디자인</p>
      <p>👩‍🎨장연우 (Designer): 모바일 버전 디자인</p>
    </div>
    <br/>
    <p>저희의 목표는 약속 상황의 불편함을 해결하고</p>
    <p>더 많은 만남과 추억을 만들 수 있도록 돕는 것!</p>
  </section>
);

const Footer = () => (
  <footer className="landing-footer">
    <p className="footer-cta">함께해요! 그래서 우리, 언제 만나볼까요? 😉</p>
    <Link to="/main" className="cta-button">시작하기</Link>
  </footer>
);

const LandingPage = () => (
  <div className="landing-page">
    <Header />
    <main>
      <Problem />
      <Features />
      <Team />
    </main>
    <Footer />
  </div>
);

export default LandingPage;