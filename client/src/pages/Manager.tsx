import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { toast} from 'react-toastify';
import Spinner from '../components/Spinner'
import Switch from '@mui/material/Switch';
import { FormControlLabel } from '@mui/material';
import Cookies from 'universal-cookie';

interface IProps {
  manager: boolean;
}

const Manager = (props: IProps) => {

    const navigate = useNavigate();
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const cookies = new Cookies();

    const getSubmit = async () => {
        setLoading(true);
        const response = await fetch('http://localhost:5000/settings/general')
        const data = await response.json();
        if (data.error) {
            toast.error(data.message);
        } else {
            setChecked(data.submit);
        }
        setLoading(false);
    }

    useEffect(() => {
        getSubmit();
    }, []);

    const changeSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.checked);
        setChecked(e.target.checked);
        const response = await fetch('http://localhost:5000/settings', { headers: { 'Authorization': 'Bearer ' + cookies.get('userToken'), "Content-type": "application/json"} ,method: 'PATCH', body: JSON.stringify({submit: e.target.checked})})
        const data = await response.json();
        if (data.error) {
            toast.error(data.message);
        } else {
            toast.success("Changed");
        }
    }

    if(!props.manager) {
        return <></>;
    }
    
  return (
    <main>
      <div className='container'>
        <h1>Manager</h1>
        <div className='manager-div'>
        <FormControlLabel control={<Switch onChange={changeSubmit} checked={checked} />} label="Submit" />
        </div>
        <h2>Schedule</h2>
        <div className='manager-div'>
            <Link to="/schedules" >Schedules</Link>
            <Link to="/schedule/new" >New Schedule</Link>
            <Link to="/structure" >Structure</Link>
        </div>
        <h2>Users</h2>
        <div className='manager-div'>
            <Link to="/users" >Users</Link>
            <Link to="/quality" >Quality</Link>
        </div>
        <h2>Events</h2>
        <div className='manager-div'>
            <Link to="/events" >Events</Link>
        </div>
        <h2>Posts</h2>
        <div className='manager-div'>
            <Link to="/posts" >Posts</Link>
            <Link to="/post/new" >New Post</Link>
        </div>
    </div>  
    </main>
  )
}

export default Manager