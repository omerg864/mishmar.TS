import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { toast} from 'react-toastify';
import Spinner from '../components/Spinner'
import { Box, Switch, FormControlLabel, Paper, Button } from '@mui/material';
import Cookies from 'universal-cookie';
import NotAuthorized from '../components/NotAuthorized';

interface IProps {
  manager: boolean;
}

const Manager = (props: IProps) => {

    const navigate = useNavigate();
    const [checked, setChecked] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const cookies = new Cookies();

    const getSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/settings/general')
            const data = await response.json();
            if (data.error || data.statusCode) {
                fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `settings/general`, component: "Manager" })})
                toast.error(data.message);
            } else {
                setChecked(data.submit);
            }
        } catch (err) {
            fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `settings/general`, component: "Manager" })})
            toast.error('Internal Server Error')
        }
        setLoading(false);
    }

    useEffect(() => {
        getSubmit();
    }, []);

    const changeSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(e.target.checked);
        try {
            const response = await fetch('/api/settings', { headers: { 'Authorization': 'Bearer ' + cookies.get('userToken'), "Content-type": "application/json"} ,method: 'PATCH', body: JSON.stringify({submit: e.target.checked})})
            const data = await response.json();
            if (data.error) {
                fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `settings`, component: "Manager" })})
                toast.error(data.message);
            } else {
                toast.success("????????");
            }
        } catch(err) {
            fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `settings`, component: "Manager" })})
            toast.error('Internal Server Error')
        }
    }

    const goToSettings = () => {
        navigate('/settings')
    }

    const goToSchedules = () => {
        navigate('/schedules')
    }

    const goToNewSchedule = () => {
        navigate('/schedule/new')
    }

    const goToStructure = () => {
        navigate('/structure')
    }

    const goToUsers = () => {
        navigate('/users')
    }

    const goToQuality = () => {
        navigate('/users/quality')
    }

    const goToEvents = () => {
        navigate('/events')
    }

    const goToPosts = () => {
        navigate('/posts')
    }

    const goToNewPost = () => {
        navigate('/post/new')
    }

    if(!props.manager) {
        return <NotAuthorized />;
    }

    if (loading) {
        return <Spinner />
    }
    
  return (
    <main>
        <h1>?????? ????????</h1>
      <Box className='box-container' component={Paper}>
      <FormControlLabel control={<Switch onChange={changeSubmit} checked={checked} />} label="???????? ??????????/?????????? ?????????? ????????????" />
        <div className='manager-div'>
        <Button variant="contained" color="info" onClick={goToSettings} >????????????</Button>
        </div>
        <h2 style={{marginTop: 0}}>??????????????</h2>
        <div className='manager-div'>
        <Button variant="contained" color="success" onClick={goToSchedules} >??????????????</Button>
        <Button variant="contained" color="primary" onClick={goToNewSchedule} >?????????? ??????</Button>
        <Button variant="contained" color="info" onClick={goToStructure} >???????? ??????????</Button>
        </div>
        <h2 style={{marginTop: 0}}>??????????????</h2>
        <div className='manager-div'>
        <Button variant="contained" color="success" onClick={goToUsers} >??????????????</Button>
        <Button variant="contained" color="info" onClick={goToQuality} >??????????????</Button>
        </div>
        <h2 style={{marginTop: 0}}>??????????????</h2>
        <div className='manager-div'>
        <Button variant="contained" color="success" onClick={goToEvents} >??????????????</Button>
        </div>
        <h2 style={{marginTop: 0}}>????????????</h2>
        <div className='manager-div'>
        <Button variant="contained" color="success" onClick={goToPosts} >????????????</Button>
        <Button variant="contained" color="primary" onClick={goToNewPost} >???????? ??????</Button>
        </div>
    </Box>  
    </main>
  )
}

export default Manager