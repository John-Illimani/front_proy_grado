import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import { motion } from "framer-motion";
import { posTests } from "../../../../api/api_tests";
import { questionsMechanical } from "../../questions/questions";
import { VerifyProgres } from "../progress";
import { TestHeader } from "../../../testHeader";
import { getStudentId } from "../studentId";
import { Cambios } from "../verify";

export const TestRazonamientoMecanico = ({ nombre = "JOHN" }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos
  const [showModal, setShowModal] = useState(false);
  const [timeUpModal, setTimeUpModal] = useState(false);

  const preguntas = questionsMechanical;

  // Inicializar respuestas vacías
  const initialValues = {};
  preguntas.forEach((q) => {
    initialValues[`${q.id}`] = "";
  });

  // Temporizador
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setTimeUpModal(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Envío de formulario
  const handleSubmit = async (values, { setSubmitting }) => {
    // Convertir respuestas a 1 o 0
    const resultados = {};
    preguntas.forEach((q) => {
      resultados[q.id] = values[q.id] === q.respuesta ? 1 : 0;
    });

    VerifyProgres(resultados, 7);
    const studentId = await getStudentId();
    await posTests(resultados, "skills", "mechanical_reasoning", studentId);
    setSubmitting(false);
    setShowModal(true);
  };

  return (
    <div className="h-full flex justify-center relative overflow-hidden">
      {/* Fondo */}
      <motion.div
        className="absolute inset-0 bg-[url('/fondo_marcelo.jpg')] bg-cover bg-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity }}
      />

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-7xl px-6 py-10 overflow-y-auto scrollbar-hide">
        <TestHeader
          title={"TEST DE RAZONAMIENTO MECÁNICO"}
          description={"Ejercicios de Principios Mecánicos y Física Aplicada"}
        />

        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, setFieldValue, isSubmitting, resetForm }) => (
            <Form>
              {/* Descripción */}
              <motion.div
                className="mb-8 bg-gradient-to-r from-black/50 to-gray-900/50 rounded-3xl p-6 shadow-2xl backdrop-blur-md border border-teal-400/30 text-gray-200 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <p className="mb-4">
                  El razonamiento mecánico mide tu capacidad para comprender
                  principios básicos de la física, las leyes del movimiento, la
                  energía, la fuerza y el uso de máquinas simples como poleas,
                  palancas y engranajes.
                </p>
                <p className="mb-4">
                  Para cada ejercicio, analiza la situación mecánica presentada
                  y selecciona la respuesta correcta entre las opciones.
                </p>
                <p className="text-teal-300 font-semibold">
                  ⚙️ Consejo: Recuerda principios como acción-reacción, torque,
                  equilibrio de fuerzas y transmisión de movimiento.
                </p>
              </motion.div>

              {/* Temporizador */}
              <motion.div
                className="flex justify-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="text-white text-2xl font-bold bg-black/40 px-8 py-4 rounded-full border border-teal-400/50">
                  Tiempo: {formatTime(timeLeft)}
                </div>
              </motion.div>

              {/* Preguntas */}
              <motion.div
                className="max-h-[700px] overflow-y-auto pr-2 scrollbar-hide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {preguntas.map((pregunta) => {
                  const fieldName = `${pregunta.id}`;
                  return (
                    <motion.div
                      key={pregunta.id}
                      className="mb-8 p-6 bg-gradient-to-r from-black/50 to-gray-900/50 rounded-3xl shadow-2xl backdrop-blur-md border border-teal-400/30"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-4">
                        <p className="text-white font-semibold text-lg mb-3">
                          {pregunta.id}. {pregunta.texto}
                        </p>

                        {pregunta.imagen && (
                          <div className="flex justify-center mb-4 p-4 bg-gray-800/30 rounded-2xl">
                            <div className="text-center">
                              <div className="bg-white/10 p-4 rounded-xl inline-block">
                                <img
                                  src={pregunta.imagen}
                                  alt={`Ejercicio mecánico ${pregunta.id}`}
                                  className="max-w-full h-[25rem] mx-auto"
                                />
                              </div>
                              <p className="text-gray-400 text-sm mt-2">
                                Observa la situación mecánica
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Opciones */}
                      <div className="flex flex-wrap items-center justify-center gap-x-8">
                        {pregunta.opciones.map((opcion, index) => {
                          const isSelected = values[fieldName] === opcion;
                          return (
                            <motion.label
                              key={index}
                              className={`flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all border-2 w-40 text-center ${
                                isSelected
                                  ? "bg-teal-400/20 border-teal-400"
                                  : "bg-gray-800/50 border-gray-600 hover:border-teal-400/50"
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setFieldValue(fieldName, opcion)}
                            >
                              <Field
                                type="radio"
                                name={fieldName}
                                value={opcion}
                                checked={isSelected}
                                className="hidden"
                              />
                              <span className="text-white text-sm font-medium">
                                {opcion}
                              </span>
                            </motion.label>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Modal Envío Correcto */}
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

              {/* Modal Tiempo Agotado */}
              {timeUpModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
                  <div className="bg-gray-900 rounded-xl p-8 max-w-sm w-full text-center shadow-lg">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">
                      ⏰ ¡Se acabó el tiempo!
                    </h2>
                    <p className="text-gray-300 mb-6">
                      El tiempo ha finalizado. Intenta nuevamente.
                    </p>
                    <button
                      onClick={() => {
                        setTimeLeft(25 * 60);
                        resetForm();
                        setTimeUpModal(false);
                      }}
                      className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold hover:opacity-90 transition-all duration-300"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              )}

              {/* Botón Enviar */}
              <motion.div
                className="text-center mt-10"
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
                  className="px-8 py-4 rounded-full bg-teal-400 text-black font-bold text-lg shadow-lg border-2 border-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Respuestas"}
                </motion.button>
              </motion.div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
