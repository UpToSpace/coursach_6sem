function convertArrivalTimeToMilliseconds(time) {
    // Split the time string into hours and minutes
    const [hours, minutes] = time.split(':');

    // Create a Date object with today's date and the specified hours and minutes
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(hours);
    currentDate.setMinutes(minutes);

    // Calculate the difference between the current date and the UNIX epoch
    const timeInMillis = currentDate.getTime();

    return timeInMillis;
}

module.exports = {
    convertArrivalTimeToMilliseconds
}