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
    const nextTime = arrivalTimes[1].arrivalTime;

    // Calculate the difference in minutes
    const minutesUntilClosestTime = Math.abs(convertToMinutes(closestTime) - currentTimeInMinutes);
    const minutesUntilNextTime = Math.abs(convertToMinutes(nextTime) - currentTimeInMinutes);

    return { minutesUntilClosestTime, minutesUntilNextTime };
}

// Helper function to convert time to minutes
function convertToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}