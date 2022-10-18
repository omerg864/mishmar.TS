import React, { useState, useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom';
import { Schedule, ShiftWeek, Structure } from '../types/types';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner'
import { addDays, dateToString, dateToStringShort, numberToArray } from '../functions/functions';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import { Button, FormControlLabel, Switch } from '@mui/material';
import TableBodySchedule from '../components/TableBodySchedule';
import TableHead2 from '../components/TableHead';
import ActionButton from '../components/ActionButton';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import TableChartIcon from '@mui/icons-material/TableChart';
import DeleteIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DatasetIcon from '@mui/icons-material/Dataset';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useNavigate } from 'react-router-dom';

interface IProps {
    manager: boolean;
}

const ScheduleUpdate = (props: IProps) => {

    const { id } = useParams();
    const cookies = new Cookies();
    const [schedule, setSchedule] = useState<Schedule>({} as Schedule);
    const [isLoading, setIsLoading]  = useState<boolean>(false);
    const [buttonOpen, setButtonOpen] = useState<boolean>(false);
    const navigate = useNavigate();


    const getSchedule = async () => {
        setIsLoading(true);
        const response = await fetch('/api/schedules/' + id, { headers: { authorization: 'Bearer ' + cookies.get('userToken')}});
        const data = await response.json();
        if (data.error) {
            toast.error(data.message);
        } else {
            setSchedule(data);
        }
        setIsLoading(false);
    }

    const changeSchedule = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const [ week, shift, day ] = e.target.name.split('-');
        let schedule_temp = {...schedule}
        schedule_temp.weeks[parseInt(week)][parseInt(shift)].days[parseInt(day)] = e.target.value;
        setSchedule(schedule_temp);
    }

    const changePublish = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSchedule({ ...schedule, publish: !schedule.publish });
    }

    const saveSchedule = async () => {
        setButtonOpen(false);
        setIsLoading(true);
        try {
            const response = await fetch('/api/schedules/', { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken')  },
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

    const deleteSchedule = async () => {
        setButtonOpen(false);
        setIsLoading(true);
        try {
            const response = await fetch(`/api/schedules/${id}`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken')  },
            method: 'DELETE' });
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                toast.success("Deleted Successfully");
                navigate('/schedules');
            }
        } catch (e) {
            console.log(e);
            toast.error("Internal server error");
        }
        setIsLoading(false);
    }

    const resetScheduleWeeks = () => {
        let weeks_temp = [...schedule.weeks];
        for( let i = 0; i < weeks_temp.length; i++ ) {
            // i - week number
            for ( let j = 0; j < weeks_temp[i].length; j++ ) {
                // j - shift number
                for ( let k = 0; k < weeks_temp[i][j].days.length; k++ ) {
                    // k - day number
                    weeks_temp[i][j].days[k] = ""
                }
            }
        }
        setSchedule({...schedule, weeks: weeks_temp});
        return weeks_temp;
    }

    const resetSchedule = async () => {
        setButtonOpen(false);
        setIsLoading(true);
        try {
            let weeks = resetScheduleWeeks();
            const response = await fetch('/api/schedules/', { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken')  },
            method: 'PATCH', body: JSON.stringify({...schedule, weeks}) });
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

    const checkSchedule = async () => {
        setButtonOpen(false);
        setIsLoading(true);
        try {
            const response = await fetch('/api/schedules/check', { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken')  },
            method: 'PUT', body: JSON.stringify(schedule.weeks) });
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                if (data.length > 0) {
                    for( let i = 0; i < data.length; i++ ) {
                        toast.error(data[i], { autoClose: false });
                    }
                } else {
                    toast.success("Schedule Valid");
                }
            }
        } catch (e) {
            console.log(e);
            toast.error("Internal server error");
        }
        setIsLoading(false);
    }

    const scheduleView = async () => {
        await saveSchedule();
        navigate(`/schedule/${id}/view`)
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

    const actions = [
        { icon: <SaveIcon color='success' />, name: 'שמירה', onClick: saveSchedule},
        { icon: <CheckIcon color="info" />, name: 'בדיקה', onClick: checkSchedule },
        { icon: <UploadFileIcon htmlColor="#9A8B4F" />, name: 'העלאה', onClick: () =>  {return;} },
        { icon: <DatasetIcon htmlColor='#45B8AC' />, name: 'תצוגה', onClick: scheduleView },
        { icon: <TableChartIcon htmlColor="#009B77" />, name: 'טבלת משמרות', onClick: () =>  {return;} },
        { icon: <RestartAltIcon color='error' />, name: 'איפוס', onClick: resetSchedule },
        { icon: <DeleteIcon color='error' />, name: 'מחיקה', onClick: deleteSchedule },
      ];

  return (
    <>
    <ActionButton actions={actions} open={buttonOpen} setOpen={setButtonOpen}/>
    <main>
        <h1>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
        <FormControlLabel control={<Switch onChange={changePublish} checked={schedule.publish} />} label="Submit" />
        {numberToArray(schedule.num_weeks).map((week) => (
          <TableHead2 key={`week-${week}`} days={schedule.days[week]} children={<TableBodySchedule week={week} data={schedule.weeks[week]} update={true} onChange={changeSchedule} />} />
        ))}
    </main>
    </>
  )
}

export default ScheduleUpdate