// ============================================================
// src/services/api.js
// All backend API calls are centralized here
// ============================================================

import axios from 'axios';

// Base URL for the backend
const API_BASE = 'http://localhost:5000/api';

// ---- AUTH APIs ----

// Register a new user
export const registerUser = (data) =>
  axios.post(`${API_BASE}/auth/register`, data);

// Login user
export const loginUser = (data) =>
  axios.post(`${API_BASE}/auth/login`, data);

// ---- UPLOAD APIs ----

// Upload a file for detection (with progress tracking)
export const uploadFile = (formData, onProgress) =>
  axios.post(`${API_BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percent);
      }
    },
  });

// Get user upload history
export const getUserHistory = (userId) =>
  axios.get(`${API_BASE}/upload/history/${userId}`);

// Get single upload report
export const getUploadReport = (uploadId) =>
  axios.get(`${API_BASE}/upload/report/${uploadId}`);

// Submit a fake content report
export const submitReport = (data) =>
  axios.post(`${API_BASE}/upload/report`, data);

// ---- ADMIN APIs ----

// Get all uploads (admin)
export const adminGetUploads = () =>
  axios.get(`${API_BASE}/admin/uploads`);

// Get all users (admin)
export const adminGetUsers = () =>
  axios.get(`${API_BASE}/admin/users`);

// Delete an upload (admin)
export const adminDeleteUpload = (id) =>
  axios.delete(`${API_BASE}/admin/upload/${id}`);

// Get dashboard stats (admin)
export const adminGetStats = () =>
  axios.get(`${API_BASE}/admin/stats`);
