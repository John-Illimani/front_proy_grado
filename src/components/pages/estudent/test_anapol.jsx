import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import { motion } from "framer-motion";
import {
  matematicaQuestions,
  fisicaQuimicaQuestions,
  filosofiaQuestions,
  psicologiaQuestions,
  literaturaQuestions,
  biologiaQuestions,
  cienciasSocialesQuestions,
} from "../questions/questions";

// Función para enviar los tests (simulada)
const posTests = async (data, type, name) => {
  console.log("Enviando test:", { data, type, name });
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const Test_anapol = () => {
  const [currentSection, setCurrentSection] = useState("fisicaQuimica");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const questionsPerPage = 3;

  // Inicializar valores de Formik
  const initialValues = {};

  // Calcular el total de preguntas para inicializar valores
  const allQuestions = [
    ...fisicaQuimicaQuestions,
    ...filosofiaQuestions,
    ...psicologiaQuestions,
    ...literaturaQuestions,
    ...biologiaQuestions,
    ...cienciasSocialesQuestions,
    ...matematicaQuestions,
  ];

  allQuestions.forEach((_, index) => {
    initialValues[`${index + 1}`] = null;
  });

  // Función de submit
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Determinar preguntas actuales según sección
      let startIndex = 0;
      let endIndex = 0;
      let nameQuestion = currentSection;

      // Calcular índices según la sección actual
      const sections = {
        fisicaQuimica: { start: 0, length: fisicaQuimicaQuestions.length },
        filosofia: {
          start: fisicaQuimicaQuestions.length,
          length: filosofiaQuestions.length,
        },
        psicologia: {
          start: fisicaQuimicaQuestions.length + filosofiaQuestions.length,
          length: psicologiaQuestions.length,
        },
        literatura: {
          start:
            fisicaQuimicaQuestions.length +
            filosofiaQuestions.length +
            psicologiaQuestions.length,
          length: literaturaQuestions.length,
        },
        biologia: {
          start:
            fisicaQuimicaQuestions.length +
            filosofiaQuestions.length +
            psicologiaQuestions.length +
            literaturaQuestions.length,
          length: biologiaQuestions.length,
        },
        cienciasSociales: {
          start:
            fisicaQuimicaQuestions.length +
            filosofiaQuestions.length +
            psicologiaQuestions.length +
            literaturaQuestions.length +
            biologiaQuestions.length,
          length: cienciasSocialesQuestions.length,
        },
        matematica: {
          start:
            fisicaQuimicaQuestions.length +
            filosofiaQuestions.length +
            psicologiaQuestions.length +
            literaturaQuestions.length +
            biologiaQuestions.length +
            cienciasSocialesQuestions.length,
          length: matematicaQuestions.length,
        },
      };

      const currentSectionData = sections[currentSection];
      startIndex = currentSectionData.start;
      endIndex = startIndex + currentSectionData.length;

      // Extraer solo las respuestas del formulario actual
      const currentFormValues = {};
      for (let i = startIndex; i < endIndex; i++) {
        const key = `${i + 1}`;
        currentFormValues[key] = values[key];
      }

      await posTests(currentFormValues, "anapol", nameQuestion);
      setShowModal(true);
    } catch (error) {
      console.error("Error al enviar test:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Obtener preguntas actuales por sección
  const getCurrentQuestions = () => {
    const indexOfLastQuestion = currentPage * questionsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;

    let questions = [];
    switch (currentSection) {
      case "fisicaQuimica":
        questions = fisicaQuimicaQuestions;
        break;
      case "filosofia":
        questions = filosofiaQuestions;
        break;
      case "psicologia":
        questions = psicologiaQuestions;
        break;
      case "literatura":
        questions = literaturaQuestions;
        break;
      case "biologia":
        questions = biologiaQuestions;
        break;
      case "cienciasSociales":
        questions = cienciasSocialesQuestions;
        break;
      case "matematica":
        questions = matematicaQuestions;
        break;
      default:
        questions = fisicaQuimicaQuestions;
    }

    return questions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  };

  const currentQuestions = getCurrentQuestions();

  const getTotalQuestions = () => {
    switch (currentSection) {
      case "fisicaQuimica":
        return fisicaQuimicaQuestions.length;
      case "filosofia":
        return filosofiaQuestions.length;
      case "psicologia":
        return psicologiaQuestions.length;
      case "literatura":
        return literaturaQuestions.length;
      case "biologia":
        return biologiaQuestions.length;
      case "cienciasSociales":
        return cienciasSocialesQuestions.length;
      case "matematica":
        return matematicaQuestions.length;
      default:
        return fisicaQuimicaQuestions.length;
    }
  };

  const totalPages = Math.ceil(getTotalQuestions() / questionsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const getSectionName = (section) => {
    const names = {
      fisicaQuimica: "Física - Química",
      filosofia: "Filosofía",
      psicologia: "Psicología",
      literatura: "Literatura",
      biologia: "Biología",
      cienciasSociales: "Ciencias Sociales",
      matematica: "Matemática",
    };
    return names[section] || section;
  };

  return (
    <div className="relative text-white max-h-screen h-screen overflow-hidden">
      {/* Fondo */}
      <motion.div
        className="absolute inset-0 bg-[url('/fondo_marcelo.jpg')] bg-cover bg-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      <div className="absolute inset-0"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 max-h-screen">
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, isSubmitting, setFieldValue }) => {
            const indexOfFirstQuestion = (currentPage - 1) * questionsPerPage;

            return (
              <Form>
                {/* Encabezado */}
                <motion.div
                  className="text-center mb-5 pt-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                    TEST - ANAPOL
                  </h1>
                  <h2 className="text-lg md:text-xl text-cyan-300">
                    BANCO DE PREGUNTAS
                  </h2>

                  {/* Selector de sección */}
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {[
                      "fisicaQuimica",
                      "filosofia",
                      "psicologia",
                      "literatura",
                      "biologia",
                      "cienciasSociales",
                      "matematica",
                    ].map((section) => (
                      <button
                        type="button"
                        key={section}
                        onClick={() => {
                          setCurrentSection(section);
                          setCurrentPage(1);
                        }}
                        className={`
                          px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold transition-all duration-300 text-sm
                          ${
                            currentSection === section
                              ? "bg-cyan-600 text-white shadow-lg"
                              : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-105 active:scale-95"
                          }
                        `}
                      >
                        {getSectionName(section)}
                      </button>
                    ))}
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-6 bg-gray-700/40 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-cyan-400 to-green-400 h-3"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(currentPage / totalPages) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    ></motion.div>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    Página {currentPage} de {totalPages} -{" "}
                    {getSectionName(currentSection)}
                  </p>
                </motion.div>

                {/* Preguntas */}
                <div className="space-y-4 md:space-y-6 max-h-[40vh] overflow-y-auto pr-2">
                  {currentQuestions.map((question, index) => {
                    // Calcular el índice global de la pregunta
                    const sectionOffsets = {
                      fisicaQuimica: 0,
                      filosofia: fisicaQuimicaQuestions.length,
                      psicologia:
                        fisicaQuimicaQuestions.length +
                        filosofiaQuestions.length,
                      literatura:
                        fisicaQuimicaQuestions.length +
                        filosofiaQuestions.length +
                        psicologiaQuestions.length,
                      biologia:
                        fisicaQuimicaQuestions.length +
                        filosofiaQuestions.length +
                        psicologiaQuestions.length +
                        literaturaQuestions.length,
                      cienciasSociales:
                        fisicaQuimicaQuestions.length +
                        filosofiaQuestions.length +
                        psicologiaQuestions.length +
                        literaturaQuestions.length +
                        biologiaQuestions.length,
                      matematica:
                        fisicaQuimicaQuestions.length +
                        filosofiaQuestions.length +
                        psicologiaQuestions.length +
                        literaturaQuestions.length +
                        biologiaQuestions.length +
                        cienciasSocialesQuestions.length,
                    };

                    const sectionOffset = sectionOffsets[currentSection] || 0;
                    const questionId =
                      sectionOffset + indexOfFirstQuestion + index + 1;
                    const fieldName = `${questionId}`;

                    return (
                      <motion.div
                        key={questionId}
                        className="p-3 md:p-5 bg-gradient-to-r from-[#1e293b]/80 to-[#0f172a]/80 rounded-2xl border border-cyan-500/30 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-400/40"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      >
                        <p className="mb-4 text-lg font-medium text-cyan-300">
                          <span className="text-green-400 font-bold">
                            {indexOfFirstQuestion + index + 1}.
                          </span>{" "}
                          {question}
                        </p>

                        <div className="flex flex-wrap gap-4">
                          {["A", "B", "C", "D"].map((option, optIndex) => (
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
                                whileHover={{
                                  scale: 1.05,
                                  boxShadow: "0 0 15px rgba(20,184,166,0.5)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                className={`text-sm md:text-base px-2 py-1 md:px-4 md:py-2 rounded-lg bg-gray-700/50 peer-checked:bg-cyan-500/80 peer-checked:text-white text-cyan-400 font-semibold transition-all duration-300 ${
                                  values[fieldName] === option
                                    ? "bg-cyan-500/80 text-white"
                                    : ""
                                }`}
                                onClick={() => setFieldValue(fieldName, option)}
                              >
                                Opción {option}
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
                        ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-cyan-500 to-green-500 hover:opacity-90 hover:shadow-cyan-400/40 text-white shadow-lg"
                    }`}
                  >
                    Anterior
                  </motion.button>

                  {currentPage === totalPages ? (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-green-400/40 ${
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
                      className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 hover:shadow-cyan-400/40 text-white shadow-lg transition-all duration-300"
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
