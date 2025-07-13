import { useEffect, useMemo, useState } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from "recharts";
import useFinanceStore from "../store/useFinanceStore";

const ProfitChart = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const { profitData, getYearlyProfit, loading, error } = useFinanceStore();

    useEffect(() => {
        getYearlyProfit(year);
    }, [year, getYearlyProfit]);

    // Trim data when profit hits 0
    const trimmedData = useMemo(() => {
        const result = [];
        for (const item of profitData) {
            if (item.profit === 0) break;
            result.push(item);
        }
        return result;
    }, [profitData]);

    return (
        <div className="h-full w-full p-6 flex flex-col gap-4">
            {/* Header with year selector */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setYear((y) => y - 1)}
                    className="w-10 h-10 rounded-full bg-[#C62828] text-white text-xl"
                >&lt;</button>

                <h2 className="text-3xl font-bold text-[#C62828]">
                    Profit Trend – {year}
                </h2>

                <button
                    onClick={() => setYear((y) => y + 1)}
                    className="w-10 h-10 rounded-full bg-[#C62828] text-white text-xl"
                >&gt;</button>
            </div>

            {/* Chart */}
            <div className="h-[500px] w-full">
                {loading && <p className="text-center text-[#C62828]">Loading…</p>}
                {error && <p className="text-center text-[#C62828]">Error: {error}</p>}

                {!loading && !error && trimmedData.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trimmedData} margin={{ top: 20, right: 40, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" tick={{ fill: "#C62828" }} />
                            <YAxis tick={{ fill: "#C62828" }} />
                            <Tooltip formatter={(v) => `Rs.${v}`} />
                            <Line
                                type="monotone"
                                dataKey="profit"
                                stroke="#C62828"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}

                {!loading && !error && trimmedData.length === 0 && (
                    <p className="text-center text-[#C62828]">No profit data to show.</p>
                )}
            </div>
        </div>
    );
};

export default ProfitChart;
