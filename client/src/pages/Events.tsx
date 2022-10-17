import React, { useState, useEffect, useRef } from 'react'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { EventType, User } from '../types/types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import ChipSelect from '../components/ChipSelect';
import { SelectChangeEvent } from '@mui/material/Select';
import DatePicker from '../components/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { StyledTableCell, StyledTableRow } from '../components/StyledTable';




interface IProps {
  manager: boolean;
}

const Events = (props: IProps) => {
    const [events, setEvents] = useState<EventType[]>([]);
    const [newEvent, setNewEvent] = useState<EventType>({content: "", users: [], date: (new Date()).toString()});
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const cookies = new Cookies();
    const [height, setHeight] = useState(100);


    const newDateChange = (newValue: Dayjs | null) => {
      setNewEvent({...newEvent, date: newValue ? newValue.toString() : ""});
    }

    const newTextChange = (e: any) => {
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

    const textChange = (e: any) => {
      let [ key, id ] = e.target.name.split("&&");
      let events_temp = [...events];
      events_temp = events_temp.map(event => {
        if (event._id === id) {
          event[key as keyof EventType] = e.target.value;
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
        toast.error("please add users");
        return;
      }
      if (newEvent.content === "") {
        toast.error("please add content");
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/events/`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') },
      method: 'POST', body: JSON.stringify(newEvent)});
        const data = await response.json();
        if (data.error) {
          toast.error(data.message);
        } else {
          toast.success("Event created");
          await saveEvents(false);
          await getEvents(false);
          setNewEvent({content: "", users: [], date: (new Date()).toString()});
        }
      } catch (e) {
        console.log(e);
        toast.error("Internal server error");
      }
      setIsLoading(false);
    }


    const deleteEvent = async (e: any) => {
      setIsLoading(true);
      e.preventDefault();
      try {
        const response = await fetch(`/api/events/${e.target.value}`, { headers: { authorization: 'Bearer ' + cookies.get('userToken') }, method: 'DELETE'});
        const data = await response.json();
        if (data.error) {
          toast.error(data.message);
        } else {
          toast.success('Event deleted');
          await getEvents(false);
        }
      } catch (e) {
        console.log(e);
        toast.error("Internal server error");
      }
      setIsLoading(false);
    }

    const saveEvents = async (loading: boolean) => {
      for ( let i = 0; i < events.length; i++ ) {
        if ( events[i].content === ""){
          toast.error("please add content to all events");
          return;
        }
        if ( events[i].users.length === 0 ) {
          toast.error("please add users to all events");
          return;
        }
      }
      if (loading)
        setIsLoading(true);
      try {
        const response = await fetch(`/api/events/many`, { headers: { 'Content-Type': 'application/json', Authorization : 'Bearer ' + cookies.get('userToken') }, 
      method: 'PATCH', body: JSON.stringify(events) });
      const data = await response.json();
        if (data.error) {
          toast.error(data.message);
        } else {
          toast.success('Events saved');
        }
      } catch (e) {
        console.log(e);
        toast.error("Internal server error");
      }
      if (loading)
        setIsLoading(false);
    }


    const getEvents = async (loading: boolean) => {
      if (loading)
        setIsLoading(true);
      try {
        const response = await fetch('/api/events/all', { headers: { 'Authorization': 'Bearer ' + cookies.get('userToken')}});
        const data = await response.json();
        if (data.error) {
          toast.error(data.message);
        } else {
          setEvents(data.events);
          setUsers(data.users);
        }
      } catch (e) {
        console.log(e);
        toast.error('Internal server error');
      }
      if (loading)
        setIsLoading(false);
    }

    useEffect(() => {
        if (props.manager) {
          getEvents(true);
        }
      }, [props.manager]);
    
    
      const changeRef = (el: any) => {
        if (el){
          setHeight(el.clientHeight as number);
        }
      }


    if (isLoading) {
      return <Spinner/>;
    }

    if (!props.manager) {
      return <></>;
    }

  return (
    <main>
      <h1>Events</h1>
      <div className='save-btn-container'>
        <Button variant="contained" color="primary" onClick={() => saveEvents(true)}>Save</Button>
        </div>
      <TableContainer style={{minHeight: height}} component={Paper}>
      <Table ref={changeRef} sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center">Date</StyledTableCell>
            <StyledTableCell align="center">Content</StyledTableCell>
            <StyledTableCell align="center">Users</StyledTableCell>
            <StyledTableCell align="center"></StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
        <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center" scope="row">
              <DatePicker value={dayjs(newEvent.date)} onChange={newDateChange}/>
              </TableCell>
              <TableCell align="center" scope="row">
              <TextField required label="Content" value={newEvent.content} name={`content`} onChange={newTextChange}/>
              </TableCell>
              <TableCell align="center" scope="row">
                <ChipSelect names={users} onChange={newSelectChange} name={`newEvent`} inputLabel={`Users`} values={(newEvent.users) as string[]} />
              </TableCell>
              <TableCell align="center" scope="row">
              <Button variant="contained" color="primary" onClick={createEvent}>Create</Button>
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
                <TextField required label="Content" value={event.content} name={`content&&${event._id}`} onChange={textChange}/>
                </TableCell>
              <TableCell align="center" scope="row">
                <ChipSelect names={users} onChange={handleChange} name={`${event._id}`} inputLabel={`Users`} values={(event.users) as string[]} />
              </TableCell>
              <TableCell align="center" scope="row">
              <Button variant="contained" color="error" value={event._id} onClick={deleteEvent} >Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </main>
  )
}

export default Events