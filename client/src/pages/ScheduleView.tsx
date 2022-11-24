import { Button, Pagination, Paper, Table, TableContainer } from '@mui/material'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Spinner from '../components/Spinner'
import TableBodySchedule from '../components/TableBodySchedule'
import TableHeadSchedule from '../components/TableHeadSchedule'
import { addDays, dateToString, numberToArray, dateToStringShort } from '../functions/functions'
import { Schedule } from '../types/types'
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { useParams, useSearchParams } from 'react-router-dom';
import NotAuthorized from '../components/NotAuthorized';
import html2canvas from 'html2canvas';


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
  const [overflow, setOverflow] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);

  const getSchedule = async () => {
    setIsLoading(true);
    let url = "";
    if (id) {
      url = `/api/schedules/${id}`;
    } else {
      let page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1;
      url = `/api/schedules/auth/view?page=${page}`;
    }
    try {
        const response = await fetch(url, { headers: { authorization: 'Bearer ' + cookies.get('userToken') } });
        const data = await response.json();
        if (data.error || data.statusCode) {
          fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: url, component: "ScheduleView" })})
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
      fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: url, component: "ScheduleView" })})
        toast.error("Internal Server Error");
    }
    setIsLoading(false);
  }

  const paginationClick = (e: React.ChangeEvent<unknown>, value: number) => {
    setSearchParams(`?page=${value}`);
  }

  const checkOverflow = (el: HTMLDivElement | null) => {
    if (el) {
      if (el.clientWidth < el.scrollWidth) {
        setOverflow(true);
      } else {
        setOverflow(false);
      }
    }
  }


  useEffect(() => {
    if (props.authenticated) {
      getSchedule();
    }
  },[props.authenticated, searchParams] );

  useLayoutEffect(() => {
    function updateSize() {
      checkOverflow(containerRef.current);
      resizeRows();
    }
    window.addEventListener('resize', updateSize);
  }, []);

  useEffect(() => { 
    checkOverflow(containerRef.current)
  }, [height])

  const resizeRows = () => {
    if (schedule.num_weeks !== 0) {
      let rows = Array.from(document.querySelectorAll<HTMLTableRowElement>('tbody tr'))
      const rowsWeeks = [];
      const shifts = rows.length / schedule.num_weeks;
      while(rows.length) 
        rowsWeeks.push(rows.splice(0, shifts));
      console.log(rowsWeeks)
      let heights: number[] = [];
      for (let i = 0; i < rowsWeeks.length; i++) { 
        for (let j = 0; j < rowsWeeks[i].length; j++) {
          if ( i === 0) {
            heights[j] = rowsWeeks[i][j].clientHeight;
          } else {
            if (heights[j] < rowsWeeks[i][j].clientHeight) {
              heights[j] = rowsWeeks[i][j].clientHeight;
            }
          }
        }
      }
      rows = Array.from(document.querySelectorAll('tbody tr'))
      for (let i = 0; i < rowsWeeks.length; i++) { 
        for (let j = 0; j < rowsWeeks[i].length; j++) {
          rowsWeeks[i][j].style.height = heights[j] + 'px';
        }
      }
    }
  }

  useEffect(() => {
    resizeRows();
  }, [schedule])


  if (isLoading) {
    return <Spinner />;
  }

  if (!props.authenticated) {
    return <NotAuthorized />;
  }

  const changeRef = (el: HTMLTableElement) => {
    if (el){
      if (el.clientHeight as number > height)
        setHeight(el.clientHeight as number);
    }
  }

  const getPicture = () => {
    const tables = document.querySelector<HTMLDivElement>("#tables");
    if (tables && schedule.num_weeks !== 0) {
      const newDiv = tables.cloneNode(true) as HTMLElement;
      document.body.appendChild(newDiv);
      html2canvas(newDiv).then(canvas => {
        let a = document.createElement('a');
        a.href = canvas.toDataURL();
        a.download = `schedule${dateToStringShort(new Date(schedule.date))}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
      document.body.removeChild(newDiv);
    }
  }

  return (
    <main>
        {schedule.num_weeks !== 0 && <>
        <h1>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
        <div style={{marginBottom: '10px'}}>
          <Button variant="contained" onClick={getPicture}>הורדה כתמונה</Button>
        </div>
        <TableContainer ref={containerRef} style={{minHeight: height, paddingBottom: '10px'}} component={Paper}>
        <div id="tables" className={overflow ? 'tables' : 'tables-center'}>
        {numberToArray(schedule.num_weeks).map((week, index1) => (
          <Table style={{width: 'fit-content'}} ref={changeRef} key={`week-${week}`}>
          <TableHeadSchedule days={schedule.days[index1]} >
          </TableHeadSchedule>
          <TableBodySchedule week={week} data={schedule.weeks[index1]} update={false} />
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