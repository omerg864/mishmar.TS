import React, { useState, useEffect } from 'react'
import Spinner from '../components/Spinner'
import { Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import { addDays, dateToString, dateToStringShort, numberToArray } from '../functions/functions';
import { EventType, ScheduleUser, ShiftWeek, User } from '../types/types';
import TableHead2 from '../components/TableHead';
import TableBodyShift from '../components/TableBodyShift';
import NotAuthorized from '../components/NotAuthorized';


interface IProps {
    manager: boolean;
}

interface ShiftScheduleWeek {
    morning: string[];
    noon: string[];
    night: string[]; 
    pull: string[];
    reinforcement: string[]; 
    notes: string[];
}

const rows = ["morning", "noon", "night", "reinforcement"];

const ScheduleShift = (props: IProps) => {

    const { id } = useParams();
    const [loading, setLoading] = useState<boolean>(true);
    const [weeks, setWeeks] = useState<ShiftScheduleWeek[]>([]);
    const [users, setUsers] = useState<{nickname: string, id: string}[]>([]);
    const [noUsers, setNoUsers] = useState<{nickname: string, id: string}[]>([]);
    const [minUsers, setMinUsers] = useState<{nickname: string, id: string, noon: number[], morning: number[]}[]>([]);
    const [schedule, setSchedule] = useState<ScheduleUser>({num_weeks: 0, date: new Date(), days: [] as string[][], _id: '1'});
    const [weeksNotes, setWeeksNotes] = useState<string[]>([]);
    const [generalNotes, setGeneralNotes] = useState<string>("");
    const [events, setEvents] = useState<EventType[]>([]);
    const cookies = new Cookies();


    const getData = async () => {
        try {
            const response = await fetch(`/api/shifts/schedule/${id}`, {headers: { 'Content-Type': 'application/json' }});
            const data = await response.json();
            if (data.error || data.statusCode) {
                fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `shifts/schedule/${id}`, component: "ScheduleShift" })})
                toast.error(data.message);
            } else {
                setWeeks(data.weeks);
                setUsers(data.users);
                setNoUsers(data.noUsers);
                setMinUsers(data.minUsers);
                setWeeksNotes(data.weeksNotes);
                setGeneralNotes(data.generalNotes);
            }
        } catch (err) {
            fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `shifts/schedule/${id}`, component: "ScheduleShift" })})
            toast.error('Internal Server Error');
        }
    }

    const getEvents = async () => {
        try {
            const response = await fetch(`/api/events/manager/schedule/${id}`, {headers: { 'Content-Type': 'application/json' }});
            const data = await response.json();
            if (data.error || data.statusCode) {
                fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `events/manager/schedule/${id}`, component: "ScheduleShift" })})
                toast.error(data.message);
            } else {
                setEvents(data);
            }
        } catch (err) {
            fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `events/manager/schedule/${id}`, component: "ScheduleShift" })})
            toast.error('Internal Server Error');
        }
    }

    const getSchedule = async () => {
        try {
            const response = await fetch(`/api/schedules/${id}`, { headers: { 'Content-Type': 'application/json' }});
            const data = await response.json();
            if (data.error || data.statusCode) {
                fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `schedules/${id}`, component: "ScheduleShift" })})
                toast.error(data.message);
            } else {
                setSchedule(data);
            }
        } catch (err) {
            fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `schedules/${id}`, component: "ScheduleShift" })})
            toast.error('Internal Server Error');
        }
    }

    const toExcel = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/shifts/excel', { headers: { 'Content-Type': 'application/json' },
            method: 'PUT', body: JSON.stringify({weeks, days: schedule.days, num_users: users.length, weeksNotes, generalNotes, events}) });
            const blob = await response.blob();
            if (response.status === 200) {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = `shifts ${dateToStringShort(new Date(schedule.date))}.xlsx`;
                a.click();
            } else {
                toast.error('לא ניתו להוריד קובץ');
                fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: response, path: `shifts/excel'`, component: "ScheduleShift" })})
            }
        } catch (err) {
            fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `shifts/excel'`, component: "ScheduleShift" })})
            toast.error("Internal Server error");
        }
        setLoading(false);
    }

    const getRequests = async () => {
        setLoading(true);
        getData();
        getEvents();
        await getSchedule();
        setLoading(false);
    }


    useEffect(() => {
        if(props.manager) {
            getRequests();
        }
    }, [props.manager]);


    if (!props.manager) {
        return <NotAuthorized />;
    }

    if (loading) {
        return <Spinner />;
    }

  return (
    <main>
        <h1 style={{margin: 0, textAlign: 'center'}}>משמרות שהוגשו לסידור</h1>
        <h1 style={{textAlign: 'center'}} >{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
        <div className='schedule-shift-info'>
        <div style={{display: "flex", alignItems: "center"}}>
        <Button variant="contained" sx={{height: "fit-content"}} onClick={toExcel} color="primary" >יצא לאקסל</Button>
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
            <pre style={{ fontFamily: 'inherit' }}>
                הערות כלליות:{"\n"}{generalNotes}
            </pre>
        </div>
        <div style={{display: 'flex', width: '100%'}}>
            <pre style={{ fontFamily: 'inherit' }}>
                 אירועים:{"\n"}
                 {events.map(event => (
                    <pre style={{ fontFamily: 'inherit' }} key={event._id}>
                        <span>{dateToStringShort(new Date(event.date))}: {event.content} - {event.users.map((user, index) => (
                            <span key={(user as User)._id}>{(user as User).nickname}{index === event.users.length - 1 ? "" : ','}</span>
                        ))}</span>
                    </pre>
                 ))}
            </pre>
        </div>
        {numberToArray(schedule.num_weeks).map((week, index1) => (
            <div style={{width: '100%'}} key={`week-${week}`}>
            <TableHead2 days={schedule.days[week]} 
            children={<TableBodyShift rows={rows} week={week} data={weeks} update={false} disabled={false}/>}/>
            <div style={{display: 'flex', width: '100%'}}>
            <pre style={{ fontFamily: 'inherit' }}>
                הערות שבוע {week + 1}:{"\n"}{weeksNotes[week]}
            </pre>
            </div>
            </div>
        ))}
    </main>
  )
}

export default ScheduleShift