import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { Schedule, ShiftWeek, Structure } from '../types/types';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner'
import { addDays, dateToString, dateToStringShort, numberToArray } from '../functions/functions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { Button } from '@mui/material';

interface IProps {
    manager: boolean;
}

const ScheduleUpdate = (props: IProps) => {

    const { id } = useParams();
    const cookies = new Cookies();
    const [schedule, setSchedule] = useState<Schedule>({} as Schedule);
    const [isLoading, setIsLoading]  = useState<boolean>(false);

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


    const getSchedule = async () => {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/schedule/' + id, { headers: { authorization: 'Bearer ' + cookies.get('userToken')}});
        const data = await response.json();
        if (data.error) {
            toast.error(data.message);
        } else {
            setSchedule(data);
        }
        setIsLoading(false);
    }

    const changeSchedule = (e: any) => {
        const [ week, shift, day ] = e.target.name.split('-');
        let schedule_temp = {...schedule}
        schedule_temp.weeks[week][shift].days[day] = e.target.value;
        setSchedule(schedule_temp);
    }

    const saveSchedule = async (e: any) => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/schedule/', { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken')  },
            method: 'PATCH', body: JSON.stringify(schedule) });
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                toast.success("Saved Successfully");
            }
        } catch (e) {
            console.log(e);
            toast.error("Internal server error");
        }
        setIsLoading(false);
    }

    useEffect(() => {
        getSchedule();
    }, []);

    if (isLoading) {
        return <Spinner />;
    }


    if (!props.manager) {
        return <></>;
    }

  return (
    <main>
        <h1>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
        <Button variant="contained" color="primary" onClick={saveSchedule}>Save</Button>
        <TableContainer component={Paper}>
        {numberToArray(schedule.num_weeks).map((week, index1) => (
      <Table sx={{ minWidth: 650 }} aria-label="simple table" key={index1}>
        <TableHead>
        <StyledTableRow>
        <StyledTableCell align="center">תאריך</StyledTableCell>
        {schedule.days[week].map((day, index) => {
                return (
                    <StyledTableCell  align="center" key={day}>{dateToStringShort(new Date(day))}</StyledTableCell>
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
            {schedule.weeks[week].map((shift, index2) => (
                <TableRow
                key={(shift.shift as Structure)._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                <TableCell align="center" scope="row"><p>{(shift.shift as Structure).title}</p><p>{(shift.shift as Structure).description}</p></TableCell>
                {shift.days.map((day, index) => (
                    <TableCell key={`${(shift.shift as Structure)._id}-${index}`} align="center" scope="row">
                        <TextareaAutosize
                    minRows={3}
                    value={day}
                    onChange={changeSchedule}
                    name={`${week}-${index2}-${index}`}
                    style={{ width: 200 }}
                  />
                  </TableCell>
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

export default ScheduleUpdate