import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import { SalarySettings } from '../types/types';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import { Box, Button, Paper, TextField } from '@mui/material';

interface IProps {
    setSettingsChange: React.Dispatch<React.SetStateAction<boolean>>;
    settingsChange: boolean;
}
function SettingsSalary(props: IProps) {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [settings, setSettings] = useState<SalarySettings>({} as SalarySettings);
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
        <h1>הגדרות שכר</h1>
        <Box className='box-container' component={Paper}>
            <form className='box-container' style={{textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px'}} onSubmit={saveSettings}>
            <TextField fullWidth type='number' value={settings.base_pay} onChange={handleChange} name="base_pay" label="שכר מאבטח" />
            <TextField fullWidth type='number' value={settings.base_pay2} onChange={handleChange} name="base_pay2" label="שכר אחמ״ש" />
            <TextField fullWidth type='number' value={settings.base_pay3} onChange={handleChange} name="base_pay3" label="שכר קצין מתקן" />
            <TextField fullWidth value={settings.travel} type="number" required onChange={handleChange} name="travel" color="primary" label="דמי נסיעה" />
            <TextField fullWidth value={settings.big_eco} type="number" required onChange={handleChange} name="big_eco" color="primary" label="כלכלה גדולה" />
            <TextField fullWidth value={settings.small_eco} type="number" required onChange={handleChange} name="small_eco" color="primary" label="כלכלה קטנה" />
            <TextField fullWidth value={settings.extra_eco} type="number" required onChange={handleChange} name="extra_eco" color="primary" label="אש״ל תגבור" />
            <TextField fullWidth value={settings.extra_travel} type="number" required onChange={handleChange} name="extra_travel" color="primary" label="תחבורה ציבורית תגבור" />
            <TextField fullWidth value={settings.s_travel} type="number" required onChange={handleChange} name="s_travel" color="primary" label="נסיעות שבת" />
            <TextField fullWidth value={settings.recuperation} type="number" required onChange={handleChange} name="recuperation" color="primary" label="הבראה" />
            <Button variant="contained" color="primary" type="submit">שמור</Button>
            </form>
      </Box>
    </main>
  )
}

export default SettingsSalary