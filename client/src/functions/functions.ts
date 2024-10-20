import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);


export const addDays = (date: Date, days: number): Date => {
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
};

export const dateToString = (date: Date): string => {
	const yyyy = date.getFullYear() % 100;
	const dateShort = dateToStringShort(date).replace('.', '/');

	const formattedDate = dateShort + '/' + yyyy;
	return formattedDate;
};

export const dateToStringShort = (date: Date): string => {
    const datejs = dayjs(date);
    datejs.tz('Asia/Jerusalem');
    const formattedDate = datejs.format('DD.MM');

	return formattedDate;
};

export const numberToArray = (number: number): number[] => {
	const arr: number[] = [];
	for (let i = 0; i < number; i++) {
		arr.push(i);
	}
	return arr;
};

export const doesContain = (arr: any[], value: any): boolean => {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] === value) return true;
	}
	return false;
};
