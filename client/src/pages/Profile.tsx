import { Card, CardContent, Typography, TextField, Button } from '@mui/material'
import React, { useState } from 'react'
import Cookies from 'universal-cookie'
import { toast } from 'react-toastify'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'


interface IProps {
  authenticated: boolean;
}

const Profile = (props: IProps) => {
  const cookies = new Cookies();
  const [formData, setFormData] = useState({ username: cookies.get('user').username, email: cookies.get('user').email, name: cookies.get('user').name})
  const [passwordData, setPasswordData] = useState({ password:"", confirmPassword: ''});
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)


  const handleChange = (e: any) => {
    setFormData({...formData, [e.target.name]: e.target.value })
  }


  const handleSubmit = async (e: any) => {
    e.preventDefault()
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
    <TextField name='password' sx={{marginTop: '10px'}} type="password" label={"Password"} value={passwordData.password} onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}/>
    <div>
    <TextField name='confirmPassword' sx={{marginTop: '10px'}} type="password" label={"Confirm Password"} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}/>
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