import axios from "axios";

const API_URL = "http://localhost:8000/api/add_section/";
// ❌ ELIMINAR: const accessToken = localStorage.getItem("access");

// ✅ CORRECCIÓN: Leer el token dinámicamente DENTRO de la función
const getHeaders = () => {
    const accessToken = localStorage.getItem("access");
    return {
      // Usa el valor fresco del token
      Authorization: `Bearer ${accessToken}`, 
      "Content-Type": "application/json",
    };
};

export const getSections = async () => { // Elimina el parámetro accessToken, ya no es necesario
  return await axios.get(API_URL, { headers: getHeaders() });
};

export const addSection = async (data) => { // Elimina el parámetro accessToken
  return await axios.post(API_URL, data, { headers: getHeaders() });
};

export const updateSection = async (id, data) => { // Elimina el parámetro accessToken
  return await axios.put(`${API_URL}${id}/`, data, {
    headers: getHeaders(),
  });
};

export const deleteSection = async (id) => { // Elimina el parámetro accessToken
  return await axios.delete(`${API_URL}${id}/`, {
    headers: getHeaders(),
  })
};