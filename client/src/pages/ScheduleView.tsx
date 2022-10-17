import { Button, Paper, Table, TableContainer } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Spinner from '../components/Spinner'
import TableBodySchedule from '../components/TableBodySchedule'
import TableHeadSchedule from '../components/TableHeadSchedule'
import { addDays, dateToString, numberToArray } from '../functions/functions'
import { Schedule } from '../types/types'
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { useParams } from 'react-router-dom';


interface IProps {
  authenticated: boolean;
}

const ScheduleView = (props: IProps) => {

  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState({} as Schedule);
  const cookies = new Cookies();
  const [height, setHeight] = useState(100);
  const { id } = useParams(); 

  const getLastSchedule = async () => {
    setIsLoading(true);
    try {
        let url = `/api/schedules/auth/last/data`;
        if (id) {
          url = `/api/schedules/${id}`;
        }
        const response = await fetch(url, { headers: { authorization: 'Bearer ' + cookies.get('userToken') } });
        const data = await response.json();
        if (data.error) {
          toast.error(data.message);
        } else {
          setSchedule(data);
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

  const changeRef = (el: any) => {
    if (el){
      if (el.clientHeight as number + 10 > height)
        setHeight(el.clientHeight as number + 10);
    }
  }

  return (
    <main>
        {schedule.num_weeks !== undefined && <>
        <h1>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
        <TableContainer style={{minHeight: height, paddingBottom: '10px'}} component={Paper}>
        <div style={{display: 'flex'}}>
        {numberToArray(schedule.num_weeks).map((week, index1) => (
          <Table ref={changeRef} key={`week-${week}`}>
          <TableHeadSchedule days={schedule.days[week]} children={<TableBodySchedule week={week} data={schedule.weeks[week]} update={false} />} />
          </Table>
        ))} 
        </div>
        </TableContainer>
        </> }
    </main>
  )
}

export default ScheduleView