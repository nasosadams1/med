// src/api.js
const API_URL = import.meta.env.VITE_API_URL;

export const fetchData = async (endpoint) => {
  const response = await fetch(`${API_URL}/api/${endpoint}`);
  return response.json();
};

export const postData = async (endpoint, data) => {
  const response = await fetch(`${API_URL}/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
