// Archivo: api_student.js

import axios from "axios";

const API_URL = "http://localhost:8000/api/add_student/";

// ❌ ELIMINA: const accessToken = localStorage.getItem("access"); 
// ✅ CORRECCIÓN: Leer el token justo antes de cada petición.
const getHeaders = () => {
    const accessToken = localStorage.getItem("access"); 

    return {
        // La variable accessToken ahora siempre tiene el valor más reciente de localStorage
        Authorization: `Bearer ${accessToken}`, 
        "Content-Type": "application/json",
    };
};

export const getStudents = async () => {
    return await axios.get(API_URL, { headers: getHeaders() });
};

export const addStudent = async (data ) => {
    return await axios.post(API_URL, data, { headers: getHeaders() });
};

export const updateStudent = async (id, data ) => {
    return await axios.put(`${API_URL}${id}/`, data, {
        headers: getHeaders(),
    });
};

export const deleteStudent = async (id) => {
    return await axios.delete(`${API_URL}${id}/`, {
        headers: getHeaders(),
    });
};