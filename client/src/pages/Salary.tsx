import { Fragment, useEffect, useMemo, useState } from 'react'
import { BaseSalary, Salary as SalaryInterface } from '../types/types';
import MiniTable from '../components/MiniTable';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import SalaryTable from '../components/SalaryTable';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import Cookies from 'universal-cookie';

function Salary() {
    const cookies = new Cookies();
    const [inputType, setInputType] = useState<string>('input');
    const [salary, setSalary] = useState<SalaryInterface>({
        absence: 0,
        shift_100: 0,
        extra_100: 0,
        extra_125: 0,
        extra_150: 0,
        special_150: 0,
        special_200: 0,
        shift_150: 0,
        extra_1875: 0,
        extra_225: 0,
        extra_20: 0,
        small_eco: 0,
        big_eco: 0,
        extra_eco: 0,
        travel: 0,
        extra_travel: 0,
        s_travel: 0
    });
    const [baseData, setBaseData] = useState<BaseSalary>({
        pay: 40.966,
        travel: 18,
        extra_travel: 18,
        small_eco: 13.5,
        big_eco: 19.7,
        extra_eco: 33.9,
        s_travel: 28,
        recuperation: 200
    });

    const totalPay = useMemo<SalaryInterface & {work_hours_pay: number, total: number, work_hours: number}>(() => {
        const absence = salary.absence * baseData.pay;
        const shift_100 = salary.shift_100 * baseData.pay;
        const extra_100 = salary.extra_100 * baseData.pay;
        const extra_125 = salary.extra_125 * baseData.pay * 1.25;
        const extra_150 = salary.extra_150 * baseData.pay * 1.5;
        const special_150 = salary.special_150 * baseData.pay * 1.5;
        const special_200 = salary.special_200 * baseData.pay * 2;
        const shift_150 = salary.shift_150 * baseData.pay * 1.5;
        const extra_1875 = salary.extra_1875 * baseData.pay * 1.875;
        const extra_225 = salary.extra_225 * baseData.pay * 2.25;
        const extra_20 = salary.extra_20 * baseData.pay * 0.2;
        const small_eco = salary.small_eco * baseData.small_eco;
        const big_eco = salary.big_eco * baseData.big_eco;
        const extra_eco = salary.extra_eco * baseData.extra_eco;
        const travel = salary.travel * baseData.travel < 255 ? salary.travel * baseData.travel : 255;
        const extra_travel = salary.extra_travel * baseData.extra_travel;
        const s_travel = salary.s_travel * baseData.s_travel;
        const work_hours = salary.shift_100 + salary.extra_125 + salary.extra_150 + salary.special_150 + salary.special_200 + salary.shift_150 + salary.extra_1875 + salary.extra_225;
        const work_hours_pay = absence + shift_100 + extra_125 + extra_150 + special_150 + special_200 + shift_150 + extra_1875 + extra_225 + extra_20 + extra_100;
        const total = work_hours_pay + small_eco + big_eco + extra_eco + travel + extra_travel + s_travel + baseData.recuperation;
        return { absence, shift_100, extra_125, extra_150, special_150, special_200, shift_150, extra_1875, extra_225, extra_20, small_eco, big_eco, extra_eco, travel, extra_travel, work_hours_pay, total, extra_100, s_travel, work_hours };
    }, [salary, baseData]);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const changeBaseData = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBaseData({...baseData, [e.target.id]: +e.target.value});
    }

    const changeSalary = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSalary({...salary, [e.target.id]: +e.target.value});
    }

    const changeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]){
            const fileType = e.target.files[0].name.split('.').pop();
            if ((fileType !== 'PDF' && fileType !== 'pdf') || e.target.files[0].size === 0){
                toast.error('קובץ לא תקין');
                return;
            }
            const formData = new FormData();
            formData.append('file', e.target.files[0]);
            setIsLoading(true);
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/report`, { 
                    headers: {
                        authorization: 'Bearer ' + cookies.get('userToken') 
                    },
                    method: 'POST', 
                    body: formData
                });
                const data = await response.json();
                if (data.error || data.statusCode) {
                    fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `users/all`, component: "Quality" })})
                    toast.error(data.message);
                } else {
                    setSalary(data.data);
                }
            } catch (err) {
            fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `users/all`, component: "Quality" })})
            toast.error('Internal Server Error');
            }
            setIsLoading(false);
        }
    }

    const getBaseData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/pay`, { 
                headers: {
                    'Content-Type': 'application/json', 
                    authorization: 'Bearer ' + cookies.get('userToken') 
                },
            });
            const data = await response.json();
            if (data.error || data.statusCode) {
                fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err: data, path: `users/all`, component: "Quality" })})
                toast.error(data.message);
            } else {
                setBaseData(data.data);
            }
        } catch (err) {
            fetch(`${process.env.REACT_APP_API_URL}/api/logs`, { headers: { 'Content-Type': 'application/json' },method: 'POST', body: JSON.stringify({user: cookies.get('user'), err, path: `users/all`, component: "Quality" })})
            toast.error('Internal Server Error');
        }
        setIsLoading(false);
    }

    useEffect(() => {
        getBaseData();
    }, []);

    const onSelectionChange = (e: SelectChangeEvent) => {
        const value = e.target.value as string;
        setInputType(value);
    }

    if (isLoading){
        return <Spinner />
    }

    const heads = [{name: 'ימי העדרות', id: 'absence'}, {name: 'ע״ח שבת', id: 'extra_100'}, {name: 'משמרת 100%', id: 'shift_100'}, {name: 'שעות נוספות 125%', id: 'extra_125'}, {name: 'שעות נוספות 150%', id: 'extra_150'}, {name: 'איכות 150%', id: 'special_150'}, {name: 'איכות 200%', id: 'special_200'}, {name: 'לילה 150%', id: 'shift_150'}, {name: 'שעות נוספות 187.5%', id: 'extra_1875'}, {name: 'שעות נוספות 225%', id: 'extra_225'}, {name: 'צהריים 20%', id: 'extra_20'}, {name: 'כלכלה קטנה', id: 'small_eco'}, {name: 'כלכלה גדולה', id: 'big_eco'}, {name: 'אש"ל תגבור', id: 'extra_eco'}, {name: 'נסיעות', id: 'travel'}, {name: 'תחבורה ציבורית תגבור', id: 'extra_travel'}, {name: 'נסיעות שבת', id: 's_travel'}];
    const quantity = [salary.absence.toString(), salary.extra_100.toString(), salary.shift_100.toString(), salary.extra_125.toString(), salary.extra_150.toString(), salary.special_150.toString(), salary.special_200.toString(), salary.shift_150.toString(), salary.extra_1875.toString(), salary.extra_225.toString(), salary.extra_20.toString(), salary.small_eco.toString(), salary.big_eco.toString(), salary.extra_eco.toString(), salary.travel.toString(), salary.extra_travel.toString(), salary.s_travel.toString()];
    const pay = [totalPay.absence.toFixed(2).toString(), totalPay.extra_100.toFixed(2).toString(), totalPay.shift_100.toFixed(2).toString(), totalPay.extra_125.toFixed(2).toString(), totalPay.extra_150.toFixed(2).toString(), totalPay.special_150.toFixed(2).toString(), totalPay.special_200.toFixed(2).toString(), totalPay.shift_150.toFixed(2).toString(), totalPay.extra_1875.toFixed(2).toString(), totalPay.extra_225.toFixed(2).toString(), totalPay.extra_20.toFixed(2).toString(), totalPay.small_eco.toFixed(2).toString(), totalPay.big_eco.toFixed(2).toString(), totalPay.extra_eco.toFixed(2).toString(), totalPay.travel.toFixed(2).toString(), totalPay.extra_travel.toFixed(2).toString(), totalPay.s_travel.toFixed(2).toString()];

  return (
    <main>
        <h1>חישוב שכר</h1>
        <FormControl sx={{width: '8rem'}}>
            <InputLabel id="previous-label">{"הזנת מידע"}</InputLabel>
            <Select
            labelId="previous-label"
            id="previous"
            value={inputType}
            label="הזנת מידע"
            onChange={onSelectionChange}>
                <MenuItem value={"input"}>הזנה ידנית</MenuItem>
                <MenuItem value={"file"}>קובץ</MenuItem>
            </Select>
        </FormControl>
        {inputType === 'file' && <TextField sx={{width: '15rem'}} onChange={changeFile} id='file' type='file' />}
        <div className='salary_cells' style={{ justifyContent: 'center', width: '100%'}}>
            <MiniTable head="שכר" onChange={changeBaseData} editable={true} id='pay' body={baseData.pay.toString()} />
            <MiniTable head="דמי נסיעה" onChange={changeBaseData} editable={true} id='travel' body={baseData.travel.toString()} />
            <MiniTable head="כלכלה גדולה" onChange={changeBaseData} editable={true} id='big_eco' body={baseData.big_eco.toString()} />
            <MiniTable head="כלכלה קטנה" onChange={changeBaseData} editable={true} id='small_eco' body={baseData.small_eco.toString()} />
            <MiniTable head="אש״ל תגבור" onChange={changeBaseData} editable={true} id='extra_eco' body={baseData.extra_eco.toString()} />
            <MiniTable head="תחבורה ציבורית תגבור" onChange={changeBaseData} editable={true} id='extra_travel' body={baseData.extra_travel.toString()} />
            <MiniTable head="נסיעות שבת" onChange={changeBaseData} editable={true} id='s_travel' body={baseData.s_travel.toString()} />
            <MiniTable head="הבראה" onChange={changeBaseData} editable={true} id='recuperation' body={baseData.recuperation.toString()} />
        </div>
        <div className='salary_cells'>
            {inputType === 'input' ? <Fragment>
                {heads.map((head, index) => (
                    <SalaryTable head={head.name} onChange={changeSalary} editable={true} id={head.id} quantity={quantity[index]} pay={pay[index]} />
                ))}
            </Fragment> : <Fragment>
                {heads.map((head, index) => (
                    <SalaryTable head={head.name} quantity={quantity[index]} pay={pay[index]} />
                ))}
                </Fragment>}
        </div>
        <div style={{ display: 'flex', marginTop: '10px', flexWrap: 'wrap'}}>
            <MiniTable minWidth='15rem' head="שכר על השעות" body={totalPay.work_hours_pay.toFixed(2).toString()} />
            <MiniTable minWidth='15rem' head="שעות בפועל" body={totalPay.work_hours.toFixed(2).toString()} />
            <MiniTable minWidth='15rem' head="ברוטו" body={totalPay.total.toFixed(2).toString()} />
            <MiniTable minWidth='15rem' head="שכר שעתי ממוצע" body={(totalPay.total / totalPay.work_hours).toFixed(2).toString()} />
        </div>
    </main>
  )
}

export default Salary