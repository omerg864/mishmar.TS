import React, { useState, useEffect} from 'react'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Spinner from '../components/Spinner';
import { ScheduleUser } from '../types/types';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { addDays, dateToString, dateToStringShort, numberToArray } from '../functions/functions';


interface IProps {
    authenticated: boolean;
}

const Shift = (props: IProps) => {

    const [submitting, setSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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

      const getLastSchedule = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/schedule/last`, { headers: { authorization: 'Bearer ' + cookies.get('userToken') } });
            const data = await response.json();
            await getShift(data._id);
            setSchedule({...data, date: new Date(data.date)});
        } catch (err) {
            console.log(err);
            toast.error("Internal server error");
        }
        setIsLoading(false);
      }

      const getGeneralSettings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/settings`, { headers: { Authorization: 'Bearer ' + cookies.get('userToken') } });
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                setSubmitting(data.submit);
            }
        } catch (err) {
            console.log(err);
            toast.error("Internal server error");
        }
        setIsLoading(false);
      }

      const getShift = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:5000/shift/user/${id}`, { headers: { Authorization: 'Bearer ' + cookies.get('userToken') } });
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
            }
        } catch (err) {
            console.log(err);
            toast.error("Internal server error");
        }
      }

      useEffect(() => {
        if (props.authenticated) {
            getGeneralSettings();
            getLastSchedule();
        }
      }, [props.authenticated]);

      if (!props.authenticated) {
        return <></>;
      }


      if (isLoading) {
        return <Spinner />;
      }

  return (
    <main>
        <h1>Shift</h1>
        <h1>{dateToString(schedule.date)} - {dateToString(addDays(schedule.date, schedule.num_weeks * 7 - 1))}</h1>
        {submitting ? <TableContainer component={Paper}>
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
            
        </TableBody>
      </Table>
        ))}
    </TableContainer> : <p>Can't submit shifts anymore</p>}
    </main>
  )
}

export default Shift