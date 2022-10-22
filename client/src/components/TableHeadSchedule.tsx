import React, { ReactNode } from 'react'
import TableHead from '@mui/material/TableHead';
import { dateToStringShort } from '../functions/functions';
import { StyledTableCell, StyledTableRow } from './StyledTable';


interface IProps {
  children?: ReactNode
  days: string[],
}

const TableHeadSchedule = (props: IProps) => {


  return (
    <>
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
    </>
  )
}

export default TableHeadSchedule