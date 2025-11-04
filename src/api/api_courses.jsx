import axios from "axios";

const API_URL = "http://localhost:8000/api/add_courses/";

// ❌ ELIMINAR ESTA LÍNEA: const accessToken = localStorage.getItem("access"); 

// ✅ CORRECCIÓN: La función getHeaders debe leer el token de forma dinámica
const getHeaders = () => {
    // Esto garantiza que se obtiene el valor más reciente de localStorage
    const accessToken = localStorage.getItem("access"); 
    
    return {
        // Usa el valor fresco y disponible del token
        Authorization: `Bearer ${accessToken}`, 
        "Content-Type": "application/json",
    };
};

export const getCourses = async () => {
    return await axios.get(API_URL, { headers: getHeaders() });
};

export const addCourse = async (data ) => {
    return await axios.post(API_URL, data, { headers: getHeaders() });
};

export const updateCourse = async (id, data ) => {
    return await axios.put(`${API_URL}${id}/`, data, {
        headers: getHeaders(),
    });
};

export const deleteCourse = async (id) => {
    return await axios.delete(`${API_URL}${id}/`, {
        headers: getHeaders(),
    });
};