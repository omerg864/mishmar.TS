import React, { useState } from 'react'
import Spinner from '../components/Spinner'
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { password_regex, email_regex } from '../types/regularExpressions'
import PasswordRules from '../components/PasswordRules'

interface IProps {
    authenticated: boolean;
}

const Register = (props: IProps) => {

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', username: '', password: '', confirmPassword: '', email: '', pin_code: ''});
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (!password_regex.test(formData.password)) {
            toast.error('please enter a valid password');
            return;
        }
        if (!email_regex.test(formData.email)) {
            toast.error('please enter a valid email');
            return;
        }
        setIsLoading(true);
        const response = await fetch(`/api/users/register`, { headers: {"Content-type": "application/json"} ,method: 'POST', body: JSON.stringify({user: formData, pin_code: formData.pin_code})})
        const data = await response.json();
        if (data.error) {
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
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
            <TextField className='text_input' id="name" label="Full Name" name='name' required variant="outlined" onChange={handleChange} />
            <TextField className='text_input' id="username" label="Username" name='username' required variant="outlined" onChange={handleChange} />
            <TextField className='text_input' id="email" label="Email" name='email' type="email" required variant="outlined" onChange={handleChange} />
            <TextField className='text_input' id="password" label="Password" name="password" type="password" required variant="outlined" onChange={handleChange} />
            <PasswordRules />
            <TextField className='text_input' id="confirmPassword" label="Confirm Password" name="confirmPassword" type="password" required variant="outlined" onChange={handleChange} />
            <TextField className='text_input' id="pin_code" label="Register Code" name='pin_code' required variant="outlined" onChange={handleChange} />
            <Button variant="contained" color="primary" type="submit" >Register</Button>
            </form>
        </div>
    </main>
  )
}

export default Register