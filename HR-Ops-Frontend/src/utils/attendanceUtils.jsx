import { CheckCircle, XCircle, Calendar as CalendarIcon } from 'lucide-react';

// Dynamically determine Server base URL based on current hostname
const getServerBaseUrl = () => {
    const hostname = window.location.hostname;
    // If accessing via IP address (network), use the same IP for server
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:5002`;
    }
    // Default to localhost
    return 'http://localhost:5002';
};

export const BASE_URL = getServerBaseUrl();
export const API_BASE_URL = `http://localhost:5002/api`;

export const getStatusColor = (status) => {
    if (status === 'Present') return 'bg-green-100 text-green-700 border-green-400';
    if (status === 'Site Visit') return 'bg-green-100 text-green-700 border-green-400';
    if (status === 'Absent') return 'bg-red-100 text-red-700 border-red-400';
    if (status === 'Missed Punch') return 'bg-yellow-100 text-yellow-700 border-yellow-400';
    if (status === 'Leave') return 'bg-pink-100 text-pink-700 border-pink-400';
    if (status === 'Weekend') return 'bg-purple-100 text-purple-700 border-purple-400';
    if (status === 'Holiday') return 'bg-blue-100 text-blue-700 border-blue-400';
    return 'bg-gray-100 text-gray-700 border-gray-300';
};

export const getStatusIcon = (status) => {
    if (status === 'Present' || status === 'Site Visit') return <CheckCircle size={20} className="text-green-500" />;
    if (status === 'Absent') return <XCircle size={20} className="text-red-500" />;
    if (status === 'Missed Punch' || status === 'Leave') return <CalendarIcon size={20} className="text-yellow-500" />;
    if (status === 'Weekend') return <CalendarIcon size={20} className="text-purple-500" />;
    return null;
};

export const generateCalendarDates = (year, month, attendanceArray) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();

    const recordsMap = {};
    if (attendanceArray) {
        attendanceArray.forEach(record => {
            recordsMap[record.day] = record;
        });
    }

    const days = [];
    const startPadding = firstDay.getDay();

    for (let i = 0; i < startPadding; i++) days.push({ day: '', status: 'Padding' });

    for (let i = 1; i <= numDays; i++) {
        const dayOfWeek = new Date(year, month, i).getDay();
        const record = recordsMap[i];

        let status = '-';
        if (record) {
            status = record.status;
            // If it's a leave and leaveType is siteVisit, change status to "Site Visit"
            if ((status === 'Leave' || status === 'Absent') && record.leaveType && (record.leaveType.toLowerCase() === 'sitevisit' || record.leaveType.toLowerCase() === 'site visit')) {
                status = 'Site Visit';
            }
        }


        if (dayOfWeek === 0 && (status === 'Absent' || status === 'Missed Punch' || status === '-')) {
            status = 'Weekend';
        }

        days.push({
            day: i,
            status: status,
            details: record || { inTime: '-', outTime: '-', totalHours: 0 }
        });
    }

    while (days.length % 7 !== 0) days.push({ day: '', status: 'Padding' });

    return days;
};

export const formatDecimalHours = (decimalHours) => {
    if (decimalHours === undefined || decimalHours === null || decimalHours === 0) return '-';
    // Ensure it's a number
    const num = parseFloat(decimalHours);
    if (isNaN(num)) return '-';

    const hours = Math.floor(num);
    const minutes = Math.round((num - hours) * 60);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
};

export const formatLongTime = (decimalHours) => {
    if (decimalHours === undefined || decimalHours === null || decimalHours === 0) return '0h 00min';
    const num = parseFloat(decimalHours);
    if (isNaN(num)) return '0h 00min';

    const hours = Math.floor(num);
    const minutes = Math.round((num - hours) * 60);

    return `${hours}h ${String(minutes).padStart(2, '0')}min`;
};

/**
 * Calculates net working days for a month:
 * Total Days - Sundays - Holidays = Working Days
 * 
 * @param {number|string} year 
 * @param {number|string} month (1-12)
 * @param {Array} attendanceRecords (optional, to extract holidays from records if present)
 * @returns {number} netWorkingDays
 */
export const calculateNetWorkingDays = (year, month, attendanceRecords = []) => {
    const y = parseInt(year);
    const m = parseInt(month) - 1; // 0-indexed for Date constructor
    const lastDay = new Date(y, m + 1, 0).getDate();

    let sundays = 0;
    const holidays = new Set(); // Use a Set to avoid double counting

    for (let day = 1; day <= lastDay; day++) {
        const date = new Date(y, m, day);
        if (date.getDay() === 0) {
            sundays++;
        }
    }

    // Extract holidays from attendance records if they tags as "Holiday"
    // The backend merges 'Holiday' status into the attendance array
    if (attendanceRecords && attendanceRecords.length > 0) {
        // We look at one employee's record (e.g. the first one or any that has full month data)
        // to identify which days are holidays for everyone.
        const firstRecord = attendanceRecords[0];
        if (firstRecord && firstRecord.attendance) {
            firstRecord.attendance.forEach(dayRec => {
                if (dayRec.status === 'Holiday') {
                    // Check if it's NOT a Sunday (to avoid double subtracting)
                    const d = new Date(y, m, dayRec.day);
                    if (d.getDay() !== 0) {
                        holidays.add(dayRec.day);
                    }
                }
            });
        }
    }

    const netWorkingDays = lastDay - sundays - holidays.size;
    return netWorkingDays;
};