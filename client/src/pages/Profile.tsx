import { Card, CardContent, Typography, TextField, Button } from '@mui/material'
import React, { useState } from 'react'
import Cookies from 'universal-cookie'
import { toast } from 'react-toastify'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import { email_regex, password_regex } from '../types/regularExpressions'
import PasswordRules from '../components/PasswordRules'
import { Passwords } from '../types/types'


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
      if (data.error) {
        toast.error(data.message);
      } else {
        toast.success("Settings saved");
        cookies.set('user', data);
      }
    } catch (e) {
      console.log(e);
      toast.error('Internal server error');
    }
    setLoading(false);
  }

  const updatePassword = async () => {
    if (passwordData.password === ""){
      toast.error('Password is required');
      return;
    }
    if (passwordData.confirmPassword === ""){
      toast.error('Please enter password again');
      return;
    }
    if (!password_regex.test(passwordData.password)){
      toast.error('Please enter a valid password');
      return;
    }
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('Password do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/users`, { headers: { "Content-Type": "application/json" ,authorization: 'Bearer ' + cookies.get('userToken')}, 
      method: 'PATCH', body: JSON.stringify(passwordData)});
      const data = await response.json();
      if (data.error) {
        toast.error(data.message);
      } else {
        toast.success("Password Changed");
        closeModal();
      }
    } catch (e) {
      console.log(e);
      toast.error('Internal server error');
    }
    setLoading(false);
  }

  const closeModal = () => {
    setModal(false);
    setPasswordData({ password: '', confirmPassword: ''});
  }

  const modalChildren = (<>
    <TextField name='password' required sx={{marginTop: '10px'}} type="password" label={"Password"} value={passwordData.password} onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}/>
    <PasswordRules />
    <div>
    <TextField name='confirmPassword' required sx={{marginTop: '10px'}} type="password" label={"Confirm Password"} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}/>
    </div>
    </>)

  if (loading) {
    return <Spinner />;
  }

  if (!props.authenticated) {
    return <></>
  }

  return (
    <main>
      <Modal open={modal} closeModal={closeModal} textContent="" title='Password Change' confirmButtonText='Change Password' children={modalChildren} confirmButton={updatePassword} />
        <h1>Profile</h1>
        <Card sx={{ width: '60%' }}>
          <CardContent sx={{textAlign: 'center', position: 'relative'}}>
            <form onSubmit={handleSubmit}>
            <TextField value={formData.username} required onChange={handleChange} name="username" color="primary" label="Username" />
            <div style={{marginTop: '10px'}}>
              <TextField value={formData.email} required onChange={handleChange} name="email" type="email" label="Email" />
            </div>
            <div style={{marginTop: '10px'}}>
              <TextField value={formData.name} required onChange={handleChange} name="name" color="primary" label="Name" />
            </div>
            <div style={{marginTop: '10px', display: 'flex', justifyContent: 'space-between', gap: '10px'}}>
            <Button variant="contained" color="primary" type="submit">Save</Button>
            <Button variant="contained" color="secondary" onClick={() => setModal(true)} >Change Password</Button>
            </div>
            </form>
          </CardContent>
      </Card>
    </main>
  )
}

export default Profile