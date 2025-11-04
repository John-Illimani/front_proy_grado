import axios from "axios";
import { getStudentId } from "../components/pages/estudent/studentId";

const API_URL = "http://localhost:8000/api/option_response/";

const testRanges = {
  chaside: { startId: 1, endId: 98 },
  ipde: { startId: 99, endId: 157 },
  psychotechnical: { startId: 158, endId: 182 },
  colmilPersonality: { startId: 183, endId: 254 },

  personality: { startId: 255, endId: 417 },
  verbal_reasoning: { startId: 418, endId: 464 },
  numeric_reasoning: { startId: 465, endId: 504 },
  abstract_reasoning: { startId: 505, endId: 552 },
  mechanical_reasoning: { startId: 553, endId: 567 },
  orthography: { startId: 568, endId: 593 },
  speed_test1: { startId: 594, endId: 693 },
  speed_test2: { startId: 694, endId: 793 },
  spatial_reasoning: { startId: 794, endId: 823 },
};



/**
 * Sincroniza las respuestas de un test para un estudiante.
 * Primero, consulta las respuestas existentes. Luego, crea las que son nuevas
 * y actualiza las que han cambiado.
 * @param {Array<Object>} newAnswersPayload - El array de nuevas respuestas desde el formulario.
 * @param {string} testName - El nombre clave del test (ej. 'chaside', 'ipde').
 */
async function sendData(newAnswersPayload, testName) {
    // Se obtiene el studentId al inicio, es crucial para el GET y el POST.
    // 🚨 CAMBIO CRÍTICO: Añadir 'await' aquí
    const studentId = await getStudentId(); 
    if (!studentId) {
        throw new Error("No se pudo obtener la ID del estudiante.");
    }

    const access = localStorage.getItem("access");
    const headers = {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
    };

    const range = testRanges[testName];
    if (!range) throw new Error(`Rango no definido para el test '${testName}'`);

    try {
        // --- PASO 1: OBTENER Y PROCESAR RESPUESTAS EXISTENTES PAGINADAS ---
        // studentId ahora es un número, resolviendo el ValueError del backend.
        let nextUrl = `${API_URL}?estudiante=${studentId}&pregunta__gte=${range.startId}&pregunta__lte=${range.endId}`;
        const existingAnswersMap = new Map();

        while (nextUrl) {
            const res = await axios.get(nextUrl, { headers });
            const data = res.data.results || res.data;

            if (Array.isArray(data)) {
                for (const ans of data) {
                    existingAnswersMap.set(ans.pregunta, ans);
                }
            }

            nextUrl = res.data.next || null;
        }

        // --- PASO 2: DETECTAR CAMBIOS ---
        const toCreate = [];
        const toUpdate = [];

        for (const newAnswer of newAnswersPayload) {
            const existing = existingAnswersMap.get(newAnswer.pregunta);
            
            if (existing) {
                const sameText = existing.texto === newAnswer.texto;
                const sameValue = Number(existing.valor) === Number(newAnswer.valor);

                if (!sameText || !sameValue) {
                    toUpdate.push({
                        // Preserva las claves existentes como 'id'
                        ...existing, 
                        texto: newAnswer.texto,
                        valor: newAnswer.valor,
                    });
                }
            } else {
                // Inyectar la clave 'estudiante' con su ID.
                toCreate.push({
                    ...newAnswer,
                    estudiante: studentId, 
                });
            }
        }

        // --- PASO 3: SINCRONIZAR CON EL BACKEND ---
        
        // 1. Creación Masiva (POST)
        if (toCreate.length > 0) {
            console.log(`🆕 Creando ${toCreate.length} respuestas nuevas`);
            const chunkSize = 200;
            for (let i = 0; i < toCreate.length; i += chunkSize) {
                const chunk = toCreate.slice(i, i + chunkSize);
                await axios.post(API_URL, chunk, { headers }); 
            }
        }

        // 2. Actualización Masiva (PATCH)
        if (toUpdate.length > 0) {
            console.log(`🔄 Actualizando ${toUpdate.length} respuestas existentes`);
            const updateUrl = `http://localhost:8000/api/update/`; 
            const chunkSize = 200;
            for (let i = 0; i < toUpdate.length; i += chunkSize) {
                const chunk = toUpdate.slice(i, i + chunkSize);
                await axios.patch(updateUrl, chunk, { headers });
            }
        }

        if (toCreate.length === 0 && toUpdate.length === 0) {
            console.log("✅ No hubo cambios que guardar.");
        }
    } catch (error) {
        console.error(
            "❌ Error al sincronizar los datos:",
            error.response?.data || error.message
        );
        // Propaga el error para que la interfaz de usuario pueda manejarlo
        throw error; 
    }
}



