import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useAuthStore = create((set) => ({
	authUser: null, // Initial state, null until logged in
	loading: false,
	userDetails: null,

	// Register a new gym
	register: async (gymData) => {
		try {
			set({ loading: true });
			const res = await axiosInstance.post("/gym", gymData);
			set({ authUser: res.data.user });
			toast.success("Account created successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Something went wrong");
		} finally {
			set({ loading: false });
		}
	},

	// Login
	login: async (loginData) => {
		try {
			set({ loading: true });
			const res = await axiosInstance.post("/gym/login", loginData);
			const gymData = res.data;
			set({ authUser: gymData });
			localStorage.setItem("gymId", gymData.id);
			toast.success("Logged in successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || error.message || "Something went wrong");
		} finally {
			set({ loading: false });
		}
	},

	// Logout
	logout: async () => {
		try {
			await axiosInstance.post("/auth/logout");
			set({ authUser: null });
			localStorage.removeItem("gymId");
			toast.success("Logged out successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Something went wrong");
		}
	},
	updateUserProfile: async (formData) => {
		set({ loading: true, error: null });
		try {
			const response = await axiosInstance.put('/auth/profile', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			set({ userProfile: response.data, loading: false });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			throw error;
		}
	},

	// Upload image
	uploadImage: async (image) => {
		try {
			set({ loading: true });
			const formData = new FormData();
			formData.append("profilePicture", image);
			const res = await axiosInstance.post("/auth/uploadImage", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			return res.data;
		} catch (error) {
			toast.error(error.response?.data?.message || "Something went wrong");
		} finally {
			set({ loading: false });
		}
	},

	// Set auth user manually (e.g., after token refresh)
	setAuthUser: (user) => set({ authUser: user }),

	// Update profile
	updateProfile: async (updateData) => {
		try {
			const authUser = useAuthStore.getState().authUser;
			if (!authUser || !authUser._id) {
				throw new Error("User is not authenticated or _id is missing");
			}
			set({ loading: true });
			const res = await axiosInstance.put(`/gym/update/${authUser._id}`, updateData);
			set({ authUser: res.data.user });
			toast.success("Profile updated successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || error.message || "Something went wrong");
		} finally {
			set({ loading: false });
		}
	},
	getUserProfile: async () => {
		set({ loading: true, error: null });
		try {
			const response = await axiosInstance.get('/gym/profile', {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // Adjust token storage as needed
			});
			set({ userProfile: response.data, loading: false });
		} catch (error) {
			set({ error: error.message, loading: false });
		}
	},

	// Get user details
	getUserDetails: async () => {
		try {
			const authUser = useAuthStore.getState().authUser;
			if (!authUser || !authUser._id) {
				throw new Error("User is not authenticated or _id is missing");
			}
			set({ loading: true });
			const res = await axiosInstance.get(`/userDetails/user/${authUser._id}`);
			set({ userDetails: res.data });
		} catch (error) {
			toast.error(error.response?.data?.message || "Something went wrong");
		} finally {
			set({ loading: false });
		}
	},

	// Update user details
	updateDetail: async (updateData) => {
		try {
			const authUser = useAuthStore.getState().authUser;
			if (!authUser || !authUser._id) {
				throw new Error("User is not authenticated or _id is missing");
			}
			set({ loading: true });
			const res = await axiosInstance.put(`/userDetails/${authUser._id}`, updateData);
			set({ authUser: res.data.data });
			toast.success("Details updated successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || error.message || "Something went wrong");
		} finally {
			set({ loading: false });
		}
	},

	// Check password
	checkPassword: async (userId, password) => {
		try {
			const response = await axiosInstance.post("/auth/checkPassword", { userId, password });
			return response.data;
		} catch (error) {
			toast.error(error.response?.data?.message || "Something went wrong");
			return { success: false, message: error.response?.data?.message || "Something went wrong" };
		}
	},
}));