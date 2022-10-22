import React, { useState, useEffect, useRef } from 'react'
import Spinner from '../components/Spinner';
import TableHead from '../components/TableHead';
import TableBodyShift from '../components/TableBodyShift';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { ScheduleUser, Shift, User } from '../types/types';
import { addDays, dateToString, numberToArray } from '../functions/functions';
import { Button, Paper, TableContainer, TextareaAutosize, TextField, Typography } from '@mui/material';
import TableHead2 from '../components/TableHead';





interface IProps {
    manager: boolean;
}

const defaultValue = {weeks: [], _id: '', weekend_night: 0, weekend_day: 0, userId: "", scheduleId: "", notes: ""};
const rows = ["morning", "noon", "night", "pull", "reinforcement"]
type ShiftWeek = {morning: boolean[], noon: boolean[], night: boolean[], pull: boolean[], reinforcement: boolean[]};

const ScheduleShiftUser = (props: IProps) => {
    const [user, setUser] = useState<User>({nickname: "", _id: "", name: ""});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [schedule, setSchedule] = useState<ScheduleUser>({num_weeks: 0, date: new Date(), days: [] as string[][], _id: '1'});
    const [shift, setShift] = useState<Shift>(defaultValue);
    const { scheduleId, userId } = useParams();
    const cookies = new Cookies();

    useEffect(() => {
        if (props.manager) {
            getData();
        }
    }, [props.manager])

    const getSchedule = async () => {
        try {
            const response = await fetch(`/api/schedules/${scheduleId}`, { headers: { authorization: 'Bearer ' + cookies.get('userToken') }});
            const data = await response.json();
            if (data.error || data.statusCode) {
                toast.error(data.message);
            } else {
                setSchedule(data)
            }

        } catch (err) {
            console.log(err);
            toast.error('Internal Server Error');
        }
    }

    const getUser = async () => {
        try {
            const response = await fetch(`/api/users/get/${userId}`, { headers: { authorization: `Bearer ${cookies.get('userToken')}`}})
            const data = await response.json();
            if (data.error || data.statusCode) {
                toast.error(data.message);
            } else {
                setUser(data);
            }

        } catch (err) {
            console.log(err);
            toast.error('Internal Server Error');
        }
    }

    const getShift = async () => {
        try {
            const response = await fetch(`/api/shifts/user/${userId}/${scheduleId}/manager`, { headers: { Authorization: 'Bearer ' + cookies.get('userToken') } });
            const data = await response.json();
            if (data.error || data.statusCode) {
                toast.error(data.message);
            } else {
                setShift(data);
            }
        } catch (err) {
            console.log(err);
            toast.error("Internal Server Error");
        }
      }

      const submitShift = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/shifts`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') },
        method: 'PATCH', body: JSON.stringify(shift) });
            const data = await response.json();
            if (data.error || data.statusCode) {
                toast.error(data.message);
            } else {
                toast.success("משמרות עודכנו");
            }
        } catch (e) {
            console.log(e);
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
        const [row, week, day] = e.target.name.split("-");
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

    if(!props.manager) {
        return <></>
    }

    if (isLoading) {
        return <Spinner/>;
    }

  return (
    <main>
        <h1>{user.nickname}</h1>
        <h1>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
        <Button variant="contained" color="primary" onClick={submitShift}>שמור</Button>
        <div style={{display: 'flex', width: '100%', gap: '10px', marginTop: '10px', textAlign: 'center', justifyContent: 'start', padding: '10px', boxSizing: 'border-box'}}>
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