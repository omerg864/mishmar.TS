import React, { useState, useEffect, useRef } from 'react'
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { User } from '../types/types';
import Cookies from 'universal-cookie';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import { StyledTableCell, StyledTableRow } from '../components/StyledTable';
import Modal from '../components/Modal';


interface IProps {
  manager: boolean;
}

const Users = (props: IProps) => {

  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [modal, setModal] = useState<{open: boolean, user: User}>({open: false, user: {} as User});
  const cookies = new Cookies();
  const [height, setHeight] = useState(100);

  const getUsers = async (loading: boolean) => {
    if (loading) 
      setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/all`, { headers: { authorization: 'Bearer ' + cookies.get('userToken')}});
      const data = await response.json();
      if (data.error) {
        toast.error(data.message);
      } else {
        setUsers(data);
      }
    } catch (e) {
      console.log(e);
      toast.error('Internal server error');
    }
    if (loading)
      setIsLoading(false);
  }

  const saveUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/many`, { headers: { "Content-Type": "application/json" ,authorization: 'Bearer ' + cookies.get('userToken')}, 
      method: 'PATCH', body: JSON.stringify(users)});
      const data = await response.json();
      if (data.error) {
        toast.error(data.message);
      } else {
        toast.success("Users saved");
      }
    } catch (e) {
      console.log(e);
      toast.error('Internal server error');
    }
    setIsLoading(false);
  }

  const openModal = (e: any) => {
    setModal({open: true, user: {...((users.find(user => user._id === e.target.value) as User)), password: "", confirmPassword: ""}});
  }

  const changePassword = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/manager`, { headers: { "Content-Type": "application/json" ,authorization: 'Bearer ' + cookies.get('userToken')}, 
      method: 'PATCH', body: JSON.stringify(modal.user)});
      const data = await response.json();
      if (data.error) {
        toast.error(data.message);
      } else {
        toast.success("Password Changed");
        setModal({open: false, user: {password: "", confirmPassword: ""} as User})
      }
    } catch (e) {
      console.log(e);
      toast.error('Internal server error');
    }
    setIsLoading(false);
  }

  const handleTextChange = (e: any) => {
    const [ name, id ] = e.target.name.split("&&");
    let users_temp = users.map(user => {
      if (user._id === id) {
        user[name as keyof User] = e.target.value;
      }
      return user;
    })
    setUsers(users_temp);
  }

  const handleCheckBoxChange = (e: any) => {
    const [ name, id ] = e.target.name.split("&&");
    let users_temp = users.map(user => {
      if (user._id === id) {
        if (user.role?.includes(name)){
          user.role = user.role.filter(role => role !== name);
        } else {
          user.role = [...(user.role as string[]), name];
        }
      }
      return user;
    })
    setUsers(users_temp);
  }

  const deleteUser = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${e.target.value}`, { headers: { "Content-Type": "application/json" ,authorization: 'Bearer ' + cookies.get('userToken')}, 
      method: 'DELETE'});
      const data = await response.json();
      if (data.error) {
        toast.error(data.message);
      } else {
        toast.success("User deleted");
        await getUsers(false);
      }
    } catch (e) {
      console.log(e);
      toast.error('Internal server error');
    }
    setIsLoading(false);
  }

  const modalChildren = (<>
  <TextField name='password' sx={{marginTop: '10px'}} type="password" label={"Password"} value={modal.user.password} onChange={(e) => setModal({open: true, user: {...modal.user, password: e.target.value}})}/>
  <div>
  <TextField name='confirmPassword' sx={{marginTop: '10px'}} type="password" label={"Confirm Password"} value={modal.user.confirmPassword} onChange={(e) => setModal({open: true, user: {...modal.user, confirmPassword: e.target.value}})}/>
  </div>
  </>)

  useEffect(() => {
    if (props.manager) {
      getUsers(true);
    }
  }, [props.manager]);


  const changeRef = (el: any) => {
    if (el){
      setHeight(el.clientHeight as number);
    }
  }

  if (!props.manager) {
    return <></>
  }

  if (isLoading) {
    return <Spinner />
  }


  return (
    <main>
      <Modal open={modal.open} title={"Change Password"} confirmButtonText={"Change Password"}
       textContent={""} closeModal={() => setModal({open: false, user: {password: "", confirmPassword: ""} as User})} children={modalChildren} confirmButton={changePassword} />
        <h1>Users</h1>
        <Button variant="contained" color="primary" onClick={saveUsers}>Save</Button>
        <TableContainer style={{minHeight: height}} component={Paper}>
      <Table ref={changeRef} sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center">Name</StyledTableCell>
            <StyledTableCell align="center">Nickname</StyledTableCell>
            <StyledTableCell align="center">Email</StyledTableCell>
            <StyledTableCell align="center">Username</StyledTableCell>
            <StyledTableCell align="center">Site Manager</StyledTableCell>
            <StyledTableCell align="center">Shift Manager</StyledTableCell>
            <StyledTableCell align="center">Password</StyledTableCell>
            <StyledTableCell align="center"></StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} onChange={handleTextChange} value={user.name} name={`name&&${user._id}`} label="Full Name"/></TableCell>
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} onChange={handleTextChange} value={user.nickname} name={`nickname&&${user._id}`} label="Nickname"/></TableCell>
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} onChange={handleTextChange} value={user.email} type="email" name={`email&&${user._id}`} label="Email"/></TableCell>
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} onChange={handleTextChange} value={user.username} name={`username&&${user._id}`} label="Username"/></TableCell>
              <TableCell align="center" scope="row"><Checkbox name={`SITE_MANAGER&&${user._id}`} onChange={handleCheckBoxChange} checked={user.role?.includes("SITE_MANAGER")}/></TableCell>
              <TableCell align="center" scope="row"><Checkbox name={`SHIFT_MANAGER&&${user._id}`} onChange={handleCheckBoxChange} checked={user.role?.includes("SHIFT_MANAGER")}/></TableCell>
              <TableCell align="center" scope="row">
                <Button variant="contained" color="info" value={user._id} onClick={openModal}>Change Password</Button>
              </TableCell>
              <TableCell align="center" scope="row">
                <Button variant="contained" color="error" value={user._id} onClick={deleteUser}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </main>
  )
}

export default Users