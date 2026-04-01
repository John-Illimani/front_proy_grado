import React, { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Settings,
  ClipboardList,
  Gamepad2,
  ChevronDown,
  ArrowRight,
  Target,
  Brain,
  BarChart3,
  Heart,
  Users,
  BookOpen,
  GraduationCap,
} from "lucide-react";

export const WelcomInfo = () => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  return (
    <div className=" relative flex-1 p-10 h-screen  overflow-hidden">
      {/* Fondo animado */}
      <motion.div
        className="absolute inset-0 dark:bg-[url('/fondo_marcelo.jpg')] dark:bg-cover dark:bg-center bg-gradient-to-br from-[#b9edfa]"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      <div className="absolute inset-0 "></div>

      <div className="relative z-10 overflow-y-auto h-full scrollbar-hide">
        {/* Bienvenida */}
        <motion.div
          className="mb-8 text-center "
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className=" text-4xl md:text-5xl font-bold dark:text-teal-400 mb-4 drop-shadow-lg text-black ">
            Bienvenido al Sistema de Orientación Vocacional
          </h1>
          <p className="text-lg md:text-xl dark:text-white/90 max-w-4xl mx-auto mb-6 text-black">
            Una herramienta innovadora con tecnología de{" "}
            <b className="dark:text-teal-300 ">Inteligencia Artificial</b> para
            ayudarte a descubrir tu camino profesional ideal.
          </p>

          <motion.div
            className="flex justify-center mt-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          ></motion.div>
        </motion.div>

        {/* Mensaje de bienvenida extenso */}
        <motion.div
          className="mb-10 bg-gradient-to-r dark:from-black/40 dark:to-black/20 from-white to-white rounded-2xl p-8 shadow-lg border border-teal-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold dark:text-teal-400 text-black mb-6 text-center flex items-center justify-center gap-2">
            <Target className="dark:text-teal-400 text-black" size={24} />
            Un momento decisivo en tu vida
          </h2>

          <div className="space-y-4 dark:text-white/90 text-black leading-relaxed text-lg">
            <p>
              Estás a punto de vivir uno de los momentos más importantes: la
              elección de tu carrera universitaria. Esta decisión no solo
              marcará tus próximos años de estudio, sino que influirá en tu
              desarrollo personal y profesional. Sabemos que puede generar
              expectativa, incertidumbre e incluso algo de ansiedad, pero
              <b className="dark:text-teal-300"> no estás solo/a en este proceso</b>.
            </p>

            <div className="dark:from-teal-900/30  dark:to-teal-900/30 bg-gradient-to-br from-[#053F5C] to-[#1081b9]  p-4 rounded-xl my-6  text-white">
              <h3 className="text-xl font-bold text-teal-300 mb-3 flex items-center gap-2">
                <Brain className="text-teal-300" size={22} />
                ¿Por qué el sistema es diferente?
              </h3>
              <p>
                Nuestra plataforma utiliza un algoritmo avanzado de{" "}
                <b>Random Forest (Bosque Aleatorio)</b>, una tecnología de
                inteligencia artificial que analiza múltiples variables
                simultáneamente para ofrecerte recomendaciones personalizadas
                basadas en tus intereses, aptitudes, personalidad y las demandas
                del mercado laboral.
              </p>
            </div>

            <p>
              Este sistema ha sido desarrollado considerando las
              particularidades de nuestra unidad educativa y el contexto
              regional, incorporando información sobre las universidades
              locales, programas de estudio disponibles en Santa Cruz y las
              oportunidades de desarrollo profesional en nuestra región.
            </p>

            <AnimatePresence>
              {showMoreInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="pt-4 space-y-4"
                >
                  <h4 className="dark:text-teal-300 font-semibold flex items-center gap-2">
                    <BarChart3 size={20} />
                    Para nuestra comunidad Marcelo Quiroga Santa Cruz
                  </h4>
                  <p>
                    Más que un test, esta es una herramienta para conocerte
                    mejor, descubrir opciones que quizás no habías considerado,
                    validar aquellas carreras que ya tienes en mente y tomar una
                    decisión informada y consciente.
                  </p>

                  <div className="dark:from-gray-800/40 dark:to-gray-800/40 p-4 rounded-xl mt-4 bg-gradient-to-br from-[#053F5C] to-[#1081b9] text-white">
                    <h4 className="font-bold mb-2 text-teal-300 flex items-center gap-2">
                      <Heart size={20} />
                      Recuerda:
                    </h4>
                    <p>
                      Los resultados son una{" "}
                      <b>guía, no un destino irrevocable</b>. Tú eres el/la
                      principal protagonista de tu futuro profesional. Tómate tu
                      tiempo, responde con honestidad y aprovecha esta
                      herramienta para dar el siguiente paso con confianza.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowMoreInfo(!showMoreInfo)}
              className="mt-4 flex items-center gap-2 tdark:ext-teal-400 dark:hover:text-teal-300 font-medium hover:border-b-2 hover:border-black"
            >
              {showMoreInfo ? "Ver menos" : "Leer información completa"}
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  showMoreInfo ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </motion.div>

        {/* Proceso de orientación */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold dark:text-teal-400 mb-6 text-black text-center">
            ¿Cómo funciona el proceso?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: <ClipboardList size={32} className="dark:text-teal-400 text-black" />,
                title: "Evaluación integral",
                description:
                  "Realizarás tests y cuestionarios cuidadosamente diseñados",
              },
              {
                icon: <Brain size={32} className="dark:text-teal-400 text-black" />,
                title: "Análisis inteligente",
                description:
                  "Nuestro sistema procesará tus respuestas con el algoritmo Random Forest",
              },
              {
                icon: <FileText size={32} className="dark:text-teal-400 text-black" />,
                title: "Resultados personalizados",
                description:
                  "Obtendrás un perfil detallado con carreras compatibles contigo",
              },
              {
                icon: <GraduationCap size={32} className="dark:text-teal-400 text-black" />,
                title: "Exploración de opciones",
                description:
                  "Conocerás detalles sobre cada carrera recomendada",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="bg-gradient-to-b dark:from-teal-900/30 dark:to-black/50 from-sky-500 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-teal-400/20 flex flex-col items-center text-center"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="mb-4 p-3 dark:bg-teal-400/10 bg-amber- rounded-full">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold dark:text-teal-300 text-black mb-2">
                  {item.title}
                </h3>
                <p className="text-black dark:text-white/80 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Info adicional */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-gradient-to-br dark:from-purple-900/30 dark:to-black/50 from-sky-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-purple-400/20">
            <h3 className="text-xl font-bold text-purple-300 mb-3 flex items-center gap-2">
              <Users size={22} />
              Para nuestra comunidad
            </h3>
            <p className="dark:text-white/80 text-black font-bold">
              Este sistema ha sido desarrollado específicamente para los
              estudiantes de sexto de secundaria de la Unidad Educativa Marcelo
              Quiroga Santa Cruz, considerando nuestro contexto educativo y las
              oportunidades locales.
            </p>
          </div>

          <div className="bg-gradient-to-br dark:from-amber-900/30 dark:to-black/50 from-sky-900 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-amber-400/20">
            <h3 className="text-xl font-bold text-amber-300 mb-3 flex items-center gap-2">
              <BookOpen size={22} />
              Tu journey hacia el futuro
            </h3>
            <p className="dark:text-white/80 text-black font-bold">
              Te invitamos a embarcarte en este viaje de autodescubrimiento con
              mente abierta y curiosidad. Comienza cuando estés listo/a y
              recuerda que estamos aquí para apoyarte.
            </p>
          </div>
        </motion.div>

        {/* CTA final */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-white/70 text-sm mt-4">
            Formando los profesionales del mañana - U.E. Marcelo Quiroga Santa
            Cruz
          </p>
        </motion.div>
      </div>
    </div>
  );
};
