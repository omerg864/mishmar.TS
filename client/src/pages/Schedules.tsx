import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';
import Spinner from '../components/Spinner';
import { addDays, dateToString } from '../functions/functions';
import { Schedule } from '../types/types';


interface IProps {
    manager: boolean;
}

const Schedules = (props: IProps) => {

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const cookies = new Cookies();

    const getSchedules = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/schedule/all`, { headers: {authorization: 'Bearer ' + cookies.get('userToken')}});
            const data = await response.json();
            setSchedules(data);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
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
                <div key={schedule._id} className='schedule'>
                    <h1>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
                    <div className='space-div'>
                    <Link to={`/schedule/${schedule._id}/update`}>Update</Link>
                    <Link to={`/schedule/${schedule._id}/shifts`}>Shifts</Link>
                    </div>
                </div>
            ))}
        </div>
    </main>
  )
}

export default Schedules