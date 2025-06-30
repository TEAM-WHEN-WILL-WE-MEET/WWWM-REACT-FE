import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { StagewiseToolbar } from "@stagewise/toolbar-react";
import { ReactPlugin } from "@stagewise-plugins/react";
import "./App.css";
import Invite from "./pages/invite";
import EventCalendar from "./pages/eventCalendar";
import ParentMonth from "./pages/ParentMonth";
import GetAppointmentRedirect from "./pages/GetAppointmentRedirect";
import IndividualCalendar from "./pages/individualCalendar";
import MyPage from "./pages/MyPage";
import AccountManagement from "./pages/AccountManagement";
import LandingPage from "./components/LandingPage";
import Menu from "./pages/menu";

function App() {
  return (
    <>
      <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/MonthView" element={<ParentMonth />} />
            <Route
              path="/getAppointment"
              element={<GetAppointmentRedirect />}
            />
            <Route
              path="/invite"
              element={
                <>
                  {" "}
                  <Invite />{" "}
                </>
              }
            />
            <Route
              path="/menu"
              element={
                <>
                  {" "}
                  <Menu />{" "}
                </>
              }
            />
            <Route
              path="/eventCalendar"
              element={
                <>
                  {" "}
                  <EventCalendar />{" "}
                </>
              }
            />
            <Route
              path="/individualCalendar"
              element={
                <>
                  <IndividualCalendar />
                </>
              }
            />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/account-management" element={<AccountManagement />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
