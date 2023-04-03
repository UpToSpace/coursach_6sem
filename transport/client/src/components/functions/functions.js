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
  