import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getStudentTests } from "../../../api/api_estudent_test";
import { getStudents } from "../../../api/api_student";
import { getUsers } from "../../../api/api_user";
import { getSections } from "../../../api/api_section";
import { getAptitudes } from "../../../api/api_aptitudes";
import { Brain, GraduationCap, Star, Loader2 } from "lucide-react";

export const ObservationsManager = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [sections, setSections] = useState([]);
  const [aptitudes, setAptitudes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, usersRes, sectionsRes, aptitudesRes] = await Promise.all([
          getStudents(),
          getUsers(),
          getSections(),
          getAptitudes(),
        ]);

        setStudents(studentsRes.data);
        setUsers(usersRes.data);
        setSections(sectionsRes.data);
        setAptitudes(aptitudesRes.data);
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Buscar las aptitudes de un estudiante específico
  const getAptitudesByStudent = (studentId) => {
    const registro = aptitudes.find((a) => a.estudiante === studentId);
    return registro && Array.isArray(registro.aptitudes) ? registro.aptitudes : [];
  };

  // ✅ Calcular la aptitud dominante (la de mayor porcentaje positivo)
  const getAptitudDominante = (studentId) => {
    const lista = getAptitudesByStudent(studentId);
    if (lista.length === 0) return null;

    let mejor = null;
    let maxVal = -Infinity;

    lista.forEach((apt) => {
      const valor = parseFloat(apt.porcentaje.replace("%", "")) || 0;
      if (valor > maxVal) {
        maxVal = valor;
        mejor = apt;
      }
    });

    return mejor;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-teal-400 w-10 h-10" />
      </div>
    );

  // ✅ Combinar datos para mostrar
  const estudiantesConAptitudes = students.map((student) => {
    const user = users.find((u) => u.id === student.usuario);
    const paralelo = sections.find((s) => s.id === student.paralelo);
    const aptitudesEst = getAptitudesByStudent(student.id);
    const aptitudDominante = getAptitudDominante(student.id);

    return {
      id: student.id,
      nombre: user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          user.username
        : "Desconocido",
      paralelo: paralelo ? paralelo.nombre : "Sin paralelo",
      aptitudes: aptitudesEst,
      aptitudDominante,
    };
  });

  return (
    <div className="text-gray-700 dark:text-white overflow-y-auto scrollbar-hide h-[90vh]">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold text-teal-400 flex justify-center items-center gap-2">
          <Brain /> Aptitudes Reales de los Estudiantes
        </h1>
        <p className="text-lg mt-2">
          Orientación personalizada basada en resultados reales del modelo
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {estudiantesConAptitudes.map((est) => (
          <motion.div
            key={est.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-gradient-to-br from-gray-800/50 to-black/60 rounded-2xl border border-teal-400/20 shadow-lg hover:shadow-teal-500/30 transition-all"
          >
            <h2 className="text-xl font-bold text-teal-300 mb-2 flex items-center gap-2">
              <GraduationCap /> {est.nombre}
            </h2>
            <p className="text-sm text-gray-400 mb-2">
              Paralelo: {est.paralelo}
            </p>

            {est.aptitudes.length > 0 ? (
              <>
                <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                  <Star /> Aptitud Dominante:
                  <span className="text-white">
                    {" "}
                    {est.aptitudDominante?.aptitud || "No definida"}
                  </span>
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  Nivel:{" "}
                  <span className="text-teal-300 font-semibold">
                    {est.aptitudDominante?.porcentaje || "0%"}
                  </span>
                </p>

                <div className="space-y-2">
                  {est.aptitudes.map((apt, idx) => {
                    const valor = parseFloat(apt.porcentaje.replace("%", "")) || 0;
                    const barWidth = Math.max(0, Math.min(valor, 100));
                    const barColor =
                      valor < 0 ? "bg-red-500" : "bg-yellow-400";

                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-xs text-gray-300 mb-1">
                          <span>{apt.aptitud}</span>
                          <span>{apt.porcentaje}</span>
                        </div>
                        <div className="w-full bg-gray-600 h-2 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-2 rounded-full ${barColor}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-gray-400 mt-2">
                No se encontraron aptitudes registradas para este estudiante.
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
