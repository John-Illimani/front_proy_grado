import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import { motion } from "framer-motion";
import { posTests } from "../../../../api/api_tests";
import { questionsOrthography } from "../../questions/questions";
import { VerifyProgres } from "../progress";
import { TestHeader } from "../../../testHeader";
import { getStudentId } from "../studentId";
import { Cambios } from "../verify";

export const TestOrtografia = () => {
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 25 minutos
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const preguntas = questionsOrthography;

  // Inicializar valores de todas las preguntas como null
  const initialValues = {};
  preguntas.forEach((q) => {
    initialValues[`${q.id}`] = null;
  });

  // Temporizador
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Cuando se acaba el tiempo
      setModalMessage("⏰ Tiempo agotado. Inténtalo nuevamente.");
      setShowModal(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Enviar respuestas
  const handleSubmit = async (values, { setSubmitting }) => {
    const formattedValues = {};

    preguntas.forEach((pregunta, index) => {
      const respuestaCorrectaIndex = pregunta.opciones.findIndex(
        (op) => op === pregunta.respuesta
      );
      const seleccion = values[pregunta.id];
      formattedValues[pregunta.id] =
        seleccion === respuestaCorrectaIndex ? 1 : 0;
    });

    VerifyProgres(formattedValues, 8);
    const studentId = await getStudentId();
    await posTests(formattedValues, "skills", "orthography", studentId);

    setSubmitting(false);
    setModalMessage("✅ ¡Respuestas enviadas correctamente!");
    setShowModal(true);
  };

  // Reiniciar test
  const handleReset = (resetForm) => {
    resetForm();
    setTimeLeft(10 * 60);
    setShowModal(false);
  };

  return (
    <div className="h-full flex items-center justify-center relative overflow-hidden">
      {/* Fondo animado */}
      <motion.div
        className="absolute inset-0 dark:bg-[url('/fondo_marcelo.jpg')] dark:bg-cover dark:bg-center bg-gradient-to-br from-[#b9edfa]"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      <div className="absolute inset-0 "></div>

      <div className="relative z-10 w-full max-w-6xl px-6 py-10 h-full overflow-y-auto scrollbar-hide ">
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, isSubmitting, resetForm }) => (
            <Form>
              {/* Encabezado */}
              <TestHeader
                title={"TEST DE ORTOGRAFÍA"}
                description={"Ejercicios de Ortografía con Respuestas"}
              />

              {/* Introducción */}
              <motion.div
                className="from-white to-white text-black mb-8 bg-gradient-to-r dark:from-black/50 dark:to-gray-900/50 rounded-3xl p-6 shadow-2xl backdrop-blur-md border border-teal-400/30 dark:text-gray-200 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <p className="mb-4">
                  La ortografía es fundamental para una comunicación escrita
                  clara y efectiva. Este test evalúa tu conocimiento de las
                  reglas ortográficas del español.
                </p>
                <p className="mb-4">
                  Presta atención a detalles como: haber vs a ver, sino vs si
                  no, uso de B/V, G/J, H, y las reglas de acentuación.
                </p>
                <p className="dark:text-teal-300 text-black font-semibold">
                  💡 Consejo: Lee cada opción cuidadosamente y considera el
                  contexto de la frase.
                </p>
              </motion.div>

              {/* Temporizador */}
              <motion.div
                className="flex justify-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="dark:text-white text-2xl font-bold dark:bg-black/40 px-8 py-4 rounded-full border-2 border-black text-black shadow-xl dark:border-teal-400/50 ">
                  Tiempo: {formatTime(timeLeft)}
                </div>
              </motion.div>

              {/* Preguntas */}
              <motion.div
                className="max-h-[600px] overflow-y-auto px-6 scrollbar-hide "
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {preguntas.map((pregunta) => {
                  const fieldName = `${pregunta.id}`;
                  const correctIndex = pregunta.opciones.findIndex(
                    (op) => op === pregunta.respuesta
                  );

                  return (
                    <motion.div
                      key={pregunta.id}
                      className="mb-6 p-6 bg-gradient-to-r from-white dark:from-black/50 dark:to-gray-900/50 rounded-3xl shadow-2xl backdrop-blur-md border border-teal-400/30"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-4">
                        <p className="dark:text-white font-semibold  text-black text-lg mb-4">
                          {pregunta.id}. {pregunta.texto}
                        </p>
                      </div>

                      {/* Opciones */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pregunta.opciones.map((opcion, index) => (
                          <motion.label
                            key={index}
                            className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300  hover:bg-[color:yellow] dark:hover:bg-gray-600 ${
                              values[fieldName] === index
                                ? "dark:bg-teal-400/20 border-2 dark:border-teal-400"
                                : "dark:bg-gray-800/50  dark:border dark:border-gray-600 hover:border-teal-400/50 border-[5px] "
                            }`}
                            
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFieldValue(fieldName, index)}
                          >
                            <Field
                              type="radio"
                              name={fieldName}
                              value={index}
                              checked={values[fieldName] === index}
                              className="hidden"
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
              </motion.div>

              {/* Modal */}
              {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
                  <div className="bg-gray-900 rounded-xl p-8 max-w-sm w-full text-center shadow-lg border border-teal-400/40">
                    <h2 className="text-2xl font-bold text-teal-400 mb-4">
                      {modalMessage.includes("Tiempo")
                        ? "⏰ Tiempo agotado"
                        : "✅ Envío exitoso"}
                    </h2>
                    <p className="text-gray-300 mb-6">{modalMessage}</p>
                    <button
                      onClick={() => handleReset(resetForm)}
                      className="px-6 py-2 bg-teal-500 text-white rounded-xl font-bold hover:opacity-90 transition-all duration-300"
                    >
                      Reiniciar
                    </button>
                  </div>
                </div>
              )}

              {/* Botón de enviar */}
              <motion.div
                className="text-center mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  
                  onClick={() => Cambios()}
                  whileTap={{ scale: 0.95 }}
                  className="hover:scale-95 px-8 py-4 rounded-full dark:from-teal-400 dark:to-teal-400 dark:text-black font-bold text-lg shadow-lg border-2 border-teal-400 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#053F5C] to-[#0c7fb8]  duration-400  transition-all "
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
