import React, { useState, useEffect} from 'react'
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Spinner from '../components/Spinner';
import { ScheduleUser, Shift as ShiftType } from '../types/types';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { addDays, dateToString, dateToStringShort, numberToArray } from '../functions/functions';
import { Button } from '@mui/material';
import TableHead2 from '../components/TableHead';
import TableBodyShift from '../components/TableBodyShift';


interface IProps {
    authenticated: boolean;
}

const defaultValue = {weeks: [], _id: '', weekend_night: 0, weekend_day: 0, userId: "", scheduleId: "", notes: ""};
const rows = ["morning", "noon", "night", "pull", "reinforcement"]
type ShiftWeek = {morning: boolean[], noon: boolean[], night: boolean[], pull: boolean[], reinforcement: boolean[]};

const Shift = (props: IProps) => {

    const [submitting, setSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [schedule, setSchedule] = useState({num_weeks: 0, date: new Date(), days: [] as string[][], _id: '1'} as ScheduleUser);
    const [shift, setShift] = useState(defaultValue as ShiftType);
    const cookies = new Cookies();

      const getLastSchedule = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/schedule/last`, { headers: { authorization: 'Bearer ' + cookies.get('userToken') } });
            const data = await response.json();
            await getShift(data._id);
            setSchedule({...data, date: new Date(data.date)});
        } catch (err) {
            console.log(err);
            toast.error("Internal server error");
        }
        setIsLoading(false);
      }

      const getGeneralSettings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/settings`, { headers: { Authorization: 'Bearer ' + cookies.get('userToken') } });
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                setSubmitting(data.submit);
            }
        } catch (err) {
            console.log(err);
            toast.error("Internal server error");
        }
        setIsLoading(false);
      }

      const getShift = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:5000/shift/user/${id}`, { headers: { Authorization: 'Bearer ' + cookies.get('userToken') } });
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                setShift(data);
            }
        } catch (err) {
            console.log(err);
            toast.error("Internal server error");
        }
      }

      const checkboxChange = (e: any) => {
        let weeks = [...shift.weeks]
        const [row, week, day] = e.target.name.split("-");
        weeks[parseInt(week)][row as keyof ShiftWeek][parseInt(day)] = !weeks[parseInt(week)][row as keyof ShiftWeek][parseInt(day)];
        setShift({...shift, weeks });
      }

      const notesChange = (e: any) => {
        let weeks = [...shift.weeks]
        const [row, week, day] = e.target.name.split("-");
        weeks[parseInt(week)].notes[parseInt(day)] = e.target.value;
        setShift({...shift, weeks });
      }

      const submitShift = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/shift`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') },
        method: 'PATCH', body: JSON.stringify(shift) });
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                toast.success("Shift submitted successfully");
            }
        } catch (e) {
            console.log(e);
            toast.error("Internal server error");
        }
        setIsLoading(false);
      }

      useEffect(() => {
        if (props.authenticated) {
            getGeneralSettings();
            getLastSchedule();
        }
      }, [props.authenticated]);

      if (!props.authenticated) {
        return <></>;
      }


      if (isLoading) {
        return <Spinner />;
      }

  return (
    <main>
        <h1 style={{margin : 0}}>Shift</h1>
        <h1>{dateToString(schedule.date)} - {dateToString(addDays(schedule.date, schedule.num_weeks * 7 - 1))}</h1>
        {!submitting ? <h1>לא ניתן לשנות/להגיש משמרות</h1> :
        <Button variant="contained" color="primary" disabled={!submitting} onClick={submitShift}>Submit</Button>}
        <TableContainer component={Paper}>
        {numberToArray(schedule.num_weeks).map((week, index1) => (
          <TableHead2 key={`week-${week}`} days={schedule.days[week]} 
          children={<TableBodyShift rows={rows} week={week} data={shift.weeks} notesChange={notesChange} checkboxChange={checkboxChange} update={true} disabled={!submitting}/>}/>
        ))}
    </TableContainer>
    </main>
  )
}

export default Shift