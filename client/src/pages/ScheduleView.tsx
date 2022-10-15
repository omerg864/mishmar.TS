import { Button, Paper, TableContainer } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Spinner from '../components/Spinner'
import TableBodySchedule from '../components/TableBodySchedule'
import TableHead2 from '../components/TableHead'
import { addDays, dateToString, numberToArray } from '../functions/functions'
import { Schedule } from '../types/types'
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';


interface IProps {
  authenticated: boolean;
}

const ScheduleView = (props: IProps) => {

  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState({} as Schedule);
  const cookies = new Cookies();

  const getLastSchedule = async () => {
    setIsLoading(true);
    try {
        const response = await fetch(`/api/schedules/last/data`, { headers: { authorization: 'Bearer ' + cookies.get('userToken') } });
        const data = await response.json();
        if (data.error) {
          toast.error(data.message);
        } else {
          setSchedule(data);
          console.log(data);
        }
    } catch (err) {
        console.log(err);
        toast.error("Internal server error");
    }
    setIsLoading(false);
  }


  useEffect(() => {
    if (props.authenticated) {
      getLastSchedule();
    }
  },[props.authenticated] );


  if (isLoading) {
    return <Spinner />;
  }

  if (!props.authenticated) {
    return <></>;
  }



  return (
    <main>
        {schedule.num_weeks !== undefined && <><h1>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
        {numberToArray(schedule.num_weeks).map((week, index1) => (
          <TableHead2 key={`week-${week}`} days={schedule.days[week]} children={<TableBodySchedule week={week} data={schedule.weeks[week]} update={false} />} />
        ))} </> }
    </main>
  )
}

export default ScheduleView