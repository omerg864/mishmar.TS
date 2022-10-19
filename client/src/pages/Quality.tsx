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

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const cookies = new Cookies();
    const [users, setUsers] = useState<UserQuality[]>([]);
    const [height, setHeight] = useState<number>(100);

    const getUsers = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/users/all`, { headers: { authorization: 'Bearer ' + cookies.get('userToken')}});
          const data = await response.json();
          if (data.error) {
            toast.error(data.message);
          } else {
            setUsers(data);
          }
        } catch (e) {
          console.log(e);
          toast.error('Internal Server Error');
        }
        setIsLoading(false);
    }

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [ name, id ] = e.target.name.split("&&");
        let users_temp = users.map(user => {
          if (user._id === id) {
            user[name as keyof {night: number, weekend_night: number, weekend_day: number, friday_noon: number }] = +e.target.value;
          }
          return user;
        })
        setUsers(users_temp);
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [ name, id ] = e.target.name.split("&&");
        let users_temp = users.map(user => {
          if (user._id === id) {
            user.nickname = e.target.value;
          }
          return user;
        })
        setUsers(users_temp);
    }

    const arrayDuplicates = (arr: string[]): string[] => {
      return arr.filter((item, index) => arr.indexOf(item) != index)
    }

    const saveUsers = async (loading: boolean, e?: React.MouseEvent<HTMLButtonElement>) => {
      e?.preventDefault();
      let users_nickname: string[] = [];
      for (let i = 0; i < users.length; i++) {
        if (users[i].nickname === ""){
          toast.error("כינוי לא יכול להיות ריק");
          return;
        }
        users_nickname.push(users[i].nickname);
      }
      users_nickname = arrayDuplicates(users_nickname);
      if (users_nickname.length > 0) {
        toast.error("כינוי חייב להיות יחודי");
        return;
      }
        if (loading)
            setIsLoading(true);
        try {
          const response = await fetch(`/api/users/many`, { headers: { "Content-Type": "application/json" ,authorization: 'Bearer ' + cookies.get('userToken')}, 
          method: 'PATCH', body: JSON.stringify(users)});
          const data = await response.json();
          if (data.error) {
            toast.error(data.message);
          } else {
            toast.success("איכויות נשמרו");
            const userID = cookies.get('user')._id;
            cookies.set('user', users.find(user => user._id === userID));
          }
        } catch (e) {
          console.log(e);
          toast.error('Internal Server Error');
        }
        if (loading)
            setIsLoading(false);
    }

    const resetQuality = async (e: React.MouseEvent<HTMLButtonElement>) => {
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

    const changeRef = (el: HTMLTableElement) => {
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
        <h1>איכויות</h1>
        <div style={{display: 'flex', justifyContent: "space-between", width: "100%", padding: "10px", boxSizing: "border-box"}}>
        <Button variant="contained" color="primary" onClick={(e) => saveUsers(true, e)} >שמור</Button>
        <Button variant="contained" color="error" onClick={(e) => resetQuality(e)}>איפוס איכויות</Button>
        </div>
        <TableContainer style={{minHeight: height}} component={Paper}>
      <Table ref={changeRef} sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center">כינוי</StyledTableCell>
            <StyledTableCell align="center">לילה</StyledTableCell>
            <StyledTableCell align="center">שישי צהריים</StyledTableCell>
            <StyledTableCell align="center">שישי לילה/מוצ"ש</StyledTableCell>
            <StyledTableCell align="center">שבת בוקר/צהריים</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
            <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} onChange={handleTextChange} required value={user.nickname} name={`nickname&&${user._id}`} label="כינוי"/></TableCell>
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} inputProps={{min: '0'}} onChange={handleNumberChange} required type="number" value={user.night} name={`night&&${user._id}`} label="לילה"/></TableCell>
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} inputProps={{min: '0'}} onChange={handleNumberChange} required type="number" value={user.friday_noon} name={`friday_noon&&${user._id}`} label="שישי צהריים"/></TableCell>
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} inputProps={{min: '0'}} onChange={handleNumberChange} required type="number" value={user.weekend_night} name={`weekend_night&&${user._id}`} label={'שישי לילה/מוצ"ש'}/></TableCell>
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} inputProps={{min: '0'}} onChange={handleNumberChange} required type="number" value={user.weekend_day} name={`weekend_day&&${user._id}`} label="שבת בוקר/צהריים"/></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </main>
  )
}

export default Quality