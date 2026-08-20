// Centralized Application Configuration
// VITE_API_URL can be set during deployment (e.g. on Vercel/Render/Netlify)
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
