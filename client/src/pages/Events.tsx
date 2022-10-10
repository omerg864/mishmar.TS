import React, { useState, useEffect } from 'react'
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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import ChipSelect from '../components/ChipSelect';




interface IProps {
  manager: boolean;
}

const Events = (props: IProps) => {
    const [events, setEvents] = useState<EventType[]>([]);
    const [newEvent, setNewEvent] = useState<EventType>({content: "", users: [], _id: "", date: ""});
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const cookies = new Cookies();


    const StyledTableCell = styled(TableCell)(({ theme }) => ({
      [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
      },
      [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
      },
    }));
    
    const StyledTableRow = styled(TableRow)(({ theme }) => ({
      '&:nth-of-type(odd)': {
        backgroundColor: 'theme.palette.action.hover',
      },
    }));


    const getEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/event/all', { headers: { 'Authorization': 'Bearer ' + cookies.get('userToken')}});
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
      setIsLoading(false);
    }

    useEffect(() => {
        if (props.manager) {
          getEvents();
        }
      }, [props.manager]);


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
        <Button variant="contained" color="primary" >Save</Button>
        </div>
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
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
              <TableCell align="center" scope="row"></TableCell>
              <TableCell align="center" scope="row"></TableCell>
              <TableCell align="center" scope="row"></TableCell>
              <TableCell align="center" scope="row"></TableCell>
            </TableRow>
          {events.map((event) => (
            <TableRow
              key={event._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center" scope="row">{event.date}</TableCell>
              <TableCell align="center" scope="row">{event.content}</TableCell>
              <TableCell align="center" scope="row">
                <ChipSelect names={users} inputLabel={`Users`} values={(event.users) as string[]} />
              </TableCell>
              <TableCell align="center" scope="row"></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </main>
  )
}

export default Events