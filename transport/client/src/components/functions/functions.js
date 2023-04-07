export function groupBy(list, keyGetter) {
    const map = new Map();
    const keys = [];
    list.forEach((item) => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
            map.set(key, [item]);
            keys.push(key);
         } else {
             collection.push(item);
         }
    });
    return {map, keys};
}
  
export function dateToString(date) {
    const dateObj = new Date(date);
    let month = dateObj.getMonth() + 1;
    let day = dateObj.getDate();
    if (month < 10) {
        month = `0${month}`;
    }
    if (day < 10) {
        day = `0${day}`;
    }
    const year = dateObj.getFullYear();
    return `${day}.${month}.${year}`;
}

export function stringToDate(date) {
    const dateArray = date.split('.');
    const day = dateArray[0];
    const month = dateArray[1] - 1;
    const year = dateArray[2];
    return new Date(year, month, day);
}