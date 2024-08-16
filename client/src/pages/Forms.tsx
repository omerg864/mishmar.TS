import React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import MonthPicker from '../components/MonthPicker';
import { Box, Button, Paper } from '@mui/material';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';

const Forms = () => {

    const [dateData, setDateData] = React.useState<{month: number, year: number}>({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const cookies = new Cookies();

    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const changeDate = (value: Dayjs | null) => {
        setDateData({
            month: value?.month() ? value.month() + 1 : 1,
            year: value?.year() ? value.year() : 2024
        });
    }

    const getHFile = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/hfile`, { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: JSON.stringify({month: dateData.month, year: dateData.year}) });
            const blob = await response.blob();
            if (response.status === 201 || response.status === 200) {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = `יומן חימוש ${dateData.month}-${dateData.year}.docx`;
                a.click();
            } else {
                toast.error('לא ניתו להוריד קובץ');
                fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: response, path: `shifts/excel'`, component: "ScheduleShift" })})
            }
        } catch (err) {
            fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({err, path: `forms/hfile`, component: "Forms" })})
        }
        setIsLoading(false);
    }

    const getBFile = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/bfile`, { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: JSON.stringify({month: dateData.month, year: dateData.year}) });
            const blob = await response.blob();
            if (response.status === 201 || response.status === 200) {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = `יומן בקרה ${dateData.month}-${dateData.year}.docx`;
                a.click();
            } else {
                toast.error('לא ניתו להוריד קובץ');
                fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: response, path: `shifts/excel'`, component: "ScheduleShift" })})
            }
        } catch (err) {
            fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({err, path: `forms/hfile`, component: "Forms" })})
        }
        setIsLoading(false);
    }

    if (isLoading) {
        return <Spinner />;
    }


  return (
    <main>
        <h1>טפסים</h1>
        <Box className='box-container' component={Paper}>
            <MonthPicker value={dayjs(new Date(dateData.year, dateData.month - 1, 1))} onChange={changeDate} />
            <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                <Button variant="contained" color="primary" onClick={getHFile}>יומן חימוש</Button>
                <Button variant="contained" color="info" onClick={getBFile}>יומן בקרה</Button>
            </div>
        </Box>
    </main>
  )
}

export default Forms