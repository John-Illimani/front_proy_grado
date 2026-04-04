import axios from "axios";

const API_URL = "http://localhost:8000/api/add_grades/";
// ❌ ELIMINAR: const accessToken = localStorage.getItem("access");

// ✅ CORRECCIÓN: Leer el token dinámicamente cada vez que se llama
const getHeaders = () => {
  const accessToken = localStorage.getItem("access");
  return {
    // Usa el valor fresco del token
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
};

export const addGradeBulk = async (listaPayloads) => {
  try {
    const res = await axios.post(API_URL, listaPayloads, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("Error en bulk:", error.response?.data || error.message);
    throw error;
  }
};

export const getGrades = async () => {
  return await axios.get(API_URL, { headers: getHeaders() });
};

export const addGrade = async (data) => {
  return await axios.post(API_URL, data, { headers: getHeaders() });
};

export const updateGrade = async (id, data) => {
  return await axios.put(`${API_URL}${id}/`, data, {
    headers: getHeaders(),
  });
};

export const deleteGrade = async (id) => {
  return await axios.delete(`${API_URL}${id}/`, {
    headers: getHeaders(),
  });
};
