// write a procedure that takes an array of bjects contains arrivalTime field like "19:00" and returns the closest time to current time and the next time

export function findClosestTimes(arrivalTimes) {
    console.log('arrivalTimes: ', arrivalTimes);
    // Get the current time
    const currentTime = new Date();
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();

    // Convert current time to minutes for easier comparison
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    // Sort the array based on the time difference from the current time
    arrivalTimes.sort((a, b) => {
        const timeA = convertToMinutes(a.arrivalTime);
        const timeB = convertToMinutes(b.arrivalTime);

        return Math.abs(timeA - currentTimeInMinutes) - Math.abs(timeB - currentTimeInMinutes);
    });

    // The first element is the closest time, and the second is the next time
    const closestTime = arrivalTimes[0].arrivalTime;
    const nextTime = arrivalTimes[1] !== undefined ? arrivalTimes[1].arrivalTime : null;

    // Calculate the difference in minutes
    const minutesUntilClosestTime = Math.abs(convertToMinutes(closestTime) - currentTimeInMinutes);
    if (nextTime === null) {
        return { minutesUntilClosestTime, minutesUntilNextTime: null };
    }
    const minutesUntilNextTime = Math.abs(convertToMinutes(nextTime) - currentTimeInMinutes);

    return { minutesUntilClosestTime, minutesUntilNextTime };
}

// Helper function to convert time to minutes
function convertToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

export function findNearestStops(userLatitude, userLongitude, stops) {
    const R = 6371; // Earth radius in kilometers
    const stopAmount = 5;
    // Calculate distances to all stops
    const distances = stops.map(stop => {
        const lat1 = userLatitude; 
        const lon1 = userLongitude; 
        const lat2 = stop.latitude;
        const lon2 = stop.longitude;

        const dLat = degToRad(lat2 - lat1);
        const dLon = degToRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // Distance in kilometers
        return { stop, distance };
    });

    // Sort distances in ascending order
    distances.sort((a, b) => a.distance - b.distance);

    // Get the three nearest stops
    const nearestStops = distances.slice(0, stopAmount).map(item => item.stop);
    return nearestStops;
}

function degToRad(deg) {
    return deg * (Math.PI / 180);
}