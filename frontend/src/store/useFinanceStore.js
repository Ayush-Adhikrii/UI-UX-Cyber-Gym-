import { create } from "zustand";

const useFinanceStore = create((set) => ({
    profitData: [],
    loading: false,
    error: null,

    getYearlyProfit: async (year) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`/api/finance/profit?year=${year}`);
            if (!res.ok) throw new Error("Fetch failed");
            const rawData = await res.json();

            // Convert object to array format for charts
            const formattedData = Object.entries(rawData).map(([month, profit]) => ({
                month,
                profit,
            }));

            set({ profitData: formattedData, loading: false });
        } catch (e) {
            set({ error: e.message, loading: false });
        }
    },
}));

export default useFinanceStore;
