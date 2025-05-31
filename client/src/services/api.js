import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
};

// Posts API
export const postsAPI = {
  getAllPosts: (page = 1, limit = 10) =>
    api.get(`/posts?page=${page}&limit=${limit}`),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (postData) => api.post("/posts", postData),
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/posts/${id}`),
  getUserPosts: (page = 1, limit = 10) =>
    api.get(`/posts/my-posts?page=${page}&limit=${limit}`),
};

// Comments API
export const commentsAPI = {
  getPostComments: (postId, page = 1, limit = 20) =>
    api.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`),
  createComment: (postId, content) =>
    api.post(`/posts/${postId}/comments`, { content }),
  updateComment: (commentId, content) =>
    api.put(`/comments/${commentId}`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
  getComment: (commentId) => api.get(`/comments/${commentId}`),
};

export default api;
