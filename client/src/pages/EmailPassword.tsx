import React, { useState } from 'react'
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner'
import { Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { email_regex } from '../types/regularExpressions'

interface IProps {
  authenticated: boolean;
}

const EmailPassword = (props: IProps) => {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email_regex.test(email)){
      toast.error("דואר אלקטרוני לא תקין");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/forgot`, { headers: { 'Content-Type': 'application/json'}, method: 'POST', body: JSON.stringify({email})});
      const data = await response.json();
      if (data.error || data.statusCode) {
        toast.error(data.message);
      } else {
        toast.success("נשלח כתובת לאיפוס סיסמה למייל");
        navigate("/");
      }
    } catch (e) {
      console.log(e);
      toast.error('Internal Server Error');
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
      <h1>שכחתי את הסיסמה</h1>
      <form onSubmit={handleSubmit}>
      <TextField sx={{minWidth: '180px'}} type="email" required onChange={(e) => setEmail(e.target.value)} value={email} name={`email`} label="אימייל" />
      <div style={{display: 'flex', justifyContent: 'center', marginTop: '10px'}}>
      <Button type="submit" variant="contained" color="primary" >שלח אימייל לאיפוס</Button>
      </div>
      </form>
    </main>
  )
}

export default EmailPassword