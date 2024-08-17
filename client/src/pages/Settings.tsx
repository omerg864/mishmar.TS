import { Button, Box, Paper, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import { Settings } from '../types/types';
import Cookies from 'universal-cookie';

interface IProps {
    setSettingsChange: React.Dispatch<React.SetStateAction<boolean>>;
    settingsChange: boolean;
}

const SettingsPage = (props: IProps) => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [settings, setSettings] = useState<Settings>({} as Settings);
    const cookies = new Cookies();


    const getSettings = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') }})
          const data = await response.json();
          if (data.error || data.statusCode) {
            fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `settings`, component: "Settings" })})
            toast.error(data.message);
          } else {
            setSettings(data);
          }
        } catch (err) {
          fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `settings`, component: "Settings" })})
          toast.error("Internal Server Error");
        }
        setIsLoading(false);
    }

    const saveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') }, 
            method: 'PATCH', body: JSON.stringify(settings)})
          const data = await response.json();
          if (data.error || data.statusCode) {
            fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `settings`, component: "Settings" })})
            toast.error(data.message);
          } else {
            toast.success("הגדרות נשמרו");
            props.setSettingsChange(!props.settingsChange);
          }
        } catch (err) {
          fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `settings`, component: "Settings" })})
          toast.error("Internal Server Error");
        }
        setIsLoading(false);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({...settings, [e.target.name]: e.target.value })
      }

    useEffect(() => {
      getSettings();
    }, []);


    if (isLoading) {
        return <Spinner />;
    }

  return (
    <main>
        <h1>הגדרות</h1>
        <Box className='box-container' component={Paper}>
            <form className='box-container' style={{textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px'}} onSubmit={saveSettings}>
            <TextField fullWidth value={settings.pin_code} required onChange={handleChange} name="pin_code" color="primary" label="קוד הרשמה" />
            <TextField fullWidth value={settings.officer} onChange={handleChange} name="officer" label="קצין מתקן" />
            <TextField fullWidth value={settings.title} required onChange={handleChange} name="title" color="primary" label="כותרת אתר" />
            <TextField fullWidth value={settings.max_seq_noon} type="number" inputProps={{min: "0"}} required onChange={handleChange} name="max_seq_noon" color="primary" label="מ'ס רצפים צהריים לבוקר" />
            <TextField fullWidth value={settings.max_seq_nights} type="number" inputProps={{min: "0"}} required onChange={handleChange} name="max_seq_nights" color="primary" label="מ'ס רצפים לילה לצהריים" />
            <Button variant="contained" color="primary" type="submit">שמור</Button>
            </form>
      </Box>
    </main>
  )
}

export default SettingsPage