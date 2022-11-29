import React, { useState, useEffect } from 'react'
import Cookies from 'universal-cookie';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'
import Calendar from 'react-calendar';
import { addDays, dateToString } from '../functions/functions';
import { Box, Paper, TextField, Button } from '@mui/material';
import NotAuthorized from '../components/NotAuthorized';


interface IProps {
    manager: boolean;
}


const ScheduleNew = (props: IProps) => {

    const [loading, setLoading] = useState<boolean>(false);
    const [date, setDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 13));
    const [numWeeks, setNumWeeks] = useState<number>(2);
    const cookies = new Cookies();
    const navigate = useNavigate();


    const createSchedule = async (e:  React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`/api/schedules`, 
            {headers: {'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken')}
            ,method: 'POST', body: JSON.stringify({ date: date, num_weeks: numWeeks})});
            const data = await response.json();
            if (data.error || data.statusCode) {
                fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `schedules`, component: "ScheduleNew" })})
                toast.error(data.message);
            } else {
                toast.success('ויהיה סידור');
                navigate(`/schedule/${data._id}/update`);
            }
        } catch (err) {
            fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `schedules`, component: "ScheduleNew" })})
            toast.error("Internal Server Error");
        }
        setLoading(false);
    }


    const getLast = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/schedules/auth/last`, 
            {headers: {'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken')}});
            const data = await response.json();
            if (data.error || data.statusCode) {
                fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `schedules/auth/last`, component: "ScheduleNew" })})
                toast.error(data.message);
            } else {
                setDate(addDays(new Date(data.date), data.num_weeks * 7))
            }
        } catch (err) {
            fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `schedules/auth/last`, component: "ScheduleNew" })})
            toast.error("Internal Server Error");
        }
        setLoading(false);
    }

    useEffect(() => {
        if (props.manager) {
            getLast();
        }
    }, [props.manager]);

    useEffect(() => {
        setEndDate(addDays(date, numWeeks * 7 - 1))
    }, [numWeeks, date]);


    if (!props.manager) {
        return <NotAuthorized />;
    }

    if (loading) {
        return <Spinner/>;
    }

  return (
    <main>
        <h1>סידור חדש</h1>
        <Box className="box-container" component={Paper}>
        <h2>{dateToString(date)} - {dateToString(endDate)}</h2>
        <form className='box-container' style={{textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px', width: '100%'}} onSubmit={createSchedule}>
            <Calendar calendarType="Hebrew" onChange={setDate} defaultValue={date}/>
            <TextField fullWidth  id="num_weeks" type="number" required inputProps={{min: '1', step: '1'}} name='num_weeks' value={numWeeks} label="מ'ס שבועות" onChange={e => setNumWeeks(+e.target.value)} />
            <Button variant="contained" color="primary" type="submit">סידור חדש</Button>
        </form>
        </Box>
    </main>
  )
}

export default ScheduleNew