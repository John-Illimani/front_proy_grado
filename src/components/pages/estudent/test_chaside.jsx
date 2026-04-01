import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import { motion } from "framer-motion";
import { posTests } from "../../../api/api_tests";
import { questionsChaside } from "../questions/questions";

import { VerifyProgres } from "./progress";
import { getStudentId } from "./studentId";
import { Cambios } from "./verify";
import { TestHeader } from "../../testHeader";

export const Test_chaside = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;
  const totalPages = Math.ceil(98 / questionsPerPage);
  const [showModal, setShowModal] = useState(false);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const questions = questionsChaside;

 
  const initialValues = {};
  questions.forEach((_, index) => {
    initialValues[`${index + 1}`] = null;
  });

const handleSubmit = async (values, { setSubmitting }) => {
  VerifyProgres(values, 1);

  // 🔹 Crear un objeto asegurando que TODAS las preguntas estén incluidas
  const respuestasCompletas = {};
  questions.forEach((_, index) => {
    const key = `${index + 1}`;
    // Si el campo no existe o fue eliminado, lo reponemos como null
    respuestasCompletas[key] =
      values[key] !== undefined ? values[key] : null;
  });

  const studentId = await getStudentId();

  // 🔹 Enviar todas las respuestas (null incluidas)
  await posTests(respuestasCompletas, "chaside", "", studentId);

  setSubmitting(false);
  setShowModal(true);
};


  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  return (
    <div className="relative text-white overflow-hidden h-full">
      {/* Fondo pulsante */}
      <motion.div
        className="absolute inset-0 dark:bg-[url('/fondo_marcelo.jpg')] dark:bg-cover dark:bg-center bg-gradient-to-br from-[#b9edfa]"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      <div className="absolute inset-0 "></div>

      <div className="relative z-10 max-w-5xl h-full mx-auto py-12 px-6 overflow-y-auto scrollbar-hide">
        {/* Encabezado */}
        <TestHeader
          title={"Test de Orientación Vocacional (CHASIDE)"}
          description={
            "Responde sinceramente para descubrir tus intereses y aptitudes profesionales."
          }
        />
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, isSubmitting, setFieldValue, setSubmitting }) => (
            <Form>
              {/* Encabezado */}
              <motion.div
                className="text-center mb-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Barra de progreso */}
                <div className="mt-6 dark:bg-gray-700/40 bg-yellow-300 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r dark:from-cyan-400 dark:to-green-400 bg-red-700 h-3"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentPage / totalPages) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
                <p className="mt-2 text-sm dark:text-gray-400 text-black font-bold">
                  Página {currentPage} de {totalPages}
                </p>
              </motion.div>
              {/* Preguntas */}
              <div className="space-y-6">
                {currentQuestions.map((question, index) => {
                  const questionId = indexOfFirstQuestion + index + 1;
                  const fieldName = `${questionId}`;

                  return (
                    <motion.div
                      key={questionId}
                      className="p-5  bg-gradient-to-r dark:from-black/50 dark:to-gray-900/50 from-white to-white rounded-2xl border border-cyan-500/30 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-400/40"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <p className="mb-4 text-lg font-medium dark:text-cyan-300 text-black ">
                        <span className="dark:text-green-400 text-black font-bold ">
                          {questionId}
                        </span>{" "}
                        {question}
                      </p>
                      <div className="flex space-x-6">
                        <label className="inline-flex items-center cursor-pointer ">
                          <Field
                            type="radio"
                            name={fieldName}
                            value="SI"
                            className="hidden peer"
                          />
                          <motion.span
                            whileHover={{
                              scale: 1.05,
                              boxShadow: "0 0 15px rgba(20,184,166,0.5)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            className={` px-4 py-2 rounded-lg dark:shadow-none dark:bg-gray-700/50 text-black dark:border border-2  dark:peer-checked:bg-green-500/80 peer-checked:bg-lime-400/90  dark:peer-checked:text-white peer-checked:text-black dark:text-green-400 font-semibold transition-all duration-300 ${
                              values[fieldName] === "SI"
                                ? "dark:bg-green-500/80 dark:text-white "
                                : ""
                            }`}
                            onClick={() => setFieldValue(fieldName, "SI")}
                          >
                            SÍ
                          </motion.span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                          <Field
                            type="radio"
                            name={fieldName}
                            value="NO"
                            className="hidden peer"
                          />
                          <motion.span
                            whileHover={{
                              scale: 1.05,
                              boxShadow: "0 0 15px rgba(239,68,68,0.5)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            className={`dark:border px-4 py-2 rounded-lg dark:bg-gray-700/50 text-black border-2 dark:peer-checked:bg-red-500/80 dark:peer-checked:text-white peer-checked:bg-[color:yellow] peer-checked:text-black dark:text-red-400 font-semibold transition-all duration-300 ${
                              values[fieldName] === "NO"
                                ? "bg-red-500/80 text-white"
                                : ""
                            }`}
                            onClick={() => setFieldValue(fieldName, "NO")}
                          >
                            NO
                          </motion.span>
                        </label>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* la modal  */}

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

              {/* Botones */}

              <div className="flex justify-between mt-8">
                <motion.button
                  type="button"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  whileHover={
                    currentPage !== 1
                      ? {
                          scale: 1.05,
                          boxShadow: "0 0 15px rgba(56,189,248,0.5)",
                        }
                      : {}
                  }
                  whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                  className={`px-6 py-2 rounded-xl font-bold transition-all duration-300 ${
                    currentPage === 1
                      ? "dark:bg-gray-600/50 dark:text-gray-400 cursor-not-allowed  opacity-0 "
                      : " dark:from-cyan-500 dark:to-green-500 bg-gradient-to-br from-lime-800 to-lime-400  hover:opacity-90 hover:shadow-cyan-400/40 text-white shadow-lg"
                  }`}
                >
                  Anterior
                </motion.button>

                {currentPage === totalPages ? (
                  <button
                    type="button" 
                    onClick={async () => {
                      setSubmitting(true); 
                      await handleSubmit(values, { setSubmitting }); 
                      setSubmitting(false);
                      Cambios();
                    }}
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-[#053F5C] to-[#0c7fb8]  text-white shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-green-400/40 ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Test"}
                  </button>
                ) : (
                  <motion.button
                    type="button"
                    onClick={nextPage}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 15px rgba(6,182,212,0.5)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 from-lime-400 to-lime-800  hover:opacity-90 hover:shadow-cyan-400/40 text-white shadow-lg transition-all duration-300"
                  >
                    Siguiente
                  </motion.button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
