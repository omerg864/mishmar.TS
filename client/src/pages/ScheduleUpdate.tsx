import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Reinforcement, Schedule } from '../types/types';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import { addDays, dateToString, numberToArray } from '../functions/functions';
import { Button, FormControlLabel, SelectChangeEvent, Switch, Typography } from '@mui/material';
import TableBodySchedule from '../components/TableBodySchedule';
import TableHead2 from '../components/TableHead';
import ActionButton from '../components/ActionButton';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import TableChartIcon from '@mui/icons-material/TableChart';
import DeleteIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DatasetIcon from '@mui/icons-material/Dataset';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Modal from '../components/Modal';
import { v4 as uuidv4 } from 'uuid';

const ScheduleUpdate = () => {
	const { id } = useParams();
	const cookies = new Cookies();
	const [schedule, setSchedule] = useState<Schedule>({} as Schedule);
	const [reinforcements, setReinforcements] = useState<Reinforcement[][][]>(
		[]
	);
	const [addedReinforcements, setAddedReinforcements] = useState<
		Reinforcement[][][]
	>([]);
    const [deletedReinforcements, setDeletedReinforcements] = useState<
		Reinforcement[]
	>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [buttonOpen, setButtonOpen] = useState<boolean>(false);
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [file, setFile] = useState<File | null>(null);
	const navigate = useNavigate();


    const createAddedReinforcements = (num_weeks: number) => {
        let tempAddedReinforcements: Reinforcement[][][] = [];
        for (let i = 0; i < num_weeks; i++) {
            tempAddedReinforcements.push([]);
            for (let j = 0; j < 7; j++) {
                tempAddedReinforcements[i].push([]);
            }
        }
        return tempAddedReinforcements;
    }

	const getSchedule = async (loading: boolean) => {
		if (loading) setIsLoading(true);
		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/schedules/${id}`,
				{
					headers: {
						'Content-Type': 'application/json',
						authorization: 'Bearer ' + cookies.get('userToken'),
					},
				}
			);
			const data = await response.json();
			if (data.error || data.statusCode) {
				fetch(`${process.env.REACT_APP_API_URL}/api/logs`, {
					headers: { 'Content-Type': 'application/json' },
					method: 'POST',
					body: JSON.stringify({
						user: cookies.get('user'),
						err: data,
						path: `schedules/${id}`,
						component: 'ScheduleUpdate',
					}),
				});
				toast.error(data.message);
			} else {
				setSchedule(data.schedule);
				setReinforcements(data.reinforcements);
				setAddedReinforcements(createAddedReinforcements(data.schedule.num_weeks));
			}
		} catch (err) {
			fetch(`${process.env.REACT_APP_API_URL}/api/logs`, {
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
				body: JSON.stringify({
					user: cookies.get('user'),
					err,
					path: `schedules/${id}`,
					component: 'ScheduleUpdate',
				}),
			});
			toast.error('Internal Server Error');
		}
		if (loading) setIsLoading(false);
	};

	const changeSchedule = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const [week, shift, day] = e.target.name.split('-');
		let schedule_temp = { ...schedule };
		schedule_temp.weeks[parseInt(week)][parseInt(shift)].days[
			parseInt(day)
		] = e.target.value;
		setSchedule(schedule_temp);
	};

	const changePublish = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSchedule({ ...schedule, publish: !schedule.publish });
	};

	const saveSchedule = async () => {
		setButtonOpen(false);
		setIsLoading(true);
		try {
            const reinforcements_send = []
            for (let i = 0; i < reinforcements.length; i++) {
                for (let j = 0; j < reinforcements[i].length; j++) {
                    if (reinforcements[i][j]) {
                        reinforcements_send.push(...reinforcements[i][j]);
                    }
                }
            }
            for (let i = 0; i < addedReinforcements.length; i++) {
                for (let j = 0; j < addedReinforcements[i].length; j++) {
                    if (addedReinforcements[i][j]) {
                        let tempAddedReinforcements = [...addedReinforcements[i][j]];
                        for (let k = 0; k < tempAddedReinforcements.length; k++) {
                            let tempReinforcement: Reinforcement = {...tempAddedReinforcements[k]};
                            if (tempReinforcement._id) {
                                delete tempReinforcement._id;
                            }
                            reinforcements_send.push(tempReinforcement);
                        }
                    }
                }
            }
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/schedules/`,
				{
					headers: {
						'Content-Type': 'application/json',
						authorization: 'Bearer ' + cookies.get('userToken'),
					},
					method: 'PATCH',
					body: JSON.stringify({
                        schedule: schedule,
                        reinforcements: reinforcements_send,
                        deletedReinforcements: deletedReinforcements
                    }),
				}
			);
			const data = await response.json();
			if (data.error || data.statusCode) {
				fetch(`${process.env.REACT_APP_API_URL}/api/logs`, {
					headers: { 'Content-Type': 'application/json' },
					method: 'POST',
					body: JSON.stringify({
						user: cookies.get('user'),
						err: data,
						path: `schedules`,
						component: 'ScheduleUpdate',
					}),
				});
				toast.error(data.message);
			} else {
				toast.success('עודכן');
                setReinforcements(data.reinforcements);
                setAddedReinforcements(createAddedReinforcements(schedule.num_weeks));
                setDeletedReinforcements([]);
			}
		} catch (err) {
			fetch(`${process.env.REACT_APP_API_URL}/api/logs`, {
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
				body: JSON.stringify({
					user: cookies.get('user'),
					err,
					path: `schedules`,
					component: 'ScheduleUpdate',
				}),
			});
			toast.error('Internal Server error');
            console.log(err);
		}
		setIsLoading(false);
	};

	const deleteSchedule = async () => {
		setButtonOpen(false);
		setIsLoading(true);
		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/schedules/${id}`,
				{
					headers: {
						'Content-Type': 'application/json',
						authorization: 'Bearer ' + cookies.get('userToken'),
					},
					method: 'DELETE',
				}
			);
			const data = await response.json();
			if (data.error || data.statusCode) {
				fetch(`${process.env.REACT_APP_API_URL}/api/logs`, {
					headers: { 'Content-Type': 'application/json' },
					method: 'POST',
					body: JSON.stringify({
						user: cookies.get('user'),
						err: data,
						path: `schedules/${id}`,
						component: 'ScheduleUpdate',
					}),
				});
				toast.error(data.message);
			} else {
				toast.success('סידור נמחק');
				navigate('/schedules');
			}
		} catch (err) {
			fetch(`${process.env.REACT_APP_API_URL}/api/logs`, {
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
				body: JSON.stringify({
					user: cookies.get('user'),
					err,
					path: `schedules/${id}`,
					component: 'ScheduleUpdate',
				}),
			});
			toast.error('Internal Server Error');
		}
		setIsLoading(false);
	};

	const resetScheduleWeeks = () => {
		let weeks_temp = [...schedule.weeks];
		for (let i = 0; i < weeks_temp.length; i++) {
			// i - week number
			for (let j = 0; j < weeks_temp[i].length; j++) {
				// j - shift number
				for (let k = 0; k < weeks_temp[i][j].days.length; k++) {
					// k - day number
					weeks_temp[i][j].days[k] = '';
				}
			}
		}
		setSchedule({ ...schedule, weeks: weeks_temp });
		return weeks_temp;
	};

	const resetSchedule = async () => {
		setButtonOpen(false);
		setIsLoading(true);
		try {
			let weeks = resetScheduleWeeks();
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/schedules/`,
				{
					headers: {
						'Content-Type': 'application/json',
						authorization: 'Bearer ' + cookies.get('userToken'),
					},
					method: 'PATCH',
					body: JSON.stringify({ ...schedule, weeks, reset: true }),
				}
			);
			const data = await response.json();
			if (data.error || data.statusCode) {
				fetch(`${process.env.REACT_APP_API_URL}/api/logs`, {
					headers: { 'Content-Type': 'application/json' },
					method: 'POST',
					body: JSON.stringify({
						user: cookies.get('user'),
						err: data,
						path: `schedules`,
						component: 'ScheduleUpdate',
					}),
				});
				toast.error(data.message);
			} else {
				toast.success('עודכן');
			}
		} catch (err) {
			fetch(`${process.env.REACT_APP_API_URL}/api/logs`, {
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
				body: JSON.stringify({
					user: cookies.get('user'),
					err,
					path: `schedules`,
					component: 'ScheduleUpdate',
				}),
			});
			toast.error('Internal Server Error');
		}
		setIsLoading(false);
	};

	const checkSchedule = async () => {
		setButtonOpen(false);
		setIsLoading(true);
		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/schedules/check`,
				{
					headers: {
						'Content-Type': 'application/json',
						authorization: 'Bearer ' + cookies.get('userToken'),
					},
					method: 'PUT',
					body: JSON.stringify(schedule.weeks),
				}
			);
			const data = await response.json();
			if (data.error || data.statusCode) {
				fetch(`${process.env.REACT_APP_API_URL}/api/logs`, {
					headers: { 'Content-Type': 'application/json' },
					method: 'POST',
					body: JSON.stringify({
						user: cookies.get('user'),
						err: data,
						path: `schedules/check`,
						component: 'ScheduleUpdate',
					}),
				});
				toast.error(data.message);
			} else {
				if (data.length > 0) {
					for (let i = 0; i < data.length; i++) {
						toast.error(data[i], { autoClose: false });
					}
				} else {
					toast.success('סידור תקין');
				}
			}
		} catch (err) {
			fetch(`${process.env.REACT_APP_API_URL}/api/logs`, {
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
				body: JSON.stringify({
					user: cookies.get('user'),
					err,
					path: `schedules/check`,
					component: 'ScheduleUpdate',
				}),
			});
			toast.error('Internal Server Error');
		}
		setIsLoading(false);
	};

	const scheduleView = async () => {
		await saveSchedule();
		navigate(`/schedule/${id}/view`);
	};

	const scheduleTable = async () => {
		await saveSchedule();
		navigate(`/schedule/${id}/table`);
	};

	const addReinforcement = (week: number, day: number) => {
		let addedReinforcements_temp = [...addedReinforcements];
		addedReinforcements_temp[week][day].push({
			names: '',
			shift: 0,
			where: '',
			scheduleId: schedule._id,
			week,
			day,
			_id: uuidv4(),
		});
		setAddedReinforcements(addedReinforcements_temp);
	};

    const removeReinforcement = (week: number, day: number, id: string, added: boolean) => {
        let addedReinforcements_temp;
        if (added) {
            addedReinforcements_temp = [...addedReinforcements];
        } else {
            addedReinforcements_temp = [...reinforcements];
        }
        if (!added) {
            let removed = addedReinforcements_temp[week][day].find((reinforcement) => reinforcement._id === id);
            if (removed) {
                setDeletedReinforcements([...deletedReinforcements, removed]);
            }
        }
        addedReinforcements_temp[week][day] = addedReinforcements_temp[week][day].filter((reinforcement) => reinforcement._id !== id);
        if (!added) {
            setReinforcements(addedReinforcements_temp);
        } else {
            setAddedReinforcements(addedReinforcements_temp);
        }
    }

    const changeReinforcement = (e: ChangeEvent<HTMLTextAreaElement>, added: boolean) => {
        const [week, day, id, name] = e.target.name.split('/');
        let addedReinforcements_temp;
        if (added) {
            addedReinforcements_temp = [...addedReinforcements];
        } else {
            addedReinforcements_temp = [...reinforcements];
        }
		const reinforcement = addedReinforcements_temp[parseInt(week)][parseInt(day)].find((reinforcement) => reinforcement._id === id);
		if (reinforcement) {
			(reinforcement as any)[name] = e.target.value;
		}
        if (added) {
            setAddedReinforcements(addedReinforcements_temp);
        } else {
            setReinforcements(addedReinforcements_temp);
        }
    }

    const changeSelectReinforcement = (e: SelectChangeEvent<number>, ElementName: string, added: boolean) => {
        const [week, day, id, name] = ElementName.split('/');
        let addedReinforcements_temp;
        if (added) {
            addedReinforcements_temp = [...addedReinforcements];
        } else {
            addedReinforcements_temp = [...reinforcements];
        }
        const reinforcement = addedReinforcements_temp[parseInt(week)][parseInt(day)].find((reinforcement) => reinforcement._id === id);
        if (reinforcement) {
            (reinforcement as any)[name] = parseInt(e.target.value as string);
        }
        if (added) {
            setAddedReinforcements(addedReinforcements_temp);
        } else {
            setReinforcements(addedReinforcements_temp);
        }
    }

	useEffect(() => {
		getSchedule(true);
	}, []);

	if (isLoading) {
		return <Spinner />;
	}

	const modalChildren = (
		<>
			<form>
				<Button variant="contained" component="label">
					קובץ
					<input
						hidden
						onChange={(e) =>
							setFile(e.target.files ? e.target.files[0] : null)
						}
						type="file"
					/>
				</Button>
				<Typography>{file ? file.name : ''}</Typography>
			</form>
		</>
	);

	const closeModal = () => {
		setModalOpen(false);
		setFile(null);
	};

	const uploadExcel = async () => {
		if (file === null) {
			toast.error('נא לבחור קובץ');
			return;
		}
		setIsLoading(true);
		try {
			var form = new FormData();
			form.append('file', file);
			form.append('scheduleId', schedule._id);
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/schedules/upload`,
				{
					headers: {
						authorization: 'Bearer ' + cookies.get('userToken'),
					},
					method: 'PUT',
					body: form,
				}
			);
			const data = await response.json();
			if (data.error || data.statusCode) {
				fetch(`${process.env.REACT_APP_API_URL}/api/logs`, {
					headers: { 'Content-Type': 'application/json' },
					method: 'POST',
					body: JSON.stringify({
						user: cookies.get('user'),
						err: data,
						path: `schedules/upload`,
						component: 'ScheduleUpdate',
					}),
				});
				toast.error(data.message);
			} else {
				closeModal();
				await getSchedule(false);
			}
		} catch (err) {
			fetch(`${process.env.REACT_APP_API_URL}/api/logs`, {
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
				body: JSON.stringify({
					user: cookies.get('user'),
					err,
					path: `schedules/upload`,
					component: 'ScheduleUpdate',
				}),
			});
			toast.error('Internal Server Error');
		}
		setIsLoading(false);
	};

	const openModal = async () => {
		setModalOpen(true);
		setFile(null);
	};

	const actions = [
		{
			icon: <SaveIcon color="success" />,
			name: 'שמירה',
			onClick: saveSchedule,
		},
		{
			icon: <CheckIcon color="info" />,
			name: 'בדיקה',
			onClick: checkSchedule,
		},
		{
			icon: <UploadFileIcon htmlColor="#9A8B4F" />,
			name: 'העלאה',
			onClick: openModal,
		},
		{
			icon: <DatasetIcon htmlColor="#45B8AC" />,
			name: 'תצוגה',
			onClick: scheduleView,
		},
		{
			icon: <TableChartIcon htmlColor="#009B77" />,
			name: 'טבלת משמרות',
			onClick: scheduleTable,
		},
		{
			icon: <RestartAltIcon color="error" />,
			name: 'איפוס',
			onClick: resetSchedule,
		},
		{
			icon: <DeleteIcon color="error" />,
			name: 'מחיקה',
			onClick: deleteSchedule,
		},
	];

	return (
		<>
			<Modal
				open={modalOpen}
				closeModal={closeModal}
				children={modalChildren}
				textContent=""
				confirmButtonText="העלאה"
				title="העלאת קובץ אקסל"
				confirmButton={uploadExcel}
			/>
			<ActionButton
				actions={actions}
				open={buttonOpen}
				setOpen={setButtonOpen}
			/>
			<main>
				<h1>
					{dateToString(new Date(schedule.date))} -{' '}
					{dateToString(
						addDays(
							new Date(schedule.date),
							schedule.num_weeks * 7 - 1
						)
					)}
				</h1>
				<FormControlLabel
					control={
						<Switch
							onChange={changePublish}
							checked={schedule.publish}
						/>
					}
					label="פרסום"
				/>
				{numberToArray(schedule.num_weeks).map((week) => (
					<TableHead2
						key={`week-${week}`}
						days={schedule.days[week]}
						children={
							<TableBodySchedule
								addReinforcement={addReinforcement}
                                removeReinforcement={removeReinforcement}
                                changeReinforcement={changeReinforcement}
                                changeSelectReinforcement={changeSelectReinforcement}
								addedReinforcements={addedReinforcements[week]}
								week={week}
								data={schedule.weeks[week]}
								reinforcements={reinforcements[week]}
								update={true}
								onChange={changeSchedule}
							/>
						}
					/>
				))}
			</main>
		</>
	);
};

export default ScheduleUpdate;
