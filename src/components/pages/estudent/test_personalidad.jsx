import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import { motion } from "framer-motion";
import { questionsPersonality } from "../questions/questions.js";
import { posTests } from "../../../api/api_tests";
import { getUsers } from "../../../api/api_user.jsx";
import { getStudents } from "../../../api/api_student.jsx";
import {
  addStudentTest,
  getStudentTests,
  updateStudentTest,
} from "../../../api/api_estudent_test.jsx";
import { VerifyProgres } from "./progress.js";
import { getStudentId } from "./studentId.js";
import { Cambios } from "./verify.js";
import { TestHeader } from "../../testHeader.jsx";
import { span } from "framer-motion/client";

export const Test_personalidad = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;
  const totalPages = Math.ceil(162 / questionsPerPage);
  const [showModal, setShowModal] = useState(false);

  const questions = questionsPersonality;

  // Crear objeto inicial con todas las preguntas como null
  const initialValues = {};
  questions.forEach((_, index) => {
    initialValues[`${index + 1}`] = null;
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    VerifyProgres(values, 3);
    // -------------------------
    const studentId = await getStudentId();

    await posTests(values, "personality", "", studentId);
    setSubmitting(false);
    setShowModal(true);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Calcular preguntas para la página actual
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  const description = () => {
    return (
      <span>
        Califica cada afirmación según tu grado de acuerdo <br />
        (1 = Muy en desacuerdo, 5 = Muy de acuerdo)
      </span>
    );
  };

  return (
    <div className="relative text-white min-h-screen overflow-hidden h-full">

      <div className="absolute inset-0"></div> {/* overlay oscuro */}
      <div className="relative z-10 max-w-5xl mx-auto pt-6 px-6">
        {/* Encabezado */}
        <TestHeader title={"Test de Personalidad"} description={description()} />
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, isSubmitting, setFieldValue, setSubmitting }) => (
            <Form>
              {/* Encabezado */}
              <motion.div
                className="text-center mb-5"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Barra de progreso */}
                <div className="mt-6 dark:bg-gray-700/40 bg-yellow-300 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r dark:from-purple-400 dark:to-pink-400 from-red-700 to-red-700 h-3"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(currentPage / totalPages) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
                <p className="mt-2 text-sm dark:ext-gray-400 text-black font-bold ">
                  Página {currentPage} de {totalPages}
                </p>
              </motion.div>

              {/* Preguntas */}
              <div className="space-y-4 md:space-y-6 overflow-y-auto max-h-[55vh] scrollbar-hide">
                {currentQuestions.map((question, index) => {
                  const questionId = indexOfFirstQuestion + index + 1;
                  const fieldName = `${questionId}`;

                  return (
                    <motion.div
                      key={questionId}
                      className="p-5  bg-gradient-to-r from-white to-white dark:from-black/50 dark:to-gray-900/50 rounded-2xl border border-purple-500/30 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-400/40"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <p className="mb-4 text-lg font-medium dark:text-purple-300 text-black">
                        <span className="dark:text-pink-400 text-blue-600 font-bold">
                          {questionId}.
                        </span>{" "}
                        {question}
                      </p>

                      <div className="flex flex-col sm:flex-row items-center justify-between">
                        <span className=" dark:text-gray-400 text-black mb-2 sm:mb-0">
                          Muy en desacuerdo
                        </span>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <label
                              key={value}
                              className="inline-flex items-center cursor-pointer"
                            >
                              <Field
                                type="radio"
                                name={fieldName}
                                value={String(value)}
                                className="hidden peer"
                              />
                              <motion.span
                                whileHover={{
                                  scale: 1.1,
                                  boxShadow:
                                    "0 0 15px rgba(192, 132, 252, 0.5)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                className={`h-10 w-10 flex items-center dark:border-none border-2 border-black text-black peer-checked:bg-lime-400 justify-center rounded-full dark:bg-gray-700/50 dark:peer-checked:bg-purple-500/80 dark:peer-checked:text-white dark:text-purple-400 font-semibold transition-all duration-300 ${
                                  values[fieldName] === String(value)
                                    ? "dark:bg-purple-500/80 dark:text-white "
                                    : ""
                                }`}
                                onClick={() =>
                                  setFieldValue(fieldName, String(value))
                                }
                              >
                                {value}
                              </motion.span>
                            </label>
                          ))}
                        </div>
                        <span className=" dark:text-gray-400 text-black mt-2 sm:mt-0">
                          Muy de acuerdo
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Modal */}
              {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                  <div className="bg-gray-900 rounded-xl p-8 max-w-sm w-full text-center shadow-lg">
                    <h2 className="text-2xl font-bold text-pink-500 mb-4">
                      ¡Enviado correctamente!
                    </h2>
                    <p className="text-gray-300 mb-6">
                      Tu formulario ha sido enviado exitosamente.
                    </p>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 bg-pink-500 text-white rounded-xl font-bold hover:opacity-90 transition-all duration-300"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-between my-4">
                <motion.button
                  type="button"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  whileHover={
                    currentPage !== 1
                      ? {
                          scale: 1.05,
                          boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)",
                        }
                      : {}
                  }
                  whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                  className={`px-6 py-2 rounded-xl font-bold transition-all duration-300 ${
                    currentPage === 1
                      ? "opacity-0"
                      : "bg-gradient-to-r dark:from-purple-500 dark:to-pink-500 from-lime-800 to-lime-400  hover:opacity-90 hover:shadow-purple-400/40 text-white shadow-lg "
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
                    className={`px-6 py-2 rounded-xl font-bold bg-gradient-to-r dark:from-pink-500 dark:to-rose-600 from-[#053F5C] to-[#0c7fb8] text-white shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-pink-400/40 ${
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
                      boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r dark:from-purple-500 dark:to-indigo-600 from-lime-400 to-lime-800 hover:opacity-90 hover:shadow-purple-400/40 text-white shadow-lg transition-all duration-300"
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
