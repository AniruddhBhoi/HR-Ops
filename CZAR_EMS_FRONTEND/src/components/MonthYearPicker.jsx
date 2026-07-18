// src/components/MonthYearPicker.jsx
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Button from './Button';

const MONTHS = [
    { name: 'Jan', value: '01' }, { name: 'Feb', value: '02' }, { name: 'Mar', value: '03' },
    { name: 'Apr', value: '04' }, { name: 'May', value: '05' }, { name: 'Jun', value: '06' },
    { name: 'Jul', value: '07' }, { name: 'Aug', value: '08' }, { name: 'Sep', value: '09' },
    { name: 'Oct', value: '10' }, { name: 'Nov', value: '11' }, { name: 'Dec', value: '12' },
];

const MonthYearPicker = ({ currentMonthYear, onChange, onClose }) => {
    const [currentMonth, currentYear] = currentMonthYear.split('-');
    const [displayYear, setDisplayYear] = useState(parseInt(currentYear, 10));
    const yearInputRef = useRef(null);

    const years = useMemo(() => {
        const startYear = 2020;
        const endYear = 2030;
        const list = [];
        for (let y = startYear; y <= endYear; y++) list.push(y);
        return list;
    }, []);

    useEffect(() => {
        if (yearInputRef.current) {
            const currentYearIndex = years.findIndex(y => y === displayYear);
            if (currentYearIndex !== -1) {
                yearInputRef.current.scrollTop = currentYearIndex * 30 - (yearInputRef.current.clientHeight / 2) + 15;
            }
        }
    }, [years, displayYear]);

    const handleMonthClick = useCallback((monthValue) => {
        onChange(`${monthValue}-${displayYear}`);
        onClose();
    }, [displayYear, onChange, onClose]);

    return (
        <div className="absolute top-full mt-1 z-20 bg-white border border-gray-300 rounded-lg shadow-xl w-64 p-4 flex">
            <div className="flex-1 pr-3 border-r border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Month</h4>
                <div className="grid grid-cols-3 gap-2">
                    {MONTHS.map((month) => (
                        <Button
                            key={month.value}
                            variant={month.value === currentMonth ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleMonthClick(month.value)}
                            className={`text-[10px] ${month.value === currentMonth ? '' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 border-transparent'}`}
                        >
                            {month.name}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="flex-1 pl-3">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Year ({displayYear})</h4>
                <div ref={yearInputRef} className="h-48 overflow-y-auto border border-gray-200 rounded-lg p-1 text-sm custom-scrollbar">
                    {years.map((year) => (
                        <div key={year} onClick={() => setDisplayYear(year)} className={`p-1.5 cursor-pointer rounded-md transition ${year === displayYear ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>
                            {year}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MonthYearPicker;