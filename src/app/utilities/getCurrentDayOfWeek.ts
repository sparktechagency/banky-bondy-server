const getCurrentDayOfWeek = (date: string): string => {
    const daysOfWeek = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];

    const currentDayIndex = new Date(date).getDay();

    return daysOfWeek[currentDayIndex];
};

export default getCurrentDayOfWeek;
