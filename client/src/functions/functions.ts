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
	const dateString = date.toLocaleDateString('he-IL');
	console.log(date.toLocaleDateString('he-IL'));
	const data = dateString.split('.');
	const dd = parseInt(data[0]);
	const mm = parseInt(data[1]);

	let MM = mm.toString();
	let DD = dd.toString();

	if (dd < 10) DD = '0' + dd;
	if (mm < 10) MM = '0' + mm;

	const formattedDate = DD + '.' + MM;
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
