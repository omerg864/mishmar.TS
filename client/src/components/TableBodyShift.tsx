import React from 'react'
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { numberToArray } from '../functions/functions';
import { Checkbox, TextareaAutosize } from '@mui/material';

interface IProps {
  rows: string[];
  week: number;
  data: ShiftScheduleWeek[]|ShiftScheduleWeek2[],
  update: boolean,
  disabled: boolean,
  checkboxChange?: React.ChangeEventHandler<HTMLInputElement>;
  notesChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}

interface ShiftScheduleWeek {
  morning: string[];
  noon: string[];
  night: string[]; 
  pull: string[];
  reinforcement: string[]; 
  notes: string[];
}

interface ShiftScheduleWeek2 {
  morning: boolean[];
  noon: boolean[];
  night: boolean[]; 
  pull: boolean[];
  reinforcement: boolean[]; 
  notes: string[];
}

type ShiftWeek = {morning: boolean[], noon: boolean[], night: boolean[], pull: boolean[], reinforcement: boolean[]};

const TableBody2 = (props: IProps) => {
  return (
    <>
    {(!props.update) ? <TableBody>
    {props.rows.map((row) => (
    <TableRow key={`${row}-${props.week}`}>
        <TableCell align="center">{row}</TableCell>
    {numberToArray(7).map(num => (
            <TableCell  key={`${row}-${props.week}-${num}`} style={{padding: '1px'}} align="center">{props.data[props.week][row as keyof ShiftScheduleWeek][num]}</TableCell>
    ))}
    </TableRow>
    ))}
  </TableBody> : 
  <TableBody>
            {props.rows.map((row) => (
            <TableRow key={`${row}-${props.week}`}>
                <TableCell align="center">{row}</TableCell>
            {numberToArray(7).map(num => (
                    <TableCell  key={`${row}-${props.week}-${num}`} style={{padding: '1px'}} align="center"><Checkbox name={`${row}-${props.week}-${num}`} disabled={props.disabled} onChange={props.checkboxChange} checked={((props.data as ShiftScheduleWeek2[])[props.week][row as keyof ShiftScheduleWeek2][num]) as boolean}/></TableCell>
            ))}
            </TableRow>
            ))}
            <TableRow>
                <TableCell align="center">Notes</TableCell>
            {numberToArray(7).map(num => (
                    <TableCell key={`notes-${props.week}-${num}`} style={{padding: '5px'}} align="center"><TextareaAutosize                     
                    minRows={2}
                    disabled={props.disabled}
                    value={props.data[props.week].notes[num]}
                    onChange={props.notesChange}
                    name={`notes-${props.week}-${num}`}
                    style={{ minWidth: 200 }} /></TableCell>
            ))}
            </TableRow>
        </TableBody>
}
</>
  )
}

export default TableBody2