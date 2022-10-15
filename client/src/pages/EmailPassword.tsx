import React, { useState } from 'react'
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner'
import { Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface IProps {
  authenticated: boolean;
}

const EmailPassword = (props: IProps) => {

  const [isLoading, setIsLoading] =useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/forgot`, { headers: { 'Content-Type': 'application/json'}, method: 'POST', body: JSON.stringify({email})});
      const data = await response.json();
      if (data.error) {
        toast.error(data.message);
      } else {
        toast.success("Please check your email address");
        navigate("/");
      }
    } catch (e) {
      console.log(e);
      toast.error('Please enter a valid email address');
    }
    setIsLoading(false);
  }
    


  if (isLoading) {
    return <Spinner />
  }

  if (props.authenticated) {
    return <></>
  }

  return (
    <main>
      <h1>Forgot My Password</h1>
      <form onSubmit={handleSubmit}>
      <TextField sx={{minWidth: '180px'}} type="email" required onChange={(e) => setEmail(e.target.value)} value={email} name={`email`} label="Email" />
      <div style={{display: 'flex', justifyContent: 'center', marginTop: '10px'}}>
      <Button type="submit" variant="contained" color="primary" >Send Reset Email</Button>
      </div>
      </form>
    </main>
  )
}

export default EmailPassword