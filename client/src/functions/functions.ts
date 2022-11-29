export const addDays = (date: Date, days: number): Date => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const dateToString = (date: Date): string => {
    const yyyy = date.getFullYear() % 100;
    let mm = date.getMonth() + 1; // Months start at 0!
    let dd = date.getDate();

    let MM = mm.toString();
    let DD = dd.toString();

    if (dd < 10) DD = '0' + dd;
    if (mm < 10) MM = '0' + mm;

    const formattedDate = DD + '/' + MM + '/' + yyyy;
    return formattedDate;
};

export const dateToStringShort = (date: Date): string => {
    let mm = date.getMonth() + 1; // Months start at 0!
    let dd = date.getDate();

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
