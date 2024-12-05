import React, { ChangeEvent } from 'react'
import { Reinforcement } from '../types/types';
import { IconButton, MenuItem, Select, SelectChangeEvent, TextareaAutosize, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';


interface IProps {
    reinforcement: Reinforcement;
    added?: boolean;
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>, added: boolean) => void;
    onSelectChange?: (event: SelectChangeEvent<number>, name: string, added: boolean) => void;
    removeReinforcement?: (week: number, day: number, id: string, added: boolean) => void;
}

const ReinforcementUpdate = (props: IProps) => {
  return (
    <div style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '6px', border: '1px solid black', padding: '45px 5px 5px 5px', boxSizing: 'border-box', position: 'relative'}}>
        <TextareaAutosize
            minRows={3}
            value={props.reinforcement.names}
            onChange={(e) => props.onChange!(e, props.added as boolean)}
            name={`${props.reinforcement.week}/${props.reinforcement.day}/${props.reinforcement._id}/names`}
            style={{ maxWidth: '90px' }} />
        <TextField 
            label="מתקן"
            name={`${props.reinforcement.week}/${props.reinforcement.day}/${props.reinforcement._id}/where`}
            value={props.reinforcement.where}
            onChange={(e) => props.onChange!(e as ChangeEvent<HTMLTextAreaElement>, props.added as boolean)}
            style={{ maxWidth: '90px' }}
        />
        <Select
            id={`shift`}
            value={props.reinforcement.shift}
            label="משמרת"
            name={`${props.reinforcement.week}/${props.reinforcement.day}/${props.reinforcement._id}/shift`}
            onChange={(e) => props.onSelectChange!(e, `${props.reinforcement.week}/${props.reinforcement.day}/${props.reinforcement._id}/shift`, props.added as boolean)}>
            <MenuItem value={0}>בוקר</MenuItem>
            <MenuItem value={1}>צהריים</MenuItem>
            <MenuItem value={2}>לילה</MenuItem>
        </Select>
        <IconButton onClick={() => props.removeReinforcement!(props.reinforcement.week, props.reinforcement.day, props.reinforcement._id!, props.added as boolean)} style={{position: 'absolute', right: '5px', top: '5px'}}>
            <DeleteIcon color='error' />
        </IconButton>
    </div>
  )
}

export default ReinforcementUpdate