import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth
export const register = (username, password, displayName) =>
  api.post('/auth/register', { username, password, displayName });

export const login = (username, password) =>
  api.post('/auth/login', { username, password });

export const getCurrentUser = () => api.get('/auth/me');

// Users
export const getUser = (userId) => api.get(`/users/${userId}`);

export const getUserProjects = (userId) => api.get(`/users/${userId}/projects`);

export const updateProfile = (userId, data) => api.put(`/users/${userId}`, data);

// Projects
export const getProjects = () => api.get('/projects');

export const getProject = (projectId) => api.get(`/projects/${projectId}`);

export const createProject = (data) => api.post('/projects', data);

export const updateProject = (projectId, data) => api.put(`/projects/${projectId}`, data);

export const deleteProject = (projectId) => api.delete(`/projects/${projectId}`);

export const searchProjects = (query) => api.get(`/projects/search?q=${query}`);

// Reels
export const getReels = () => api.get('/reels');

// Comments
export const getComments = (projectId) => api.get(`/comments/project/${projectId}`);

export const addComment = (projectId, text) =>
  api.post('/comments', { projectId, text });

export const deleteComment = (commentId) => api.delete(`/comments/${commentId}`);

// Social
export const likeProject = (projectId) => api.post(`/social/like/${projectId}`);

export const checkLike = (projectId) => api.get(`/social/like/${projectId}`);

export const bookmarkProject = (projectId) => api.post(`/social/bookmark/${projectId}`);

export const checkBookmark = (projectId) => api.get(`/social/bookmark/${projectId}`);

export const followUser = (userId) => api.post(`/social/follow/${userId}`);

export const checkFollow = (userId) => api.get(`/social/follow/${userId}`);

export default api;
