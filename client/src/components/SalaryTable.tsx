import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import { StyledTableCell, StyledTableRow } from './StyledTable'


interface SalaryTableProps {
    head: string;
    quantity: string;
    pay: string;
    id?: string;
    editable?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
function SalaryTable(props: SalaryTableProps) {

  return (
    <TableContainer id='salaryTableContainer' component={Paper}>
        <Table aria-label="simple table">
            <TableHead>
                <StyledTableRow>
                    {<StyledTableCell sx={{width: 'fit-content'}} align="center">{''}</StyledTableCell>}
                    {<StyledTableCell sx={{width: '13rem'}} align="center">{props.head}</StyledTableCell>}
                </StyledTableRow>
            </TableHead>
        <TableBody>
            <TableRow>
                {<TableCell align="center">{'מספר שעות'}</TableCell>}
                {<TableCell align="center">{props.editable ? <TextField sx={{width: '7rem'}} id={props.id} type='number' onChange={props.onChange} value={props.quantity} /> : props.quantity}</TableCell>}
            </TableRow>
            <TableRow>
                {<TableCell align="center">{'שכר'}</TableCell>}
                {<TableCell align="center">{props.pay}</TableCell>}
            </TableRow>
        </TableBody>
        </Table>
    </TableContainer>
  )
}

export default SalaryTable