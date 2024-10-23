import dayjs, { Dayjs } from 'dayjs';
import MonthPicker from '../components/MonthPicker';
import { Box, Button, Paper } from '@mui/material';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { useEffect, useState } from 'react';
import { TextField, TableRow, TableHead, TableContainer, TableCell, TableBody,
    Table } from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../components/StyledTable';
import { UserShifts } from '../types/types';

const UsersShifts = () => {
	const [dateData, setDateData] = useState<{ month: number; year: number }>({
		month: new Date().getMonth() + 1,
		year: new Date().getFullYear(),
	});

    const [users, setUsers] = useState<{[key: string]: UserShifts}>({});
    const [height, setHeight] = useState<number>(100);

	const cookies = new Cookies();

	const [isLoading, setIsLoading] = useState<boolean>(false);

    const changeRef = (el: HTMLTableElement) => {
        if (el){
          setHeight(el.clientHeight as number);
        }
      }

	const changeDate = (value: Dayjs | null) => {
		setDateData({
			month: value?.month() ? value.month() + 1 : 1,
			year: value?.year() ? value.year() : 2024,
		});
	};

    const onAcceptDate = () => {
        getUsersShifts();
    }

    const getUsersShifts = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/schedules/shifts`, { headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + cookies.get('userToken') }, method: 'POST', body: JSON.stringify({month: dateData.month - 1, year: dateData.year}) });
          const data = await response.json();
          if (data.error || data.statusCode) {
            fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `users/all`, component: "UsersShifts" })})
            toast.error(data.message);
          } else {
            setUsers(data);
          }
        } catch (err) {
          fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `users/all`, component: "UsersShifts" })})
          toast.error('Internal Server Error');
        }
        setIsLoading(false);
    }

    useEffect(() => {
        if (dateData) getUsersShifts();
    }, []);



	if (isLoading) {
		return <Spinner />;
	}

	return (
		<main>
			<h1>משמרות</h1>
			<Box className="box-container" component={Paper}>
				<MonthPicker
					value={dayjs(
						new Date(dateData.year, dateData.month - 1, 1)
					)}
					onChange={changeDate}
                    onAccept={onAcceptDate}
				/>
				<TableContainer style={{ minHeight: height }} component={Paper}>
					<Table
						ref={changeRef}
						sx={{ minWidth: 650 }}
						aria-label="simple table"
					>
						<TableHead>
							<StyledTableRow>
								<StyledTableCell align="center">
									שם
								</StyledTableCell>
                                <StyledTableCell align="center">
									בוקר
								</StyledTableCell>
                                <StyledTableCell align="center">
									צהריים
								</StyledTableCell>
								<StyledTableCell align="center">
									לילה
								</StyledTableCell>
								<StyledTableCell align="center">
									שישי צהריים
								</StyledTableCell>
								<StyledTableCell align="center">
									שבת בוקר/צהריים
								</StyledTableCell>
                                <StyledTableCell align="center">
									שישי לילה/מוצ"ש
								</StyledTableCell>
							</StyledTableRow>
						</TableHead>
						<TableBody>
							{Object.keys(users).map((user) => (
								<TableRow
									key={users[user].nickname}
									sx={{
										'&:last-child td, &:last-child th': {
											border: 0,
										},
									}}
								>
									<TableCell align="center" scope="row">
										{users[user].nickname}
									</TableCell>
									<TableCell align="center" scope="row">
										{users[user].morning}
									</TableCell>
									<TableCell align="center" scope="row">
										{users[user].noon}
									</TableCell>
									<TableCell align="center" scope="row">
										{users[user].night}
									</TableCell>
									<TableCell align="center" scope="row">
										{users[user].friday_noon}
									</TableCell>
                                    <TableCell align="center" scope="row">
										{users[user].weekend_day}
									</TableCell>
                                    <TableCell align="center" scope="row">
										{users[user].weekend_night}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>
		</main>
	);
};

export default UsersShifts;
