import * as React from 'react';
import { Dayjs } from 'dayjs';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';


interface IProps {
  value: Dayjs;
  onChange: (value: Dayjs| null, id?: string) => void;
  onAccept?: () => void;
}

export default function MaterialUIPickers(props: IProps) {

  const handleChange = (newValue: Dayjs | null) => {
      props.onChange(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack>
        <MobileDatePicker
          label="חודש"
          inputFormat="MM/YYYY"
          value={props.value}
          views={['year', 'month']}
          onChange={handleChange}
          renderInput={(params) => <TextField {...params} />}
          onAccept={props.onAccept}
        />
      </Stack>
    </LocalizationProvider>
  );
}