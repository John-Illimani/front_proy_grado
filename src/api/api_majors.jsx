import axios from "axios";

// Assuming your endpoint for Majors is /api/majors/
const API_URL = "http://localhost:8000/api/majors/";
const API_URL_DELETE = "http://localhost:8000/api/delete_majors/";
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

/**
 * Gets the recommended majors for a specific student.
 * @param {number} studentId - The ID of the student to filter by.
 * @returns {Promise<AxiosResponse<any>>} The axios response.
 */
export const getMajors = async (studentId) => {
  const url = `${API_URL}?estudiante=${studentId}&page_size=10`;
  return await axios.get(url, { headers: getHeaders() });
};

export const deleteMajors = async (id) => {
  return await axios.delete(`${API_URL_DELETE}${id}/`, {
    headers: getHeaders(),
  });
};