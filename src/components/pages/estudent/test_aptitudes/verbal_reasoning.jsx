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
    <div className="min-h-screen flex justify-center relative overflow-hidden h-full ">
      

      <div className="relative z-10 w-full max-w-6xl px-5 py-5  ">
        <TestHeader
          title={"TEST DE RAZONAMIENTO VERBAL"}
          description={"ULA-UNET Aprende Matemática-Física-Química-Lógica…"}
        />

        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, isSubmitting, setValues }) => (
            <Form>
              {/* Contenedor fijo de sección y temporizador arriba */}
              <motion.div
                className="  sticky top-5 z-20 dark:from-black/40 dark:to-black/40 backdrop-blur-md rounded-3xl p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-teal-400/50  bg-gradient-to-r from-white to-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="flex gap-4">
                  <motion.button
                    type="button"
                    
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1.5 md:px-6 md:py-3  font-bold rounded-full border    shadow-md  duration-500 dark:hover:bg-gray-600  ${
                      currentSection === "A"
                        ? " dark:bg-teal-400 text-black dark:border-teal-400 border-2 border-red-950 "
                        : "bg-transparent text-whiteborder-teal-400 dark:text-white text-black "
                    }`}
                    onClick={() => setCurrentSection("A")}
                  >
                    Sección A (4 min)
                  </motion.button>
                  <motion.button
                    type="button"
                    
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-full border font-bold shadow-md  duration-500  dark:hover:bg-gray-600  ${
                      currentSection === "B"
                        ? "dark:bg-teal-400 text-black dark:border-teal-400 border-2 border-red-950 "
                        : "bg-transparent dark:text-white dark:border-teal-400 text-black "
                    }`}
                    onClick={() => setCurrentSection("B")}
                  >
                    Sección B (5 min)
                  </motion.button>
                </div>

                <div className="dark:text-white  text-black text-lg md:text-xl font-bold px-6 py-3 rounded-full border-2 dark:border-teal-400/50 border-red-800 ">
                  Tiempo:{" "}
                  {currentSection === "A"
                    ? formatTime(timeLeftA)
                    : formatTime(timeLeftB)}
                </div>
              </motion.div>

              {/* Contenedor preguntas */}
              <div className="max-h-[65vh] overflow-y-auto  scrollbar-default px-6 ">
                {/* Introducción */}
                <motion.div
                  className="mb-8 bg-gradient-to-r dark:from-black/50 dark:to-gray-900/50 from-white to-white rounded-3xl p-6 shadow-2xl backdrop-blur-md border border-teal-400/30 dark:text-gray-200 text-black leading-relaxed"
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
                      className="mb-6 p-6 bg-gradient-to-r dark:from-black/50 dark:to-gray-900/50 from-white  rounded-3xl shadow-2xl backdrop-blur-md border border-teal-400/30"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="dark:text-white text-black font-semibold text-base md:text-lg mb-4">
                        {pregunta.id}.- {pregunta.texto}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pregunta.opciones.map((opcion, index) => (
                          <motion.label
                            key={index}
                            className={`flex items-center p-4 rounded-2xl cursor-pointer duration-300 transition-all hover:bg-[color:yellow] dark:hover:bg-gray-600 ${
                              values[fieldName] === opcion
                                ? "dark:bg-teal-400/20 border-2 dark:border-teal-400 "
                                : "dark:bg-gray-800/50 border-[5px] dark:border-gray-600  "
                            }`}
                            
                            
                          >
                            <Field
                              type="radio"
                              name={fieldName}
                              value={opcion}
                              className="mr-3 h-5 w-5 dark:text-teal-400 text-black"
                            />
                            <span className="dark:text-white text-black font-bold">
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
                    
                    onClick={() => Cambios()}
                    whileTap={{ scale: 0.95 }}
                    className=" hover:scale-95 hover:shadow-2xl py-2 px-4 md:px-8 md:py-4 rounded-full dark:from-teal-400 dark:to-teal-400  dark:text-black  font-bold text-base md:text-lg shadow-lg border-2  dark:border-teal-400 border-cyan-800 bg-gradient-to-r from-[#053F5C] to-[#0c7fb8]  transition-all duration-300 disabled:opacity-50 "
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
