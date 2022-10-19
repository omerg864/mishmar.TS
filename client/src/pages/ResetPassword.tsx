import React, { ReactFragment, useEffect, useState} from 'react'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify';
import { Button, TextField } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import PasswordRules from '../components/PasswordRules'
import { password_regex } from '../types/regularExpressions'
import { Passwords } from '../types/types';
import PasswordInput from '../components/PasswordInput';

interface IProps {
  authenticated: boolean;
}

const ResetPassword = (props: IProps) => {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordData, setPasswordData] = useState<Passwords>({ password: "", confirmPassword: ""});
  const [token, setToken] = useState<boolean>(false);
  const { reset_token } = useParams();
  const navigate = useNavigate();


  const checkToken = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/resetPassword/${reset_token}`)
      const data = await response.json();
      if (data.error || data.statusCode) {
        toast.error(data.message);
      } else {
        setToken(true);
      }
    } catch (err) {
      console.log(err);
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
        toast.error(data.message);
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.log(err);
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
    return <></>;
  }


  return (
    <main>
      {token && <> <h1>איפוס סיסמה</h1>
      <form onSubmit={changePassword}>
      <PasswordInput sx={{marginTop: '10px'}} id="password" label="סיסמה" name="password" value={passwordData.password} onChange={handleChange}/>
      <PasswordRules />
    <div style={{marginTop: '10px'}}>
    <PasswordInput sx={{marginTop: '10px'}} name='confirmPassword' id='confirmPassword' label={"הכנס סיסמה שוב"} value={passwordData.confirmPassword} onChange={handleChange}/>
    </div>
    <Button style={{marginTop: '10px'}} variant="contained" color="primary" type="submit">שנה סיסמה</Button>
    </form></>}
    </main>
  )
}

export default ResetPassword