export const posTests = async (
  formResponses,
  test,
  nameQuestion,
  estudiante
) => {
  let payload;
  if (test === "chaside") {
    payload = Object.entries(formResponses).map(
      ([preguntaId, respuesta], index) => ({
        texto: respuesta === null ? "vacio" : respuesta,
        valor: respuesta === "SI" ? 1 : respuesta === "NO" ? 2 : 0,
        pregunta: 1 + index,
        estudiante: estudiante,
      })
    );
    await sendData(payload, "chaside");
  } else {
    if (test === "colmil") {
      if (nameQuestion === "ipde") {
        payload = Object.entries(formResponses).map(
          ([preguntaId, respuesta], index) => ({
            texto: respuesta === null ? "vacio" : respuesta,
            valor: respuesta === "V" ? 1 : respuesta === "F" ? 2 : 0,
            pregunta: 99 + index,

            estudiante: estudiante,
          })
        );

        await sendData(payload, "ipde");
      } else {
        if (nameQuestion === "psychotechnical") {
          payload = Object.entries(formResponses).map(
            ([preguntaId, respuesta], index) => ({
              texto: respuesta === null ? "vacio" : respuesta,
              valor: respuesta === "Si" ? 1 : respuesta === "No" ? 2 : 0,
              pregunta: 158 + index,
              estudiante: estudiante,
            })
          );
          await sendData(payload, "psychotechnical");
        } else {
          payload = Object.entries(formResponses).map(
            ([preguntaId, respuesta], index) => ({
              texto: respuesta === null ? "vacio" : respuesta,
              valor: 1,
              pregunta: 183 + index,
              estudiante: estudiante,
            })
          );
          await sendData(payload, "colmilPersonality");
        }
      }
    } else {
      if (test === "personality") {
        payload = Object.entries(formResponses).map(
          ([preguntaId, respuesta], index) => ({
            texto: respuesta === null ? "vacio" : respuesta,
            valor: 1,
            pregunta: 255 + index,
            estudiante: estudiante,
          })
        );
        await sendData(payload, "personality");
      } else {
        if (test === "skills") {
          if (nameQuestion === "verbal_reasoning") {
            payload = Object.entries(formResponses).map(
              ([preguntaId, respuesta], index) => ({
                texto: respuesta === null ? "vacio" : respuesta,
                valor: 1,
                pregunta: 418 + index,
                estudiante: estudiante,
              })
            );
            await sendData(payload, "verbal_reasoning");
          } else {
            if (nameQuestion === "numeric_reasoning") {
              payload = Object.entries(formResponses).map(
                ([preguntaId, respuesta], index) => ({
                  texto: respuesta === null ? "vacio" : respuesta,
                  valor: 1,
                  pregunta: 465 + index,
                  estudiante: estudiante,
                })
              );
              await sendData(payload, "numeric_reasoning");
            } else {
              if (nameQuestion === "abstract_reasoning") {
                payload = Object.entries(formResponses).map(
                  ([preguntaId, respuesta], index) => ({
                    texto: respuesta === null ? "vacio" : respuesta,
                    valor: 1,
                    pregunta: 505 + index,
                    estudiante: estudiante,
                  })
                );
                await sendData(payload, "abstract_reasoning");
              } else {
                if (nameQuestion === "mechanical_reasoning") {
                  payload = Object.entries(formResponses).map(
                    ([preguntaId, respuesta], index) => ({
                      texto: respuesta === null ? "vacio" : respuesta,
                      valor: 1,
                      pregunta: 553 + index,
                      estudiante: estudiante,
                    })
                  );
                  await sendData(payload, "mechanical_reasoning");
                } else {
                  if (nameQuestion === "orthography") {
                    payload = Object.entries(formResponses).map(
                      ([preguntaId, respuesta], index) => ({
                        texto: respuesta === null ? "vacio" : respuesta,
                        valor: 1,
                        pregunta: 568 + index,
                        estudiante: estudiante,
                      })
                    );
                    await sendData(payload, "orthography");
                  } else {
                    if (nameQuestion === "speed_test1") {
                      payload = Object.entries(formResponses).map(
                        ([preguntaId, respuesta], index) => ({
                          texto: respuesta === null ? "vacio" : respuesta,
                          valor: 1,
                          pregunta: 594 + index,
                          estudiante: estudiante,
                        })
                      );
                      await sendData(payload, "speed_test1");
                    } else {
                      if (nameQuestion === "speed_test2") {
                        payload = Object.entries(formResponses).map(
                          ([preguntaId, respuesta], index) => ({
                            texto: respuesta === null ? "vacio" : respuesta,
                            valor: 1,
                            pregunta: 694 + index,
                            estudiante: estudiante,
                          })
                        );
                        await sendData(payload, "speed_test2");
                      }else{
                        if (nameQuestion === "spatial_reasoning") {
                        payload = Object.entries(formResponses).map(
                          ([preguntaId, respuesta], index) => ({
                            texto: respuesta === null ? "vacio" : respuesta,
                            valor: 1,
                            pregunta: 794 + index,
                            estudiante: estudiante,
                          })
                        );
                        await sendData(payload, "spatial_reasoning");
                      }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

const API_URL_DELETE = "http://localhost:8000/api/delete_response/";

const accessToken = localStorage.getItem("access");
const getHeaders = () => ({
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json",
});

export const deleteTest = async (id) => {
  return await axios.delete(`${API_URL_DELETE}${id}/`, {
    headers: getHeaders(),
  });
};


