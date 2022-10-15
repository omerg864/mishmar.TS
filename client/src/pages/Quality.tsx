import React, { useState, useEffect, useRef } from 'react'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { UserQuality } from '../types/types';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { StyledTableCell, StyledTableRow } from '../components/StyledTable';



interface IProps {
    manager: boolean;
}

const Quality = (props: IProps) => {

    const [isLoading, setIsLoading] = useState(false);
    const cookies = new Cookies();
    const [users, setUsers] = useState<UserQuality[]>([]);
    const tableRef = useRef<HTMLTableElement>(null);
    const [height, setHeight] = useState(100);

    const getUsers = async () => {
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
        setIsLoading(false);
    }

    const handleNumberChange = (e: any) => {
        const [ name, id ] = e.target.name.split("&&");
        let users_temp = users.map(user => {
          if (user._id === id) {
            user[name as keyof {night: number, weekend_night: number, weekend_day: number, friday_noon: number }] = +e.target.value;
          }
          return user;
        })
        setUsers(users_temp);
    }

    const handleTextChange = (e: any) => {
        const [ name, id ] = e.target.name.split("&&");
        let users_temp = users.map(user => {
          if (user._id === id) {
            user.nickname = e.target.value;
          }
          return user;
        })
        setUsers(users_temp);
    }

    const saveUsers = async (loading: boolean) => {
        if (loading)
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
        if (loading)
            setIsLoading(false);
    }

    const resetQuality = async () => {
        setIsLoading(true);
        let temp_users = [...users];
        temp_users = temp_users.map(user => {
            user.friday_noon = 0
            user.weekend_day = 0
            user.weekend_night = 0
            user.night = 0
            return user;
        })
        setUsers(temp_users);
        await saveUsers(false);
        setIsLoading(false);
    }


    useEffect(() => {
        if (props.manager) {
            getUsers();
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
        <h1>Users Quality</h1>
        <div style={{display: 'flex', justifyContent: "space-between", width: "100%", padding: "10px", boxSizing: "border-box"}}>
        <Button variant="contained" color="primary" onClick={() => saveUsers(true)}>Save</Button>
        <Button variant="contained" color="error" onClick={resetQuality}>Reset</Button>
        </div>
        <TableContainer style={{minHeight: height}} component={Paper}>
      <Table ref={changeRef} sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center">Nickname</StyledTableCell>
            <StyledTableCell align="center">Night</StyledTableCell>
            <StyledTableCell align="center">Friday Noon</StyledTableCell>
            <StyledTableCell align="center">Weekend Night</StyledTableCell>
            <StyledTableCell align="center">Weekend Day</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
            <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} onChange={handleTextChange} value={user.nickname} name={`nickname&&${user._id}`} label="Nickname"/></TableCell>
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} onChange={handleNumberChange} type="number" value={user.night} name={`night&&${user._id}`} label="Night"/></TableCell>
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} onChange={handleNumberChange} type="number" value={user.friday_noon} name={`friday_noon&&${user._id}`} label="Friday Noon"/></TableCell>
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} onChange={handleNumberChange} type="number" value={user.weekend_night} name={`weekend_night&&${user._id}`} label="Weekend Night"/></TableCell>
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} onChange={handleNumberChange} type="number" value={user.weekend_day} name={`weekend_day&&${user._id}`} label="Weekend Day"/></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </main>
  )
}

export default Quality