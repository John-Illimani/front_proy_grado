import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import { motion } from "framer-motion";
import { posTests } from "../../../../api/api_tests";
import { questionsAbstract } from "../../questions/questions";
import { VerifyProgres } from "../progress";
import { TestHeader } from "../../../testHeader";
import { getStudentId } from "../studentId";
import { Cambios } from "../verify";

export const TestRazonamientoAbstracto = ({ nombre = "JOHN" }) => {
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutos
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  const preguntas = questionsAbstract;

  // Valores iniciales de todas las preguntas
  const initialValues = {};
  preguntas.forEach((pregunta) => {
    initialValues[`${pregunta.id}`] = "";
  });

  // Temporizador
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowTimeoutModal(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Al enviar respuestas
  const handleSubmit = async (values, { setSubmitting }) => {
    const respuestasEvaluadas = {};
    preguntas.forEach((pregunta) => {
      respuestasEvaluadas[pregunta.id] =
        values[pregunta.id] === pregunta.respuesta ? 1 : 0;
    });

    VerifyProgres(respuestasEvaluadas, 6);
    const studentId = await getStudentId();
    await posTests(
      respuestasEvaluadas,
      "skills",
      "abstract_reasoning",
      studentId
    );
    setSubmitting(false);
    setShowSubmitModal(true);
  };

  // Reiniciar cuando se acaba el tiempo
  const handleTimeoutReset = (resetForm) => {
    resetForm();
    setTimeLeft(30 * 60);
    setShowTimeoutModal(false);
  };

  return (
    <div className="h-screen flex justify-center relative overflow-hidden">
      {/* Fondo */}
      <motion.div
        className="absolute inset-0 bg-[url('/fondo_marcelo.jpg')] bg-cover bg-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity }}
      />

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-7xl px-6 py-10 h-full overflow-y-auto scrollbar-hide">
        {/* Encabezado */}
        <TestHeader
          title={"TEST DE RAZONAMIENTO ABSTRACTO"}
          description={"Ejercicios Resueltos de Patrones y Secuencias Visuales"}
        />

        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, isSubmitting, setFieldValue, resetForm }) => (
            <Form>
              {/* Introducción */}
              <motion.div
                className="mb-8 bg-gradient-to-r from-black/50 to-gray-900/50 rounded-3xl p-6 shadow-2xl backdrop-blur-md border border-teal-400/30 text-gray-200 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="mb-4">
                  El razonamiento abstracto evalúa tu capacidad para identificar
                  patrones, relaciones lógicas y principios de organización en
                  secuencias de figuras y formas geométricas.
                </p>
                <p className="mb-4">
                  Para cada ejercicio, analiza cuidadosamente los patrones
                  visuales presentados y selecciona la alternativa correcta.
                </p>
                <p className="text-teal-300 font-semibold">
                  💡 Consejo: Busca patrones de rotación, simetría, secuencias y
                  transformaciones.
                </p>
              </motion.div>

              {/* Temporizador */}
              <motion.div
                className="flex justify-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
              >
                {preguntas.map((pregunta) => (
                  <motion.div
                    key={pregunta.id}
                    className="mb-8 p-6 bg-gradient-to-r from-black/50 to-gray-900/50 rounded-3xl shadow-2xl backdrop-blur-md border border-teal-400/30"
                    whileHover={{ scale: 1.01 }}
                  >
                    <p className="text-white font-semibold text-lg mb-3">
                      {pregunta.id}. {pregunta.texto}
                    </p>

                    {/* Imagen */}
                    {pregunta.imagen && (
                      <div className="flex justify-center mb-4 p-4 bg-gray-800/30 rounded-2xl">
                        <img
                          src={pregunta.imagen}
                          alt={`Patrón ${pregunta.id}`}
                          className="max-w-full h-[20rem] rounded-xl"
                        />
                      </div>
                    )}

                    {/* Opciones */}
                    <div className="flex flex-wrap items-center justify-center gap-6">
                      {pregunta.opciones.map((opcion, idx) => (
                        <motion.label
                          key={idx}
                          className={`flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all border-2 w-32 ${
                            values[pregunta.id] === opcion
                              ? "bg-teal-400/20 border-teal-400"
                              : "bg-gray-800/50 border-gray-600 hover:border-teal-400/50"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFieldValue(pregunta.id, opcion)}
                        >
                          <Field
                            type="radio"
                            name={pregunta.id}
                            value={opcion}
                            checked={values[pregunta.id] === opcion}
                            className="hidden"
                          />
                          <span className="text-white text-sm font-medium">
                            {String.fromCharCode(97 + idx)}) {opcion}
                          </span>
                        </motion.label>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Modal tiempo agotado */}
              {showTimeoutModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
                  <div className="bg-gray-900 rounded-xl p-8 max-w-sm w-full text-center shadow-lg">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">
                      ¡Se acabó el tiempo!
                    </h2>
                    <p className="text-gray-300 mb-6">Intenta nuevamente.</p>
                    <button
                      onClick={() => handleTimeoutReset(resetForm)}
                      className="px-6 py-2 bg-teal-500 text-white rounded-xl font-bold hover:opacity-90 transition-all duration-300"
                    >
                      Reiniciar Test
                    </button>
                  </div>
                </div>
              )}

              {/* Modal envío */}
              {showSubmitModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                  <div className="bg-gray-900 rounded-xl p-8 max-w-sm w-full text-center shadow-lg">
                    <h2 className="text-2xl font-bold text-teal-400 mb-4">
                      ¡Enviado correctamente!
                    </h2>
                    <p className="text-gray-300 mb-6">
                      Tus respuestas se han guardado exitosamente.
                    </p>
                    <button
                      onClick={() => setShowSubmitModal(false)}
                      className="px-6 py-2 bg-teal-500 text-white rounded-xl font-bold hover:opacity-90 transition-all duration-300"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}

              {/* Botón enviar */}
              <motion.div
                className="text-center mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
                  className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg border-2 ${
                    isSubmitting
                      ? "bg-gray-500 text-gray-200 border-gray-500 cursor-not-allowed"
                      : "bg-teal-400 text-black border-teal-400"
                  }`}
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
