import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

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
                name: username,
                email,
                password,
                phoneNumbers: [phoneNumber],
                confirmPassword: password,
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

    verifyEmail: async (token) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.get(`${API_URL}/auth/verify-email`, {
                params: { token },
            });
            set({ isLoading: false });
            return res.data.message;
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error verifying email",
                isLoading: false,
            });
            throw error;
        }
    },

    login: async (email, password, navigate) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });
            toast.success(res.data.message || "Verification code sent");
            set({ isLoading: false });
            navigate("/auth/2fa");
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Login failed";
            set({ isLoading: false, error: errorMsg });
            toast.error(errorMsg);
        }
    },

    verifyLogin: async (code, navigate) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Sending code:", code);
            const res = await axios.post(`${API_URL}/auth/verify-login`, { code });

            const {
                accessToken,
                refreshToken,
                _id,
                username,
                email,
                role,
                profileImage,
            } = res.data;

            console.log("Received tokens:", { accessToken, refreshToken }); // Debug
            if (!accessToken || !refreshToken) throw new Error("Tokens missing from response");

            Cookies.set("accessToken", accessToken, { expires: 7 });
            Cookies.set("refreshToken", refreshToken, { expires: 14 });

            set({
                user: {
                    _id,
                    username,
                    email,
                    role,
                    profileImage: profileImage?.secure_url,
                    phoneNumbers: res.data.phoneNumbers || [],
                    age: res.data.age || null,
                    addresses: res.data.addresses || [],
                    createdAt: res.data.createdAt,
                    updatedAt: res.data.updatedAt,
                },
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            toast.success("Login successful");
            navigate("/");
        } catch (error) {
            console.log("VerifyLogin error:", error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || "2FA verification failed";
            set({ isLoading: false, error: errorMsg });
            toast.error(errorMsg);
        }
    },

    refreshAccessToken: async () => {
        try {
            const refreshToken = Cookies.get("refreshToken");
            if (!refreshToken) throw new Error("No refresh token");

            console.log("Refreshing token with:", refreshToken); // Debug
            const res = await axios.get(`${API_URL}/auth/refresh-token`, {
                headers: {
                    refreshtoken: refreshToken,
                },
            });

            const { accessToken } = res.data;
            console.log("New access token:", accessToken); // Debug
            Cookies.set("accessToken", accessToken, { expires: 7 });

            return accessToken;
        } catch (err) {
            console.log("Refresh token error:", err.response?.data);
            set({ isAuthenticated: false, user: null });
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");
            throw err;
        }
    },

    restoreSession: async () => {
        set({ isCheckingAuth: true, error: null });

        let accessToken = Cookies.get("accessToken");
        console.log("Restoring session with accessToken:", accessToken ? `accessToken_${accessToken.slice(0, 10)}...` : "null"); // Debug partial token

        if (!accessToken) {
            console.log("No access token found, setting unauthenticated");
            set({ isAuthenticated: false, isCheckingAuth: false });
            return;
        }

        try {
            const res = await axios.get(`${API_URL}/auth/get-profile`, {
                headers: {
                    accessToken: `accessToken_${accessToken}`, // Prepend accessToken_
                },
            });
            console.log("Profile data received:", res.data); // Debug full response

            const userData = res.data;
            set({
                user: {
                    _id: userData._id,
                    username: userData.username,
                    email: userData.email,
                    role: userData.role,
                    profileImage: userData.profileImage?.secure_url,
                    phoneNumbers: userData.phoneNumbers || [],
                    age: userData.age || null,
                    addresses: userData.addresses || [],
                    createdAt: userData.createdAt,
                    updatedAt: userData.updatedAt,
                },
                isAuthenticated: true,
                isCheckingAuth: false,
            });
        } catch (err) {
            console.log("Restore session error - Status:", err.response?.status, "Data:", err.response?.data);
            try {
                const newAccessToken = await useAuthStore.getState().refreshAccessToken();
                console.log("Refreshed accessToken:", `accessToken_${newAccessToken.slice(0, 10)}...`); // Debug partial token

                const res = await axios.get(`${API_URL}/auth/get-profile`, {
                    headers: {
                        accessToken: `accessToken_${newAccessToken}`, // Prepend accessToken_
                    },
                });
                console.log("Profile data after refresh:", res.data); // Debug full response

                const userData = res.data;
                set({
                    user: {
                        _id: userData._id,
                        username: userData.username,
                        email: userData.email,
                        role: userData.role,
                        profileImage: userData.profileImage?.secure_url,
                        phoneNumbers: userData.phoneNumbers || [],
                        age: userData.age || null,
                        addresses: userData.addresses || [],
                        createdAt: userData.createdAt,
                        updatedAt: userData.updatedAt,
                    },
                    isAuthenticated: true,
                    isCheckingAuth: false,
                });
            } catch (refreshErr) {
                console.log("Refresh error - Status:", refreshErr.response?.status, "Data:", refreshErr.response?.data);
                set({ isAuthenticated: false, user: null, isCheckingAuth: false });
            }
        }
    },

    logout: () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        set({ user: null, isAuthenticated: false });
        toast.info("Logged out");
    },

    deleteUser: async () => {
        set({ isLoading: true, error: null });
        try {
            const accessToken = Cookies.get("accessToken");
            if (!accessToken) throw new Error("No access token");

            await axios.delete(`${API_URL}/auth/delete-user`, {
                headers: { accessToken: `accessToken_${accessToken}` }, // Prepend accessToken_
            });

            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");
            set({ user: null, isAuthenticated: false, isLoading: false });
            toast.success("Account deleted successfully");
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to delete account";
            set({ isLoading: false, error: errorMsg });
            toast.error(errorMsg);
            throw error;
        }
    },

    updateUser: async (updatedData) => {
        set({ isLoading: true, error: null });
        try {
            const accessToken = Cookies.get("accessToken");
            if (!accessToken) throw new Error("No access token");

            const { name, age, phoneNumbers } = updatedData;
            const res = await axios.put(`${API_URL}/auth/update-user`, {
                name,
                age,
                phoneNumbers,
            }, {
                headers: { accessToken: `accessToken_${accessToken}` }, // Prepend accessToken_
            });

            const updatedUser = res.data;
            set({
                user: {
                    ...updatedUser,
                    profileImage: updatedUser.profileImage?.secure_url,
                    addresses: updatedUser.addresses || [],
                },
                isLoading: false,
            });
            toast.success("Profile updated successfully");
            return updatedUser;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to update profile";
            set({ isLoading: false, error: errorMsg });
            toast.error(errorMsg);
            throw error;
        }
    },

    uploadProfileImage: async (imageFile) => {
        set({ isLoading: true, error: null });
        try {
            const accessToken = Cookies.get("accessToken");
            if (!accessToken) throw new Error("No access token");

            const formData = new FormData();
            formData.append("profileImg", imageFile);

            const res = await axios.post(`${API_URL}/auth/upload-profileImg`, formData, {
                headers: {
                    accessToken: `accessToken_${accessToken}`, // Prepend accessToken_
                    "Content-Type": "multipart/form-data",
                },
            });

            const updatedUser = res.data;
            set({
                user: {
                    ...updatedUser,
                    profileImage: updatedUser.profileImage?.secure_url,
                    addresses: updatedUser.addresses || [],
                },
                isLoading: false,
            });
            toast.success("Profile image uploaded successfully");
            return updatedUser;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to upload profile image";
            set({ isLoading: false, error: errorMsg });
            toast.error(errorMsg);
            throw error;
        }
    },

    deleteProfileImage: async () => {
        set({ isLoading: true, error: null });
        try {
            const accessToken = Cookies.get("accessToken");
            if (!accessToken) throw new Error("No access token");

            const res = await axios.delete(`${API_URL}/auth/delete-profileImg`, {
                headers: { accessToken: `accessToken_${accessToken}` }, // Prepend accessToken_
            });

            const updatedUser = res.data;
            set({
                user: {
                    ...updatedUser,
                    profileImage: null,
                    addresses: updatedUser.addresses || [],
                },
                isLoading: false,
            });
            toast.success("Profile image deleted successfully");
            return updatedUser;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to delete profile image";
            set({ isLoading: false, error: errorMsg });
            toast.error(errorMsg);
            throw error;
        }
    },
}));