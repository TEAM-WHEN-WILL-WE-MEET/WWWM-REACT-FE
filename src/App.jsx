import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import EventCalendar from "./features/calendar/pages/EventCalendar";
import CreateCalendar from "./features/calendar/pages/CreateCalendar";
import GetAppointmentRedirect from "./features/calendar/pages/GetAppointmentRedirect";
import IndividualCalendar from "./features/calendar/pages/IndividualCalendar";
import LandingPage from "./components/LandingPage";
import Menu from "./features/layout/components/Menu";

import EditProfile from "./features/user/pages/EditProfile";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import KakaoCallback from "./features/auth/pages/KakaoCallback";
import AppointmentNameInput from "./components/AppointmentNameInput";
import TimeSelectionModal from "./components/TimeSelectionModal";


// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        // 토큰이 없으면 로그인 페이지로 리다이렉트
        const currentPath = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?redirect=${currentPath}`, { replace: true });
        return;
      }

      // 토큰이 있으면 서버에서 유효성 검증
      try {
        const BASE_URL = import.meta.env.PROD
          ? import.meta.env.VITE_WWWM_BE_ENDPOINT
          : import.meta.env.VITE_WWWM_BE_DEV_EP;

        const trimmedToken = token?.trim();
        let authToken;
        if (trimmedToken?.startsWith("Bearer")) {
          authToken = trimmedToken?.startsWith("Bearer ") 
            ? trimmedToken 
            : trimmedToken?.replace("Bearer", "Bearer ");
        } else {
          authToken = `Bearer ${trimmedToken}`;
        }

        const response = await fetch(`${BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            Authorization: authToken,
            "Cache-Control": "no-cache",
          },
        });

        if (response.status === 401 || response.status === 403) {
          // 토큰이 만료되었거나 유효하지 않음
          localStorage.removeItem("authToken");
          const currentPath = encodeURIComponent(location.pathname + location.search);
          navigate(`/login?redirect=${currentPath}`, { replace: true });
        }
      } catch (error) {
        // 네트워크 오류 등은 무시하고 계속 진행 (사용자가 오프라인일 수 있음)
      }
    };

    checkAuthStatus();
  }, [navigate, location]);

  const token = localStorage.getItem("authToken");
  if (!token) {
    return null; // 리다이렉트가 처리되는 동안 아무것도 렌더링하지 않음
  }

  return children;
};

// Legacy invite route redirect component
const InviteRedirect = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const appointmentId = urlParams.get("appointmentId");
  
  if (appointmentId) {
    return <Navigate to={`/getAppointment?appointmentId=${appointmentId}`} replace />;
  }
  
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/MonthView" element={<ProtectedRoute><CreateCalendar /></ProtectedRoute>} />
          <Route path="/getAppointment" element={<GetAppointmentRedirect />} />
          <Route path="/invite" element={<InviteRedirect />} />
          <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />

          <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
          <Route path="/eventCalendar" element={<EventCalendar />} />
          <Route path="/individualCalendar" element={<IndividualCalendar />} />
          <Route path="/appointment-name" element={<AppointmentNameInput />} />
          <Route path="/time-modal" element={<TimeSelectionModal />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
