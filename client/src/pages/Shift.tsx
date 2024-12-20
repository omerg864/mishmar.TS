import React, { useState, useEffect } from 'react'
import Spinner from '../components/Spinner';
import { ScheduleUser, Shift as ShiftType } from '../types/types';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { addDays, dateToString, dateToStringShort, numberToArray } from '../functions/functions';
import { Button, TextField, Typography, TextareaAutosize } from '@mui/material';
import TableHead2 from '../components/TableHead';
import TableBodyShift from '../components/TableBodyShift';



const defaultValue = {weeks: [], _id: '', weekend_night: 0, weekend_day: 0, userId: "", scheduleId: "", notes: ""};
const rows = ["morning", "noon", "night", "pull"]
type ShiftWeek = {morning: boolean[], noon: boolean[], night: boolean[], pull: boolean[], reinforcement: boolean[]};

const Shift = () => {

    const [submitting, setSubmitting] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [schedule, setSchedule] = useState<ScheduleUser>({num_weeks: 0, date: new Date(), days: [] as string[][], _id: '1'});
    const [shift, setShift] = useState<ShiftType>(defaultValue);
    const cookies = new Cookies();

      const getLastSchedule = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/schedules/auth/last`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') } });
            const data = await response.json();
            if (data.error || data.statusCode) {
              fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `schedules/auth/last`, component: "Shift" })})
              toast.error(data.message);
            } else {
              await Promise.all([getShift(data._id), getEvents(data._id)]);
              setSchedule({...data, date: new Date(data.date)});
            }
        } catch (err) {
          fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `schedules/auth/last`, component: "Shift" })})
            toast.error("Internal Server Error");
        }
        setIsLoading(false);
      }

      const getGeneralSettings = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/general`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') } });
            const data = await response.json();
            if (data.error || data.statusCode) {
              fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `settings/general`, component: "Shift" })})
                toast.error(data.message);
            } else {
                setSubmitting(data.submit);
            }
        } catch (err) {
          fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `settings/general`, component: "Shift" })})
            toast.error("Internal Server Error");
        }
      }

      const getShift = async (id: string) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/shifts/user/${id}`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') } });
            const data = await response.json();
            if (data.error || data.statusCode) {
              fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `shifts/user/${id}`, component: "Shift" })})
                toast.error(data.message);
            } else {
                setShift(data);
            }
        } catch (err) {
          fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `shifts/user/${id}`, component: "Shift" })})
            toast.error("Internal Server Error");
        }
      }

      const getEvents = async (id: string) => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/schedule/${id}`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') } });
          const data = await response.json();
          if (data.error || data.statusCode) {
            fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `events/schedule/${id}`, component: "Shift" })})
              toast.error(data.message);
          } else {
            for ( let i = 0; i < data.length; i++) {
              toast.info(`לא לשכוח בתאריך ${dateToStringShort(new Date(data[i].date))} יש ${data[i].content}`, {autoClose: false});
            }
          }
      } catch (err) {
        fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `events/schedule/${id}`, component: "Shift" })})
          toast.error("Internal Server Error");
      }
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

      const shiftTextChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
        setShift({...shift, [e.target.name]: e.target.value});
      }

      const submitShift = async () => {
        if (!submitting) {
          toast.error('לא ניתן להגיש משמרות כעת');
          return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/shifts`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') },
        method: 'PATCH', body: JSON.stringify(shift) });
            const data = await response.json();
            if (data.error || data.statusCode) {
              fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `shifts`, component: "Shift" })})
                toast.error(data.message);
            } else {
                toast.success("משמרות עודכנו");
            }
        } catch (err) {
          fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `shifts`, component: "Shift" })})
            toast.error("Internal Server Error");
        }
        setIsLoading(false);
      }

      useEffect(() => {
        getGeneralSettings();
        getLastSchedule();
      }, []);


      if (isLoading) {
        return <Spinner />;
      }

  return (
    <main>
        <h1 style={{margin : 0}}>הגשת משמרות</h1>
        {shift.userId !== "" && (
          <>
        <h1>{dateToString(schedule.date)} - {dateToString(addDays(schedule.date, schedule.num_weeks * 7 - 1))}</h1>
        {!submitting ? <h1>לא ניתן לשנות/להגיש משמרות</h1> :
        <Button variant="contained" color="primary" disabled={!submitting} onClick={submitShift}>עדכון</Button>}
        <div className='shift-user'>
          <TextField label="מ'ס רצפים לילה לצהריים" type="number" value={shift.weekend_night} name="weekend_night" disabled={!submitting} onChange={shiftTextChange} />
          <TextField label="מ'ס רצפים צהריים לבוקר" type="number" value={shift.weekend_day} name="weekend_day" disabled={!submitting} onChange={shiftTextChange} />
          <Typography style={{marginTop: 'auto', marginBottom: 'auto'}}>הערות: </Typography>
          <TextareaAutosize id="notes" minRows={3} name="notes" value={shift.notes} disabled={!submitting} onChange={shiftTextChange} />
        </div>
        {numberToArray(schedule.num_weeks).map((week, index1) => (
          <TableHead2 key={`week-${week}`} days={schedule.days[week]} 
          children={<TableBodyShift rows={rows} week={week} data={shift.weeks} notesChange={notesChange} checkboxChange={checkboxChange} update={true} disabled={!submitting}/>}/>
        ))}
        </>)}
    </main>
  )
}

export default Shift