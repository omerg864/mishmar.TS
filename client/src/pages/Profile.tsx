import { Paper, Box, TextField, Button } from '@mui/material'
import React, { useState } from 'react'
import Cookies from 'universal-cookie'
import { toast } from 'react-toastify'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import { email_regex, password_regex } from '../types/regularExpressions'
import PasswordRules from '../components/PasswordRules'
import { Passwords } from '../types/types'
import PasswordInput from '../components/PasswordInput'
import NotAuthorized from '../components/NotAuthorized'


interface IProps {
  authenticated: boolean;
}

const Profile = (props: IProps) => {
  const cookies = new Cookies();
  const [formData, setFormData] = useState<{username: string, email: string, name: string}>({ username: cookies.get('user').username, email: cookies.get('user').email, name: cookies.get('user').name})
  const [passwordData, setPasswordData] = useState<Passwords>({ password:"", confirmPassword: ''});
  const [loading, setLoading] = useState<boolean>(false)
  const [modal, setModal] = useState<boolean>(false)


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value })
  }


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email_regex.test(formData.email)) {
      toast.error('please enter a valid email');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/users`, { headers: { "Content-Type": "application/json" ,authorization: 'Bearer ' + cookies.get('userToken')}, 
      method: 'PATCH', body: JSON.stringify(formData)});
      const data = await response.json();
      if (data.error || data.statusCode) {
        toast.error(data.message);
      } else {
        toast.success("הגדרות נשמרו");
        cookies.set('user', data);
      }
    } catch (e) {
      console.log(e);
      toast.error('Internal Server Error');
    }
    setLoading(false);
  }

  const updatePassword = async () => {
    if (passwordData.password === ""){
      toast.error('נא הכנס סיסמה');
      return;
    }
    if (passwordData.confirmPassword === ""){
      toast.error('נא הכנס סיסמה בשנית');
      return;
    }
    if (!password_regex.test(passwordData.password)){
      toast.error('סיסמה לא תקינה');
      return;
    }
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('סיסמאות לא תואמות');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/users`, { headers: { "Content-Type": "application/json" ,authorization: 'Bearer ' + cookies.get('userToken')}, 
      method: 'PATCH', body: JSON.stringify(passwordData)});
      const data = await response.json();
      if (data.error || data.statusCode) {
        toast.error(data.message);
      } else {
        toast.success("סיסמה שונתה");
        closeModal();
      }
    } catch (e) {
      console.log(e);
      toast.error('Internal Server Error');
    }
    setLoading(false);
  }

  const closeModal = () => {
    setModal(false);
    setPasswordData({ password: '', confirmPassword: ''});
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({...passwordData, [e.target.name]: e.target.value})
  }

  const modalChildren = (<>
  <PasswordInput sx={{marginTop: '10px'}} name="password" id="password" label="סיסמה" onChange={handlePasswordChange} />
    <PasswordRules />
    <div>
    <PasswordInput sx={{marginTop: '10px'}} name="confirmPassword" id="confirmPassword" label={"הכנס סיסמה שוב"} onChange={handlePasswordChange} />
    </div>
    </>)

  if (loading) {
    return <Spinner />;
  }

  if (!props.authenticated) {
    return <NotAuthorized />
  }

  return (
    <main>
      <Modal open={modal} closeModal={closeModal} textContent="" title='שינוי סיסמה' confirmButtonText='שנה' children={modalChildren} confirmButton={updatePassword} />
        <h1>פרופיל</h1>
        <Box className="box-container" component={Paper}>
            <form className='box-container' style={{textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px'}} onSubmit={handleSubmit}>
            <TextField fullWidth value={formData.username} required onChange={handleChange} name="username" color="primary" label="שם משתמש" />
              <TextField fullWidth value={formData.email} required onChange={handleChange} name="email" type="email" label="אימייל" />
              <TextField fullWidth value={formData.name} required onChange={handleChange} name="name" color="primary" label="שם מלא" />
            <div style={{width: '100%',marginTop: '10px', display: 'flex', justifyContent: 'space-between', gap: '10px'}}>
            <Button variant="contained" color="primary" type="submit">שמור</Button>
            <Button variant="contained" color="secondary" onClick={() => setModal(true)} >שנה סיסמה</Button>
            </div>
            </form>
      </Box>
    </main>
  )
}

export default Profile