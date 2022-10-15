import React, { useEffect, useState} from 'react'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify';
import { Button, TextField } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface IProps {
  authenticated: boolean;
}

const ResetPassword = (props: IProps) => {

  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({ password: "", confirmPassword: ""});
  const [token, setToken] = useState(false);
  const { reset_token } = useParams();
  const navigate = useNavigate();


  const checkToken = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/resetPassword/${reset_token}`)
      const data = await response.json();
      if (data.error) {
        toast.error(data.message);
      } else {
        setToken(true);
      }
    } catch (err) {
      console.log(err);
      toast.error("Internal server error");
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (!props.authenticated) {
      checkToken();
    }
  }, [props.authenticated]);


  const changePassword = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/resetPassword/${reset_token}`, { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: JSON.stringify(passwordData) });
      const data = await response.json();
      if (data.error) {
        toast.error(data.message);
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.log(err);
      toast.error("Internal server error");
    }
    setIsLoading(false);
  }



  if (isLoading) {
    return <Spinner />;
  }

  if (props.authenticated) {
    return <></>;
  }


  return (
    <main>
      {token && <> <h1>Reset Password</h1>
      <form onSubmit={changePassword}>
      <TextField name='password' sx={{marginTop: '10px'}} type="password" label={"Password"} value={passwordData.password} onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}/>
    <div style={{marginTop: '10px'}}>
    <TextField name='confirmPassword' sx={{marginTop: '10px'}} type="password" label={"Confirm Password"} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}/>
    </div>
    <Button style={{marginTop: '10px'}} variant="contained" color="primary" type="submit">Change Password</Button>
    </form></>}
    </main>
  )
}

export default ResetPassword