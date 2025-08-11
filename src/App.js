import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
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
          <Route path="/MonthView" element={<CreateCalendar />} />
          <Route path="/getAppointment" element={<GetAppointmentRedirect />} />
          <Route path="/invite" element={<InviteRedirect />} />
          <Route path="/menu" element={<Menu />} />

          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
          <Route path="/eventCalendar" element={<EventCalendar />} />
          <Route path="/individualCalendar" element={<IndividualCalendar />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
