import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../auth/auth";
import { clear } from "@testing-library/user-event/dist/clear";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
})

api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newAccess) {
    refreshSubscribers.forEach((cb) => cb(newAccess));
    refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
    refreshSubscribers.push(cb);
}

api.interceptors.response.use(
    (response) => response,
    async(error) => {
        const originalRequest = error.config;

        if(!error.response) return Promise.reject(error);

        if(error.response.status == 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refresh = getRefreshToken();
            if(!refresh) {
                clearTokens();
                window.location.href = "/login";
                return Promise.reject(error);
            }

            if(isRefreshing) {
                return new Promise((resolve) => {
                    addRefreshSubscriber((newAccess) => {
                        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                        resolve(api(originalRequest));
                    });

                });
            }

            isRefreshing = true;

            try {
                const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {refresh});

                const newAccess = res.data.access;
                setTokens({access: newAccess});

                isRefreshing = false;
                onRefreshed(newAccess);

                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return api(originalRequest);

            } catch(refreshErr) {
                isRefreshing = false;
                clearTokens();
                window.location.href = "/login";
                return Promise.reject(refreshErr);
            }

        }
        return Promise.reject(error);
    }
);

export default api;