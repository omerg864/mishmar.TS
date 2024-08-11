import { useEffect, useState } from 'react'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { StyledTableRow, StyledTableCell } from '../components/StyledTable';
import Cookies from 'universal-cookie';


const ScheduleTable = () => {
    const [height, setHeight] = useState<number>(100);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [counts, setCounts] = useState<{name: string, night: number, weekend: number, [key: string]: number|string}[]>([]);
    const [weeksKeys, setWeeksKeys] = useState<string[]>([]);
    const [total, setTotal] = useState<{night: number, weekend: number, [key: string]: number}>({night: 0, weekend: 0});
    const { id } = useParams();
    const cookies = new Cookies();


    const getData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/schedules/table/${id}`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') } });
            const data = await response.json();
            if (data.error || data.statusCode) {
                fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `schedules/table/${id}`, component: "ScheduleTable" })})
                toast.error(data.message);
            } else {
                setCounts(data.counts);
                setWeeksKeys(data.weeksKeys);
                setTotal(data.total);
            }
        } catch (err) {
            fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `schedules/table/${id}`, component: "ScheduleTable" })})
            toast.error('Internal Server Error');
        }
        setIsLoading(false);
    }

    const translateToHebrew = (key: string) => {
        if (key.includes('morning')) {
            return `בוקר ${+key.replace('morning', '') + 1}`;
        }
        if (key.includes('noon')) {
            return `צהריים ${+key.replace('noon', '') + 1}`;
        }
    }


    const changeRef = (el: HTMLTableElement) => {
        if (el){
          setHeight(el.clientHeight as number);
        }
    }

    useEffect(() => {
        getData();
    }, []);

    if (isLoading) {
        return <Spinner/>;
    }


  return (
    <main>
        <h1>ספירת משמרות</h1>
        <TableContainer style={{minHeight: height}} component={Paper}>
      <Table ref={changeRef} sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center">כינוי</StyledTableCell>
            {weeksKeys.map(key => (
                <StyledTableCell align="center" key={key}>{translateToHebrew(key)}</StyledTableCell>
            ))}
            <StyledTableCell align="center">לילה</StyledTableCell>
            <StyledTableCell align="center">סופ״ש</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
            {counts.map(user => (
                <TableRow key={`${user.name}-row`}>
                    <TableCell align="center">{user.name}</TableCell>
                    {weeksKeys.map(key => (
                        <TableCell key={`${user.name}-${key}`} align="center">{user[key]}</TableCell>
                    ))}
                    <TableCell align="center">{user.night}</TableCell>
                    <TableCell align="center">{user.weekend}</TableCell>
                </TableRow>
            ))}
            <TableRow>
                    <TableCell align="center">סה״כ</TableCell>
                    {weeksKeys.map(key => (
                        <TableCell key={`total-${key}`} align="center">{total[key]}</TableCell>
                    ))}
                    <TableCell align="center">{total.night}</TableCell>
                    <TableCell align="center">{total.weekend}</TableCell>
                </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
    </main>
  )
}

export default ScheduleTable