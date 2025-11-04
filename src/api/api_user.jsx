import axios from "axios";

const API_URL = "http://localhost:8000/api/add_user/";
// ❌ ELIMINAR ESTA LÍNEA: const accessToken = localStorage.getItem("access"); 

// ✅ CORRECCIÓN: La función getHeaders debe leer el token de forma dinámica
const getHeaders = () => {
    // Lee el token justo antes de que se use
    const accessToken = localStorage.getItem("access"); 
    
    return {
        // Usa el valor fresco y disponible del token
        Authorization: `Bearer ${accessToken}`, 
        "Content-Type": "application/json",
    };
};

export const getUsers = async () => {
    return await axios.get(API_URL, { headers: getHeaders() });
};

export const addUser = async (data) => {
    return await axios.post(API_URL, data, { headers: getHeaders() });
};

export const updateUser = async (id, data) => {
    return await axios.put(`${API_URL}${id}/`, data, {
        headers: getHeaders(),
    });
};

export const deleteUser = async (id) => {
    return await axios.delete(`${API_URL}${id}/`, {
        headers: getHeaders(),
    });
};