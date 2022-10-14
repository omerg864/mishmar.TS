import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { Schedule, ShiftWeek, Structure } from '../types/types';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner'
import { addDays, dateToString, dateToStringShort, numberToArray } from '../functions/functions';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import { Button, FormControlLabel, Switch } from '@mui/material';
import TableBodySchedule from '../components/TableBodySchedule';
import TableHead2 from '../components/TableHead';

interface IProps {
    manager: boolean;
}

const ScheduleUpdate = (props: IProps) => {

    const { id } = useParams();
    const cookies = new Cookies();
    const [schedule, setSchedule] = useState<Schedule>({} as Schedule);
    const [isLoading, setIsLoading]  = useState<boolean>(false);


    const getSchedule = async () => {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/schedule/' + id, { headers: { authorization: 'Bearer ' + cookies.get('userToken')}});
        const data = await response.json();
        if (data.error) {
            toast.error(data.message);
        } else {
            setSchedule(data);
        }
        setIsLoading(false);
    }

    const changeSchedule = (e: any) => {
        const [ week, shift, day ] = e.target.name.split('-');
        let schedule_temp = {...schedule}
        schedule_temp.weeks[week][shift].days[day] = e.target.value;
        setSchedule(schedule_temp);
    }

    const changePublish = (e: any) => {
        setSchedule({ ...schedule, publish: !schedule.publish });
    }

    const saveSchedule = async (e: any) => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/schedule/', { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken')  },
            method: 'PATCH', body: JSON.stringify(schedule) });
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                toast.success("Saved Successfully");
            }
        } catch (e) {
            console.log(e);
            toast.error("Internal server error");
        }
        setIsLoading(false);
    }

    useEffect(() => {
        getSchedule();
    }, []);

    if (isLoading) {
        return <Spinner />;
    }


    if (!props.manager) {
        return <></>;
    }

  return (
    <main>
        <h1>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
        <Button variant="contained" color="primary" onClick={saveSchedule}>Save</Button>
        <FormControlLabel control={<Switch onChange={changePublish} checked={schedule.publish} />} label="Submit" />
        <TableContainer component={Paper}>
        {numberToArray(schedule.num_weeks).map((week, index1) => (
          <TableHead2 key={`week-${week}`} days={schedule.days[week]} children={<TableBodySchedule week={week} data={schedule.weeks[week]} update={true} onChange={changeSchedule} />} />
        ))}
    </TableContainer>
    </main>
  )
}

export default ScheduleUpdate