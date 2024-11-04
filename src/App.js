import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate  } from 'react-router-dom';
import './App.css';
import MonthView from "./pages/MonthView";
import WeekView from "./pages/WeekView";
import Invite from "./pages/invite";
import EventCalendar from "./pages/eventCalendar";
import ParentMonth from './pages/ParentMonth';
import GetAppointmentRedirect from './pages/GetAppointmentRedirect';
import IndividualCalendar from './pages/individualCalendar';

import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* <Route path="/MonthView" 
            // element={<> 
            // <MonthView /> <TimePicker /> 
            // </>}  */}
            <Route path="/MonthView" element={<ParentMonth />} />
          
          {/* <Route path="/WeekView" 
            element={<> 
            <WeekView /> <TimePicker /> 
            </>} 
          /> */}
         
          {/* <Route path="/invite" 
            element={<> 
            <Invite /> 
            </>} 
          /> */}

          {/* <Route path="/invite" component={InvitePage} /> */}
          {/* <Route path="/getAppointment" element={<Navigate to="/invite" replace />} /> */}

          {/* <Route path="/getAppointment" element={<Navigate to={`/invite${window.location.search}`} replace />} /> */}
          <Route path="/getAppointment" element={<GetAppointmentRedirect />} />

         
          <Route path="/invite"   element={<> <Invite /> </>} />

          <Route path="/eventCalendar" element={<> <EventCalendar /> </>} />
          <Route path="/individualCalendar" element={<><IndividualCalendar /></>}/>  
          {/* ? */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;