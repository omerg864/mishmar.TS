import * as React from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { User } from '../types/types';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name: string, personName: readonly string[], theme: Theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

interface IProps {
    names: User[];
    inputLabel: string;
    values: string[];
    name: string;
    onChange?: (event: SelectChangeEvent<string[]>) => void;
}

export default function ChipSelect(props: IProps) {
  const theme = useTheme();


  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-multiple-chip-label">{props.inputLabel}</InputLabel>
        <Select
          labelId="demo-multiple-chip-label"
          id="demo-multiple-chip"
          multiple
          name={props.name}
          value={props.values}
          onChange={props.onChange}
          input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={props.names.find(user => user._id === value)?.nickname} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {props.names.map((user) => (
            <MenuItem
              key={user._id}
              value={user._id}
              style={getStyles(user.nickname, props.values, theme)}
            >
              {user.nickname}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}