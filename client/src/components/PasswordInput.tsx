import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import React, { useState } from 'react'

interface IProps {
    name: string;
    id: string;
    label: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    sx?: {};
    value?: string;
}

const PasswordInput = (props:IProps) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);


    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
      };
  
  
      const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      };
  

  return (
    <TextField  fullWidth className='text_input' id={props.id} label={props.label} name={props.name}
    type={showPassword ? "": "password"} required variant="outlined" value={props.value}
    InputProps={{ startAdornment: 
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={handleClickShowPassword}
          onMouseDown={handleMouseDownPassword}
        >
          {!showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    }}
    onChange={props.onChange}
    />
  )
}

export default PasswordInput