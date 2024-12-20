import { Button, Pagination, Paper, SpeedDial, SpeedDialAction, SpeedDialIcon, Table, TableContainer } from '@mui/material'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Spinner from '../components/Spinner'
import TableBodySchedule from '../components/TableBodySchedule'
import TableHeadSchedule from '../components/TableHeadSchedule'
import { addDays, dateToString, numberToArray, dateToStringShort } from '../functions/functions'
import { CalendarEvent, Reinforcement, Schedule } from '../types/types'
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { useParams, useSearchParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import * as ics from 'ics';
import ImageIcon from '@mui/icons-material/Image';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';


const ScheduleView = () => {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [schedule, setSchedule] = useState<Schedule>({num_weeks: 0, days: [], weeks: [], date: new Date(), publish: true, id: "", _id: ""});
  const [reinforcements, setReinforcements] = useState<Reinforcement[][][]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
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
      url = `${process.env.REACT_APP_API_URL}/api/schedules/${id}`;
    } else {
      let page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1;
      url = `${process.env.REACT_APP_API_URL}/api/schedules/auth/view?page=${page}`;
    }
    try {
        const response = await fetch(url, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') } });
        const data = await response.json();
        if (data.error || data.statusCode) {
          fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: url, component: "ScheduleView" })})
          toast.error(data.message);
        } else {
          if (!id){
            setSchedule(data.schedule);
            setPages(data.pages);
            setReinforcements(data.reinforcements);
            setEvents(data.events);
          } else {
            setSchedule(data.schedule);
            setReinforcements(data.reinforcements);
            setEvents(data.events);
          }
        }
    } catch (err) {
      fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: url, component: "ScheduleView" })})
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
    getSchedule();
  },[searchParams] );

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
      newDiv.style.position = 'absolute';
      document.body.appendChild(newDiv);
      html2canvas(newDiv).then(canvas => {
        let a = document.createElement('a');
        a.href = canvas.toDataURL();
        a.download = `schedule${dateToStringShort(new Date(schedule.date))}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        document.body.removeChild(newDiv);
    });
    }
  }

  const addToCalendar = async () => {
    if (schedule.num_weeks !== 0) {
      ics.createEvents(events, (error, value) => {
        if (error) {
          toast.error("יצירת אירועים נכשלה");
          console.log(error);
          return;
        }
        const blob = new Blob([value], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      });
    }
  }

  const actions = [
    { icon: <ImageIcon/>, name: 'הורדה כתמונה', action: getPicture },
    { icon: <CalendarMonthIcon/>, name: 'הוספה ליומן', action: addToCalendar}
  ]

  return (
    <main>
        {schedule.num_weeks !== 0 && <>
        <h1>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
        {!id && <div style={{height: '3rem', width: '100%', position: 'relative', marginBottom: '16px'}}>
          <SpeedDial
              direction="down"
              ariaLabel="Schedule Actions"
              sx={{ position: 'absolute', top: 0, right: 0 }}
              icon={<SpeedDialIcon />}
            >
              {actions.map((action) => (
                <SpeedDialAction
                  tooltipOpen={true}
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  onClick={action.action}
                />
              ))}
            </SpeedDial>
        </div>}
        <TableContainer ref={containerRef} style={{minHeight: height, paddingBottom: '10px'}} component={Paper}>
        <div id="tables" className={overflow ? 'tables' : 'tables-center'}>
        {numberToArray(schedule.num_weeks).map((week, index1) => (
          <Table style={{width: 'fit-content'}} ref={changeRef} key={`week-${week}`}>
          <TableHeadSchedule days={schedule.days[index1]} >
          </TableHeadSchedule>
          <TableBodySchedule week={week} data={schedule.weeks[index1]} reinforcements={reinforcements[week]} update={false} />
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