import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 8000, // 8 second timeout — don't hang forever if backend is down
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('edushelf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── PUBLIC ────────────────────────────────────────────
export const getPublicStats = () => API.get('/public/stats');

// ── AUTH ──────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser    = (data) => API.post('/auth/login', data);
export const getMe        = ()     => API.get('/auth/me');

// ── BOOKS ─────────────────────────────────────────────
export const getBooks         = (params) => API.get('/books', { params });
export const getBookById      = (id)     => API.get(`/books/${id}`);
export const uploadBook       = (data)   => API.post('/books', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateBook       = (id, d)  => API.put(`/books/${id}`, d);
export const deleteBook       = (id)     => API.delete(`/books/${id}`);
export const likeBook         = (id)     => API.post(`/books/${id}/like`);
export const dislikeBook      = (id)     => API.post(`/books/${id}/dislike`);
export const saveBook         = (id)     => API.post(`/books/${id}/save`);
export const downloadBook     = (id)     => API.post(`/books/${id}/download`);
export const getBookReviews   = (id)     => API.get(`/books/${id}/reviews`);
export const addBookReview    = (id, d)  => API.post(`/books/${id}/reviews`, d);

// ── USERS ─────────────────────────────────────────────
export const getSavedBooks      = () => API.get('/users/me/saved');
export const getLikedBooks      = () => API.get('/users/me/liked');
export const getDownloadedBooks = () => API.get('/users/me/downloads');
export const getRecentBooks     = () => API.get('/users/me/recent');
export const getMyStats         = () => API.get('/users/me/stats');
export const updateProfile      = (d) => API.put('/users/profile', d);

// ── REQUESTS ──────────────────────────────────────────
export const createBookRequest = (d) => API.post('/requests', d);
export const getMyRequests     = ()  => API.get('/requests/my');

// ── ADMIN ─────────────────────────────────────────────
export const adminGetStats         = ()       => API.get('/admin/stats');
export const adminGetAllBooks      = ()       => API.get('/admin/books');
export const adminGetPendingBooks  = ()       => API.get('/admin/books/pending');
export const adminGetUsers         = ()       => API.get('/admin/users');
export const adminApproveBook      = (id)     => API.put(`/admin/books/${id}/approve`);
export const adminRejectBook       = (id)     => API.put(`/admin/books/${id}/reject`);
export const adminDeleteUser       = (id)     => API.delete(`/admin/users/${id}`);
export const adminChangeUserRole   = (id, role) => API.put(`/admin/users/${id}/role`, { role });
export const adminGetRequests      = ()       => API.get('/admin/requests');
export const adminUpdateRequest    = (id, status) => API.put(`/admin/requests/${id}`, { status });

export default API;
