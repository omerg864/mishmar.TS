import React, { useState, useEffect } from 'react'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { EventType, User } from '../types/types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
          Button, Pagination, TextField} from '@mui/material';
import ChipSelect from '../components/ChipSelect';
import { SelectChangeEvent } from '@mui/material/Select';
import DatePicker from '../components/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { StyledTableCell, StyledTableRow } from '../components/StyledTable';
import { useSearchParams } from 'react-router-dom';
import NotAuthorized from '../components/NotAuthorized';

interface IProps {
  manager: boolean;
}

const Events = (props: IProps) => {
    const [events, setEvents] = useState<EventType[]>([]);
    const [newEvent, setNewEvent] = useState<EventType>({content: "", users: [], date: (new Date()).toString()});
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const cookies = new Cookies();
    const [height, setHeight] = useState<number>(100);
    const [searchParams, setSearchParams] = useSearchParams();
    const [pages, setPages] = useState<number>(1);


    const newDateChange = (newValue: Dayjs | null) => {
      setNewEvent({...newEvent, date: newValue ? newValue.toString() : ""});
    }

    const newTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewEvent({...newEvent, [e.target.name as keyof EventType]: e.target.value});
    }

    const newSelectChange = (e: SelectChangeEvent<string[]>) => {
      let value = e.target.value;
      setNewEvent({...newEvent, users: (typeof value === 'string' ? value.split(',') : value)});
    }


    const dateChange = (newValue: Dayjs | null, id?: string) => {
      let events_temp = [...events];
      events_temp = events_temp.map(event => {
        if (event._id === id) {
          event.date = newValue ? newValue.toString() : "";
        }
        return event;
      })
      setEvents(events_temp);
    }

    const textChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let [ _, id ] = e.target.name.split("&&");
      let events_temp = [...events];
      events_temp = events_temp.map(event => {
        if (event._id === id) {
          event.content = e.target.value;
        }
        return event;
      })
      setEvents(events_temp);
    }


    const handleChange = (e: SelectChangeEvent<string[]>) => {
      let value = e.target.value;
      let events_temp = [...events];
      events_temp = events_temp.map(event => {
        if (event._id === e.target.name) {
          event.users = typeof value === 'string' ? value.split(',') : value;
        }
        return event;
      })
      setEvents(events_temp);
    };

    const createEvent = async () => {
      if (newEvent.users.length === 0) {
        toast.error("חייב להוסיף משתמשים");
        return;
      }
      if (newEvent.content === "") {
        toast.error("חייב להוסיף תוכן");
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/events/`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') },
      method: 'POST', body: JSON.stringify(newEvent)});
        const data = await response.json();
        if (data.error || data.statusCode) {
          fetch('/api/logs', {method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: 'events', component: "Events" })})
          toast.error(data.message);
        } else {
          toast.success("אירוע נוצר");
          await saveEvents(false);
          await getEvents(false);
          setNewEvent({content: "", users: [], date: (new Date()).toString()});
        }
      } catch (err) {
        fetch('/api/logs', {method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: 'events', component: "Events" })})
        toast.error("Internal Server Error");
      }
      setIsLoading(false);
    }


    const deleteEvent = async (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsLoading(true);
      e.preventDefault();
      try {
        const response = await fetch(`/api/events/${(e.target as HTMLButtonElement).value}`, { headers: { authorization: 'Bearer ' + cookies.get('userToken') }, method: 'DELETE'});
        const data = await response.json();
        if (data.error || data.statusCode) {
          fetch('/api/logs', {method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `events/${(e.target as HTMLButtonElement).value}`, component: "Events" })})
          toast.error(data.message);
        } else {
          toast.success('אירוע נמחק');
          await getEvents(false);
        }
      } catch (err) {
        fetch('/api/logs', {method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `events/${(e.target as HTMLButtonElement).value}`, component: "Events" })})
        toast.error("Internal Server Error");
      }
      setIsLoading(false);
    }

    const saveEvents = async (loading: boolean) => {
      for ( let i = 0; i < events.length; i++ ) {
        if ( events[i].content === ""){
          toast.error("נא להוסיף תוכן לכל אירוע");
          return;
        }
        if ( events[i].users.length === 0 ) {
          toast.error("נא להוסיף משתמשים לכל אירוע");
          return;
        }
      }
      if (loading)
        setIsLoading(true);
      try {
        const response = await fetch(`/api/events/many`, { headers: { 'Content-Type': 'application/json', Authorization : 'Bearer ' + cookies.get('userToken') }, 
      method: 'PATCH', body: JSON.stringify(events) });
      const data = await response.json();
        if (data.error || data.statusCode) {
          fetch('/api/logs', {method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `events/many`, component: "Events" })})
          toast.error(data.message);
        } else {
          toast.success('אירועים עודכנו');
        }
      } catch (err) {
        fetch('/api/logs', {method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `events/many`, component: "Events" })})
        toast.error("Internal Server Error");
      }
      if (loading)
        setIsLoading(false);
    }


    const getEvents = async (loading: boolean) => {
      if (loading)
        setIsLoading(true);
      let page = searchParams.get('page') ? searchParams.get('page') : 1;
      try {
        const response = await fetch(`/api/events/all?page=${page}`, { headers: { 'Authorization': 'Bearer ' + cookies.get('userToken')}});
        const data = await response.json();
        if (data.error|| data.statusCode) {
          fetch('/api/logs', {method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `events/all?page=${page}`, component: "Events" })})
          toast.error(data.message);
        } else {
          setEvents(data.events);
          setUsers(data.users);
          setPages(data.pages);
        }
      } catch (err) {
        fetch('/api/logs', {method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `events/all?page=${page}`, component: "Events" })})
        toast.error('Internal Server Error');
      }
      if (loading)
        setIsLoading(false);
    }

    useEffect(() => {
        if (props.manager) {
          getEvents(true);
        }
      }, [props.manager, searchParams]);
    
    
      const changeRef = (el: HTMLTableElement) => {
        if (el){
          setHeight(el.clientHeight as number);
        }
      }

    const paginationClick = (e: React.ChangeEvent<unknown>, value: number) => {
        setSearchParams(`?page=${value}`);
    }

    if (isLoading) {
      return <Spinner/>;
    }

    if (!props.manager) {
      return <NotAuthorized />;
    }

  return (
    <main>
      <h1>אירועים</h1>
      <div className='save-btn-container'>
        <Button variant="contained" color="primary" onClick={() => saveEvents(true)}>שמור</Button>
        </div>
      <TableContainer style={{minHeight: height}} component={Paper}>
      <Table ref={changeRef} sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center">תאריך</StyledTableCell>
            <StyledTableCell align="center">תוכן</StyledTableCell>
            <StyledTableCell align="center">משתמשים</StyledTableCell>
            <StyledTableCell align="center"></StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
        <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center" scope="row" style={{minWidth: '180px'}}>
              <DatePicker value={dayjs(newEvent.date)} onChange={newDateChange}/>
              </TableCell>
              <TableCell align="center" scope="row">
              <TextField sx={{minWidth: '180px'}} required label="תוכן" value={newEvent.content} name={`content`} onChange={newTextChange}/>
              </TableCell>
              <TableCell align="center" scope="row">
                <ChipSelect names={users} onChange={newSelectChange} name={`newEvent`} inputLabel={`משתמשים`} values={(newEvent.users) as string[]} />
              </TableCell>
              <TableCell align="center" scope="row">
              <Button variant="contained" color="primary" onClick={createEvent}>הוסף</Button>
              </TableCell>
            </TableRow>
          {events.map((event) => (
            <TableRow
              key={event._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center" scope="row">
                <DatePicker value={dayjs(event.date)} onChange={dateChange} id={event._id}/>
                </TableCell>
              <TableCell align="center" scope="row">
                <TextField sx={{minWidth: '180px'}} required label="תוכן" value={event.content} name={`content&&${event._id}`} onChange={textChange}/>
                </TableCell>
              <TableCell align="center" scope="row">
                <ChipSelect names={users} onChange={handleChange} name={`${event._id}`} inputLabel={`משתמשים`} values={(event.users) as string[]} />
              </TableCell>
              <TableCell align="center" scope="row">
              <Button variant="contained" color="error" value={event._id} onClick={deleteEvent} >מחק</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Pagination sx={{marginTop: '15px'}} page={searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1} onChange={paginationClick} count={pages} variant="outlined" color="primary" />
    </main>
  )
}

export default Events