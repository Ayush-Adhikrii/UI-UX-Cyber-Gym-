import { useEffect, useState } from "react";
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip
} from "recharts";
import useClientStore from "../store/useClientStore";

// Gradient from dark to light red
const generateGradientColors = (steps) => {
    const startColor = [198, 40, 40];
    const endColor = [255, 205, 205];
    const colors = [];
    for (let i = 0; i < steps; i++) {
        const r = Math.round(startColor[0] + ((endColor[0] - startColor[0]) * i) / (steps - 1));
        const g = Math.round(startColor[1] + ((endColor[1] - startColor[1]) * i) / (steps - 1));
        const b = Math.round(startColor[2] + ((endColor[2] - startColor[2]) * i) / (steps - 1));
        colors.push(`rgb(${r},${g},${b})`);
    }
    return colors;
};

const COLORS = generateGradientColors(7);
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const VisitsChart = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const { clientVisitData, getClientVisitFrequency, loading, error } = useClientStore();

    useEffect(() => {
        const month = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
        getClientVisitFrequency(month);
    }, [selectedYear, selectedMonth, getClientVisitFrequency]);

    const pieData = (clientVisitData || [])
        .map(({ day, average }) => {
            const date = new Date(selectedYear, selectedMonth - 1, day);
            const weekday = date.getDay();
            return {
                name: WEEKDAY_NAMES[weekday],
                value: average,
                weekday,
            };
        })
        .reduce((acc, cur) => {
            const found = acc.find((d) => d.weekday === cur.weekday);
            if (found) {
                found.value += cur.value;
            } else {
                acc.push(cur);
            }
            return acc;
        }, [])
        .sort((a, b) => a.weekday - b.weekday);

    const renderCustomLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        value,
        index
    }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) / 2;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (value < 0.1) return null;

        return (
            <text
                x={x}
                y={y}
                fill="#000"
                textAnchor="middle"
                dominantBaseline="central"
                fontWeight="bold"
                fontSize={14}
                stroke="#fff"
                strokeWidth={0.5}
                paintOrder="stroke"
            >
                {`${WEEKDAY_NAMES[index]}: ${Math.round(value)}`}
            </text>
        );
    };


    const CustomLegend = ({ data, colors }) => {
        return (
            <div className="flex flex-col justify-start pl-6 pt-6 text-sm font-medium text-[#C62828]">
                {WEEKDAY_NAMES.map((day, index) => {
                    const item = data.find((d) => d.name === day);
                    return (
                        <div key={day} className="flex items-center mb-2">
                            <div
                                className="w-4 h-4 mr-2 rounded-sm"
                                style={{ backgroundColor: colors[index] }}
                            ></div>
                            <span className="w-10">{day}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="h-full w-full p-6 flex flex-col md:flex-row gap-6">
            {/* Year + Month selection panel */}
            <div className="w-full md:w-1/3">
                <div className="bg-[#FCD9D9] rounded-xl p-4 flex flex-col items-center h-full">
                    <div className="flex justify-between items-center w-full mb-6">
                        <button
                            onClick={() => setSelectedYear((prev) => prev - 1)}
                            className="bg-[#C62828] text-white text-2xl font-bold w-10 h-10 rounded-full"
                        >
                            {"<"}
                        </button>
                        <span className="text-2xl font-bold text-white bg-[#C62828] px-6 py-2 rounded-full">
                            {selectedYear}
                        </span>
                        <button
                            onClick={() => setSelectedYear((prev) => prev + 1)}
                            className="bg-[#C62828] text-white text-2xl font-bold w-10 h-10 rounded-full"
                        >
                            {">"}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full">
                        {Array.from({ length: 12 }, (_, i) => {
                            const monthNum = i + 1;
                            const monthName = new Date(0, i).toLocaleString("default", { month: "short" });
                            const isSelected = selectedMonth === monthNum;
                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedMonth(monthNum)}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isSelected
                                        ? "bg-[#C62828] text-white"
                                        : "bg-[#E19A9A] text-white opacity-50"
                                        }`}
                                >
                                    {monthName}
                                </button>
                            );
                        })}
                    </div>
                    {loading && <div className="mt-4 text-[#C62828]">Loading...</div>}
                    {error && <div className="mt-4 text-[#C62828]">Error: {error}</div>}
                </div>
            </div>

            {/* Chart and legend layout */}
            <div className="w-full md:w-2/3 flex h-[600px]">
                {/* Pie chart section */}
                <div className="w-2/3 h-full -mt-20">

                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={220}
                                labelLine={false}
                                label={renderCustomLabel}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => value.toFixed(1)}
                                contentStyle={{ color: "#C62828" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Custom legend section */}
                <div className="w-1/3 h-full">
                    <CustomLegend data={pieData} colors={COLORS} />
                </div>
            </div>
        </div>
    );
};

export default VisitsChart;
