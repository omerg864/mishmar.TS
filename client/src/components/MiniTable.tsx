import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import { useState } from 'react'
import { StyledTableCell, StyledTableRow } from './StyledTable'


interface MiniTableProps {
    head: string;
    body: string;
    id?: string;
    editable?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    minWidth?: string;
}
function MiniTable(props: MiniTableProps) {

    const [height, setHeight] = useState<number>(100);

    const changeRef = (el: HTMLTableElement) => {
        if (el){
            setHeight(el.clientHeight as number);
        }
    }

  return (
    <TableContainer id="salaryTableContainer" style={{minHeight: height}} component={Paper}>
        <Table ref={changeRef} style={{minHeight: height}} aria-label="simple table">
            <TableHead>
                <StyledTableRow>
                    <StyledTableCell align="center">{props.head}</StyledTableCell>
                </StyledTableRow>
            </TableHead>
        <TableBody>
            <TableRow>
                <TableCell sx={{ minWidth: props.minWidth}} align="center">{props.editable ? <TextField sx={{width: '7rem'}} id={props.id} type='number' onChange={props.onChange} value={props.body} />  : props.body}</TableCell>
            </TableRow>
        </TableBody>
        </Table>
    </TableContainer>
  )
}

export default MiniTable