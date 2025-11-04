import axios from "axios";

const API_URL = "http://localhost:8000/api/predict/";
const accessToken = localStorage.getItem("access"); // ¡Asegúrate que este token sea válido!

const getHeaders = () => ({
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json",
});

export const sendIdStudent = async (id) => {
  try {
    const response = await axios.post(
      `${API_URL}${id}/`,
      null, // <-- Envía null o {} como cuerpo de la petición (segundo argumento)
      { headers: getHeaders() } // <-- Pasa las cabeceras en el objeto de config (tercer argumento)
    );
    return response.data; // Devuelve los datos de la respuesta si es exitoso
  } catch (error) {
    console.error("Error al enviar ID para predicción:", error.response?.data || error.message);
    throw error; // Re-lanza el error para manejarlo en otro lugar
  }
};