import { Pagination, Paper, Table, TableContainer } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Spinner from '../components/Spinner'
import TableBodySchedule from '../components/TableBodySchedule'
import TableHeadSchedule from '../components/TableHeadSchedule'
import { addDays, dateToString, numberToArray } from '../functions/functions'
import { Schedule } from '../types/types'
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { useParams, useSearchParams } from 'react-router-dom';
import NotAuthorized from '../components/NotAuthorized'


interface IProps {
  authenticated: boolean;
}

const ScheduleView = (props: IProps) => {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [schedule, setSchedule] = useState<Schedule>({num_weeks: 0, days: [], weeks: [], date: new Date(), publish: true, id: "", _id: ""});
  const cookies = new Cookies();
  const [height, setHeight] = useState<number>(100);
  const { id } = useParams(); 
  const [searchParams, setSearchParams] = useSearchParams();
  const [pages, setPages] = useState(1);

  const getSchedule = async () => {
    setIsLoading(true);
    try {
        let url = "";
        if (id) {
          url = `/api/schedules/${id}`;
        } else {
          let page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1;
          url = `/api/schedules/auth/view?page=${page}`;
        }
        const response = await fetch(url, { headers: { authorization: 'Bearer ' + cookies.get('userToken') } });
        const data = await response.json();
        if (data.error || data.statusCode) {
          toast.error(data.message);
        } else {
          if (!id){
          setSchedule(data.schedule);
          setPages(data.pages);
          } else {
            setSchedule(data);
          }
        }
    } catch (err) {
        console.log(err);
        toast.error("Internal Server Error");
    }
    setIsLoading(false);
  }

  const paginationClick = (e: React.ChangeEvent<unknown>, value: number) => {
    setSearchParams(`?page=${value}`);
  }


  useEffect(() => {
    if (props.authenticated) {
      getSchedule();
    }
  },[props.authenticated, searchParams] );


  if (isLoading) {
    return <Spinner />;
  }

  if (!props.authenticated) {
    return <NotAuthorized />;
  }

  const changeRef = (el: HTMLTableElement) => {
    if (el){
      if (el.clientHeight as number + 10 > height)
        setHeight(el.clientHeight as number + 10);
    }
  }

  return (
    <main>
        {schedule.num_weeks !== 0 && <>
        <h1>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
        <TableContainer style={{minHeight: height, paddingBottom: '10px'}} component={Paper}>
        <div style={{display: 'flex'}}>
        {numberToArray(schedule.num_weeks).map((week, index1) => (
          <Table ref={changeRef} key={`week-${week}`}>
          <TableHeadSchedule days={schedule.days[index1]} children={<TableBodySchedule week={week} data={schedule.weeks[index1]} update={false} />} />
          </Table>
        ))} 
        </div>
        </TableContainer>
        </> }
        {!id && <Pagination sx={{marginTop: '15px'}} page={searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1} onChange={paginationClick} count={pages} variant="outlined" color="primary" />}
    </main>
  )
}

export default ScheduleView