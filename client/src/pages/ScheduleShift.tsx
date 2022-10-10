import React, { useState, useEffect } from 'react'
import Spinner from '../components/Spinner'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { Button, Checkbox } from '@mui/material';
import { useParams } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import { addDays, dateToString, dateToStringShort, numberToArray } from '../functions/functions';
import { ScheduleUser, ShiftWeek } from '../types/types';


interface IProps {
    authenticated: boolean;
}

interface ShiftScheduleWeek {
    morning: string[];
    noon: string[];
    night: string[]; 
    pull: string[];
    reinforcement: string[]; 
    notes: string[];
}

const rows = ["morning", "noon", "night", "reinforcement", "notes"];

const ScheduleShift = (props: IProps) => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([] as ShiftScheduleWeek[]);
    const [users, setUsers] = useState([] as {nickname: string, id: string}[]);
    const [noUsers, setNoUsers] = useState([] as {nickname: string, id: string}[]);
    const [minUsers, setMinUsers] = useState([] as {nickname: string, id: string, noon: number[], morning: number[]}[]);
    const [schedule, setSchedule] = useState({num_weeks: 0, date: new Date(), days: [] as string[][], _id: '1'} as ScheduleUser);
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


    const getData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/shift/schedule/${id}`, {headers: { authorization: 'Bearer ' + cookies.get('userToken') }});
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                setData(data.weeks);
                setUsers(data.users);
                setNoUsers(data.noUsers);
                setMinUsers(data.minUsers);
            }
        } catch (e) {
            console.log(e);
            toast.error('Internal server error');
        }
    }

    const getSchedule = async () => {
        try {
            const response = await fetch(`http://localhost:5000/schedule/${id}`, { headers: { authorization: 'Bearer ' + cookies.get('userToken') }});
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                setSchedule(data);
            }
        } catch (e) {
            console.log(e);
            toast.error('Internal server error');
        }
    }

    const getRequests = async () => {
        setLoading(true);
        getData();
        await getSchedule();
        setLoading(false);
    }


    useEffect(() => {
        if(props.authenticated) {
            getRequests();
        }
    }, [props.authenticated]);


    if (!props.authenticated) {
        return <></>;
    }

    if (loading) {
        return <Spinner />;
    }

  return (
    <main>
        <h1 style={{margin: 0}}>Schedule Shifts</h1>
        <h1>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
        <div style={{display: "flex", width: "100%", padding: "10px", gap: "5%"}}>
        <div style={{display: "flex", alignItems: "center"}}>
        <Button variant="contained" sx={{height: "fit-content"}} color="primary" >יצא לאקסל</Button>
        </div>
        <div>
            <h4>הגישו סידור: {users.length} </h4>
            {users.map(user => (
                <a href={`/schedule/${schedule._id}/user/${user.id}`}>{user.nickname}, </a>
            ))}
        </div>
        <div>
            <h4> לא הגישו סידור: {noUsers.length} </h4>
            {noUsers.map(user => (
                <a href={`/schedule/${schedule._id}/user/${user.id}`}>{user.nickname}, </a>
            ))}
        </div>
        <div>
            <h4> לא הגישו מינימום: {minUsers.length} </h4>
            {minUsers.map(user => (
                <a href={`/schedule/${schedule._id}/user/${user.id}`}>{user.nickname}, </a>
            ))}
        </div>
        </div>
        <TableContainer component={Paper}>
        {numberToArray(schedule.num_weeks).map((week, index1) => (
      <Table sx={{ minWidth: 650 }} aria-label="simple table" key={`week-${index1}`}>
        <TableHead>
        <StyledTableRow>
        <StyledTableCell align="center">תאריך</StyledTableCell>
        {schedule.days[week].map((day) => {
                return (
                    <StyledTableCell align="center" key={day}>{dateToStringShort(new Date(day))}</StyledTableCell>
                )
            })}
        </StyledTableRow>
          <StyledTableRow>
            <StyledTableCell align="center"></StyledTableCell>
            <StyledTableCell align="center">ראשון</StyledTableCell>
            <StyledTableCell align="center">שני</StyledTableCell>
            <StyledTableCell align="center">שלישי</StyledTableCell>
            <StyledTableCell align="center">רביעי</StyledTableCell>
            <StyledTableCell align="center">חמישי</StyledTableCell>
            <StyledTableCell align="center">שישי</StyledTableCell>
            <StyledTableCell align="center">שבת</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
            {rows.map((row) => (
            <TableRow key={`${row}-${week}`}>
                <TableCell align="center">{row}</TableCell>
            {numberToArray(7).map(num => (
                    <TableCell  key={`${row}-${week}-${num}`} style={{padding: '1px'}} align="center">{data[week][row as keyof ShiftScheduleWeek][num]}</TableCell>
            ))}
            </TableRow>
            ))}
        </TableBody>
      </Table>
        ))}
        </TableContainer>
    </main>
  )
}

export default ScheduleShift