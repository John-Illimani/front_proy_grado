import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import { motion } from "framer-motion";

import {
  ipdeQuestions,
  psychotechnicalQuestions,
  personalityQuestions,
} from "../questions/questions.js";
import { posTests } from "../../../api/api_tests.jsx";

import { VerifyProgres } from "./progress.js";
import { getStudentId } from "./studentId.js";
import { Cambios } from "./verify.js";
import { TestHeader } from "../../testHeader.jsx";

export const Test_colmil = () => {
  const [currentSection, setCurrentSection] = useState("ipde");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const questionsPerPage = 10;

  // Inicializar valores de Formik
  const initialValues = {};
  [
    ...ipdeQuestions,
    ...psychotechnicalQuestions,
    ...personalityQuestions,
  ].forEach((_, index) => {
    initialValues[`${index + 99}`] = null;
  });

  // Función de submit
  const handleSubmit = async (values, { setSubmitting }) => {
    VerifyProgres(values, 2);

    const studentId = await getStudentId();
    // ---------------------------

    // -------------------------------------------------------
    try {
      // Determinar preguntas actuales según sección
      let startIndex = 0;
      let endIndex = 0;
      let nameQuestion = "";

      if (currentSection === "ipde") {
        startIndex = 0;
        endIndex = ipdeQuestions.length;
        nameQuestion = "ipde";
      } else if (currentSection === "psychotechnical") {
        startIndex = ipdeQuestions.length;
        endIndex = ipdeQuestions.length + psychotechnicalQuestions.length;
        nameQuestion = "psychotechnical";
      } else {
        startIndex = ipdeQuestions.length + psychotechnicalQuestions.length;
        endIndex =
          ipdeQuestions.length +
          psychotechnicalQuestions.length +
          personalityQuestions.length;
        nameQuestion = "personality";
      }

      // Extraer solo las respuestas del formulario actual
      const currentFormValues = {};
      for (let i = startIndex; i < endIndex; i++) {
        const key = `${i + 99}`;
        currentFormValues[key] = values[key];
      }

      await posTests(currentFormValues, "colmil", nameQuestion, studentId);
      setShowModal(true);
    } catch (error) {
      console.error("Error al enviar test:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Obtener preguntas actuales por sección y página
  const getCurrentQuestions = () => {
    const indexOfLastQuestion = currentPage * questionsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;

    if (currentSection === "ipde") {
      return ipdeQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
    } else if (currentSection === "psychotechnical") {
      return psychotechnicalQuestions.slice(
        indexOfFirstQuestion,
        indexOfLastQuestion
      );
    } else {
      return personalityQuestions.slice(
        indexOfFirstQuestion,
        indexOfLastQuestion
      );
    }
  };

  const currentQuestions = getCurrentQuestions();

  const totalPages = Math.ceil(
    currentSection === "ipde"
      ? ipdeQuestions.length / questionsPerPage
      : currentSection === "psychotechnical"
      ? psychotechnicalQuestions.length / questionsPerPage
      : personalityQuestions.length / questionsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="relative text-white overflow-hidden h-full">
      {/* Fondo */}
      <motion.div
        className="absolute inset-0 dark:bg-[url('/fondo_marcelo.jpg')] dark:bg-cover dark:bg-center bg-gradient-to-br from-[#b9edfa]"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      <div className="absolute inset-0"></div>

      <div className="relative z-10 max-w-5xl mx-auto pt-6 px-6 ">
        {/* Encabezado */}
        <TestHeader
          title={"TEST - COLMIL"}
          description={"PRUEBA PSICOLÓGICA Y PSICOTÉCNICA"}
        />
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, isSubmitting, setFieldValue }) => {
            const indexOfFirstQuestion = (currentPage - 1) * questionsPerPage;

            return (
              <Form>
                {/* Encabezado */}
                <motion.div
                  className="text-center mb-5"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Selector de sección */}
                  <div className="flex justify-center gap-4 mt-6">
                    {["ipde", "psychotechnical", "personality"].map(
                      (section) => (
                        <button
                          type="button"
                          key={section}
                          onClick={() => {
                            setCurrentSection(section);
                            setCurrentPage(1);
                          }}
                          className={`
    px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold transition-all duration-300 dark:border-none border-2 border-black shadow-lg dark:shadow-none
    ${
      currentSection === section
        ? "dark:bg-cyan-600 dark:text-white shadow-lg bg-[#077d9b] text-white  "
        : "dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-600/50 bg-white text-black hover:scale-105 active:scale-95"
    }
  `}
                        >
                          {section === "ipde"
                            ? "Cuestionario IPDE"
                            : section === "psychotechnical"
                            ? "Prueba Psicotécnica"
                            : "Test de Personalidad"}
                        </button>
                      )
                    )}
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-6 dark:bg-gray-700/40 bg-yellow-300 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r dark:dark:from-cyan-400 dark:to-green-400 bg-red-700 h-3"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(currentPage / totalPages) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    ></motion.div>
                  </div>
                  <p className="mt-2 text-sm dark:text-gray-400 text-black font-bold">
                    Página {currentPage} de {totalPages} -{" "}
                    {currentSection === "ipde"
                      ? "Cuestionario IPDE"
                      : currentSection === "psychotechnical"
                      ? "Prueba Psicotécnica"
                      : "Test de Personalidad"}
                  </p>
                </motion.div>

                {/* Preguntas */}
                <div className="space-y-4 md:space-y-6 max-h-[45vh] overflow-y-auto px-2 scrollbar-hide">
                  {currentQuestions.map((question, index) => {
                    const sectionOffset =
                      currentSection === "ipde"
                        ? 0
                        : currentSection === "psychotechnical"
                        ? ipdeQuestions.length
                        : ipdeQuestions.length +
                          psychotechnicalQuestions.length;

                    const questionId =
                      sectionOffset + indexOfFirstQuestion + index + 99;
                    const fieldName = `${questionId}`;

                    return (
                      <motion.div
                        key={questionId}
                        className="p-3 md:p-5  bg-gradient-to-r from-white to-white dark:from-black/50 dark:to-gray-900/50 rounded-2xl border border-cyan-500/30 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-400/40"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      >
                        <p className="mb-4 text-lg font-medium dark:text-cyan-300 text-black">
                          <span className="dark:text-green-400 text-blue-600 font-bold">
                            {indexOfFirstQuestion + index + 1}.
                          </span>{" "}
                          {currentSection === "personality"
                            ? question.question
                            : question}
                        </p>

                        <div className="flex flex-wrap gap-4">
                          {currentSection === "personality"
                            ? question.options.map((option, optIndex) => (
                                <label
                                  key={optIndex}
                                  className="inline-flex items-center cursor-pointer"
                                >
                                  <Field
                                    type="radio"
                                    name={fieldName}
                                    value={option}
                                    className="hidden peer"
                                  />
                                  <motion.span
                                  
                                    whileTap={{ scale: 0.95 }}
                                    className={`dark:border-none border-2 peer-checked:bg-lime-400 border-black text-black px-4 py-2 rounded-lg dark:bg-gray-700/50 dark:peer-checked:bg-cyan-500/80 dark:peer-checked:text-white dark:text-cyan-400 font-semibold transition-all duration-300 ${
                                      values[fieldName] === option
                                        ? "dark:bg-cyan-500/80 dark:text-white"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      setFieldValue(fieldName, option)
                                    }
                                  >
                                    {option}
                                  </motion.span>
                                </label>
                              ))
                            : ["SI", "NO"].map((option, optIndex) => (
                                <label
                                  key={optIndex}
                                  className="inline-flex items-center cursor-pointer"
                                >
                                  <Field
                                    type="radio"
                                    name={fieldName}
                                    value={
                                      currentSection === "ipde"
                                        ? option === "SI"
                                          ? "V"
                                          : "F"
                                        : option
                                    }
                                    className="hidden peer"
                                  />
                                  <motion.span
                                    // whileHover={{
                                    //   scale: 1.05,
                                    //   boxShadow:
                                    //     option === "SI"
                                    //       ? "0 0 15px rgba(20,184,166,0.5)"
                                    //       : "0 0 15px rgba(239,68,68,0.5)",
                                    // }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`text-sm md:text-base px-2 py-1 md:px-4 md:py-2 rounded-lg dark:bg-gray-700/50 dark:border-none border-2 border-black ${
                                      option === "SI"
                                        ? "dark:peer-checked:bg-green-500/80 dark:peer-checked:text-white dark:text-green-400 text-black"
                                        : "dark:peer-checked:bg-red-500/80 dark:peer-checked:text-white dark:text-red-400 text-black"
                                    } font-semibold transition-all duration-300 ${
                                      values[fieldName] ===
                                      (currentSection === "ipde"
                                        ? option === "SI"
                                          ? "V"
                                          : "F"
                                        : option)
                                        ? option === "SI"
                                          ? "dark:bg-green-500/80 dark:text-white bg-lime-400"
                                          : "dark:bg-red-500/80 dark:text-white bg-lime-400"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      setFieldValue(
                                        fieldName,
                                        currentSection === "ipde"
                                          ? option === "SI"
                                            ? "V"
                                            : "F"
                                          : option
                                      )
                                    }
                                  >
                                    {option === "SI"
                                      ? currentSection === "ipde"
                                        ? "V"
                                        : "Sí"
                                      : currentSection === "ipde"
                                      ? "F"
                                      : "No"}
                                  </motion.span>
                                </label>
                              ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Modal */}
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
                <div className="flex justify-between my-4">
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
                        ? "opacity-0"
                        : "bg-gradient-to-br dark:from-cyan-500 dark:to-green-500 from-lime-800 to-lime-400  hover:opacity-90 hover:shadow-cyan-400/40 text-white shadow-lg"
                    }`}
                  >
                    Anterior
                  </motion.button>

                  {currentPage === totalPages ? (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-[#053F5C] to-[#0c7fb8]  dark:from-green-500 dark:to-emerald-600 text-white shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-green-400/40 ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={() => Cambios()}
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
                      className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 from-lime-400 to-lime-800 hover:opacity-90 hover:shadow-cyan-400/40 text-white shadow-lg transition-all duration-300"
                    >
                      Siguiente
                    </motion.button>
                  )}
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};
