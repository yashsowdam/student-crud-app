import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../auth/auth";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000",
});

// Attach access token on every request
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, token = null) {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    pendingQueue = [];
}

// Refresh token on 401 and retry original request
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If no response (network error), just throw
        if (!error.response) throw error;

        // If not 401, throw
        if (error.response.status !== 401) throw error;

        // Prevent infinite loop if refresh endpoint itself fails
        if (originalRequest.url?.includes("/api/token/refresh/")) {
            clearTokens();
            throw error;
        }

        // If no refresh token, force login
        const refresh = getRefreshToken();
        if (!refresh) {
            clearTokens();
            throw error;
        }

        // Queue requests while refreshing
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            });
        }

        isRefreshing = true;

        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"}/api/token/refresh/`,
                { refresh }
            );

            const newAccess = res.data.access;
            setTokens({ access: newAccess, refresh });

            processQueue(null, newAccess);

            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return api(originalRequest);
        } catch (refreshErr) {
            processQueue(refreshErr, null);
            clearTokens();
            throw refreshErr;
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;