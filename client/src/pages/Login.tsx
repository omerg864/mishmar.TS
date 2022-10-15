import React, { useState } from 'react'
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Spinner from '../components/Spinner';
import { Link, useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';
import Cookies from 'universal-cookie';
import { Dispatch, SetStateAction } from "react";
import { addDays } from '../functions/functions';

interface IProps {
    authenticated: boolean;
    setAuthenticated: Dispatch<SetStateAction<boolean>>;
    setManager: Dispatch<SetStateAction<boolean>>;
  }


const Login = (props: IProps) => {

    const [userData, setUserData] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const cookies = new Cookies();


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const response = await fetch(`/api/users/login`, { headers: {"Content-type": "application/json"} ,method: 'POST', body: JSON.stringify(userData)})
        const data = await response.json();
        if (data.error) {
            toast.error(data.message);
        } else {
            let date30 = addDays(new Date(), 30);
            cookies.set('userToken', data.token, { path: '/', expires: date30 });
            cookies.set('user', JSON.stringify(data.user), { path: '/', expires: date30 });
            props.setAuthenticated(true);
            const roles = data.user.role;
            if (roles.includes('ADMIN') || roles.includes('SITE_MANAGER')) {
                props.setManager(true);
            } else {
              props.setManager(false);
            }
            navigate('/');
        }
        setIsLoading(false);
    }

    if (isLoading) {
        return <Spinner />;
    }

    if(props.authenticated) {
      return <></>;
    }


  return (
    <main>
        <div className='container'>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
            <TextField className='text_input' id="username" label="Username" name='username' required variant="outlined" onChange={(e) => setUserData({...userData, [e.target.name]: e.target.value})} />
            <TextField className='text_input' id="password" label="Password" name="password" type="password" required variant="outlined" onChange={(e) => setUserData({...userData, [e.target.name]: e.target.value})} />
            <Link to="/password/reset/email">Forgot my password?</Link>
            <Button variant="contained" color="primary" type="submit" >Login</Button>
            </form>
        </div>
    </main>
  )
}

export default Login