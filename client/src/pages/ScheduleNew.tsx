import React, { useState, useEffect } from 'react'
import Cookies from 'universal-cookie';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'
import Calendar from 'react-calendar';
import { dateToString } from '../functions/functions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';


interface IProps {
    manager: boolean;
}


const ScheduleNew = (props: IProps) => {

    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date>(new Date());
    const [numWeeks, setNumWeeks] = useState<number>(2);
    const cookies = new Cookies();
    const navigate = useNavigate();


    const createSchedule = async (e:  React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/schedules`, 
        {headers: {'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken')}
        ,method: 'POST', body: JSON.stringify({ date, num_weeks: numWeeks})});
        const data = await response.json();
        if (data.error) {
            toast.error(data.error);
            setLoading(false);
        } else {
            toast.success('Schedule created');
            setLoading(false);
            navigate(`/schedule/${data._id}/update`);
        }
    }


    if (!props.manager) {
        return <></>
    }

    if (loading) {
        return <Spinner/>;
    }

  return (
    <main>
        <h1>New Schedule</h1>
        <form className='form-new' onSubmit={createSchedule}>
            <Calendar calendarType="Hebrew" onChange={setDate} defaultValue={date}/>
            <h2>{dateToString(date)}</h2>
            <TextField  id="num_weeks" type="number" name='num_weeks' value={numWeeks} label="Number of weeks" onChange={e => setNumWeeks(+e.target.value)} />
            <Button variant="contained" color="primary" type="submit">Create Schedule</Button>
        </form>
    </main>
  )
}

export default ScheduleNew