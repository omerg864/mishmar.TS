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
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell align="center" scope="row"><p style={{ fontSize: '1.2rem' }}>{(shift.shift as Structure).title}</p><p style={{ fontSize: '1.2rem' }}>{(shift.shift as Structure).description}</p></TableCell>
            {shift.days.map((day, index) => (
              <TableCell key={`${(shift.shift as Structure)._id}-${index}`} align="center" scope="row">
                {props.update ? <TextareaAutosize
                  minRows={3}
                  value={day}
                  onChange={props.onChange}
                  name={`${props.week}-${index2}-${index}`}
                  style={{ maxWidth: '90px' }}
                /> : <Typography sx={{ fontSize: '1.2rem' }}>{day} </Typography>}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </>
  )
}

export default TableBodySchedule