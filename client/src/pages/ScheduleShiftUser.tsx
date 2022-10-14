import React, { useState, useEffect, useRef } from 'react'
import Spinner from '../components/Spinner';
import TableHead from '../components/TableHead';
import TableBodyShift from '../components/TableBodyShift';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { ScheduleUser, Shift } from '../types/types';
import { addDays, dateToString, numberToArray } from '../functions/functions';
import { Button, Paper, TableContainer } from '@mui/material';
import TableHead2 from '../components/TableHead';





interface IProps {
    manager: boolean;
}

const defaultValue = {weeks: [], _id: '', weekend_night: 0, weekend_day: 0, userId: "", scheduleId: "", notes: ""};
const rows = ["morning", "noon", "night", "pull", "reinforcement"]
type ShiftWeek = {morning: boolean[], noon: boolean[], night: boolean[], pull: boolean[], reinforcement: boolean[]};

const ScheduleShiftUser = (props: IProps) => {
    const [user, setUser] = useState({nickname: ""});
    const [isLoading, setIsLoading] = useState(false);
    const [schedule, setSchedule] = useState({num_weeks: 0, date: new Date(), days: [] as string[][], _id: '1'} as ScheduleUser);
    const [shift, setShift] = useState(defaultValue as Shift);
    const { scheduleId, userId } = useParams();
    const cookies = new Cookies();

    useEffect(() => {
        if (props.manager) {
            getData();
        }
    }, [props.manager])

    const getSchedule = async () => {
        try {
            const response = await fetch(`http://localhost:5000/schedule/${scheduleId}`, { headers: { authorization: 'Bearer ' + cookies.get('userToken') }});
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                setSchedule(data);
            }

        } catch (err) {
            console.log(err);
            toast.error('Internal server error');
        }
    }

    const getUser = async () => {
        try {
            const response = await fetch(`http://localhost:5000/user/${userId}`, { headers: { authorization: `Bearer ${cookies.get('userToken')}`}})
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                setUser(data);
            }

        } catch (err) {
            console.log(err);
            toast.error('Internal server error');
        }
    }

    const getShift = async () => {
        try {
            const response = await fetch(`http://localhost:5000/shift/user/${userId}/${scheduleId}/manager`, { headers: { Authorization: 'Bearer ' + cookies.get('userToken') } });
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



    const getData = async () => {
        setIsLoading(true);
        getUser();
        getShift();
        await getSchedule();
        setIsLoading(false);
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
        <Button variant="contained" color="primary" onClick={submitShift}>Save</Button>
        {numberToArray(schedule.num_weeks).map((week, index1) => (
          <TableHead2 key={`week-${week}`}  days={schedule.days[week]} 
          children={<TableBodyShift rows={rows} week={week} data={shift.weeks} notesChange={notesChange} checkboxChange={checkboxChange} update={true} disabled={false}/>}/>
        ))}
    </main>
  )
}

export default ScheduleShiftUser