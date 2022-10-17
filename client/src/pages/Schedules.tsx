import { Button, Card } from '@mui/material';
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';
import Spinner from '../components/Spinner';
import { addDays, dateToString } from '../functions/functions';
import { Schedule } from '../types/types';
import { useNavigate } from 'react-router-dom';


interface IProps {
    manager: boolean;
}

const Schedules = (props: IProps) => {

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const cookies = new Cookies();
    const navigate = useNavigate();

    const getSchedules = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/schedules/auth/all`, { headers: {authorization: 'Bearer ' + cookies.get('userToken')}});
            const data = await response.json();
            setSchedules(data);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    }

    const goToShifts = (id: string) => {
        navigate(`/schedule/${id}/shifts`);
    }

    const goToUpdate = (id: string) => {
        navigate(`/schedule/${id}/update`);
    }

    useEffect(() => {
        getSchedules();
    }, []);

    if (loading) {
        return <Spinner />;
    }

    if(!props.manager) {
        return <></>;
    }

  return (
    <main>
        <h1>Schedules</h1>
        <div>
            {schedules.map(schedule => (
                <Card key={schedule._id} className='schedule'>
                    <h1>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
                    <div className='space-div'>
                        <Button variant='contained' color="info" onClick={() => goToUpdate(schedule._id)}>Update</Button>
                        <Button variant='contained' color="success" onClick={() => goToShifts(schedule._id)} >Shifts</Button>
                    </div>
                </Card>
            ))}
        </div>
    </main>
  )
}

export default Schedules