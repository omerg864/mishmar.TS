import React, { useState, useEffect } from 'react'
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { User, UserStrings } from '../types/types';
import Cookies from 'universal-cookie';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Checkbox } from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../components/StyledTable';
import Modal from '../components/Modal';
import PasswordRules from '../components/PasswordRules';
import { email_regex, password_regex } from '../types/regularExpressions';
import PasswordInput from '../components/PasswordInput';
import NotAuthorized from '../components/NotAuthorized';


interface IProps {
  manager: boolean;
}

const Users = (props: IProps) => {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [modal, setModal] = useState<{open: boolean, user: User}>({open: false, user: {} as User});
  const cookies = new Cookies();
  const [height, setHeight] = useState<number>(100);

  const getUsers = async (loading: boolean) => {
    if (loading) 
      setIsLoading(true);
    try {
      const response = await fetch(`/api/users/all`, { headers: { authorization: 'Bearer ' + cookies.get('userToken')}});
      const data = await response.json();
      if (data.error || data.statusCode) {
        toast.error(data.message);
      } else {
        setUsers(data);
      }
    } catch (e) {
      console.log(e);
      toast.error('Internal Server Rrror');
    }
    if (loading)
      setIsLoading(false);
  }

  const arrayDuplicates = (arr: string[]): string[] => {
    return arr.filter((item, index) => arr.indexOf(item) !== index)
  }

  const saveUsers = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let users_nickname: string[] = [];
      for (let i = 0; i < users.length; i++) {
        if (users[i].name === "") {
          toast.error("חייב למלא שם מלא");
          return;
        }
        if (users[i].nickname === "") {
          toast.error("חייב למלא כינוי");
          return;
        }
        users_nickname.push(users[i].nickname);
      }
      users_nickname = arrayDuplicates(users_nickname);
    if (users_nickname.length > 0) {
      toast.error("כינוי חייב להיות ייחודי");
      return;
    }
    users_nickname = [];
      for (let i = 0; i < users.length; i++) {
        if (users[i].nickname === "") {
          toast.error("חייב למלא שם משתמש");
          return;
        }
        users_nickname.push(users[i].username as string);
      }
      users_nickname = arrayDuplicates(users_nickname);
    if (users_nickname.length > 0) {
      toast.error("שם משתמש חייב להיות ייחודי");
      return;
    }
    users_nickname = [];
      for (let i = 0; i < users.length; i++) {
        if (users[i].nickname === "") {
          toast.error("חייב למלא שם אימייל");
          return;
        }
        users_nickname.push(users[i].email as string);
        if( !email_regex.test(users[i].email as string)) {
          toast.error('אימייל לא תקין');
          return;
        }
      }
      users_nickname = arrayDuplicates(users_nickname);
    if (users_nickname.length > 0) {
      toast.error("אימייל חייב להיות ייחודי");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/many`, { headers: { "Content-Type": "application/json" ,authorization: 'Bearer ' + cookies.get('userToken')}, 
      method: 'PATCH', body: JSON.stringify(users)});
      const data = await response.json();
      if (data.error || data.statusCode) {
        toast.error(data.message);
      } else {
        toast.success("עודכן");
        const userID = cookies.get('user')._id;
        cookies.set('user', users.find(user => user._id === userID));
      }
    } catch (e) {
      console.log(e);
      toast.error('Internal Server Error');
    }
    setIsLoading(false);
  }

  const openModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    setModal({open: true, user: {...((users.find(user => user._id === (e.target as HTMLButtonElement).value) as User)), password: "", confirmPassword: ""}});
  }

  const changePassword = async () => {
    if (modal.user.password === '') {
      toast.error("הכנס סיסמה");
      return;
    }
    if (modal.user.password !== modal.user.confirmPassword) {
      toast.error("סיסמאות לא תואמות");
      return;  
    }
    if (!password_regex.test(modal.user.password as string)) {
      toast.error("סיסמה לא תקינה");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/manager`, { headers: { "Content-Type": "application/json" ,authorization: 'Bearer ' + cookies.get('userToken')}, 
      method: 'PATCH', body: JSON.stringify(modal.user)});
      const data = await response.json();
      if (data.error || data.statusCode) {
        toast.error(data.message);
      } else {
        toast.success("סיסמה שונתה");
        setModal({open: false, user: {password: "", confirmPassword: ""} as User})
      }
    } catch (e) {
      console.log(e);
      toast.error('Internal Server Error');
    }
    setIsLoading(false);
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [ name, id ] = e.target.name.split("&&");
    let users_temp = users.map(user => {
      if (user._id === id) {
        user[name as keyof UserStrings] = e.target.value;
      }
      return user;
    })
    setUsers(users_temp);
  }

  const handleCheckBoxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const deleteUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${(e.target as HTMLButtonElement).value}`, { headers: { "Content-Type": "application/json" ,authorization: 'Bearer ' + cookies.get('userToken')}, 
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModal({open: true, user: {...modal.user, [e.target.name]: e.target.value}})
  }

  const modalChildren = (<>
  <PasswordInput sx={{marginTop: '10px'}} id="password" label="סיסמה" name="password" value={modal.user.password} onChange={handlePasswordChange}/>
  <PasswordRules />
  <div>
    <PasswordInput sx={{marginTop: '10px'}} name='confirmPassword' id='confirmPassword' label={"הכנס סיסמה שוב"} value={modal.user.confirmPassword} onChange={handlePasswordChange}/>
  </div>
  </>)

  useEffect(() => {
    if (props.manager) {
      getUsers(true);
    }
  }, [props.manager]);


  const changeRef = (el: HTMLTableElement) => {
    if (el){
      setHeight(el.clientHeight as number);
    }
  }

  if (!props.manager) {
    return <NotAuthorized />;
  }

  if (isLoading) {
    return <Spinner />
  }


  return (
    <main>
      <Modal open={modal.open} title={"שינוי סיסמה"} confirmButtonText={"שינוי סיסמה"}
       textContent={""} closeModal={() => setModal({open: false, user: {password: "", confirmPassword: ""} as User})} children={modalChildren} confirmButton={changePassword} />
        <h1>משתמשים</h1>
        <Button variant="contained" color="primary" onClick={saveUsers}>שמור</Button>
        <TableContainer style={{minHeight: height}} component={Paper}>
      <Table ref={changeRef} sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center">שם מלא</StyledTableCell>
            <StyledTableCell align="center">כינוי</StyledTableCell>
            <StyledTableCell align="center">אימייל</StyledTableCell>
            <StyledTableCell align="center">שם משתמש</StyledTableCell>
            <StyledTableCell align="center">מנהל אתר</StyledTableCell>
            <StyledTableCell align="center">אחמ"ש</StyledTableCell>
            <StyledTableCell align="center">שינוי סיסמה</StyledTableCell>
            <StyledTableCell align="center"></StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} required onChange={handleTextChange} value={user.name} name={`name&&${user._id}`} label="שם מלא"/></TableCell>
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} required onChange={handleTextChange} value={user.nickname} name={`nickname&&${user._id}`} label="כינוי"/></TableCell>
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} required onChange={handleTextChange} value={user.email} type="email" name={`email&&${user._id}`} label="אימייל"/></TableCell>
              <TableCell align="center" scope="row"><TextField sx={{minWidth: '180px'}} required onChange={handleTextChange} value={user.username} name={`username&&${user._id}`} label="שם משתמש"/></TableCell>
              <TableCell align="center" scope="row"><Checkbox name={`SITE_MANAGER&&${user._id}`} onChange={handleCheckBoxChange} checked={user.role?.includes("SITE_MANAGER")}/></TableCell>
              <TableCell align="center" scope="row"><Checkbox name={`SHIFT_MANAGER&&${user._id}`} onChange={handleCheckBoxChange} checked={user.role?.includes("SHIFT_MANAGER")}/></TableCell>
              <TableCell align="center" scope="row">
                <Button variant="contained" color="info" value={user._id} onClick={openModal}>שינוי סיסמה</Button>
              </TableCell>
              <TableCell align="center" scope="row">
                <Button variant="contained" color="error" value={user._id} onClick={deleteUser}>מחק</Button>
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