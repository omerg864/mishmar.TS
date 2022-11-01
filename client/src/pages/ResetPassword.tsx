import React, { useEffect, useState } from 'react'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify';
import { Button, Box, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import PasswordRules from '../components/PasswordRules'
import { password_regex } from '../types/regularExpressions'
import { Passwords } from '../types/types';
import PasswordInput from '../components/PasswordInput';
import LogoutMessage from '../components/LogoutMessage';
import Cookies from 'universal-cookie';

interface IProps {
  authenticated: boolean;
}

const ResetPassword = (props: IProps) => {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordData, setPasswordData] = useState<Passwords>({ password: "", confirmPassword: ""});
  const [token, setToken] = useState<boolean>(false);
  const { reset_token } = useParams();
  const navigate = useNavigate();
  const cookies = new Cookies();


  const checkToken = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/resetPassword/${reset_token}`)
      const data = await response.json();
      if (data.error || data.statusCode) {
        fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `users/resetPassword/${reset_token}`, component: "ResetPassword" })})
        toast.error(data.message);
      } else {
        setToken(true);
      }
    } catch (err) {
      fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `users/resetPassword/${reset_token}`, component: "ResetPassword" })})
      toast.error("Internal Server Error");
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (!props.authenticated) {
      checkToken();
    }
  }, [props.authenticated]);


  const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('סיסמאות לא תואמות');
      return;
    }
    if (!password_regex.test(passwordData.password)) {
      toast.error('סיסמה לא תקינה');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/resetPassword/${reset_token}`, { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: JSON.stringify(passwordData) });
      const data = await response.json();
      if (data.error || data.statusCode) {
        fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `users/resetPassword/${reset_token}`, component: "ResetPassword" })})
        toast.error(data.message);
      } else {
        navigate('/login');
      }
    } catch (err) {
      fetch('/api/logs', { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `users/resetPassword/${reset_token}`, component: "ResetPassword" })})
      toast.error("Internal Server Error");
    }
    setIsLoading(false);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({...passwordData, [e.target.name]: e.target.value})
  }


  if (isLoading) {
    return <Spinner />;
  }

  if (props.authenticated) {
    return <LogoutMessage />
  }

  if (!token) {
    return <></>
  }


  return (
    <main>
      <h1>איפוס סיסמה</h1>
    <Box className='box-container' component={Paper}>
      <form className='box-container' style={{textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px'}} onSubmit={changePassword}>
        <PasswordInput id="password" label="סיסמה" name="password" value={passwordData.password} onChange={handleChange}/>
        <PasswordRules />
        <PasswordInput name='confirmPassword' id='confirmPassword' label={"הכנס סיסמה שוב"} value={passwordData.confirmPassword} onChange={handleChange}/>
        <Button variant="contained" color="primary" type="submit">שנה סיסמה</Button>
      </form>
    </Box>
  </main>
  )
}

export default ResetPassword