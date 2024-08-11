import React, { useEffect, useState } from 'react';
import './App.css';
import './Calendar.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Manager from './pages/Manager';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Header from './components/Header'
import Schedules from './pages/Schedules';
import ScheduleUpdate from './pages/ScheduleUpdate';
import ScheduleNew from './pages/ScheduleNew';
import Structures from './pages/Structures';
import Shift from './pages/Shift';
import ScheduleShift from './pages/ScheduleShift';
import ScheduleShiftUser from './pages/ScheduleShiftUser';
import Events from './pages/Events';
import Posts from './pages/Posts';
import PostEdit from './pages/PostEdit';
import PostNew from './pages/PostNew';
import Users from './pages/Users';
import Quality from './pages/Quality';
import EmailPassword from './pages/EmailPassword';
import Profile from './pages/Profile';
import ScheduleView from './pages/ScheduleView';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings';
import ScheduleTable from './pages/ScheduleTable';
import Page404 from './pages/Page404';
import Salary from './pages/Salary';
import { GoogleOAuthProvider } from '@react-oauth/google';


function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [manager, setManager] = useState<boolean>(false);
  const [settingsChange, setSettingsChange] = useState<boolean>(false);


  return (
    <>
      <Header authenticated={authenticated} settingsChange={settingsChange} setAuthenticated={setAuthenticated} manager={manager} setManager={setManager} />
      <ToastContainer rtl={true} theme="colored" />
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID as string}>
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
        <Route path="/salary" element={<Salary authenticated={authenticated} />} />
        <Route path="/settings" element={<Settings settingsChange={settingsChange} setSettingsChange={setSettingsChange} manager={manager} />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
      </GoogleOAuthProvider>
    </>
  );
}

export default App;
