import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;
export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    register: async (username, email, password, phoneNumber) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/auth/register`, {
                name:username,
                email,
                password,
                phoneNumbers:[phoneNumber],
                confirmPassword: password
            });
            set({ isLoading: false, isCheckingAuth: false });
            return res.data.message; 
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error in register page",
                isLoading: false,
                isCheckingAuth: false,
            });
            throw error;
        }
    },
}));
