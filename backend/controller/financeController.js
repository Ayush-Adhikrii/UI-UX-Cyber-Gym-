const db = require('../firebase');
const MONTH_LABELS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const getFeesAndSalary = async (req, res) => {
    const { month } = req.query; // e.g., "2025-07"

    try {
        // Validate month format (yyyy-MM)
        const dateRegex = /^\d{4}-\d{2}$/;
        if (!dateRegex.test(month)) {
            return res.status(400).json({ error: 'Invalid month format. Use yyyy-mm' });
        }

        // Fetch all memberships
        const membershipsSnapshot = await db.ref('memberships').once('value');
        const membershipsData = membershipsSnapshot.val() || {};

        // Aggregate total revenue from membership payments in the given month
        let totalRevenue = 0;
        for (const clientId in membershipsData) {
            const clientMemberships = membershipsData[clientId];
            for (const version in clientMemberships) {
                const membership = clientMemberships[version];
                const startDate = new Date(membership.startDate);
                if (
                    startDate.toISOString().startsWith(`${month}-`) &&
                    membership.status === 'active' &&
                    !isNaN(parseFloat(membership.paymentAmount))
                ) {
                    totalRevenue += parseFloat(membership.paymentAmount);
                }
            }
        }

        // Fetch all salary data
        const salariesSnapshot = await db.ref('salaries').once('value');
        const salariesData = salariesSnapshot.val() || {};

        // Aggregate total salary for the given month
        let totalSalary = 0;
        for (const staffId in salariesData) {
            const staffSalaries = salariesData[staffId];
            if (staffSalaries[month]) {
                const salary = staffSalaries[month];
                if (!isNaN(parseFloat(salary.paidAmount))) {
                    totalSalary += parseFloat(salary.paidAmount);
                }
            }
        }

        res.status(200).json({
            totalRevenue,
            totalSalary,
        });
    } catch (error) {
        console.error('Error in getFeesAndSalary:', error);
        res.status(500).json({ error: 'Failed to fetch fees and salary data', details: error.message });
    }
};


const getYearlyProfit = async (req, res) => {
    const { year } = req.query; // e.g., "2025"
    if (!/^\d{4}$/.test(year)) {
        return res.status(400).json({ error: "Invalid year format" });
    }

    try {
        const membershipsSnapshot = await db.ref("memberships").once("value");
        const membershipsData = membershipsSnapshot.val() || {};
        const salariesSnapshot = await db.ref("salaries").once("value");
        const salariesData = salariesSnapshot.val() || {};

        let monthlyProfits = {};

        for (let month = 1; month <= 12; month++) {
            const monthStr = `${year}-${String(month).padStart(2, "0")}`;

            // Calculate revenue for the month
            let totalRevenue = 0;
            for (const clientId in membershipsData) {
                const clientMemberships = membershipsData[clientId];
                for (const version in clientMemberships) {
                    const membership = clientMemberships[version];
                    const startDate = new Date(membership.startDate);
                    if (
                        startDate.toISOString().startsWith(`${monthStr}-`) &&
                        membership.status === "active" &&
                        !isNaN(parseFloat(membership.paymentAmount))
                    ) {
                        totalRevenue += parseFloat(membership.paymentAmount);
                    }
                }
            }

            // Calculate salary for the month
            let totalSalary = 0;
            for (const staffId in salariesData) {
                const staffSalaries = salariesData[staffId];
                if (staffSalaries[monthStr]) {
                    const salary = staffSalaries[monthStr];
                    if (!isNaN(parseFloat(salary.paidAmount))) {
                        totalSalary += parseFloat(salary.paidAmount);
                    }
                }
            }

            monthlyProfits[monthStr] = totalRevenue - totalSalary;
        }

        res.status(200).json(monthlyProfits);
    } catch (error) {
        console.error("Error in getYearlyProfit:", error);
        res
            .status(500)
            .json({ error: "Failed to fetch yearly profit data", details: error.message });
    }
};




module.exports = { getFeesAndSalary, getYearlyProfit };