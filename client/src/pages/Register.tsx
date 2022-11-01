import React, { useState } from 'react'
import Spinner from '../components/Spinner'
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';
import { Box, Paper, Button, TextField } from '@mui/material';
import { password_regex, email_regex } from '../types/regularExpressions'
import PasswordRules from '../components/PasswordRules'
import PasswordInput from '../components/PasswordInput';
import LogoutMessage from '../components/LogoutMessage';
import Cookies from 'universal-cookie';

interface IProps {
    authenticated: boolean;
}

const Register = (props: IProps) => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<{ name: string, username: string, password: string, confirmPassword: string, email: string, pin_code: string}>({ name: '', username: '', password: '', confirmPassword: '', email: '', pin_code: ''});
    const navigate = useNavigate();
    const cookies = new Cookies();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('סיסמאות לא תואמות');
            return;
        }
        if (!password_regex.test(formData.password)) {
            toast.error('סיסמה לא תקינה');
            return;
        }
        if (!email_regex.test(formData.email)) {
            toast.error('אימייל לא תקין');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`/api/users/register`, { headers: {"Content-type": "application/json"} ,method: 'POST', body: JSON.stringify({user: formData, pin_code: formData.pin_code})})
            const data = await response.json();
            if (data.error || data.statusCode) {
                fetch('/api/logs', {method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `users/register`, component: "Register" })})
                toast.error(data.message);
            } else {
                navigate('/login');
            }
            setIsLoading(false);
        } catch (err) {
            fetch('/api/logs', {method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `users/register`, component: "Register" })})
            toast.error('Internal Server Error')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    }

    if (isLoading) {
        return <Spinner />;
    }

    if(props.authenticated) {
        return <LogoutMessage />;
      }

  return (
    <main>
        <h1>הרשמה</h1>
        <Box className='box-container' component={Paper}>
            <form className='box-container' style={{textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px'}} onSubmit={handleSubmit}>
            <TextField fullWidth className='text_input' id="name" label="שם מלא" name='name' required variant="outlined" onChange={handleChange} />
            <TextField fullWidth className='text_input' id="username" label="שם משתמש" name='username' required variant="outlined" onChange={handleChange} />
            <TextField fullWidth className='text_input' id="email" label="אימייל" name='email' type="email" required variant="outlined" onChange={handleChange} />
            <PasswordInput id="password" label="סיסמה" name="password" onChange={handleChange}/>
            <PasswordRules />
            <PasswordInput id="confirmPassword" label="סיסמה שוב" name="confirmPassword" onChange={handleChange}/>
            <TextField fullWidth className='text_input' id="pin_code" label="קוד הרשמה" name='pin_code' required variant="outlined" onChange={handleChange} />
            <Button variant="contained" color="primary" type="submit" >הירשם</Button>
            </form>
        </Box>
    </main>
  )
}

export default Register