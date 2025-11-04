import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Formik, Form } from "formik";
import { posTests } from "../../../../api/api_tests";
import { questionsSpeed1 } from "../../questions/questions";
import { VerifyProgres } from "../progress";
import { TestHeader } from "../../../testHeader";
import { getStudentId } from "../studentId";
import { Cambios } from "../verify";

export const TestRapidezPerceptivaParte1 = ({ nombre = "JOHN" }) => {
  const [timeLeft, setTimeLeft] = useState(3 * 60);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [timeUp, setTimeUp] = useState(false);

  const preguntas = questionsSpeed1;

  const initialValues = {};
  preguntas.forEach((pregunta) => {
    initialValues[`${pregunta.id}`] = null;
    initialValues[`${pregunta.id}_selected`] = null;
  });

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Tiempo terminado
      setModalMessage("¡Se terminó el tiempo!");
      setShowModal(true);
      setTimeUp(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleRestart = (resetForm) => {
    setTimeLeft(3 * 60);
    resetForm();
    setShowModal(false);
    setTimeUp(false);
  };

  const handleSend = async (values, { setSubmitting }) => {
  VerifyProgres(values, 9);
  const studentId = await getStudentId();

  // Filtrar solo los valores tipo "pregunta.id"
  const respuestas = Object.fromEntries(
    Object.entries(values).filter(([key]) => !key.endsWith("_selected"))
  );

  await posTests(respuestas, "skills", "speed_test1", studentId);
  setSubmitting(false);
  setModalMessage("¡Enviado correctamente!");
  setShowModal(true);
  setTimeUp(false);
};

  return (
    <Formik initialValues={initialValues} onSubmit={handleSend}>
      {({ values, setFieldValue, isSubmitting, resetForm }) => (
        <Form>
          <div className="h-screen flex justify-center relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-[url('/fondo_marcelo.jpg')] bg-cover bg-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 15, repeat: Infinity }}
            />
            <div className="absolute inset-0"></div>

            <div className="relative z-10 w-full max-w-6xl px-6 py-10 overflow-y-auto scrollbar-hide">
              <TestHeader
                title="TEST DE RAPIDEZ Y EXACTITUD PERCEPTIVA"
                description="Parte I - Comparación de Grupos de Letras y Números"
              />

              <motion.div
                className="mb-8 bg-gradient-to-r from-black/50 to-gray-900/50 rounded-3xl p-6 shadow-2xl backdrop-blur-md border border-teal-400/30 text-gray-200 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h3 className="text-teal-400 font-bold text-xl mb-4">
                  INSTRUCCIONES:
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    Cada ejercicio muestra cinco grupos de letras y/o números.
                  </li>
                  <li>
                    Solo uno de los grupos está{" "}
                    <span className="text-teal-300 font-semibold">
                      subrayado
                    </span>
                    .
                  </li>
                  <li>
                    Debe seleccionar únicamente el grupo que sea{" "}
                    <span className="text-teal-300 font-semibold">
                      exactamente igual
                    </span>{" "}
                    al subrayado.
                  </li>

                  <li>Solo puede seleccionar una opción por ejercicio.</li>
                  <li>Trabaje con rapidez y precisión.</li>
                </ul>
              </motion.div>

              <motion.div
                className="flex justify-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div
                  className={`text-white text-2xl font-bold px-8 py-4 rounded-full border ${
                    timeLeft < 60
                      ? "bg-red-600/40 border-red-400"
                      : "bg-black/40 border-teal-400/50"
                  }`}
                >
                  Tiempo: {formatTime(timeLeft)}
                </div>
              </motion.div>

              <motion.div
                className="max-h-[500px] overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4 scrollbar-hide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {preguntas.map((pregunta) => (
                  <motion.div
                    key={pregunta.id}
                    className="p-4 bg-gradient-to-r from-black/50 to-gray-900/50 rounded-2xl shadow-2xl backdrop-blur-md border border-teal-400/30"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-teal-400 font-bold text-lg">
                          {pregunta.id}.
                        </span>
                        <span className="text-gray-400 text-sm">
                          Grupo subrayado
                        </span>
                      </div>

                      <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600 text-center font-mono">
                        {pregunta.opciones.map((opcion, index) => (
                          <span
                            key={index}
                            className={`mx-1 ${
                              opcion === pregunta.respuesta
                                ? "underline decoration-teal-400 decoration-2 font-bold"
                                : ""
                            }`}
                          >
                            {opcion}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {pregunta.opciones.map((opcion, index) => {
                        const isCorrect = opcion === pregunta.respuesta;
                        const selected =
                          (values[pregunta.id] === 1 && isCorrect) ||
                          (values[pregunta.id] === 0 &&
                            values[`${pregunta.id}_selected`] === opcion);

                        return (
                          <motion.div
                            key={index}
                            className={`flex items-center p-2 rounded-xl cursor-pointer transition-all ${
                              selected
                                ? "bg-teal-400/20 border-2 border-teal-400"
                                : "bg-gray-800/30 border border-gray-600"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              if (isCorrect) {
                                setFieldValue(`${pregunta.id}`, 1);
                                setFieldValue(`${pregunta.id}_selected`, null);
                              } else {
                                setFieldValue(`${pregunta.id}`, 0);
                                setFieldValue(
                                  `${pregunta.id}_selected`,
                                  opcion
                                );
                              }
                            }}
                          >
                            <span className="text-white font-mono text-sm">
                              {String.fromCharCode(65 + index)}) {opcion}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                  <div className="bg-gray-900 rounded-xl p-8 max-w-sm w-full text-center shadow-lg">
                    <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                      {modalMessage}
                    </h2>
                    {timeUp ? (
                      <div className="flex flex-col gap-4">
                        <button
                          onClick={() =>
                            handleSend(values, { setSubmitting: () => {} })
                          }
                          className="px-6 py-2 bg-green-500 text-white rounded-xl font-bold hover:opacity-90 transition-all duration-300"
                        >
                          Enviar respuestas contestadas
                        </button>
                        <button
                          onClick={() => handleRestart(resetForm)}
                          className="px-6 py-2 bg-teal-400 text-black rounded-xl font-bold hover:opacity-90 transition-all duration-300"
                        >
                          Reiniciar Test
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-6 py-2 bg-teal-400 text-black rounded-xl font-bold hover:opacity-90 transition-all duration-300"
                      >
                        Cerrar
                      </button>
                    )}
                  </div>
                </div>
              )}

              <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <motion.button
                  type="submit"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "#14B8A6",
                    color: "#000",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => Cambios()}
                  className="px-8 py-4 rounded-full bg-teal-400 text-black font-bold text-lg shadow-lg border-2 border-teal-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Finalizar Parte I"}
                </motion.button>
                <p className="text-gray-400 text-sm mt-2">
                  {
                    Object.keys(values).filter((key) => values[key] !== null)
                      .length
                  }{" "}
                  de {preguntas.length} preguntas respondidas
                </p>
              </motion.div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
