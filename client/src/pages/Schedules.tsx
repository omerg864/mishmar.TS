import { Button, Card, Pagination } from '@mui/material';
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom';
import Cookies from 'universal-cookie';
import Spinner from '../components/Spinner';
import { addDays, dateToString } from '../functions/functions';
import { Schedule } from '../types/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import NotAuthorized from '../components/NotAuthorized';


interface IProps {
    manager: boolean;
}

const Schedules = (props: IProps) => {

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [pages, setPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const cookies = new Cookies();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const getSchedules = async () => {
        setLoading(true);
        let page = searchParams.get('page') ? searchParams.get('page') : 1;
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/schedules/auth/all?page=${page}`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') }});
            const data = await response.json();
            if (data.error || data.statusCode) {
                fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `schedules/auth/all?page=${page}`, component: "Schedules" })})
                toast.error(data.message);
            } else {
                setSchedules(data.schedules);
                setPages(data.pages);
            }
        } catch (err) {
            fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `schedules/auth/all?page=${page}`, component: "Schedules" })})
            toast.error("Internal Server Error");
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
        if (props.manager) {
            getSchedules();
        }
    }, [props.manager, searchParams]);

    const paginationClick = (e: React.ChangeEvent<unknown>, value: number) => {
        setSearchParams(`?page=${value}`);
      }

    if (loading) {
        return <Spinner />;
    }

    if(!props.manager) {
        return <NotAuthorized />;
    }

  return (
    <main>
        <h1>סידורים</h1>
        <div>
            {schedules.map(schedule => (
                <Card key={schedule._id} className='schedule'>
                    <h1>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
                    <div className='space-div'>
                        <Button variant='contained' color="info" onClick={() => goToUpdate(schedule._id)}>עדכון</Button>
                        <Button variant='contained' color="success" onClick={() => goToShifts(schedule._id)} >משמרות</Button>
                    </div>
                </Card>
            ))}
        </div>
        <Pagination sx={{marginTop: '15px'}} page={searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1} onChange={paginationClick} count={pages} variant="outlined" color="primary" />
    </main>
  )
}

export default Schedules