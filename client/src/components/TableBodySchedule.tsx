import React, { ChangeEvent } from 'react'
import { TextareaAutosize, Typography, TableRow, TableCell, TableBody, Button, SelectChangeEvent } from '@mui/material';
import { Reinforcement, ShiftWeek, Structure } from '../types/types';
import { doesContain } from '../functions/functions';
import Cookies from 'universal-cookie';
import ReinforcementUpdate from './ReinforcementUpdate';

interface IProps {
  week: number;
  data: ShiftWeek[];
  update: boolean;
  reinforcements: Reinforcement[][];
  addedReinforcements?: Reinforcement[][];
  addReinforcement?: (week: number, day: number) => void;
  removeReinforcement?: (week: number, day: number, id: string, added: boolean) => void;
  changeReinforcement?: (e: ChangeEvent<HTMLTextAreaElement>, added: boolean) => void;
  changeSelectReinforcement?: (event: SelectChangeEvent<number>, name: string, added: boolean) => void;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}


const TableBodySchedule = (props: IProps) => {

  const cookies = new Cookies();

  const getShift = (shift: number) => {
    switch (shift) {
      case 0:
        return 'בוקר';
      case 1:
        return 'צהריים';
      case 2:
        return 'לילה';
      default:
        return '';
    }
  }
  

  return (
    <>
      <TableBody>
        {props.data.map((shift, index2) => (
          <TableRow key={(shift.shift as Structure)._id} >
            <TableCell style={{padding: '4px'}} align="center" ><Typography>{(shift.shift as Structure).start_time}{((shift.shift as Structure).start_time || (shift.shift as Structure).end_time) && "-"}{(shift.shift as Structure).end_time}<br/>{(shift.shift as Structure).title}</Typography></TableCell>
            {shift.days.map((day, index) => (
              <TableCell style={{padding: '4px'}} key={`${(shift.shift as Structure)._id}-${index}`} align="center">
                {props.update ? <TextareaAutosize
                  minRows={3}
                  value={day}
                  onChange={props.onChange}
                  name={`${props.week}-${index2}-${index}`}
                  style={{ maxWidth: '90px' }}
                /> : <React.Fragment>
                  {day.split("\n").map((line, index) => {
                    let contains = doesContain(line.split(' '), cookies.get('user').nickname);
                    return <Typography className={`${ contains ? 'green' : ''}`} key={index}>{line}</Typography>
                  })}
                  </React.Fragment>}
              </TableCell>
            ))}
          </TableRow>
        ))}
        <TableRow >
          <TableCell style={{padding: '4px'}} align="center" ><Typography>תגבורים</Typography></TableCell>
            {props.reinforcements.map((reinforcements, index) => (
              <TableCell style={{padding: '4px'}} key={`reinforcement-${index}`} align="center">
                {reinforcements && <div>
                  {props.update ? <div>
                    {reinforcements.map((reinforcement, index2) => {
                          return <ReinforcementUpdate removeReinforcement={props.removeReinforcement} onSelectChange={props.changeSelectReinforcement} onChange={props.changeReinforcement} key={index2} reinforcement={reinforcement} />
                    })}
                  </div>: <React.Fragment>
                        {reinforcements.map((reinforcement, index) => {
                          let contains = doesContain(reinforcement.names.split('\n'), cookies.get('user').nickname);
                          return <Typography className={`${ contains ? 'green' : ''}`} key={index}>{
                            reinforcement.names.split("\n").join(',') + ' תגבור ' + getShift(reinforcement.shift) + ' ' + reinforcement.where
                          }</Typography>
                        })}
                      </React.Fragment>}
                </div>}
                {props.update && <React.Fragment>
                  {props.addedReinforcements && props.addedReinforcements.length > 0 && props.addedReinforcements[index].map((reinforcement, index2) => {
                    return <ReinforcementUpdate removeReinforcement={props.removeReinforcement} onSelectChange={props.changeSelectReinforcement} onChange={props.changeReinforcement} added={true} key={index2} reinforcement={reinforcement} />
                  })}
                </React.Fragment>}
                {props.update && <Button color='success' variant='contained' onClick={() => props.addReinforcement!(props.week, index)}>
                      הוסף תגבור
                    </Button>}
              </TableCell>
            ))}
        </TableRow>
      </TableBody>
    </>
  )
}

export default TableBodySchedule