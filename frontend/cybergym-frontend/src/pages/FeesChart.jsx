import { useEffect, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import useClientStore from "../store/useClientStore";

const FeesChart = ({ onClose, setToastMessage }) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const { feesAndSalaryData, getFeesAndSalary, loading, error } = useClientStore();

    useEffect(() => {
        const month = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
        getFeesAndSalary(month);
    }, [selectedYear, selectedMonth, getFeesAndSalary]);

    const pieData = feesAndSalaryData
        ? [
              {
                  name: "Membership Fees",
                  value: feesAndSalaryData.totalRevenue,
                  color: feesAndSalaryData.totalSalary > feesAndSalaryData.totalRevenue ? "#808080" : "#C62828",
              },
              {
                  name: "Salary",
                  value: feesAndSalaryData.totalSalary,
                  color: feesAndSalaryData.totalSalary > feesAndSalaryData.totalRevenue ? "#C62828" : "#808080",
              },
          ]
        : [];

    const netIncome = feesAndSalaryData ? feesAndSalaryData.totalRevenue - feesAndSalaryData.totalSalary : 0;

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value, color }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill={color}
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                style={{ fontSize: "12px", fontWeight: "bold" }}
            >
                {`${name}: Rs.${value.toLocaleString()} (${(percent * 100).toFixed(2)}%)`}
            </text>
        );
    };

    return (
        <div className="h-full w-full p-6 flex flex-col md:flex-row gap-6">
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
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                        isSelected ? "bg-[#C62828] text-white" : "bg-[#E19A9A] text-white opacity-50"
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
            <div className="w-full md:w-2/3 relative">
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={150}
                                labelLine={false}
                                label={renderCustomLabel}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ color: "#C62828" }} />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                wrapperStyle={{ paddingLeft: "20px" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="absolute bottom-0 right-0 w-[240px] bg-white rounded-tl-lg shadow-lg border text-sm">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border p-1 text-left text-[#C62828]">Category</th>
                                <th className="border p-1 text-left text-[#C62828]">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feesAndSalaryData && (
                                <>
                                    <tr>
                                        <td className="border p-1 text-[#C62828]">Membership Fees</td>
                                        <td className="border p-1 text-[#C62828]">
                                            Rs.{feesAndSalaryData.totalRevenue.toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border p-1 text-[#C62828]">Salary</td>
                                        <td className="border p-1 text-[#C62828]">
                                            Rs.{feesAndSalaryData.totalSalary.toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border p-1 font-bold text-[#C62828]">Net Income</td>
                                        <td className="border p-1 font-bold text-[#C62828]">
                                            Rs.{netIncome.toLocaleString()}
                                        </td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <button
                onClick={onClose}
                className="w-10 h-10 bg-[#C62828] text-white font-bold rounded-full hover:bg-[#a82121] transition mt-4 self-end"
            >
                X
            </button>
        </div>
    );
};

export default FeesChart;