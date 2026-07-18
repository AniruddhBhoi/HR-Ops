import React, { useState, useRef, useEffect } from 'react';
import { Search, Upload, ChevronDown } from 'lucide-react';
import axios from 'axios';
import Button from './Button';
import MonthYearPicker from './MonthYearPicker'; // Sibling import
import UploadModal from './UploadModal';         // Sibling import
import EmployeeDetailLog from './EmployeeDetailLog'; // Sibling import
import ConfirmationModal from './ConfirmationModal'; // New confirmation modal
import useDebounce from '../hooks/useDebounce'; // Custom hook
import { API_BASE_URL, getStatusIcon, getStatusColor, calculateNetWorkingDays } from '../utils/attendanceUtils.jsx'; // Up one level to utils

function AdminAttendanceManager() {
    const today = new Date();
    const [currentMonthYear, setCurrentMonthYear] = useState(`${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const pickerRef = useRef(null);

    const [attendanceData, setAttendanceData] = useState([]);
    const [filteredAttendanceData, setFilteredAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedEmployeeRecord, setSelectedEmployeeRecord] = useState(null);

    const [employeeList, setEmployeeList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [netWorkingDays, setNetWorkingDays] = useState(0);

    useEffect(() => {
        const [m, y] = currentMonthYear.split('-');
        setNetWorkingDays(calculateNetWorkingDays(y, m, attendanceData));
    }, [currentMonthYear, attendanceData]);

    const fetchAttendanceData = async () => {
        setLoading(true);
        const [month, year] = currentMonthYear.split('-');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/attendance/view`, {
                params: { month, year, search: debouncedSearch },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Filter out sparse records (e.g. only holidays/leaves) to prevent displaying "0 hours" entries
            // Only show records with significant data (more than 15 days)
            const validRecords = response.data.filter(record => record.attendance && record.attendance.length > 15);
            setAttendanceData(validRecords);
        } catch (error) {
            console.error("Error fetching data:", error);
            setAttendanceData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/admin/all-employees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Handle both potential response structures based on observation of EmployeeListPage
            const employees = response.data.employees || response.data || [];
            setEmployeeList(employees);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchAttendanceData();
    }, [currentMonthYear, debouncedSearch]);

    useEffect(() => {
        setFilteredAttendanceData(attendanceData);
    }, [attendanceData]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) setIsPickerOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [pickerRef]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, currentMonthYear]);

    const getEmployeeName = (empId) => {
        if (!employeeList.length) return null;
        const employee = employeeList.find(e => e.employeeId === empId);
        return employee ? employee.name : null;
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedEmployees = filteredAttendanceData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredAttendanceData.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const [month, year] = currentMonthYear.split('-');
    const displayDate = new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const formatExcatTime = (time) => {
        const hours = Math.floor(time);
        const minutes = Math.round((time - hours) * 60);
        return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
    };

    const handleDeleteMonthClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteMonth = async () => {
        setIsDeleteModalOpen(false); // Close modal first

        try {
            const token = localStorage.getItem('token');
            const [month, year] = currentMonthYear.split('-');

            setLoading(true);
            await axios.delete(`${API_BASE_URL}/attendance/delete-month`, {
                params: { month, year },
                headers: { 'Authorization': `Bearer ${token}` }
            });

            alert('Attendance data deleted successfully.');
            setAttendanceData([]); // Clear local data
            fetchAttendanceData(); // Refresh (though it will likely be empty)
        } catch (error) {
            console.error("Error deleting data:", error);
            alert(error.response?.data?.message || error.response?.data?.error || 'Failed to delete data. Ensure server is running.');
        } finally {
            setLoading(false);
        }
    };

    if (selectedEmployeeRecord) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
                <EmployeeDetailLog
                    employeeRecord={{ ...selectedEmployeeRecord, name: getEmployeeName(selectedEmployeeRecord.employeeId) || selectedEmployeeRecord.name || 'Unknown' }}
                    onBack={() => setSelectedEmployeeRecord(null)}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                defaultMonthYear={currentMonthYear}
                onUploadSuccess={(newVal) => { setIsUploadModalOpen(false); setCurrentMonthYear(newVal); fetchAttendanceData(); }}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteMonth}
                title="Delete Month Data"
                message={`Are you sure you want to delete ALL attendance data for ${displayDate}?`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                showCancelButton={false}
            />

            <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-2xl font-bold">Attendance Management</h2>
                <p className="text-xs sm:text-sm opacity-90 mt-1">Review and manage all employee attendance records.</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-4 sm:mb-6 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex-grow sm:min-w-[200px] relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by Name or ID..."
                        className="w-full border rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="sm:min-w-[150px] relative" ref={pickerRef}>
                    <Button variant="secondary" onClick={() => setIsPickerOpen(!isPickerOpen)} className="w-full bg-white flex justify-between items-center hover:bg-gray-50 text-sm sm:text-base border-gray-200">
                        <span className="font-semibold">{displayDate}</span>
                        <ChevronDown size={16} />
                    </Button>
                    {isPickerOpen && <MonthYearPicker currentMonthYear={currentMonthYear} onChange={setCurrentMonthYear} onClose={() => setIsPickerOpen(false)} />}
                </div>

                <Button variant="success" onClick={() => setIsUploadModalOpen(true)} className="flex items-center justify-center text-sm sm:text-base shadow-md">
                    <Upload size={18} className="mr-2" /> Bulk Upload
                </Button>
            </div>

            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-700">Summary for {displayDate}</h3>
                    {attendanceData.length > 0 && (
                        <Button
                            variant="danger"
                            onClick={handleDeleteMonthClick}
                            className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 flex items-center transition w-full sm:w-auto justify-center"
                        >
                            <span className="font-semibold text-xs sm:text-sm">Delete Month Data</span>
                        </Button>
                    )}
                </div>
                <div className="mb-4 flex gap-4">
                    <span className="text-sm text-gray-700">Total Records: {filteredAttendanceData.length}</span>
                    <span className="text-sm text-gray-700">| Total Working Days: <span className="font-bold text-indigo-600">{netWorkingDays}</span></span>
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-md bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">ID</th>
                                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Working Days</th>
                                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Hours</th>
                                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Overtime</th>
                                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="5" className="p-4 sm:p-6 text-center text-sm">Loading...</td></tr>
                            ) : paginatedEmployees.length > 0 ? (
                                paginatedEmployees.map((record) => {
                                    return (
                                        <tr key={record._id} className="hover:bg-gray-50">
                                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm">
                                                <div className="flex flex-col">
                                                    <span>{getEmployeeName(record.employeeId) || record.name || 'Unknown'}</span>
                                                    <span className="text-gray-500 text-[10px] sm:hidden">{record.employeeId}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-500 text-xs sm:text-sm hidden sm:table-cell">{record.employeeId}</td>
                                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-700 font-semibold text-xs sm:text-sm text-left">
                                                {(record.attendance || []).filter(day => day.status === 'Present' || day.status === 'Site Visit').length} / {netWorkingDays}
                                            </td>
                                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-bold text-gray-600 text-xs sm:text-sm">
                                                <div className="flex flex-col">
                                                    <span>{formatExcatTime(record.totalMonthlyHours || 0)}</span>
                                                    <span className="text-[10px] text-gray-500 md:hidden">OT: {formatExcatTime(record.totalMonthlyOvertime || 0)}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-bold text-gray-600 text-xs sm:text-sm hidden md:table-cell">{formatExcatTime(record.totalMonthlyOvertime || 0)}</td>
                                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                                <button onClick={() => setSelectedEmployeeRecord(record)} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs sm:text-sm whitespace-nowrap">View Log</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="5" className="p-4 sm:p-6 text-center text-gray-500 text-sm">No data available for this month.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredAttendanceData.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-3 bg-white border border-gray-200 rounded-xl">
                        <span className="text-sm text-gray-700">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAttendanceData.length)} of {filteredAttendanceData.length} entries
                        </span>
                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminAttendanceManager;