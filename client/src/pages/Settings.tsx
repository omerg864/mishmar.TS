import { Button, Card, CardContent, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import { Settings } from '../types/types';
import Cookies from 'universal-cookie';

interface IProps {
    manager: boolean;
}

const SettingsPage = (props: IProps) => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [settings, setSettings] = useState<Settings>({} as Settings);
    const cookies = new Cookies();


    const getSettings = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/settings/', { headers: { authorization: 'Bearer ' + cookies.get('userToken')}})
          const data = await response.json();
          if (data.error || data.statusCode) {
            toast.error(data.message);
          } else {
            setSettings(data);
          }
        } catch (err) {
          console.error(err);
          toast.error("Internal Server Error");
        }
        setIsLoading(false);
    }

    const saveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
          const response = await fetch('/api/settings/', { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken')}, 
            method: 'PATCH', body: JSON.stringify(settings)})
          const data = await response.json();
          if (data.error || data.statusCode) {
            toast.error(data.message);
          } else {
            toast.success("הגדרות נשמרו");
          }
        } catch (err) {
          console.error(err);
          toast.error("Internal Server Error");
        }
        setIsLoading(false);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({...settings, [e.target.name]: e.target.value })
      }

    useEffect(() => {
        if (props.manager) {
            getSettings();
        }
    }, [props.manager]);


    if (isLoading) {
        return <Spinner />;
    }

    if (!props.manager) {
        return <></>;
    }

  return (
    <main>
        <h1>Settings</h1>
        <Card sx={{ width: '60%', overflow: 'visible' }}>
          <CardContent sx={{textAlign: 'center', position: 'relative'}}>
            <form onSubmit={saveSettings}>
            <TextField value={settings.pin_code} required onChange={handleChange} name="pin_code" color="primary" label="קוד הרשמה" />
            <div style={{marginTop: '10px'}}>
              <TextField value={settings.officer} onChange={handleChange} name="officer" label="קצין מתקן" />
            </div>
            <div style={{marginTop: '10px'}}>
              <TextField value={settings.title} required onChange={handleChange} name="title" color="primary" label="כותרת אתר" />
            </div>
            <div style={{marginTop: '10px'}}>
              <TextField value={settings.max_seq_noon} type="number" inputProps={{min: "0"}} required onChange={handleChange} name="max_seq_noon" color="primary" label="מ'ס רצפים צהריים לבוקר" />
            </div>
            <div style={{marginTop: '10px'}}>
              <TextField value={settings.max_seq_nights} type="number" inputProps={{min: "0"}} required onChange={handleChange} name="max_seq_nights" color="primary" label="מ'ס רצפים לילה לצהריים" />
            </div>
            <div style={{marginTop: '10px', display: 'flex', justifyContent: 'space-between', gap: '10px'}}>
            <Button variant="contained" color="primary" type="submit">שמור</Button>
            </div>
            </form>
          </CardContent>
      </Card>
    </main>
  )
}

export default SettingsPage