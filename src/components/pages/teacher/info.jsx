import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ClipboardList,
  FileText,
  Settings,
  ChevronDown,
  BarChart3,
  Brain,
  Heart,
  GraduationCap,
  BookOpen,
} from "lucide-react";

export const TeacherWelcome = () => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  return (
    <div className="relative z-10 flex-1 p-10 overflow-y-auto text-gray-700 dark:text-gray-300">
      {/* Bienvenida */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-teal-400 mb-4 drop-shadow-lg">
          Bienvenido al Panel Docente
        </h1>
        <p className="text-lg md:text-xl  max-w-4xl mx-auto mb-6">
          Gestiona tus clases, estudiantes y calificaciones de manera eficiente
          con nuestra plataforma educativa. Tu rol como{" "}
          <b className="text-teal-300">docente</b> es clave en el proceso.
        </p>
      </motion.div>

      {/* Información extensa */}
      <motion.div
        className="mb-10  bg-white/70 dark:bg-black/40 rounded-2xl p-8 shadow-lg border border-teal-500/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-teal-400 mb-6 text-center flex items-center justify-center gap-2">
          <Users className="text-teal-400" size={24} />
          Tu rol en la comunidad educativa
        </h2>

        <div className="space-y-4 leading-relaxed text-lg">
          <p>
            Como docente, tienes la responsabilidad de guiar y apoyar a tus
            estudiantes en su desarrollo académico y personal. Esta plataforma
            te proporciona herramientas para gestionar información de manera
            organizada y segura.
          </p>

          <div className="dark:bg-teal-900/30 bg-teal-500/10 p-4 rounded-xl my-6 border-l-4 border-teal-400">
            <h3 className="text-xl font-bold text-teal-300 mb-3 flex items-center gap-2">
              <Brain className="text-teal-300" size={22} />
              Herramientas avanzadas para docentes
            </h3>
            <p>
              Podrás registrar estudiantes, asignar paralelos, administrar
              calificaciones y generar reportes con facilidad. Todo esto con la
              seguridad y rapidez que proporciona nuestra interfaz moderna.
            </p>
          </div>

          <AnimatePresence>
            {showMoreInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                className="pt-4 space-y-4"
              >
                <h4 className="text-teal-300 font-semibold flex items-center gap-2">
                  <BarChart3 size={20} />
                  Para una gestión educativa eficiente
                </h4>
                <p>
                  Esta plataforma centraliza la información de tus estudiantes,
                  facilitando la actualización de datos, seguimiento de
                  desempeño y coordinación con otros docentes. Todo en un solo
                  lugar.
                </p>

                <div className="dark:bg-teal-900/30 bg-teal-500/10 p-4 rounded-xl mt-4">
                  <h4 className="font-bold mb-2 text-teal-300 flex items-center gap-2">
                    <Heart size={20} />
                    Recuerda:
                  </h4>
                  <p>
                    Tu trabajo impacta directamente en la formación de tus
                    estudiantes. Aprovecha las herramientas disponibles para
                    optimizar tus tareas y concentrarte en lo más importante:
                    enseñar y guiar.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowMoreInfo(!showMoreInfo)}
            className="mt-4 flex items-center gap-2 text-teal-400 hover:text-teal-300 font-medium"
          >
            {showMoreInfo ? "Ver menos" : "Leer información completa"}
            <ChevronDown
              size={16}
              className={`transition-transform ${showMoreInfo ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </motion.div>

      {/* Funcionalidades principales */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold text-teal-400 mb-6 text-center">
          Funcionalidades principales
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              icon: <ClipboardList size={32} className="text-teal-400" />,
              title: "Gestión de estudiantes",
              description: "Registra y administra a tus estudiantes fácilmente",
            },
            {
              icon: <FileText size={32} className="text-teal-400" />,
              title: "Gestión de notas",
              description: "Registra y controla calificaciones de manera eficiente",
            },
            {
              icon: <Settings size={32} className="text-teal-400" />,
              title: "Configuración",
              description: "Personaliza tu panel y ajusta tus preferencias",
            },
            {
              icon: <GraduationCap size={32} className="text-teal-400" />,
              title: "Reportes",
              description: "Genera reportes detallados sobre estudiantes y notas",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-gradient-to-b dark:from-teal-900/30 dark:to-black/50 from-white/70 to-white/90 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-teal-400/20 flex flex-col items-center text-center"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="mb-4 p-3 bg-teal-400/10 rounded-full">{item.icon}</div>
              <h3 className="text-lg font-bold text-teal-300 mb-2">{item.title}</h3>
              <p className="dark:text-white/80 text-gray/600 text-sm">{item.description}</p>
            </motion.div>
          ))}
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
          Formando docentes comprometidos con el futuro de sus estudiantes
        </p>
      </motion.div>
    </div>
  );
};
