import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { Schedule } from '../types/types';
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
        <TableContainer component={Paper}>
        {numberToArray(schedule.num_weeks).map((week, index) => (
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
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
            {Object.keys(schedule.weeks[index]).map(week => (
                <StyledTableRow key={week}>
                    
                </StyledTableRow>
            ))}
            <TableRow
              key={index}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center" scope="row"></TableCell>
              <TableCell align="center"></TableCell>
              <TableCell align="center"></TableCell>
              <TableCell align="center"></TableCell>
              <TableCell align="center"></TableCell>
              <TableCell align="center"></TableCell>
              <TableCell align="center"></TableCell>
              <TableCell align="center"></TableCell>
            </TableRow>
        </TableBody>
      </Table>
        ))}
    </TableContainer>
    </main>
  )
}

export default ScheduleUpdate