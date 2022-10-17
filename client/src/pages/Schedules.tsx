import { Button, Card, Pagination } from '@mui/material';
import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom';
import Cookies from 'universal-cookie';
import Spinner from '../components/Spinner';
import { addDays, dateToString } from '../functions/functions';
import { Schedule } from '../types/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


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
        try {
            let page = searchParams.get('page') ? searchParams.get('page') : 1;
            const response = await fetch(`/api/schedules/auth/all?page=${page}`, { headers: {authorization: 'Bearer ' + cookies.get('userToken')}});
            const data = await response.json();
            if (data.error) {
                toast.error(data.error);
            } else {
                setSchedules(data.schedules);
                setPages(data.pages);
            }
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
        if (props.manager) {
            getSchedules();
        }
    }, [props.manager, searchParams]);

    const paginationClick = (e: any, value: number) => {
        setSearchParams(`?page=${value}`);
      }

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
        <Pagination sx={{marginTop: '15px'}} page={searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1} onChange={paginationClick} count={pages} variant="outlined" color="primary" />
    </main>
  )
}

export default Schedules