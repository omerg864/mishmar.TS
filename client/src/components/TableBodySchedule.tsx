import React from 'react'
import { TextareaAutosize, Typography, TableRow, TableCell, TableBody } from '@mui/material';
import { ShiftWeek, Structure } from '../types/types';

interface IProps {
  week: number;
  data: ShiftWeek[],
  update: boolean,
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}


const TableBodySchedule = (props: IProps) => {
  

  return (
    <>
      <TableBody>
        {props.data.map((shift, index2) => (
          <TableRow
            key={(shift.shift as Structure)._id}
          >
            <TableCell style={{padding: '4px'}} align="center" ><Typography>{(shift.shift as Structure).title} <br/>{(shift.shift as Structure).description}</Typography></TableCell>
            {shift.days.map((day, index) => (
              <TableCell style={{padding: '4px'}} key={`${(shift.shift as Structure)._id}-${index}`} align="center">
                {props.update ? <TextareaAutosize
                  minRows={3}
                  value={day}
                  onChange={props.onChange}
                  name={`${props.week}-${index2}-${index}`}
                  style={{ maxWidth: '90px' }}
                /> : <Typography>{day}</Typography>}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </>
  )
}

export default TableBodySchedule