import { create } from 'zustand';

const useStaffStore = create((set, get) => ({
    Staffs: [],
    loading: true,
    absent: [],
    error: null,

    fetchStaffs: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch('http://localhost:5000/api/staff');
            if (!response.ok) throw new Error('Failed to fetch Staffs');
            const data = await response.json();
            set({ Staffs: data, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    fetchAbsent: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch('http://localhost:5000/api/staff/absent');
            if (!response.ok) throw new Error('Failed to fetch absent staffs');
            const data = await response.json();
            set({ absent: data, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    attendance: async ({ staffId }) => {
        try {
            const response = await fetch('http://localhost:5000/api/staff/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staffId }),
            });
            if (!response.ok) throw new Error('Failed to mark present');
            await get().fetchAbsent(); // Refresh absent list
            return null;
        } catch (err) {
            return err.message;
        }
    },

    updateStaff: async (id, staffData) => {
        try {
            const response = await fetch(`http://localhost:5000/api/staff/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staffData),
            });
            if (!response.ok) throw new Error('Failed to update Staff');
            await get().fetchStaffs(); // Refetch after update
            return null;
        } catch (err) {
            return err.message;
        }
    },

    deleteStaff: async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/staff/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error('Failed to delete Staff');
            await get().fetchStaffs(); // Refetch after deletion
            return null;
        } catch (err) {
            return err.message;
        }
    },

    addStaff: async (staffData) => {
        console.log('Received staffData in addStaff:', staffData);
        try {
            const response = await fetch('http://localhost:5000/api/staff/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staffData),
            });
            if (!response.ok) throw new Error('Failed to add Staff');
            await get().fetchStaffs();
            return null;
        } catch (err) {
            return err.message;
        }
    },

    fetchSalary: async (staffId, year, month) => {
        try {
            console.log(`Fetching salary for staffId: ${staffId}, year: ${year}, month: ${month}`);
            const response = await fetch(`http://localhost:5000/api/salary/${staffId}/${year}/${month}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log('Fetched salary data:', data);
            return data.paidAmount || 0; // Return paidAmount or 0 if undefined
        } catch (err) {
            console.error('Salary fetch error:', err);
            return 0;
        }
    },
    updateSalary: async (staffId, date, paidAmount) => {
        try {
            const response = await fetch('http://localhost:5000/api/salary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staffId, date, paidAmount }),
            });
            if (!response.ok) throw new Error('Failed to update salary');
            return null;
        } catch (err) {
            return err.message;
        }
    },

    refetch: () => {
        set({ loading: true, error: null });
        get().fetchStaffs();
    },
}));

export default useStaffStore;