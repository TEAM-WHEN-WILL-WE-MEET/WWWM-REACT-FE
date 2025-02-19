import React from 'react';
import { BrowserRouter as Router, Route, Routes  } from 'react-router-dom';
import './App.css';
import Invite from "./pages/invite";
import EventCalendar from "./pages/eventCalendar";
import ParentMonth from './pages/ParentMonth';
import GetAppointmentRedirect from './pages/GetAppointmentRedirect';
import IndividualCalendar from './pages/individualCalendar';
import MyPage from './pages/MyPage';
import LandingPage from "./components/LandingPage";
import { Helmet } from 'react-helmet-async';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/MonthView" element={<ParentMonth />} />
          <Route path="/getAppointment" element={<GetAppointmentRedirect />} />   
          <Route path="/invite"   element={<> <Invite /> </>} />
          <Route path="/eventCalendar" element={<> <EventCalendar /> </>} />
          <Route path="/individualCalendar" element={<><IndividualCalendar /></>}/>  
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;