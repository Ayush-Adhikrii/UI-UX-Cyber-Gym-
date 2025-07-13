import axios from 'axios';
import { create } from 'zustand';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api',
});

const useClientStore = create((set, get) => ({
    clients: [],
    absent: [],
    attendanceData: [],
    clientVisitData: [],
    feesAndSalaryData: null,
    loading: true,
    error: null,

    fetchClients: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch('http://localhost:5000/api/clients');
            if (!response.ok) throw new Error('Failed to fetch clients');
            const data = await response.json();
            set({ clients: data, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    fetchAbsent: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch('http://localhost:5000/api/clients/absent');
            if (!response.ok) throw new Error('Failed to fetch absent clients');
            const data = await response.json();
            set({ absent: data, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    updateClient: async (id, clientData) => {
        try {
            const response = await fetch(`http://localhost:5000/api/clients/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData),
            });
            if (!response.ok) throw new Error('Failed to update client');
            await get().fetchClients();
            return null;
        } catch (err) {
            return err.message;
        }
    },

    deleteClient: async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/clients/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error('Failed to delete client');
            await get().fetchClients();
            return null;
        } catch (err) {
            return err.message;
        }
    },

    addClient: async (clientData) => {
        try {
            const response = await fetch('http://localhost:5000/api/clients/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData),
            });
            if (!response.ok) throw new Error('Failed to add client');
            await get().fetchClients();
            return null;
        } catch (err) {
            return err.message;
        }
    },

    saveMembership: async (clientId, startDate, endDate, paymentAmount) => {
        set({ loading: true, error: null });
        try {
            const currentMembershipResponse = await axiosInstance.get(`/memberships/${clientId}/current`);
            const currentMembership = currentMembershipResponse.data;

            const membershipData = {
                clientId,
                startDate,
                endDate,
                paymentAmount: parseFloat(paymentAmount),
            };

            let response;
            if (!currentMembership || new Date(currentMembership.endDate) < new Date()) {
                response = await axiosInstance.post('/memberships/add', membershipData);
            } else {
                response = await axiosInstance.put('/memberships/update', membershipData);
            }

            const clientsResponse = await axiosInstance.get('/clients');
            set({ clients: clientsResponse.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    attendance: async ({ clientId }) => {
        try {
            const response = await fetch('http://localhost:5000/api/clients/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId }),
            });
            if (!response.ok) throw new Error('Failed to mark present');
            await get().fetchAbsent();
            return null;
        } catch (err) {
            return err.message;
        }
    },

    getDailyAttendance: async (startDate) => {
        console.log('Requested startDate:', startDate);
        set({ loading: true, error: null });
        try {
            let formattedDate;
            if (startDate.includes('/')) {
                const [month, day] = startDate.split('/');
                formattedDate = `2025-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            } else {
                formattedDate = startDate;
            }
            console.log('Formatted startDate:', formattedDate);

            const res = await axiosInstance.get("/clients/daily-attendance", {
                params: { startDate: formattedDate },
            });

            if (!Array.isArray(res.data)) {
                throw new Error('Invalid data format from server');
            }

            set({
                attendanceData: res.data.map(item => ({
                    date: item.date || '',
                    count: item.count || 0
                }))
            });
        } catch (error) {
            console.error("Failed to load attendance data", error);
            set({ error: error.message, loading: false });
        } finally {
            set({ loading: false });
        }
    },

    getFeesAndSalary: async (month) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get(`/finance/fees-and-salary`, {
                params: { month },
            });
            set({ feesAndSalaryData: response.data, loading: false });
        } catch (error) {
            console.error("Failed to load fees and salary data", error);
            set({ error: error.message, loading: false });
        }
    },


    getClientVisitFrequency: async (month) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/clients/visit-frequency", { params: { month } });
            console.log(response.data);
            set({ clientVisitData: response.data, loading: false });
        } catch (error) {
            console.error("Failed to load client visit frequency", error);
            set({ error: error.message, loading: false });
        }
    },
}));

export default useClientStore;