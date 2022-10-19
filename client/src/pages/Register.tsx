import React, { useState } from 'react'
import Spinner from '../components/Spinner'
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { password_regex, email_regex } from '../types/regularExpressions'
import PasswordRules from '../components/PasswordRules'
import PasswordInput from '../components/PasswordInput';

interface IProps {
    authenticated: boolean;
}

const Register = (props: IProps) => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<{ name: string, username: string, password: string, confirmPassword: string, email: string, pin_code: string}>({ name: '', username: '', password: '', confirmPassword: '', email: '', pin_code: ''});
    const navigate = useNavigate();

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
        const response = await fetch(`/api/users/register`, { headers: {"Content-type": "application/json"} ,method: 'POST', body: JSON.stringify({user: formData, pin_code: formData.pin_code})})
        const data = await response.json();
        if (data.error || data.statusCode) {
            toast.error(data.message);
        } else {
            navigate('/login');
        }
        setIsLoading(false);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value });
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
            <h1>הרשמה</h1>
            <form onSubmit={handleSubmit}>
            <TextField className='text_input' id="name" label="שם מלא" name='name' required variant="outlined" onChange={handleChange} />
            <TextField className='text_input' id="username" label="שם משתמש" name='username' required variant="outlined" onChange={handleChange} />
            <TextField className='text_input' id="email" label="אימייל" name='email' type="email" required variant="outlined" onChange={handleChange} />
            <PasswordInput id="password" label="סיסמה" name="password" onChange={handleChange}/>
            <PasswordRules />
            <PasswordInput id="confirmPassword" label="סיסמה שוב" name="confirmPassword" onChange={handleChange}/>
            <TextField className='text_input' id="pin_code" label="קוד הרשמה" name='pin_code' required variant="outlined" onChange={handleChange} />
            <Button variant="contained" color="primary" type="submit" >הירשם</Button>
            </form>
        </div>
    </main>
  )
}

export default Register