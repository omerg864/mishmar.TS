import React, { lazy, useEffect, useState } from 'react';
import './App.css';
import './Calendar.css';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Manager = lazy(() => import('./pages/Manager'));
const Header = lazy(() => import('./components/Header'));
const Schedules = lazy(() => import('./pages/Schedules'));
const ScheduleUpdate = lazy(() => import('./pages/ScheduleUpdate'));
const ScheduleNew = lazy(() => import('./pages/ScheduleNew'));
const Structures = lazy(() => import('./pages/Structures'));
const Shift = lazy(() => import('./pages/Shift'));
const ScheduleShift = lazy(() => import('./pages/ScheduleShift'));
const ScheduleShiftUser = lazy(() => import('./pages/ScheduleShiftUser'));
const Events = lazy(() => import('./pages/Events'));
const Posts = lazy(() => import('./pages/Posts'));
const PostEdit = lazy(() => import('./pages/PostEdit'));
const PostNew = lazy(() => import('./pages/PostNew'));
const Users = lazy(() => import('./pages/Users'));
const Quality = lazy(() => import('./pages/Quality'));
const EmailPassword = lazy(() => import('./pages/EmailPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const ScheduleView = lazy(() => import('./pages/ScheduleView'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Settings = lazy(() => import('./pages/Settings'));
const ScheduleTable = lazy(() => import('./pages/ScheduleTable'));
const Page404 = lazy(() => import('./pages/Page404'));


function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [manager, setManager] = useState<boolean>(false);
  const [settingsChange, setSettingsChange] = useState<boolean>(false);


  return (
    <>
      <Header authenticated={authenticated} settingsChange={settingsChange} setAuthenticated={setAuthenticated} manager={manager} setManager={setManager} />
      <ToastContainer rtl={true} theme="colored" />
      <Routes>
        <Route path="/" element={<Home authenticated={authenticated} />} />
        <Route path="/login" element={<Login authenticated={authenticated} setAuthenticated={setAuthenticated} setManager={setManager} />} />
        <Route path="/register" element={<Register authenticated={authenticated} />} />
        <Route path="/management" element={<Manager manager={manager} />} />
        <Route path="/schedules" element={<Schedules manager={manager} />} />
        <Route path="/schedule/new" element={<ScheduleNew manager={manager} />} />
        <Route path="/schedule/:id/update" element={<ScheduleUpdate manager={manager} />} />
        <Route path="/structure" element={<Structures manager={manager} />} />
        <Route path="/shift" element={<Shift authenticated={authenticated} />} />
        <Route path="/schedule/:id/shifts" element={<ScheduleShift manager={manager} />} />
        <Route path="/schedule/:id/table" element={<ScheduleTable manager={manager} />} />
        <Route path="/schedule/:id/view" element={<ScheduleView authenticated={authenticated} />} />
        <Route path="/shift/schedule/:scheduleId/user/:userId" element={<ScheduleShiftUser manager={manager} />} />
        <Route path="/events" element={<Events manager={manager} />} />
        <Route path="/posts" element={<Posts authenticated={authenticated} />} />
        <Route path="/post/:id" element={<PostEdit manager={manager} />} />
        <Route path="/post/new" element={<PostNew manager={manager} />} />
        <Route path="/users" element={<Users manager={manager} />} />
        <Route path="/users/quality" element={<Quality manager={manager} />} />
        <Route path="/password/reset/email" element={<EmailPassword authenticated={authenticated} />} />
        <Route path="/password/reset/:reset_token" element={<ResetPassword authenticated={authenticated} />} />
        <Route path="/profile" element={<Profile authenticated={authenticated} />} />
        <Route path="/schedule" element={<ScheduleView authenticated={authenticated} />} />
        <Route path="/settings" element={<Settings settingsChange={settingsChange} setSettingsChange={setSettingsChange} manager={manager} />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </>
  );
}

export default App;
