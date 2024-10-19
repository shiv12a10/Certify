import axios from "axios";

// Create an Axios instance with predefined settings
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Fetch Url
export const fetchUrl = (vrCode) => api.get(`/user/verify-url/${vrCode}`);

// Auth APIs
export const loginApi = (data) => api.post("/admin/signin", data);
export const registerApi = (data) => api.post("/admin/signup", data);
export const logoutApi = () => api.post("/admin/logout");

// Certificate APIs
export const createCertificate = (data) => api.post("/admin/certificate", data);

export const updateCertificate = (id, data) =>
  api.put(`/admin/certificate/${id}`, data);

export const deleteCertificate = (id) => api.delete(`/admin/certificate/${id}`);

// Fetch all certificates with pagination and optional search key
export const getAllCertificates = (page = 1, searchKey = "") => {
  const query = `/admin/certificates?page=${encodeURIComponent(page)}&limit=5${
    searchKey ? `&key=${encodeURIComponent(searchKey)}` : ""
  }`;
  return api.get(query);
};

// Toggle certificate validation status
export const toggleCertificateValidation = (id) =>
  api.put(`/admin/certificate-validation/${id}`);

// Axios Interceptor for handling authentication and token refreshing
api.interceptors.response.use(
  (response) => {
    return response; // Pass the response if it's successful
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is a 401 (Unauthorized) and retry the request with token refresh logic
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._isRetry
    ) {
      originalRequest._isRetry = true;

      try {
        // Attempt to refresh the token
        await axios.get(`${process.env.REACT_APP_API_URL}/admin/refresh`, {
          withCredentials: true,
        });

        // Retry the original request with the new token
        return api.request(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError.message);
        throw refreshError; // Re-throw the error if token refresh fails
      }
    }

    // Log error details for debugging
    console.error("API Error:", error.response?.data || error.message);
    throw error; // Always re-throw the error to let the calling function handle it
  }
);

export default api;
