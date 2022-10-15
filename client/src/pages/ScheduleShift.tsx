import React, { useState, useEffect } from 'react'
import Spinner from '../components/Spinner'
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { Button, Checkbox, TableHead, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import { addDays, dateToString, dateToStringShort, numberToArray } from '../functions/functions';
import { ScheduleUser, ShiftWeek } from '../types/types';
import TableHead2 from '../components/TableHead';
import TableBodyShift from '../components/TableBodyShift';


interface IProps {
    authenticated: boolean;
}

interface ShiftScheduleWeek {
    morning: string[];
    noon: string[];
    night: string[]; 
    pull: string[];
    reinforcement: string[]; 
    notes: string[];
}

const rows = ["morning", "noon", "night", "reinforcement", "notes"];

const ScheduleShift = (props: IProps) => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([] as ShiftScheduleWeek[]);
    const [users, setUsers] = useState([] as {nickname: string, id: string}[]);
    const [noUsers, setNoUsers] = useState([] as {nickname: string, id: string}[]);
    const [minUsers, setMinUsers] = useState([] as {nickname: string, id: string, noon: number[], morning: number[]}[]);
    const [schedule, setSchedule] = useState({num_weeks: 0, date: new Date(), days: [] as string[][], _id: '1'} as ScheduleUser);
    const [weeksNotes, setWeeksNotes] = useState<string[]>([]);
    const [generalNotes, setGeneralNotes] = useState<string>("");
    const cookies = new Cookies();


    const getData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/shifts/schedule/${id}`, {headers: { authorization: 'Bearer ' + cookies.get('userToken') }});
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                setData(data.weeks);
                setUsers(data.users);
                setNoUsers(data.noUsers);
                setMinUsers(data.minUsers);
                setWeeksNotes(data.weeksNotes);
                setGeneralNotes(data.generalNotes);
            }
        } catch (e) {
            console.log(e);
            toast.error('Internal server error');
        }
    }

    const getSchedule = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/schedules/${id}`, { headers: { authorization: 'Bearer ' + cookies.get('userToken') }});
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                setSchedule(data);
            }
        } catch (e) {
            console.log(e);
            toast.error('Internal server error');
        }
    }

    const getRequests = async () => {
        setLoading(true);
        getData();
        await getSchedule();
        setLoading(false);
    }


    useEffect(() => {
        if(props.authenticated) {
            getRequests();
        }
    }, [props.authenticated]);


    if (!props.authenticated) {
        return <></>;
    }

    if (loading) {
        return <Spinner />;
    }

  return (
    <main>
        <h1 style={{margin: 0}}>Schedule Shifts</h1>
        <h1>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
        <div style={{display: "flex", width: "100%", padding: "10px", gap: "5%"}}>
        <div style={{display: "flex", alignItems: "center"}}>
        <Button variant="contained" sx={{height: "fit-content"}} color="primary" >יצא לאקסל</Button>
        </div>
        <div>
            <h4>הגישו סידור: {users.length} </h4>
            {users.map(user => (
                <a key={`user-${schedule._id}-${user.id}`} href={`/shift/schedule/${schedule._id}/user/${user.id}`}>{user.nickname}, </a>
            ))}
        </div>
        <div>
            <h4> לא הגישו סידור: {noUsers.length} </h4>
            {noUsers.map(user => (
                <a key={`noUser-${schedule._id}-${user.id}`} href={`/shift/schedule/${schedule._id}/user/${user.id}`}>{user.nickname}, </a>
            ))}
        </div>
        <div>
            <h4> לא הגישו מינימום: {minUsers.length} </h4>
            {minUsers.map(user => (
                <a key={`min-${schedule._id}-${user.id}`} href={`/shift/schedule/${schedule._id}/user/${user.id}`}>{user.nickname}, </a>
            ))}
        </div>
        </div>
        <div style={{display: 'flex', width: '100%'}}>
        <Typography>
            <pre style={{ fontFamily: 'inherit' }}>
                הערות כלליות:{"\n"}{generalNotes}
            </pre>
            </Typography>
        </div>
        {numberToArray(schedule.num_weeks).map((week, index1) => (
            <>
            <TableHead2 key={`week-${week}`} days={schedule.days[week]} 
            children={<TableBodyShift rows={rows} week={week} data={data} update={false} disabled={false}/>}/>
            <div style={{display: 'flex', width: '100%'}}>
            <Typography>
            <pre style={{ fontFamily: 'inherit' }}>
                הערות שבוע {week + 1}:{"\n"}{weeksNotes[week]}
            </pre>
            </Typography>
            </div>
            </>
        ))}
    </main>
  )
}

export default ScheduleShift