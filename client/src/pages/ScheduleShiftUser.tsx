import React, { useState, useEffect } from 'react'
import Spinner from '../components/Spinner';
import TableBodyShift from '../components/TableBodyShift';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { ScheduleUser, Shift, User } from '../types/types';
import { addDays, dateToString, numberToArray } from '../functions/functions';
import { Button, TextareaAutosize, TextField, Typography } from '@mui/material';
import TableHead2 from '../components/TableHead';


const defaultValue = {weeks: [], _id: '', weekend_night: 0, weekend_day: 0, userId: "", scheduleId: "", notes: ""};
const rows = ["morning", "noon", "night", "pull", "reinforcement"]
type ShiftWeek = {morning: boolean[], noon: boolean[], night: boolean[], pull: boolean[], reinforcement: boolean[]};

const ScheduleShiftUser = () => {
    const [user, setUser] = useState<User>({nickname: "", _id: "", name: ""});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [schedule, setSchedule] = useState<ScheduleUser>({num_weeks: 0, date: new Date(), days: [] as string[][], _id: '1'});
    const [shift, setShift] = useState<Shift>(defaultValue);
    const { scheduleId, userId } = useParams();
    const cookies = new Cookies();

    useEffect(() => {
            getData();
    }, [])

    const getSchedule = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/schedules/${scheduleId}`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') }});
            const data = await response.json();
            if (data.error || data.statusCode) {
                fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `schedules/${scheduleId}`, component: "ScheduleShiftUser" })})
                toast.error(data.message);
            } else {
                setSchedule(data)
            }

        } catch (err) {
            fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `schedules/${scheduleId}`, component: "ScheduleShiftUser" })})
            toast.error('Internal Server Error');
        }
    }

    const getUser = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/get/${userId}`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') }});
            const data = await response.json();
            if (data.error || data.statusCode) {
                fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `users/get/${userId}`, component: "ScheduleShiftUser" })})
                toast.error(data.message);
            } else {
                setUser(data);
            }

        } catch (err) {
            fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `users/get/${userId}`, component: "ScheduleShiftUser" })})
            toast.error('Internal Server Error');
        }
    }

    const getShift = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/shifts/user/${userId}/${scheduleId}/manager`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') } });
            const data = await response.json();
            if (data.error || data.statusCode) {
                fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `shifts/user/${userId}/${scheduleId}/manager`, component: "ScheduleShiftUser" })})
                toast.error(data.message);
            } else {
                setShift(data);
            }
        } catch (err) {
            fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `shifts/user/${userId}/${scheduleId}/manager`, component: "ScheduleShiftUser" })})
            toast.error("Internal Server Error");
        }
      }

      const submitShift = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/shifts`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') },
        method: 'PATCH', body: JSON.stringify(shift) });
            const data = await response.json();
            if (data.error || data.statusCode) {
                fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `shifts`, component: "ScheduleShiftUser" })})
                toast.error(data.message);
            } else {
                toast.success("משמרות עודכנו");
            }
        } catch (err) {
            fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `shifts`, component: "ScheduleShiftUser" })})
            toast.error("Internal Server Error");
        }
        setIsLoading(false);
      }

      const checkboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let weeks = [...shift.weeks]
        const [row, week, day] = e.target.name.split("-");
        weeks[parseInt(week)][row as keyof ShiftWeek][parseInt(day)] = !weeks[parseInt(week)][row as keyof ShiftWeek][parseInt(day)];
        setShift({...shift, weeks });
      }

      const notesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let weeks = [...shift.weeks]
        const [_, week, day] = e.target.name.split("-");
        weeks[parseInt(week)].notes[parseInt(day)] = e.target.value;
        setShift({...shift, weeks });
      }



    const getData = async () => {
        setIsLoading(true);
        getUser();
        getShift();
        await getSchedule();
        setIsLoading(false);
    }

    const shiftTextChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
        setShift({...shift, [e.target.name]: e.target.value});
    }

    if (isLoading) {
        return <Spinner/>;
    }

  return (
    <main>
        <h1 style={{margin: 0, textAlign: 'center'}}>{user.nickname}</h1>
        <h1 style={{textAlign: 'center'}}>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
        <Button variant="contained" color="primary" onClick={submitShift}>שמור</Button>
        <div className='shift-user'>
          <TextField label="מ'ס רצפים לילה לצהריים" type="number" value={shift.weekend_night} name="weekend_night" onChange={shiftTextChange} />
          <TextField label="מ'ס רצפים צהריים לבוקר" type="number" value={shift.weekend_day} name="weekend_day" onChange={shiftTextChange} />
          <Typography style={{marginTop: 'auto', marginBottom: 'auto'}}>הערות: </Typography>
          <TextareaAutosize id="notes" minRows={3} name="notes" value={shift.notes} onChange={shiftTextChange} />
        </div>
        {numberToArray(schedule.num_weeks).map((week, index1) => (
          <TableHead2 key={`week-${week}`}  days={schedule.days[week]} 
          children={<TableBodyShift rows={rows} week={week} data={shift.weeks} notesChange={notesChange} checkboxChange={checkboxChange} update={true} disabled={false}/>}/>
        ))}
    </main>
  )
}

export default ScheduleShiftUser