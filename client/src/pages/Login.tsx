import React, { useState } from 'react'
import Spinner from '../components/Spinner';
import { Link, useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';
import Cookies from 'universal-cookie';
import { Dispatch, SetStateAction } from "react";
import { addDays } from '../functions/functions';
import { Box, Paper, Button, TextField } from '@mui/material';
import PasswordInput from '../components/PasswordInput';
import LogoutMessage from '../components/LogoutMessage';
import GoogleLogin from '../components/GoogleLogin';

interface IProps {
    setAuthenticated: Dispatch<SetStateAction<boolean>>;
    setManager: Dispatch<SetStateAction<boolean>>;
  }


const Login = (props: IProps) => {

    const [userData, setUserData] = useState<{username: string, password: string}>({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const cookies = new Cookies();


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUserData({...userData, [e.target.name]: e.target.value});
    }

    const successfulLogin = (data: any) => {
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

    const responseGoogle = async (authResult: any) => {
      if (authResult["code"]) {
        setIsLoading(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/google`, { headers: {"Content-type": "application/json"} ,method: 'POST', body: JSON.stringify({code: authResult["code"]})})
        const data = await response.json();
        if (data.error || data.statusCode) {          
            fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `users/login`, component: "Login" })})
            toast.error(data.message);
        } else {
            successfulLogin(data);
        }
        } catch(err) {
          fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `users/login`, component: "Login" })})
          toast.error('Internal Server Error')
        }
        setIsLoading(false);
      } else {
        console.log(authResult);
        throw new Error(authResult);
      }
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/login`, { headers: {"Content-type": "application/json"} ,method: 'POST', body: JSON.stringify(userData)})
        const data = await response.json();
        if (data.error || data.statusCode) {          
          fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `users/login`, component: "Login" })})
          toast.error(data.message);
        } else {
          successfulLogin(data);
        }
        } catch(err) {
          fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `users/login`, component: "Login" })})
          toast.error('Internal Server Error')
        }
        setIsLoading(false);
    }

    if (isLoading) {
        return <Spinner />;
    }


  return (
    <main>
      <h1>Login</h1>
        <Box className='box-container' component={Paper}>
            <form className='box-container' style={{textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px'}} onSubmit={handleSubmit}>
                <TextField fullWidth className='text_input' id="username" label="שם משתמש" name='username' required variant="outlined" onChange={handleChange} />
                <PasswordInput name="password" label="סיסמה" id="password" onChange={handleChange}/>
              <Link to="/password/reset/email">שכחתי את הסיסמה</Link>
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <Button variant="contained" color="primary" type="submit" >התחבר</Button>
              <GoogleLogin authResponse={responseGoogle} />
              </div>
            </form>
        </Box>
    </main>
  )
}

export default Login