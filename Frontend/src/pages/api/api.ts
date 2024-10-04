// frontend/utils/api.ts
import axios from 'axios';

// Axios instance
const api = axios.create({
 
 

  baseURL: 'http://localhost:5000/api', // Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Register API call
export const register = async (data: { name: string, email: string, password: string, role: string }) => {
  return api.post(`${api}/signup`, data);
};

// Login API call
export const login = async (data: { email: string, password: string }) => {
  return api.post(`${api}/login`, data);
};
// Admin Login API call
export const adminLogin = async (data: { email: string, password: string }) => {
  return api.post('/admin/login', data); // Change the endpoint as per your backend
};
// Example of a protected API call (e.g., fetching user data)
// Fetch Books API call
console.log('Fetching from:', `${api}/books/`);
export const fetchBooks = async (data:{ title: string,author: string,isbn: string,genre?: string,cover_image_url?: string,available_copies: number,total_copies: number}) => {
 return api.post(`${api}/books/`,data);
 
};
export const getUserData = async () => {
  const token = localStorage.getItem('token');
  return api.get('/api/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

