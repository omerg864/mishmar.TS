import React, { useEffect, useState } from 'react';
import './App.css';
import './Calendar.css';
import { Routes, Route } from'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Manager from './pages/Manager';
import {ToastContainer} from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Header from './components/Header'
import Schedules from './pages/Schedules';
import ScheduleUpdate from './pages/ScheduleUpdate';
import ScheduleNew from './pages/ScheduleNew';
import Structures from './pages/Structures';


function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [manager, setManager] = useState<boolean>(false);

  useEffect(() => {

  }, [])
  return (
    <>
    <Header authenticated={authenticated} setAuthenticated={setAuthenticated} manager={manager} setManager={setManager}/>
    <ToastContainer theme="colored"/>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login authenticated={authenticated} setAuthenticated={setAuthenticated} setManager={setManager}/>} />
      <Route path="/register" element={<Register authenticated={authenticated} />} />
      <Route path="/management" element={<Manager manager={manager}/>} />
      <Route path="/schedules" element={<Schedules manager={manager}/>} />
      <Route path="/schedule/new" element={<ScheduleNew manager={manager}/>} />
      <Route path="/schedule/:id/update" element={<ScheduleUpdate manager={manager}/>} />
      <Route path="/structure" element={<Structures manager={manager}/>} />
    </Routes>
    </>
  );
}

export default App;