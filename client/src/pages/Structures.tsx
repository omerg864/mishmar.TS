import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner'
import Cookies from 'universal-cookie';
import { Structure } from '../types/types';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';


interface IProps {
    manager: boolean;
}

const Structures = (props: IProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const cookies = new Cookies();
    const [structures, setStructures] = useState<Structure[]>([]);
    //const [savedStractures, setSavedStractures] = useState<Structure[]>([]);
    //const [changes, setChanges] = useState<string[]>([]);
    const defaultValue = {title: '', description: '', shift: 0, index: 0, opening: false, pull: false, manager: false} as Structure
    const [newStructure, setNewStructure] = useState<Structure>(defaultValue);

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
          backgroundColor: theme.palette.common.black,
          color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
          fontSize: 14,
        },
      }));
      
      const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
          backgroundColor: 'theme.palette.action.hover',
        },
      }));

      const newCheckboxChange = (event: any) => {
        const name: keyof Structure = event.target.name;
        setNewStructure({...newStructure, [name]: !newStructure[name]});
    }

    const newInputChange = (event: any) => {
        event.preventDefault();
        const name: keyof Structure = event.target.name;
        setNewStructure({...newStructure, [name]: event.target.value});
    }

    const newHandleSelectChange = (event: any) => {
        setNewStructure({...newStructure, shift: event.target.value});
    }

      const checkboxChange = (event: any) => {
        const id = event.target.name.split("&&")[1];
        const name: keyof Structure = event.target.name.split("&")[0];
        let structures_tmp = [...structures];
        let st = structures.find(s => s._id === id) as Structure;
        let structure:Structure = {...st, [name] : !st[name]};
        structures_tmp = structures_tmp.map(s => {
            if (s._id === id) {
                return structure;
            }
            return s;
        })
        setStructures(structures_tmp);
    }

    const inputChange = (event: any) => {
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

    const handleSelectChange = (event: any) => {
        const id = event.target.value.split("&&")[1];
        const value = event.target.value.split("&&")[0] as number;
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
            const response = await fetch('http://localhost:5000/structure/all', {headers: { 'Authorization': 'Bearer ' + cookies.get('userToken')}});
            const data = await response.json();
            if (data.error) {
                toast.error(data.message);
            } else {
                setStructures(data);
                //setSavedStractures(data);
            }
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    }

    useEffect(() => {
        getStructures();
    }, []);

    const saveStructures = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/structure/many`, 
        { headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cookies.get('userToken')},
          method: 'PATCH', body: JSON.stringify(structures)
      })
        const data = await response.json();
        if (data.error) {
          toast.error(data.message);
        } else {
          toast.success("Changes Saved");
        }
      } catch (err) {
        console.log(err);
        toast.error("Internal server error");
      }
      setLoading(false);
    }

    const creteStructure = async () => {
      setLoading(true);
      await saveStructures();
      try {
        const response = await fetch(`http://localhost:5000/structure`,
        { headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cookies.get('userToken')}, 
        method: 'POST', body: JSON.stringify(newStructure)});
        const data = await response.json();
        if (data.error) {
          toast.error(data.message);
        } else {
          toast.success("Created successfully");
        }
      } catch (err) {
        console.log(err);
        toast.error("Internal server error");
      }
      setNewStructure(defaultValue);
      setLoading(false);
      getStructures();
    }

    const deleteStructure = async (e: any) => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/structure/${e.target.value}`, { headers: { 'Authorization': 'Bearer ' + cookies.get('userToken')}, method: 'DELETE'});
        const data = await response.json();
        if (data.error) {
          toast.error(data.message);
        } else {
          toast.success("Structure deleted successfully");
        }
      } catch (err) {
        console.log(err);
        toast.error("Internal server error");
      }
      setLoading(false);
      getStructures();
    }


    if (!props.manager) {
        return <></>;
    }

    if (loading) {
        return <Spinner/>;
    }

  return (
    <main>
        <h1>Structure</h1>
        <div className='save-btn-container'>
        <Button variant="contained" color="primary" onClick={saveStructures}>Save</Button>
        </div>
        <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center">Shift</StyledTableCell>
            <StyledTableCell align="center">Index</StyledTableCell>
            <StyledTableCell align="center">Title</StyledTableCell>
            <StyledTableCell align="center">Description</StyledTableCell>
            <StyledTableCell align="center">Opening</StyledTableCell>
            <StyledTableCell align="center">Manager</StyledTableCell>
            <StyledTableCell align="center">Pull</StyledTableCell>
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
                    <MenuItem value={0}>Morning</MenuItem>
                    <MenuItem value={1}>Noon</MenuItem>
                    <MenuItem value={2}>Night</MenuItem>
                    <MenuItem value={3}>Other</MenuItem>
                </Select>
                </TableCell>
              <TableCell align="center"><TextField type="number" name={`index`} value={newStructure.index} label="Index" onChange={newInputChange} /></TableCell>
              <TableCell align="center"><TextField name={`title`} value={newStructure.title} label="Title" onChange={newInputChange}/></TableCell>
              <TableCell align="center"><TextField name={`description`} value={newStructure.description} label="Description" onChange={newInputChange}/></TableCell>
              <TableCell align="center"><Checkbox name={`opening`} checked={newStructure.opening} onChange={newCheckboxChange} /></TableCell>
              <TableCell align="center"><Checkbox name={`manager`} checked={newStructure.manager} onChange={newCheckboxChange} /></TableCell>
              <TableCell align="center"><Checkbox name={`pull`} checked={newStructure.pull} onChange={newCheckboxChange} /></TableCell>
              <TableCell align="center"><Button variant="contained" color="primary" onClick={creteStructure}>Create</Button></TableCell>
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
                    <MenuItem value={`0&&${structure._id}`}>Morning</MenuItem>
                    <MenuItem value={`1&&${structure._id}`}>Noon</MenuItem>
                    <MenuItem value={`2&&${structure._id}`}>Night</MenuItem>
                    <MenuItem value={`3&&${structure._id}`}>Other</MenuItem>
                </Select>
                </TableCell>
              <TableCell align="center"><TextField type="number" name={`index&&${structure._id}`} value={structure.index} label="Index" onChange={inputChange} /></TableCell>
              <TableCell align="center"><TextField name={`title&&${structure._id}`} value={structure.title} label="Title" onChange={inputChange}/></TableCell>
              <TableCell align="center"><TextField name={`description&&${structure._id}`} value={structure.description} label="Description" onChange={inputChange}/></TableCell>
              <TableCell align="center"><Checkbox name={`opening&&${structure._id}`} checked={structure.opening} onChange={checkboxChange} /></TableCell>
              <TableCell align="center"><Checkbox name={`manager&&${structure._id}`} checked={structure.manager} onChange={checkboxChange} /></TableCell>
              <TableCell align="center"><Checkbox name={`pull&&${structure._id}`} checked={structure.pull} onChange={checkboxChange} /></TableCell>
              <TableCell align="center"><Button variant="contained" color="error" value={structure._id} onClick={deleteStructure} >Delete</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </main>
  )
}

export default Structures