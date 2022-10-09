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
import { ScheduleUser, Shift as ShiftType } from '../types/types';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { addDays, dateToString, dateToStringShort, numberToArray } from '../functions/functions';
import Checkbox from '@mui/material/Checkbox';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { Button } from '@mui/material';


interface IProps {
    authenticated: boolean;
}

const defaultValue = {weeks: [], _id: '', weekend_night: 0, weekend_day: 0, userId: "", scheduleId: "", notes: ""};
const rows = ["morning", "noon", "night", "pull", "reinforcement"]
type ShiftWeek = {morning: boolean[], noon: boolean[], night: boolean[], pull: boolean[], reinforcement: boolean[]};

const Shift = (props: IProps) => {

    const [submitting, setSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [schedule, setSchedule] = useState({num_weeks: 0, date: new Date(), days: [] as string[][], _id: '1'} as ScheduleUser);
    const [shift, setShift] = useState(defaultValue as ShiftType);
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
                setShift(data);
            }
        } catch (err) {
            console.log(err);
            toast.error("Internal server error");
        }
      }

      const checkboxChange = (e: any) => {
        let weeks = [...shift.weeks]
        const [row, week, day] = e.target.name.split("-");
        weeks[parseInt(week)][row as keyof ShiftWeek][parseInt(day)] = !weeks[parseInt(week)][row as keyof ShiftWeek][parseInt(day)];
        setShift({...shift, weeks });
      }

      const notesChange = (e: any) => {
        let weeks = [...shift.weeks]
        const [row, week, day] = e.target.name.split("-");
        weeks[parseInt(week)].notes[parseInt(day)] = e.target.value;
        setShift({...shift, weeks });
      }

      const submitShift = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/shift`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') },
        method: 'PATCH', body: JSON.stringify(shift) });
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                toast.success("Shift submitted successfully");
            }
        } catch (e) {
            console.log(e);
            toast.error("Internal server error");
        }
        setIsLoading(false);
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
        <h1 style={{margin : 0}}>Shift</h1>
        <h1>{dateToString(schedule.date)} - {dateToString(addDays(schedule.date, schedule.num_weeks * 7 - 1))}</h1>
        <Button variant="contained" color="primary" onClick={submitShift}>Submit</Button>
        {submitting ? <TableContainer component={Paper}>
        {numberToArray(schedule.num_weeks).map((week, index1) => (
      <Table sx={{ minWidth: 650 }} aria-label="simple table" key={`week-${index1}`}>
        <TableHead>
        <StyledTableRow>
        <StyledTableCell align="center">תאריך</StyledTableCell>
        {schedule.days[week].map((day, index) => {
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
                    <TableCell  key={`${row}-${week}-${num}`} style={{padding: '1px'}} align="center"><Checkbox name={`${row}-${week}-${num}`} onChange={checkboxChange} checked={shift.weeks[week][row as keyof ShiftWeek][num]}/></TableCell>
            ))}
            </TableRow>
            ))}
            <TableRow>
                <TableCell align="center">Notes</TableCell>
            {numberToArray(7).map(num => (
                    <TableCell key={`notes-${week}-${num}`} style={{padding: '5px'}} align="center"><TextareaAutosize                     
                    minRows={2}
                    value={shift.weeks[week].notes[num]}
                    onChange={notesChange}
                    name={`notes-${week}-${num}`}
                    style={{ minWidth: 200 }} /></TableCell>
            ))}
            </TableRow>
        </TableBody>
      </Table>
        ))}
    </TableContainer> : <p>Can't submit shifts anymore</p>}
    </main>
  )
}

export default Shift