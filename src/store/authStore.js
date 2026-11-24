import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

export const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const getAuthHeaders = () => {
    const accessToken = Cookies.get("accessToken");
    if (!accessToken || accessToken === "undefined" || accessToken === "null") {
        return {};
    }
    return {
        accessToken: `accessToken_${accessToken}`,
        Authorization: `Bearer ${accessToken}`,
    };
};

export const useAuthStore = create((set, get) => ({
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
            const errorMsg = error.response?.data?.message || "Registration failed";
            set({
                error: errorMsg,
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
            const errorMsg = error.response?.data?.message || "Error verifying email";
            set({
                error: errorMsg,
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
            toast.success(res.data.message || "Verification code sent to your email");
            set({ isLoading: false });
            if (navigate) navigate("/auth/2fa");
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Login failed";
            set({ isLoading: false, error: errorMsg });
            toast.error(errorMsg);
        }
    },

    verifyLogin: async (code, navigate) => {
        set({ isLoading: true, error: null });
        try {
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

            if (!accessToken || !refreshToken) throw new Error("Tokens missing from response");

            Cookies.set("accessToken", accessToken, { expires: 7 });
            Cookies.set("refreshToken", refreshToken, { expires: 14 });

            set({
                user: {
                    _id,
                    username,
                    email,
                    role,
                    profileImage: profileImage?.secure_url || profileImage,
                    phoneNumbers: res.data.phoneNumbers || [],
                    age: res.data.age || null,
                    addresses: res.data.addresses || [],
                    createdAt: res.data.createdAt,
                    updatedAt: res.data.updatedAt,
                },
                isAuthenticated: true,
                isLoading: false,
                isCheckingAuth: false,
                error: null,
            });

            toast.success("Login successful");
            if (navigate) navigate("/");
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Verification code is invalid or expired";
            set({ isLoading: false, error: errorMsg });
            toast.error(errorMsg);
        }
    },

    refreshAccessToken: async () => {
        try {
            const refreshToken = Cookies.get("refreshToken");
            if (!refreshToken || refreshToken === "undefined") {
                throw new Error("No refresh token");
            }

            const res = await axios.get(`${API_URL}/auth/refresh-token`, {
                headers: {
                    refreshtoken: refreshToken,
                },
            });

            const { accessToken } = res.data;
            if (accessToken) {
                Cookies.set("accessToken", accessToken, { expires: 7 });
                return accessToken;
            }
            throw new Error("Failed to receive new accessToken");
        } catch (err) {
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");
            set({ isAuthenticated: false, user: null, isCheckingAuth: false });
            throw err;
        }
    },

    restoreSession: async () => {
        const accessToken = Cookies.get("accessToken");

        if (!accessToken || accessToken === "undefined" || accessToken === "null") {
            set({ isAuthenticated: false, isCheckingAuth: false, user: null });
            return;
        }

        try {
            const res = await axios.get(`${API_URL}/auth/get-profile`, {
                headers: getAuthHeaders(),
                timeout: 5000,
            });

            const userData = res.data;
            set({
                user: {
                    _id: userData._id,
                    username: userData.username,
                    email: userData.email,
                    role: userData.role,
                    profileImage: userData.profileImage?.secure_url || userData.profileImage,
                    phoneNumbers: userData.phoneNumbers || [],
                    age: userData.age || null,
                    addresses: userData.addresses || [],
                    createdAt: userData.createdAt,
                    updatedAt: userData.updatedAt,
                },
                isAuthenticated: true,
                isCheckingAuth: false,
                error: null,
            });
        } catch (err) {
            // Attempt token refresh on 401
            if (err.response?.status === 401) {
                try {
                    const newAccessToken = await get().refreshAccessToken();
                    const res = await axios.get(`${API_URL}/auth/get-profile`, {
                        headers: {
                            accessToken: `accessToken_${newAccessToken}`,
                            Authorization: `Bearer ${newAccessToken}`,
                        },
                        timeout: 5000,
                    });

                    const userData = res.data;
                    set({
                        user: {
                            _id: userData._id,
                            username: userData.username,
                            email: userData.email,
                            role: userData.role,
                            profileImage: userData.profileImage?.secure_url || userData.profileImage,
                            phoneNumbers: userData.phoneNumbers || [],
                            age: userData.age || null,
                            addresses: userData.addresses || [],
                            createdAt: userData.createdAt,
                            updatedAt: userData.updatedAt,
                        },
                        isAuthenticated: true,
                        isCheckingAuth: false,
                    });
                    return;
                } catch {
                    Cookies.remove("accessToken");
                    Cookies.remove("refreshToken");
                }
            }
            set({ isAuthenticated: false, user: null, isCheckingAuth: false });
        }
    },

    logout: () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        set({ user: null, isAuthenticated: false, isCheckingAuth: false });
        toast.info("Logged out successfully");
    },

    deleteUser: async () => {
        set({ isLoading: true, error: null });
        try {
            await axios.delete(`${API_URL}/auth/delete-user`, {
                headers: getAuthHeaders(),
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
            const { name, age, phoneNumbers } = updatedData;
            const res = await axios.put(`${API_URL}/auth/update-user`, {
                name,
                age,
                phoneNumbers,
            }, {
                headers: getAuthHeaders(),
            });

            const updatedUser = res.data.user || res.data;
            set((state) => ({
                user: {
                    ...state.user,
                    ...updatedUser,
                    profileImage: updatedUser.profileImage?.secure_url || updatedUser.profileImage,
                    addresses: updatedUser.addresses || state.user?.addresses || [],
                },
                isLoading: false,
            }));
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
            const formData = new FormData();
            formData.append("profileImg", imageFile);

            const res = await axios.post(`${API_URL}/auth/upload-profileImg`, formData, {
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "multipart/form-data",
                },
            });

            const updatedUser = res.data.user || res.data;
            set((state) => ({
                user: {
                    ...state.user,
                    ...updatedUser,
                    profileImage: updatedUser.profileImage?.secure_url || updatedUser.profileImage,
                },
                isLoading: false,
            }));
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
            await axios.delete(`${API_URL}/auth/delete-profileImg`, {
                headers: getAuthHeaders(),
            });

            set((state) => ({
                user: {
                    ...state.user,
                    profileImage: null,
                },
                isLoading: false,
            }));
            toast.success("Profile image deleted successfully");
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to delete profile image";
            set({ isLoading: false, error: errorMsg });
            toast.error(errorMsg);
            throw error;
        }
    },

    forgetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/auth/forget-password`, { email });
            set({ isLoading: false });
            toast.success(res.data.message || "Reset password link sent successfully");
            return res.data.message;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to send reset email";
            set({ isLoading: false, error: errorMsg });
            toast.error(errorMsg);
            throw error;
        }
    },

    resetPassword: async (token, password, navigate) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/auth/reset-password/${token}`, {
                password,
            });
            set({ isLoading: false });
            toast.success(res.data.message || "Password reset successful");
            if (navigate) navigate("/auth/login");
            return res.data.message;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to reset password";
            set({ isLoading: false, error: errorMsg });
            toast.error(errorMsg);
            throw error;
        }
    },
}));
