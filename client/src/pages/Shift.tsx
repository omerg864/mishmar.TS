import React, { useState, useEffect} from 'react'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Spinner from '../components/Spinner';


interface IProps {
    authenticated: boolean;
}

const Shift = (props: IProps) => {

    const [submitting, setSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

      if (!props.authenticated) {
        return <></>;
      }


      if (isLoading) {
        return <Spinner />;
      }

      if (!submitting) {
        return (
            <main>
                <h1>Shift</h1>
                <p>Can't submit shifts anymore</p>
            </main>
        )
      }

  return (
    <main>
        <h1>Shift</h1>
        
    </main>
  )
}

export default Shift