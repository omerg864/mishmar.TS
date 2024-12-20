import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner'
import Cookies from 'universal-cookie';
import { Structure } from '../types/types';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Checkbox, MenuItem } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { StyledTableCell, StyledTableRow } from '../components/StyledTable'
import OptionsModal from '../components/OptionsModal';
import { time_shift_regex } from '../types/regularExpressions';


const Structures = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const cookies = new Cookies();
    const [structures, setStructures] = useState<Structure[]>([]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    //const [savedStractures, setSavedStractures] = useState<Structure[]>([]);
    //const [changes, setChanges] = useState<string[]>([]);
    const defaultValue = {title: '', start_time: '07:00', end_time: '15:00', shift: 0, index: 0, opening: false, pull: false, manager: false} as Structure
    const [newStructure, setNewStructure] = useState<Structure>(defaultValue);
    const [height, setHeight] = useState<number>(100);

      const newCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name: string = event.target.name;
        setNewStructure({...newStructure, [name]: !newStructure[(name as keyof Structure)]});
    }

    const newInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewStructure({...newStructure, [event.target.name]: event.target.value});
    }

    const newHandleSelectChange = (event: SelectChangeEvent<number>) => {
        setNewStructure({...newStructure, shift: +event.target.value});
    }

      const checkboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.name.split("&&")[1];
        const name: string = event.target.name.split("&")[0];
        let structures_tmp = [...structures];
        let st = structures.find(s => s._id === id) as Structure;
        let structure:Structure = {...st, [name] : !st[(name as keyof Structure)]};
        structures_tmp = structures_tmp.map(s => {
            if (s._id === id) {
                return structure;
            }
            return s;
        })
        setStructures(structures_tmp);
    }

    const inputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.name.split("&&")[1];
        const name = event.target.name.split("&")[0];
        let structures_tmp = [...structures]
        let structure:Structure = {...structures.find(s => s._id === id) as Structure, [name]: event.target.value};
        structures_tmp = structures_tmp.map(s => {
            if (s._id === id) {
                return structure;
            }
            return s;
        })
        setStructures(structures_tmp);
    }

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const id = event.target.value.split("&&")[1];
        const value = +event.target.value.split("&&")[0];
        let structures_tmp = [...structures]
        let structure:Structure = {...structures.find(s => s._id === id) as Structure, shift: value};
        structures_tmp = structures_tmp.map(s => {
            if (s._id === id) {
                return structure;
            }
            return s;
        })
        setStructures(structures_tmp);
    }

    const getStructures = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/structures/all`, {headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') }});
            const data = await response.json();
            if (data.error || data.statusCode) {
              fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `structures/all`, component: "Structures" })})
              toast.error(data.message);
            } else {
                setStructures(data);
                let morningStructure: Structure[] = data.filter((structure: Structure) => structure.shift === 0)
                if (morningStructure.length !== 0) {
                  setNewStructure({...newStructure, index: morningStructure.slice(-1)[0].index + 1})
                }
                //setSavedStructures(data);
            }
        } catch (err) {
          fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `structures/all`, component: "Structures" })})
            toast.error("Internal Server Error");
        }
        setLoading(false);
    }

    useEffect(() => {
        getStructures();
    }, []);

    const saveStructures = async () => {
      for ( let i = 0; i < structures.length; i++) {
        if (structures[i].end_time && !time_shift_regex.test(structures[i].end_time)) {
          toast.error("נא לשמור זמן כך: HH:MM");
          toast.info(`משמרת ${structures[i].title} ${i} נשמרה עם זמן לא תקין`);
          return;
        }
        if (structures[i].start_time && !time_shift_regex.test(structures[i].start_time)) {
          toast.error("נא לשמור זמן כך: HH:MM");
          toast.info(`משמרת ${structures[i].title} ${i} נשמרה עם זמן לא תקין`);
          return;
        }
      }
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/structures/many`, 
        { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') },
          method: 'PATCH', body: JSON.stringify(structures)
      })
        const data = await response.json();
        if (data.error || data.statusCode) {
          fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `structures/many`, component: "Structures" })})
          toast.error(data.message);
        } else {
          toast.success("שינויים נשמרו");
        }
      } catch (err) {
        fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `structures/many`, component: "Structures" })})
        toast.error("Internal Server Error");
      }
      setLoading(false);
    }

    const createStructure = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (newStructure.title === "") {
        toast.error("Please enter a title");
        return;
      }

      if (newStructure.end_time && !time_shift_regex.test(newStructure.end_time) ) {
        toast.error("נא לשמור זמן כך: HH:MM")
        return;
      }

      if (newStructure.start_time && !time_shift_regex.test(newStructure.start_time)) {
        toast.error("נא לשמור זמן כך: HH:MM")
        return;
      }

      let scheduleAdd = (e.target as HTMLButtonElement).value === 'true';
      closeModal();
      setLoading(true);
      await saveStructures();
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/structures`,
        { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') }, 
        method: 'POST', body: JSON.stringify({structure: newStructure, scheduleAdd})});
        const data = await response.json();
        if (data.statusCode || data.error) {
          fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `structures`, component: "Structures" })})
          toast.error(data.message);
        } else {
          toast.success("נוצר בהצלחה");
        }
      } catch (err) {
        fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `structures`, component: "Structures" })})
        toast.error("Internal Server Error");
      }
      setNewStructure(defaultValue);
      setLoading(false);
      getStructures();
    }

    const deleteStructure = async (e: React.MouseEvent<HTMLButtonElement>) => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/structures/${(e.target as HTMLButtonElement).value}`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') }, method: 'DELETE'});
        const data = await response.json();
        if (data.error || data.statusCode) {
          fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `structures/${(e.target as HTMLButtonElement).value}`, component: "Structures" })})
          toast.error(data.message);
        } else {
          toast.success("נמחק בהצלחה");
        }
      } catch (err) {
        fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `structures/${(e.target as HTMLButtonElement).value}`, component: "Structures" })})
        toast.error("Internal Server Error");
      }
      setLoading(false);
      getStructures();
    }

    const changeRef = (el: HTMLTableElement) => {
      if (el){
        setHeight(el.clientHeight as number);
      }
    }

    const closeModal = () => {
      setModalOpen(false);
    }
    const openModal = () => {
      setModalOpen(true);
    }

    if (loading) {
        return <Spinner/>;
    }

  return (
    <main>
      <OptionsModal open={modalOpen} children={<></>} textContent={"האם להוסיף את המשמרת לסידור האחרון?"}
       title="יצירת משמרת חדשה" confirmButtonText='כן' closeModal={closeModal} confirmButton={createStructure} noButtonText="לא" noButton={createStructure}/>
        <h1>מבנה סידור</h1>
        <div className='save-btn-container'>
        <Button variant="contained" color="primary" onClick={saveStructures}>שמור</Button>
        </div>
        <TableContainer style={{minHeight: height}} component={Paper}>
      <Table ref={changeRef} sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center">משמרת</StyledTableCell>
            <StyledTableCell align="center">מספר</StyledTableCell>
            <StyledTableCell align="center">כותרת</StyledTableCell>
            <StyledTableCell align="center">התחלת משמרת</StyledTableCell>
            <StyledTableCell align="center">סיום משמרת</StyledTableCell>
            <StyledTableCell align="center">פתיחה</StyledTableCell>
            <StyledTableCell align="center">אחמ"ש</StyledTableCell>
            <StyledTableCell align="center">משיכה</StyledTableCell>
            <StyledTableCell align="center"></StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
        <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center" scope="row">
              <Select
                    id={`shift`}
                    value={newStructure.shift}
                    label="Shift"
                    onChange={newHandleSelectChange}>
                    <MenuItem value={0}>בוקר</MenuItem>
                    <MenuItem value={1}>צהריים</MenuItem>
                    <MenuItem value={2}>לילה</MenuItem>
                    <MenuItem value={3}>אחר</MenuItem>
                </Select>
                </TableCell>
              <TableCell align="center"><TextField sx={{minWidth: '180px'}} type="number" required inputProps={{min: '0'}} name={`index`} value={newStructure.index} label="מספר" onChange={newInputChange} /></TableCell>
              <TableCell align="center"><TextField sx={{minWidth: '180px'}} name={`title`} value={newStructure.title} label="כותרת" onChange={newInputChange}/></TableCell>
              <TableCell align="center"><TextField sx={{minWidth: '180px'}} name={`start_time`} value={newStructure.start_time} label="התחלת משמרת" onChange={newInputChange}/></TableCell>
              <TableCell align="center"><TextField sx={{minWidth: '180px'}} name={`end_time`} value={newStructure.end_time} label="סיום משמרת" onChange={newInputChange}/></TableCell>
              <TableCell align="center"><Checkbox name={`opening`} checked={newStructure.opening} onChange={newCheckboxChange} /></TableCell>
              <TableCell align="center"><Checkbox name={`manager`} checked={newStructure.manager} onChange={newCheckboxChange} /></TableCell>
              <TableCell align="center"><Checkbox name={`pull`} checked={newStructure.pull} onChange={newCheckboxChange} /></TableCell>
              <TableCell align="center"><Button variant="contained" color="primary" onClick={openModal}>הוסף</Button></TableCell>
            </TableRow>
          {structures.map((structure) => (
            <TableRow
              key={structure._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center" scope="row">
              <Select
                    id={`shift&&${structure._id}`}
                    value={`${structure.shift}&&${structure._id}`}
                    label="Shift"
                    onChange={handleSelectChange}>
                    <MenuItem value={`0&&${structure._id}`}>בוקר</MenuItem>
                    <MenuItem value={`1&&${structure._id}`}>צהריים</MenuItem>
                    <MenuItem value={`2&&${structure._id}`}>לילה</MenuItem>
                    <MenuItem value={`3&&${structure._id}`}>אחר</MenuItem>
                </Select>
                </TableCell>
              <TableCell align="center"><TextField sx={{minWidth: '180px'}} required inputProps={{min: '0'}} type="number" name={`index&&${structure._id}`} value={structure.index} label="מספר" onChange={inputChange} /></TableCell>
              <TableCell align="center"><TextField sx={{minWidth: '180px'}} name={`title&&${structure._id}`} value={structure.title} label="כותרת" onChange={inputChange}/></TableCell>
              <TableCell align="center"><TextField sx={{minWidth: '180px'}} name={`start_time&&${structure._id}`} value={structure.start_time} label="התחלת משמרת" onChange={inputChange}/></TableCell>
              <TableCell align="center"><TextField sx={{minWidth: '180px'}} name={`end_time&&${structure._id}`} value={structure.end_time} label="סיום משמרת" onChange={inputChange}/></TableCell>
              <TableCell align="center"><Checkbox name={`opening&&${structure._id}`} checked={structure.opening} onChange={checkboxChange} /></TableCell>
              <TableCell align="center"><Checkbox name={`manager&&${structure._id}`} checked={structure.manager} onChange={checkboxChange} /></TableCell>
              <TableCell align="center"><Checkbox name={`pull&&${structure._id}`} checked={structure.pull} onChange={checkboxChange} /></TableCell>
              <TableCell align="center"><Button variant="contained" color="error" value={structure._id} onClick={deleteStructure} >מחק</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </main>
  )
}

export default Structures