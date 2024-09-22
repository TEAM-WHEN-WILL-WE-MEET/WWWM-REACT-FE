import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import MonthView from "./pages/MonthView";
import WeekView from "./pages/WeekView";
import Invite from "./pages/invite";
import EventCalendar from "./pages/eventCalendar";


import LandingPage from "./pages/LandingPage";
import TimePicker from './components/TimePicker';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/MonthView" 
            element={<> 
            <MonthView /> <TimePicker /> 
            </>} 
          />
          <Route path="/WeekView" 
            element={<> 
            <WeekView /> <TimePicker /> 
            </>} 
          />
         
          <Route path="/invite" 
            element={<> 
            <Invite /> 
            </>} 
          />
          <Route path="/eventCalendar" 
            element={<> 
            <EventCalendar /> 
            </>} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;