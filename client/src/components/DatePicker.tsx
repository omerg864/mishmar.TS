import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';


interface IProps {
  value: Dayjs;
  onChange: (value: Dayjs| null, id?: string) => void;
  id?: string;
}

export default function MaterialUIPickers(props: IProps) {

  const handleChange = (newValue: Dayjs | null) => {
    if (props.id) 
      props.onChange(newValue, props.id);
    else 
      props.onChange(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack>
        <MobileDatePicker
          label="Date"
          inputFormat="DD/MM/YYYY"
          value={props.value}
          onChange={handleChange}
          renderInput={(params) => <TextField {...params} />}
        />
      </Stack>
    </LocalizationProvider>
  );
}