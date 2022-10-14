import React, { ReactNode, useRef, useEffect, useState } from 'react'
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import { dateToStringShort } from '../functions/functions';
import { StyledTableCell, StyledTableRow } from './StyledTable';
import { Paper, TableContainer } from '@mui/material';


interface IProps {
  children?: ReactNode
  days: string[],
}

const TableHead2 = (props: IProps) => {

  const [height, setHeight] = useState(100);

  const changeRef = (el: any) => {
    if (el){
      setHeight(el.clientHeight as number);
    }
  }


  return (
    <TableContainer style={{minHeight: height}} component={Paper}>
    <Table ref={changeRef} sx={{ minWidth: 650 }} aria-label="simple table" >
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
      </TableContainer>
  )
}

export default TableHead2