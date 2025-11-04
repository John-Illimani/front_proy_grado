import axios from "axios";

// Assuming your endpoint for StudentTest is /api/student_tests/
const API_URL = "http://localhost:8000/api/add_student_test/"; // <-- Check if this URL base is correct
const API_URL_DELETE = "http://localhost:8000/api/delete/"; // <-- Check if this URL base is correct

const getHeaders = () => {
    // Lee el valor más reciente de localStorage en cada llamada
    const accessToken = localStorage.getItem("access"); 
    
    return {
        // Usa el valor fresco y disponible del token
        Authorization: `Bearer ${accessToken}`, 
        "Content-Type": "application/json",
    };
};

/**
 * Gets the list of tests completed by a specific student.
 * @param {number} studentId - The ID of the student to filter by.
 * @returns {Promise<AxiosResponse<any>>} The axios response.
 */
export const getStudentTests = async (studentId) => {
  // --- MODIFICATION HERE ---
  // Append the student ID as a query parameter '?estudiante=...'
  // Also add page_size to get all results (if your backend supports it)
  const url = `${API_URL}?estudiante=${studentId}&page_size=1000`; // Request up to 1000 tests for this student

  return await axios.get(url, { headers: getHeaders() });
};

// --- NO CHANGES NEEDED BELOW (POST/PUT/DELETE usually don't need filtering by student in the URL) ---

/**
 * Adds a new student test record (or potentially a bulk of them if backend supports it).
 * @param {object | object[]} data - The test data to add.
 * @returns {Promise<AxiosResponse<any>>} The axios response.
 */
export const addStudentTest = async (data) => {
  return await axios.post(API_URL, data, { headers: getHeaders() });
};

/**
 * Updates an existing student test record.
 * @param {number} id - The ID of the StudentTest record to update.
 * @param {object} data - The updated test data.
 * @returns {Promise<AxiosResponse<any>>} The axios response.
 */
export const updateStudentTest = async (id, data) => {
  return await axios.put(`${API_URL}${id}/`, data, {
    headers: getHeaders(),
  });
};

/**
 * Deletes a student test record.
 * @param {number} id - The ID of the StudentTest record to delete.
 * @returns {Promise<AxiosResponse<any>>} The axios response.
 */


export const deleteStudentTest = async (id) => {
  return await axios.delete(`${API_URL_DELETE}${id}/`, {
    headers: getHeaders(),
  });
};