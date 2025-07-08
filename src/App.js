import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { StagewiseToolbar } from "@stagewise/toolbar-react";
import { ReactPlugin } from "@stagewise-plugins/react";
import "./App.css";
import Invite from "./features/invite/pages/Invite";
import EventCalendar from "./features/calendar/pages/EventCalendar";
import CreateCalendar from "./features/calendar/pages/CreateCalendar";
import GetAppointmentRedirect from "./features/calendar/pages/GetAppointmentRedirect";
import IndividualCalendar from "./features/calendar/pages/IndividualCalendar";
import LandingPage from "./components/LandingPage";
import Menu from "./pages/menu";

function App() {
  return (
    <Router>
      <div className="App">
        <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/MonthView" element={<CreateCalendar />} />
          <Route path="/getAppointment" element={<GetAppointmentRedirect />} />
          <Route path="/invite" element={<Invite />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/eventCalendar" element={<EventCalendar />} />
          <Route path="/individualCalendar" element={<IndividualCalendar />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
