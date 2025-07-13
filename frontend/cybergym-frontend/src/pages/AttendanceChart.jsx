import { addDays, format, subDays } from "date-fns";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import useClientStore from "../store/useClientStore";

const AttendanceChart = ({ onClose, setToastMessage }) => {
    const [startDate, setStartDate] = useState(subDays(new Date(), 6));
    const [endDate, setEndDate] = useState(new Date());
    const { attendanceData, getDailyAttendance, loading, error } = useClientStore();

    useEffect(() => {
        const start = format(startDate, "yyyy-MM-dd");
        getDailyAttendance(start);
    }, [startDate, getDailyAttendance]);

    const handlePrevWeek = () => {
        setStartDate((prev) => subDays(prev, 7));
        setEndDate((prev) => subDays(prev, 7));
    };

    const handleNextWeek = () => {
        setStartDate((prev) => addDays(prev, 7));
        setEndDate((prev) => addDays(prev, 7));
    };

    const getDateRange = () => `< ${format(startDate, "yyyy/MM/dd")} - ${format(endDate, "yyyy/MM/dd")} >`;

    return (
        <div className="h-full w-full p-6">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#C62828]">Daily Attendance</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrevWeek}
                        className="w-10 h-10 bg-[#C62828] text-white font-bold rounded-full hover:bg-[#a82121] transition"
                    >
                        {"<"}
                    </button>
                    <span className="text-xl font-semibold text-[#C62828]">{getDateRange()}</span>
                    <button
                        onClick={handleNextWeek}
                        className="w-10 h-10 bg-[#C62828] text-white font-bold rounded-full hover:bg-[#a82121] transition"
                    >
                        {">"}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-[#C62828] text-white font-bold rounded-full hover:bg-[#a82121] transition"
                    >
                        X
                    </button>
                </div>
            </div>
            {loading && <div className="text-center text-[#C62828]">Loading...</div>}
            {error && <div className="text-center text-[#C62828]">Error: {error}</div>}
            {!loading && !error && (
                <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#C62828" />
                            <XAxis dataKey="date" tick={{ fill: "#C62828" }} />
                            <YAxis tick={{ fill: "#C62828" }} />
                            <Tooltip contentStyle={{ color: "#C62828" }} />
                            <Bar dataKey="count" fill="#C62828" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default AttendanceChart;