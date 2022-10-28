import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { Schedule } from '../types/types';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner'
import { addDays, dateToString, numberToArray } from '../functions/functions';
import { Button, FormControlLabel, Switch, Typography } from '@mui/material';
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
import NotAuthorized from '../components/NotAuthorized';
import Modal from '../components/Modal';

interface IProps {
    manager: boolean;
}

const ScheduleUpdate = (props: IProps) => {

    const { id } = useParams();
    const cookies = new Cookies();
    const [schedule, setSchedule] = useState<Schedule>({} as Schedule);
    const [isLoading, setIsLoading]  = useState<boolean>(false);
    const [buttonOpen, setButtonOpen] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [file, setFile] = useState<File|null>(null);
    const navigate = useNavigate();


    const getSchedule = async (loading: boolean) => {
        if (loading)
            setIsLoading(true);
        try {
            const response = await fetch('/api/schedules/' + id, { headers: { authorization: 'Bearer ' + cookies.get('userToken')}});
            const data = await response.json();
            if (data.error || data.statusCode) {
                toast.error(data.message);
            } else {
                setSchedule(data);
            }
        }catch (e) {
            console.log(e);
            toast.error("Internal Server Error");
        }
        if (loading)
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
            if (data.error || data.statusCode) {
                toast.error(data.message);
            } else {
                toast.success("עודכן");
            }
        } catch (e) {
            console.log(e);
            toast.error("Internal Server error");
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
            if (data.error || data.statusCode) {
                toast.error(data.message);
            } else {
                toast.success("סידור נמחק");
                navigate('/schedules');
            }
        } catch (e) {
            console.log(e);
            toast.error("Internal Server Error");
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
            if (data.error || data.statusCode) {
                toast.error(data.message);
            } else {
                toast.success("עודכן");
            }
        } catch (e) {
            console.log(e);
            toast.error("Internal Server Error");
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
            if (data.error || data.statusCode) {
                toast.error(data.message);
            } else {
                if (data.length > 0) {
                    for( let i = 0; i < data.length; i++ ) {
                        toast.error(data[i], { autoClose: false });
                    }
                } else {
                    toast.success("סידור תקין");
                }
            }
        } catch (e) {
            console.log(e);
            toast.error("Internal Server Error");
        }
        setIsLoading(false);
    }

    const scheduleView = async () => {
        await saveSchedule();
        navigate(`/schedule/${id}/view`)
    }

    const scheduleTable = async () => {
        await saveSchedule();
        navigate(`/schedule/${id}/table`)
    }

    useEffect(() => {
        getSchedule(true);
    }, []);

    if (isLoading) {
        return <Spinner />;
    }


    if (!props.manager) {
        return <NotAuthorized />;
    }

    const modalChildren = 
    <>
    <form>
        <Button variant="contained" component="label">
            קובץ
        <input hidden onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} type="file" />
        </Button>
        <Typography>
            {file ? file.name : ""}
        </Typography>
    </form>
    </>

    const closeModal = () => {
        setModalOpen(false);
        setFile(null);
    }

    const uploadExcel = async () => {
        if (file === null) {
            toast.error('נא לבחור קובץ');
            return;
        }
        setIsLoading(true);
        try {
            var form = new FormData()
            form.append("file", file);
            form.append("scheduleId", schedule._id)
            const response = await fetch(`/api/schedules/upload`, {headers: { authorization: 'Bearer ' + cookies.get('userToken')}
        ,method: 'PUT', body: form })
        const data = await response.json();
        if (data.error || data.statusCode) {
            toast.error(data.message);
        } else {
            closeModal();
            await getSchedule(false);
        }
        } catch (error) {
            console.log(error);
            toast.error("Internal Server Error");
        }
        setIsLoading(false);
    }

    const openModal = async () => {
        setModalOpen(true);
        setFile(null);
    }

    const actions = [
        { icon: <SaveIcon color='success' />, name: 'שמירה', onClick: saveSchedule},
        { icon: <CheckIcon color="info" />, name: 'בדיקה', onClick: checkSchedule },
        { icon: <UploadFileIcon htmlColor="#9A8B4F" />, name: 'העלאה', onClick: openModal },
        { icon: <DatasetIcon htmlColor='#45B8AC' />, name: 'תצוגה', onClick: scheduleView },
        { icon: <TableChartIcon htmlColor="#009B77" />, name: 'טבלת משמרות', onClick: scheduleTable },
        { icon: <RestartAltIcon color='error' />, name: 'איפוס', onClick: resetSchedule },
        { icon: <DeleteIcon color='error' />, name: 'מחיקה', onClick: deleteSchedule },
      ];

  return (
    <>
    <Modal open={modalOpen} closeModal={closeModal} children={modalChildren} textContent="" confirmButtonText='העלאה' title="העלאת קובץ אקסל" confirmButton={uploadExcel}/>
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