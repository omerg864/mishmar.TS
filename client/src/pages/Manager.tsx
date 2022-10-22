import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { toast} from 'react-toastify';
import Spinner from '../components/Spinner'
import Switch from '@mui/material/Switch';
import { Box, Card, CardContent, FormControlLabel, Paper } from '@mui/material';
import Cookies from 'universal-cookie';

interface IProps {
  manager: boolean;
}

const Manager = (props: IProps) => {

    const navigate = useNavigate();
    const [checked, setChecked] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const cookies = new Cookies();

    const getSubmit = async () => {
        setLoading(true);
        const response = await fetch('/api/settings/general')
        const data = await response.json();
        if (data.error || data.statusCode) {
            toast.error(data.message);
        } else {
            setChecked(data.submit);
        }
        setLoading(false);
    }

    useEffect(() => {
        getSubmit();
    }, []);

    const changeSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(e.target.checked);
        const response = await fetch('/api/settings', { headers: { 'Authorization': 'Bearer ' + cookies.get('userToken'), "Content-type": "application/json"} ,method: 'PATCH', body: JSON.stringify({submit: e.target.checked})})
        const data = await response.json();
        if (data.error) {
            toast.error(data.message);
        } else {
            toast.success("שונה");
        }
    }

    if(!props.manager) {
        return <></>;
    }

    if (loading) {
        return <Spinner />
    }
    
  return (
    <main>
        <h1>לוח מנהל</h1>
      <Box className='box-container' component={Paper}>
        <div className='manager-div'>        
        <div>
        <FormControlLabel control={<Switch onChange={changeSubmit} checked={checked} />} label="ניתן להגיש/לשנות הגשות לסידור" />
        <div>
        <Link to="/settings" >הגדרות</Link>
        </div>
        </div>
        </div>
        <h2>סידורים</h2>
        <div className='manager-div'>
            <Link to="/schedules" >סידורים</Link>
            <Link to="/schedule/new" >סידור חדש</Link>
            <Link to="/structure" >מבנה סידור</Link>
        </div>
        <h2>משתמשים</h2>
        <div className='manager-div'>
            <Link to="/users" >משתמשים</Link>
            <Link to="/users/quality" >איכויות</Link>
        </div>
        <h2>אירועים</h2>
        <div className='manager-div'>
            <Link to="/events" >אירועים</Link>
        </div>
        <h2>פוסטים</h2>
        <div className='manager-div'>
            <Link to="/posts" >פוסטים</Link>
            <Link to="/post/new" >פוסט חדש</Link>
        </div>
    </Box>  
    </main>
  )
}

export default Manager