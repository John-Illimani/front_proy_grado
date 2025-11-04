import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import { motion } from "framer-motion";
import { preguntasSeccionA, preguntasSeccionB } from "../../questions/questions";
import { posTests } from "../../../../api/api_tests";
import { VerifyProgres } from "../progress";
import { TestHeader } from "../../../testHeader";
import { getStudentId } from "../studentId";
import { Cambios } from "../verify";

export const TestRazonamientoVerbal = ({ nombre = "JOHN" }) => {
  const [currentSection, setCurrentSection] = useState("A");
  const [timeLeftA, setTimeLeftA] = useState(4 * 60);
  const [timeLeftB, setTimeLeftB] = useState(5 * 60);
  const [showModal, setShowModal] = useState(false);
  const [timeUpModal, setTimeUpModal] = useState(false);

  const allQuestions = [
    ...preguntasSeccionA.map((p) => ({ ...p, section: "A" })),
    ...preguntasSeccionB.map((p) => ({ ...p, section: "B" })),
  ];

  const initialValues = {};
  allQuestions.forEach((q) => {
    initialValues[`${q.section}-${q.id}`] = null;
  });

  // Temporizadores
  useEffect(() => {
    if (currentSection === "A" && timeLeftA > 0) {
      const timer = setTimeout(() => setTimeLeftA(timeLeftA - 1), 1000);
      return () => clearTimeout(timer);
    } else if (currentSection === "A" && timeLeftA === 0) {
      setTimeUpModal(true);
    }
  }, [currentSection, timeLeftA]);

  useEffect(() => {
    if (currentSection === "B" && timeLeftB > 0) {
      const timer = setTimeout(() => setTimeLeftB(timeLeftB - 1), 1000);
      return () => clearTimeout(timer);
    } else if (currentSection === "B" && timeLeftB === 0) {
      setTimeUpModal(true);
    }
  }, [currentSection, timeLeftB]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    const result = {};
    allQuestions.forEach((q) => {
      const key = `${q.section}-${q.id}`;
      result[key] = values[key] === q.respuesta ? 1 : 0;
    });

    VerifyProgres(result, 4);

    const studentId = await getStudentId();
    await posTests(result, "skills", "verbal_reasoning", studentId);
    setSubmitting(false);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen flex justify-center relative overflow-hidden h-full">
      <motion.div
        className="absolute inset-0 bg-[url('/fondo_marcelo.jpg')] bg-cover bg-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      <div className="absolute inset-0 "></div>

      <div className="relative z-10 w-full max-w-6xl px-6 py-5">
        <TestHeader
          title={"TEST DE RAZONAMIENTO VERBAL"}
          description={"ULA-UNET Aprende Matemática-Física-Química-Lógica…"}
        />

        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, isSubmitting, setValues }) => (
            <Form>
              {/* Contenedor fijo de sección y temporizador arriba */}
              <motion.div
                className="sticky top-5 z-20 bg-black/40 backdrop-blur-md rounded-3xl p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-teal-400/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="flex gap-4">
                  <motion.button
                    type="button"
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#14B8A6",
                      color: "#000",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1.5 md:px-6 md:py-3 rounded-full border font-medium shadow-md transition-all duration-300 ${
                      currentSection === "A"
                        ? "bg-teal-400 text-black border-teal-400"
                        : "bg-transparent text-white border-teal-400"
                    }`}
                    onClick={() => setCurrentSection("A")}
                  >
                    Sección A (4 min)
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#14B8A6",
                      color: "#000",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-full border font-medium shadow-md transition-all duration-300 ${
                      currentSection === "B"
                        ? "bg-teal-400 text-black border-teal-400"
                        : "bg-transparent text-white border-teal-400"
                    }`}
                    onClick={() => setCurrentSection("B")}
                  >
                    Sección B (5 min)
                  </motion.button>
                </div>

                <div className="text-white text-lg md:text-xl font-bold px-6 py-3 rounded-full border border-teal-400/50">
                  Tiempo:{" "}
                  {currentSection === "A"
                    ? formatTime(timeLeftA)
                    : formatTime(timeLeftB)}
                </div>
              </motion.div>

              {/* Contenedor preguntas */}
              <div className="max-h-[65vh] overflow-y-auto pr-2 scrollbar-default">
                {/* Introducción */}
                <motion.div
                  className="mb-8 bg-gradient-to-r from-black/50 to-gray-900/50 rounded-3xl p-6 shadow-2xl backdrop-blur-md border border-teal-400/30 text-gray-200 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <p className="mb-4">
                    La capacidad verbal es una habilidad que se encarga de la
                    comprensión de las frases, del conocimiento de las palabras
                    y la fluidez verbal para el razonamiento de los términos
                    verbales.
                  </p>
                  <p className="mb-4">
                    En los ejercicios que a continuación debes realizar
                    encuentras una serie de frases incompletas. A cada frase le
                    faltan la primera y la última palabra, que han sido
                    sustituidas por una línea de puntos.
                  </p>
                  <p>
                    Para completar el ejercicio debes elegir una de las cuatro
                    respuestas alternativas que se te dan. La primera palabra
                    corresponde con el espacio de puntos del comienzo de la
                    frase y la segunda con el espacio de puntos del final de la
                    frase.
                  </p>
                </motion.div>

                {/* Preguntas */}
                {(currentSection === "A"
                  ? preguntasSeccionA
                  : preguntasSeccionB
                ).map((pregunta) => {
                  const fieldName = `${currentSection}-${pregunta.id}`;
                  return (
                    <motion.div
                      key={fieldName}
                      className="mb-6 p-6 bg-gradient-to-r from-black/50 to-gray-900/50 rounded-3xl shadow-2xl backdrop-blur-md border border-teal-400/30"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-white font-semibold text-base md:text-lg mb-4">
                        {pregunta.id}.- {pregunta.texto}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pregunta.opciones.map((opcion, index) => (
                          <motion.label
                            key={index}
                            className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all ${
                              values[fieldName] === opcion
                                ? "bg-teal-400/20 border-2 border-teal-400"
                                : "bg-gray-800/50 border border-gray-600"
                            }`}
                            whileHover={{
                              scale: 1.02,
                              backgroundColor: "rgba(20, 184, 166, 0.2)",
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Field
                              type="radio"
                              name={fieldName}
                              value={opcion}
                              className="mr-3 h-5 w-5 text-teal-400"
                            />
                            <span className="text-white">
                              {String.fromCharCode(97 + index)}) {opcion}
                            </span>
                          </motion.label>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Botón enviar */}
                <motion.div
                  className="text-center mt-5 mb-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#14B8A6",
                      color: "#000",
                    }}
                    onClick={() => Cambios()}
                    whileTap={{ scale: 0.95 }}
                    className="py-2 px-4 md:px-8 md:py-4 rounded-full bg-teal-400 text-black font-bold text-base md:text-lg shadow-lg border-2 border-teal-400 disabled:opacity-50"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Respuestas"}
                  </motion.button>
                </motion.div>
              </div>

              {/* Modal de envío correcto */}
              {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                  <div className="bg-gray-900 rounded-xl p-8 max-w-sm w-full text-center shadow-lg">
                    <h2 className="text-2xl font-bold text-green-500 mb-4">
                      ¡Enviado correctamente!
                    </h2>
                    <p className="text-gray-300 mb-6">
                      Tu formulario ha sido enviado exitosamente.
                    </p>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 bg-green-500 text-white rounded-xl font-bold hover:opacity-90 transition-all duration-300"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}

              {/* Modal de tiempo agotado */}
              {timeUpModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                  <div className="bg-gray-900 rounded-xl p-8 max-w-sm w-full text-center shadow-lg">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">
                      ¡Se acabó el tiempo!
                    </h2>
                    <p className="text-gray-300 mb-6">
                      El tiempo para esta sección ha finalizado. Debes volver a intentarlo.
                    </p>
                    <button
                      onClick={() => {
                        setTimeUpModal(false);
                        setTimeLeftA(4 * 60);
                        setTimeLeftB(5 * 60);
                        setCurrentSection("A");
                        setValues(initialValues); // Limpiar todas las respuestas
                      }}
                      className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold hover:opacity-90 transition-all duration-300"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
