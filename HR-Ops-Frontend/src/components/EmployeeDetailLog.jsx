import { useMemo, useState } from 'react';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { getStatusColor, getStatusIcon, generateCalendarDates, formatDecimalHours, formatLongTime, API_BASE_URL } from '../utils/attendanceUtils'; // Updated Path
import Button from "./Button";

const EmployeeDetailLog = ({ employeeRecord, onBack }) => {
    const { name, employeeId } = employeeRecord;
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'
    const [currentMonth, setCurrentMonth] = useState(parseInt(employeeRecord.month));
    const [currentYear, setCurrentYear] = useState(parseInt(employeeRecord.year));
    const [attendance, setAttendance] = useState(employeeRecord.attendance || []);
    const [loading, setLoading] = useState(false);

    const monthIndex = currentMonth - 1;
    const monthYearText = new Date(currentYear, monthIndex).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const fetchNewMonthData = async (m, y) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/attendance/view`, {
                params: { month: m, year: y, search: employeeId },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // The API returns an array. Find the record for this employee.
            const record = response.data.find(r => r.employeeId === employeeId);
            if (record) {
                setAttendance(record.attendance || []);
            } else {
                setAttendance([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setAttendance([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        let newMonth = currentMonth - 1;
        let newYear = currentYear;
        if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
        fetchNewMonthData(newMonth, newYear);
    };

    const handleNextMonth = () => {
        let newMonth = currentMonth + 1;
        let newYear = currentYear;
        if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
        fetchNewMonthData(newMonth, newYear);
    };

    const calendarDates = useMemo(() => generateCalendarDates(currentYear, monthIndex, attendance), [currentYear, monthIndex, attendance]);

    const totals = useMemo(() => {
        return attendance.reduce((acc, rec) => ({
            hours: acc.hours + (rec.totalHours || 0),
            overtime: acc.overtime + (rec.overtime || 0)
        }), { hours: 0, overtime: 0 });
    }, [attendance]);

    return (
        <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 border-b pb-4 gap-3 sm:gap-4">
                {/* Left: Back Button - Compact on mobile */}
                <div className="w-full sm:w-auto flex justify-start">
                    <Button onClick={onBack} variant="ghost" className="flex items-center text-indigo-600 hover:text-indigo-800 font-bold transition text-xs sm:text-base p-0">
                        <ChevronLeft size={18} className="mr-0.5 sm:mr-1" /> Summary
                    </Button>
                </div>

                {/* Center: Name and ID - Better stacking */}
                <div className="flex flex-row sm:flex-row items-baseline justify-center gap-2 sm:gap-4 flex-grow">
                    <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight text-center">
                        {name}
                    </h2>
                    <span className="text-gray-400 font-bold text-[10px] sm:text-lg whitespace-nowrap">
                        ID: {employeeId}
                    </span>
                </div>

                {/* Right: Toggle Mode Button - Full width on very small, auto otherwise */}
                <div className="w-full sm:w-auto flex justify-end">
                    <Button
                        onClick={() => setViewMode(viewMode === 'calendar' ? 'table' : 'calendar')}
                        variant="primary"
                        className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-sm font-bold shadow-md rounded-full w-full sm:w-auto transform active:scale-95 transition-transform"
                    >
                        {viewMode === 'calendar' ? 'Details' : 'Calendar'}
                    </Button>
                </div>
            </div>

            <div className="flex justify-center items-center mb-6 sm:mb-8 p-3 sm:p-4 bg-gray-50 rounded-lg gap-2 sm:gap-6">
                <button
                    onClick={handlePrevMonth}
                    disabled={loading}
                    className="p-1 sm:p-2 rounded-full hover:bg-gray-200 text-gray-600 disabled:opacity-50 transition-colors"
                    title="Previous Month"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="flex flex-col items-center min-w-[150px] sm:min-w-[200px] gap-1">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 flex items-center justify-center">
                        <Clock size={18} className="mr-2 text-blue-600 sm:w-5 sm:h-5" />
                        {loading ? "Loading..." : monthYearText}
                    </h3>
                    {!loading && (
                        <div className="flex gap-3 text-[10px] sm:text-xs text-gray-600 font-medium">
                            <span>Hours: <span className="text-blue-600">{formatLongTime(totals.hours)}</span></span>
                            <span>OT: <span className="text-indigo-600">{formatLongTime(totals.overtime)}</span></span>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleNextMonth}
                    disabled={loading}
                    className="p-1 sm:p-2 rounded-full hover:bg-gray-200 text-gray-600 disabled:opacity-50 transition-colors"
                    title="Next Month"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {viewMode === 'calendar' ? (
                <>
                    <h4 className="text-base sm:text-lg font-bold text-gray-700 mb-3 mt-4 sm:mt-6">Monthly Calendar View</h4>
                    {attendance && attendance.length > 15 ? (
                        <div className="border border-gray-200 rounded-lg p-2 sm:p-4 mb-6 sm:mb-8">
                            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center font-medium text-gray-500 uppercase text-[10px] sm:text-xs mb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="py-1 sm:py-2 text-indigo-600">{day}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                                {calendarDates.map((dayData, index) => (
                                    <div key={index}
                                        className={`relative h-12 sm:h-14 md:h-16 flex flex-col items-center justify-center rounded-lg text-xs sm:text-sm transition duration-100 p-0.5 sm:p-1 cursor-help
                                         ${dayData.status === 'Padding' ? 'bg-white text-gray-300' : `border ${getStatusColor(dayData.status)}`}`}
                                        title={dayData.status === 'Holiday' ? (dayData.details?.holidayName || 'Public Holiday') : ''}>
                                        {dayData.details?.overtime > 0 && (
                                            <div
                                                className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full shadow-sm"
                                                title={`Overtime: ${formatDecimalHours(dayData.details.overtime)}`}
                                            />
                                        )}
                                        <span className="font-semibold text-[10px] sm:text-xs">{dayData.day}</span>
                                        {dayData.status !== 'Padding' && (
                                            <span className={`text-[7px] sm:text-[10px] md:text-xs mt-0.5 sm:mt-1 font-mono text-center px-0.5 leading-tight ${dayData.status === 'Holiday' ? 'font-bold' : 'text-gray-600 italic'}`}>
                                                {dayData.status === 'Holiday' ?
                                                    <span className="truncate max-w-[40px] sm:max-w-none block" title={dayData.details.holidayName}>
                                                        {dayData.details.holidayName || 'Holiday'}
                                                    </span>
                                                    : (dayData.status === 'Site Visit' ? 'Site Visit' : (dayData.status === 'Leave' ? `Leave (${dayData.details.leaveType || ''})` : (dayData.details?.totalHours > 0 ? formatDecimalHours(dayData.details.totalHours) : dayData.status)))
                                                }
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-lg p-8 sm:p-12 mb-6 sm:mb-8 flex flex-col items-center justify-center text-gray-500">
                            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Attendance Data Available</p>
                            <p className="text-sm sm:text-base text-gray-500 text-center">There is no attendance record for {monthYearText}.</p>
                            <p className="text-xs sm:text-sm text-gray-400 mt-2 text-center">Upload attendance data for this month to view the calendar.</p>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <h4 className="text-base sm:text-lg font-bold text-gray-700 mb-3">Detail Log</h4>
                    {attendance && attendance.length > 15 ? (
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Day</th>
                                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Check In</th>
                                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Check Out</th>
                                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Hours</th>
                                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Overtime</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {attendance.map((record, index) => {
                                        const isSunday = new Date(currentYear, currentMonth - 1, record.day).getDay() === 0;
                                        const displayStatus = (isSunday && (record.status === 'Absent' || record.status === 'Missed Punch')) ? 'Weekend' : record.status;
                                        const isWeekend = displayStatus === 'Weekend';
                                        return (
                                            <tr key={index} className={`hover:bg-gray-50 ${isWeekend ? 'bg-purple-100' : ''}`}>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{record.day}</td>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-black-600">
                                                    <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full w-fit border ${getStatusColor(displayStatus)}`}>
                                                        <span className="hidden sm:inline">{getStatusIcon(displayStatus)}</span>
                                                        <span className="text-[10px] sm:text-xs">
                                                            {displayStatus}{(record.leaveType && displayStatus !== 'Site Visit') ? ` (${record.leaveType})` : (displayStatus === 'Holiday' && record.holidayName) ? ` (${record.holidayName})` : ''}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">{record.inTime || '-'}</td>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">{record.outTime || '-'}</td>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-black-600">
                                                    <div className="flex flex-col">
                                                        <span>{formatDecimalHours(record.totalHours)}</span>
                                                        <span className="text-[10px] text-gray-500 md:hidden">OT: {formatDecimalHours(record.overtime)}</span>
                                                        <span className="text-[10px] text-gray-500 sm:hidden">In: {record.inTime || '-'} / Out: {record.outTime || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-black-600 hidden md:table-cell">{formatDecimalHours(record.overtime)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-lg p-8 sm:p-12 flex flex-col items-center justify-center text-gray-500">
                            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Attendance Data Available</p>
                            <p className="text-sm sm:text-base text-gray-500 text-center">There is no attendance record for {monthYearText}.</p>
                            <p className="text-xs sm:text-sm text-gray-400 mt-2 text-center">Upload attendance data for this month to view the details.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default EmployeeDetailLog;