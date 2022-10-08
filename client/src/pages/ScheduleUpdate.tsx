import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { Schedule } from '../types/types';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner'
import { addDays, dateToString, dateToStringShort, numberToArray } from '../functions/functions';


interface IProps {
    manager: boolean;
}

const ScheduleUpdate = (props: IProps) => {

    const { id } = useParams();
    const cookies = new Cookies();
    const [schedule, setSchedule] = useState<Schedule>({} as Schedule);
    const [isLoading, setIsLoading]  = useState<boolean>(false);

    const getSchedule = async () => {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/schedule/' + id, { headers: { authorization: 'Bearer ' + cookies.get('userToken')}});
        const data = await response.json();
        if (data.error) {
            toast.error(data.message);
        } else {
            setSchedule(data);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        getSchedule();
    }, []);

    if (isLoading) {
        return <Spinner />;
    }


    if (!props.manager) {
        return <></>;
    }

  return (
    <main>
        <h1>{dateToString(new Date(schedule.date))} - {dateToString(addDays(new Date(schedule.date), schedule.num_weeks * 7 - 1))}</h1>
        {numberToArray(schedule.num_weeks).map( week => {return (
        <table>
		<thead>
        <tr>
			<th>תאריך</th>
            {schedule.days[week].map((day, index) => {
                return (
                    <th key={day}>{dateToStringShort(new Date(day))}</th>
                )
            })}
		</tr>
		<tr>
			<th></th>
			<th>ראשון</th>
			<th>שני</th>
			<th>שלישי</th>
			<th>רביעי</th>
			<th>חמישי</th>
			<th>שישי</th>
			<th>שבת</th>
		</tr>
		</thead>
		<tbody>

		</tbody>
	</table>)})}
    </main>
  )
}

export default ScheduleUpdate