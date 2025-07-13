import { addDays, format } from "date-fns";
import { useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { useClientStore } from "../stores/useClientStore";

const DailyAttendancePage = () => {
    const { attendanceData, getDailyAttendance, loading, error } = useClientStore();
    const [startDate, setStartDate] = useState(format(new Date(), "MM/dd"));

    useEffect(() => {
        getDailyAttendance(startDate);
    }, [startDate, getDailyAttendance]);

    const handlePrev = () => {
        const current = new Date(`2025-${startDate}`);
        const newDate = addDays(current, -7);
        setStartDate(format(newDate, "MM/dd"));
    };

    const handleNext = () => {
        const current = new Date(`2025-${startDate}`);
        const newDate = addDays(current, 7);
        setStartDate(format(newDate, "MM/dd"));
    };

    const getDateRange = () => {
        const start = new Date(`2025-${startDate}`);
        const end = addDays(start, 6);
        return `< ${format(start, "yyyy/MM/dd")} - ${format(end, "yyyy/MM/dd")} >`;
    };

    if (loading) return <div className="p-6 text-center" style={{ color: '#C62828' }}>Loading attendance data...</div>;
    if (error) return <div className="p-6 text-center" style={{ color: '#C62828' }}>Error: {error}</div>;

    return (
        <div className="p-6 w-full h-full">

            <div className="flex justify-between items-center mb-8">
                <button
                    onClick={handlePrev}
                    className="w-10 h-10 bg-[#C62828] text-white font-bold rounded-full hover:bg-[#a82121] transition"
                >
                    {'<'}
                </button>
                <span className="text-4xl font-bold" style={{ color: '#C62828' }}>{getDateRange()}</span>
                <button
                    onClick={handleNext}
                    className="w-10 h-10 bg-[#C62828] text-white font-bold rounded-full hover:bg-[#a82121] transition"
                >
                    {'>'}
                </button>
            </div>

            <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#C62828" />
                        <XAxis
                            dataKey="date"
                            label={{ value: "Date", position: "insideBottom", offset: -5, fill: '#C62828' }}
                            tick={{ fill: '#C62828' }}
                        />
                        <YAxis
                            label={{ value: "No. of Clients", angle: -90, position: "insideLeft", fill: '#C62828' }}
                            tick={{ fill: '#C62828' }}
                        />
                        <Tooltip contentStyle={{ color: '#C62828' }} />
                        <Bar dataKey="count" fill="#C62828">
                            <LabelList dataKey="count" position="top" fill="#C62828" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DailyAttendancePage;