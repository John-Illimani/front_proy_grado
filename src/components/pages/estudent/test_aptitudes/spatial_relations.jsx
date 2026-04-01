import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import { motion } from "framer-motion";
import { posTests } from "../../../../api/api_tests";
import { VerifyProgres } from "../progress";
import { TestHeader } from "../../../testHeader";
import { getStudentId } from "../studentId";
import { Cambios } from "../verify";
import { questionsSpatialReasoning } from "../../questions/questions";

export const TestRazonamientoEspacial = () => {
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  const preguntas = questionsSpatialReasoning;

  const initialValues = {};
  preguntas.forEach((pregunta) => {
    initialValues[`${pregunta.id}`] = "";
  });

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

  const handleSubmit = async (values, { setSubmitting }) => {
    const respuestasEvaluadas = {};
    preguntas.forEach((pregunta) => {
      respuestasEvaluadas[pregunta.id] =
        values[pregunta.id] === pregunta.respuesta ? 1 : 0;
    });

    VerifyProgres(respuestasEvaluadas, 11);
    const studentId = await getStudentId();
    await posTests(respuestasEvaluadas, "skills", "spatial_reasoning", studentId);
    setSubmitting(false);
    setShowSubmitModal(true);
  };

  const handleTimeoutReset = (resetForm) => {
    resetForm();
    setTimeLeft(45 * 60);
    setShowTimeoutModal(false);
  };

  return (
    <div className="h-full flex justify-center relative overflow-hidden">
      {/* Fondo animado */}
      <motion.div
        className="absolute inset-0 dark:bg-[url('/fondo_marcelo.jpg')] dark:bg-cover dark:bg-center bg-gradient-to-br from-[#b9edfa]"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity }}
      />

      <div className="relative z-10 w-full max-w-6xl px-6 py-10 overflow-y-auto scrollbar-hide">
        <TestHeader
          title={"TEST DE RAZONAMIENTO ESPACIAL"}
          description={"Instrumento adaptado del 'Spatial Reasoning Instrument' (SRI)"}
        />

        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, isSubmitting, setFieldValue, resetForm }) => (
            <Form>
              {/* Descripción */}
              <motion.div
                className="mb-8 bg-gradient-to-r from-white to-white text-black dark:from-black/50 dark:to-gray-900/50 rounded-3xl p-6 shadow-2xl backdrop-blur-md border border-teal-400/30 dark:text-gray-200 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="mb-4">
                  Este cuestionario evalúa tu capacidad de razonamiento espacial, 
                  rotación mental y visualización de objetos en distintas posiciones.
                </p>
                <p>
                  Tienes 45 minutos para completar las 30 preguntas. 
                  Observa cada imagen cuidadosamente antes de elegir tu respuesta.
                </p>
              </motion.div>

              {/* Temporizador */}
              <motion.div className="flex justify-center mb-8">
                <div className="dark:text-white text-2xl font-bold dark:bg-black/40 px-8 py-4 rounded-full border-2 border-black dark:border-teal-400/50 text-black shadow-xl">
                  Tiempo: {formatTime(timeLeft)}
                </div>
              </motion.div>

              {/* Preguntas */}
              <div className="max-h-[800px] overflow-y-auto px-6 scrollbar-hide">
                {preguntas.map((pregunta) => (
                  <div
                    key={pregunta.id}
                    className="mb-6 p-6 bg-gradient-to-r dark:from-black/50 dark:to-gray-900/50 from-white to-white rounded-3xl shadow-2xl backdrop-blur-md border border-teal-400/30"
                  >
                    <p className="dark:text-white text-black font-semibold text-lg mb-4">
                      {pregunta.id}.- {pregunta.texto}
                    </p>

                    {/* Imagen de la pregunta */}
                    {pregunta.imagen && (
                      <div className="flex justify-center mb-4">
                        <img
                          src={pregunta.imagen}
                          alt={`Pregunta ${pregunta.id}`}
                          className="max-w-full md:max-w-lg rounded-xl border border-gray-600 shadow-lg"
                        />
                      </div>
                    )}

                    {/* Opciones */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pregunta.opciones.map((opcion, idx) => (
                        <label
                          key={idx}
                          className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all hover:bg-[color:yellow] ${
                            values[pregunta.id] === opcion
                              ? "dark:bg-teal-400/20 border-2 dark:border-teal-400 "
                              : "dark:bg-gray-800/50 dark:border hover:border-teal-400/50 border-[5px]"
                          }`}
                          onClick={() => setFieldValue(pregunta.id, opcion)}
                        >
                          <Field
                            type="radio"
                            name={pregunta.id}
                            value={opcion}
                            checked={values[pregunta.id] === opcion}
                            className="mr-3 h-5 w-5 text-teal-400"
                          />
                          <span className=" dark:text-white text-black font-bold">
                            {String.fromCharCode(97 + idx)}) {opcion}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal de tiempo agotado */}
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

              {/* Modal de envío */}
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
              <div className="text-center mt-10">
                <motion.button
                  type="submit"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "#14B8A6",
                    color: "#000",
                  }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSubmitting}
                  onClick={() => Cambios()}
                  className={`hover:scale-95 py-2 px-4 md:px-8 md:py-4 rounded-full dark:from-teal-400 dark:to-teal-400  dark:text-black  font-bold text-base md:text-lg shadow-lg border-2  dark:border-teal-400 border-cyan-800 bg-gradient-to-r from-[#053F5C] to-[#0c7fb8]  duration-400  transition-all disabled:opacity-50 hover:shadow-2xl ${
                    isSubmitting
                      ? "dark:bg-gray-500 dark:text-gray-200 border-gray-500 cursor-not-allowed"
                      : "dark:bg-teal-400 dark:text-blackborder-teal-400"
                  }`}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Respuestas"}
                </motion.button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
