import { useState } from "react";
import AttendanceChart from "./AttendanceChart";
import FeesChart from "./FeesChart";
import ProfitChart from "./ProfitChart";
import VisitsChart from "./VisitsChart";

const ChartsPage = ({ setNavbarText }) => {
    const [selectedChart, setSelectedChart] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    const handleChartSelect = (chart) => {
        setSelectedChart(chart);
        setToastMessage(null); // Clear any previous toast
    };

    return (
        <div className="h-full w-full p-6">
            {toastMessage && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#C62828] text-white px-4 py-2 rounded shadow-lg z-50">
                    {toastMessage}
                </div>
            )}
            {!selectedChart ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 place-items-center h-full">
                    <button
                        className="w-48 h-48 text-lg font-bold bg-[#C62828] text-white rounded-xl hover:bg-[#a82121] transition"
                        onClick={() => handleChartSelect("attendance")}
                    >
                        Daily Attendance
                    </button>
                    <button
                        className="w-48 h-48 text-lg font-bold bg-[#C62828] text-white rounded-xl hover:bg-[#a82121] transition"
                        onClick={() => handleChartSelect("feesAndSalary")}
                    >
                        Fees & Salary
                    </button>
                    <button
                        className="w-48 h-48 text-lg font-bold bg-[#C62828] text-white rounded-xl hover:bg-[#a82121] transition"
                        onClick={() => handleChartSelect("clientVisits")}
                    >
                        Client Visit Frequency
                    </button>
                    <button
                        className="w-48 h-48 text-lg font-bold bg-[#C62828] text-white rounded-xl hover:bg-[#a82121] transition"
                        onClick={() => handleChartSelect("profitTrend")}
                    >
                        Monthly Profit Trend
                    </button>
                </div>
            ) : selectedChart === "attendance" ? (
                <AttendanceChart onClose={() => setSelectedChart(null)} setToastMessage={setToastMessage} />
            ) : selectedChart === "feesAndSalary" ? (
                <FeesChart onClose={() => setSelectedChart(null)} setToastMessage={setToastMessage} />
            ) : selectedChart === "clientVisits" ? (
                <VisitsChart onClose={() => setSelectedChart(null)} setToastMessage={setToastMessage} />
            ) : selectedChart === "profitTrend" ? (
                <ProfitChart onClose={() => setSelectedChart(null)} setToastMessage={setToastMessage} />
            ) : null}
        </div>
    );
};

export default ChartsPage;