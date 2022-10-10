import React, { ReactNode } from 'react'
import Table from '@mui/material/Table';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';
import { dateToStringShort } from '../functions/functions';


interface IProps {
  className?: string
  style?: React.CSSProperties
  children?: ReactNode
  days: string[]
}

const TableHead2 = (props: IProps) => {


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


  return (
    <Table sx={{ minWidth: 650 }} aria-label="simple table" >
        <TableHead>
        <StyledTableRow>
        <StyledTableCell align="center">תאריך</StyledTableCell>
        {props.days.map((day) => {
                return (
                    <StyledTableCell align="center" key={day}>{dateToStringShort(new Date(day))}</StyledTableCell>
                )
            })}
        </StyledTableRow>
          <StyledTableRow>
            <StyledTableCell align="center"></StyledTableCell>
            <StyledTableCell align="center">ראשון</StyledTableCell>
            <StyledTableCell align="center">שני</StyledTableCell>
            <StyledTableCell align="center">שלישי</StyledTableCell>
            <StyledTableCell align="center">רביעי</StyledTableCell>
            <StyledTableCell align="center">חמישי</StyledTableCell>
            <StyledTableCell align="center">שישי</StyledTableCell>
            <StyledTableCell align="center">שבת</StyledTableCell>
          </StyledTableRow>
        </TableHead>
          {props.children}
      </Table>
  )
}

export default TableHead2