import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getStudents } from "../../../api/api_student";
import { getUsers } from "../../../api/api_user";
import { getSections } from "../../../api/api_section";
import { getAptitudes } from "../../../api/api_aptitudes";
import { getMajors } from "../../../api/api_majors";
import { Brain, GraduationCap, Star, Loader2, BookOpen, TrendingUp } from "lucide-react";

export const ObservationsManager = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [sections, setSections] = useState([]);
  const [aptitudes, setAptitudes] = useState([]);
  const [recommendedMajors, setRecommendedMajors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, usersRes, sectionsRes, aptitudesRes, majorsRes] =
          await Promise.all([
            getStudents(),
            getUsers(),
            getSections(),
            getAptitudes(),
            getMajors(),
          ]);

        setStudents(studentsRes.data);
        setUsers(usersRes.data);
        setSections(sectionsRes.data);
        setAptitudes(aptitudesRes.data);

        // ✅ Misma lógica de parseo que ReporteGeneralVocacional
        const majorsData = majorsRes.data;
        const majorsMap = {};
        if (majorsData && Array.isArray(majorsData)) {
          majorsData.forEach((item) => {
            if (item.carreras && item.carreras !== "sin carreras") {
              try {
                const carrerasArray = JSON.parse(
                  item.carreras.replace(/'/g, '"')
                );
                majorsMap[item.estudiante] = carrerasArray;
              } catch (parseError) {
                console.error("Error al parsear carreras:", parseError);
                majorsMap[item.estudiante] = [];
              }
            } else {
              majorsMap[item.estudiante] = [];
            }
          });
        }
        setRecommendedMajors(majorsMap);
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getAptitudesByStudent = (studentId) => {
    const registro = aptitudes.find((a) => a.estudiante === studentId);
    return registro && Array.isArray(registro.aptitudes) ? registro.aptitudes : [];
  };

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
        <Loader2 className="animate-spin text-teal-500 w-10 h-10" />
      </div>
    );

  const estudiantesConAptitudes = students.map((student) => {
    const user = users.find((u) => u.id === student.usuario);
    const paralelo = sections.find((s) => s.id === student.paralelo);
    const aptitudesEst = getAptitudesByStudent(student.id);
    const aptitudDominante = getAptitudDominante(student.id);
    const carrerasRecomendadas = recommendedMajors[student.id] || [];

    return {
      id: student.id,
      nombre: user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username
        : "Desconocido",
      paralelo: paralelo ? paralelo.nombre : "Sin paralelo",
      aptitudes: aptitudesEst,
      aptitudDominante,
      carrerasRecomendadas,
    };
  });

  return (
    <div className="text-gray-800 dark:text-white overflow-y-auto scrollbar-hide h-[90vh]">
      {/* ── Encabezado ── */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold text-teal-700 dark:text-teal-400 flex justify-center items-center gap-2">
          <Brain /> Aptitudes y Carreras Recomendadas
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
          Orientación personalizada basada en resultados reales del modelo
        </p>
      </motion.div>

      {/* ── Grid de tarjetas ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {estudiantesConAptitudes.map((est, cardIdx) => (
          <motion.div
            key={est.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: cardIdx * 0.05 }}
            className="
              p-6 rounded-2xl shadow-lg transition-all
              bg-white border border-slate-200 hover:shadow-teal-200 hover:border-teal-300
              dark:bg-gray-800/50 dark:border-teal-400/20 dark:hover:shadow-teal-500/30
            "
          >
            {/* Nombre + paralelo */}
            <h2 className="text-xl font-bold text-teal-700 dark:text-teal-300 mb-1 flex items-center gap-2">
              <GraduationCap size={20} /> {est.nombre}
            </h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-4 font-medium">
              Paralelo:{" "}
              <span className="text-slate-700 dark:text-white font-semibold">
                {est.paralelo}
              </span>
            </p>

            {/* ── Aptitudes ── */}
            {est.aptitudes.length > 0 ? (
              <>
                

                {/* Barras de aptitudes */}
                <div className="space-y-2 mb-4">
                  {est.aptitudes.map((apt, idx) => {
                    const valor = parseFloat(apt.porcentaje.replace("%", "")) || 0;
                    const barWidth = Math.max(0, Math.min(valor, 100));
                    const barColor =
                      valor < 0
                        ? "bg-red-400"
                        : "bg-teal-500 dark:bg-yellow-400";

                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-xs text-slate-600 dark:text-gray-300 mb-1 font-medium">
                          <span>{apt.aptitud}</span>
                          <span className="font-bold text-slate-800 dark:text-white">
                            {apt.porcentaje}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-2 rounded-full ${barColor}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-slate-400 dark:text-gray-500 text-sm mb-4 italic">
                No se encontraron aptitudes registradas.
              </p>
            )}

            {/* ── Carreras Recomendadas ── */}
            {est.carrerasRecomendadas.length > 0 ? (
              <div className="mt-2 px-3 py-3 rounded-xl bg-teal-50 border border-teal-200 dark:bg-teal-500/10 dark:border-teal-500/30">
                <p className="text-sm font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1 mb-2">
                  <BookOpen size={14} /> Carreras Recomendadas
                </p>
                <div className="space-y-1">
                  {est.carrerasRecomendadas.map((carrera, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-700 dark:text-gray-200 font-medium flex items-center gap-1">
                        <TrendingUp size={12} className="text-teal-500 dark:text-teal-400" />
                        {carrera.carrera}
                      </span>
                      <span className="font-bold text-teal-700 dark:text-teal-300 text-xs bg-teal-100 dark:bg-teal-500/20 px-2 py-0.5 rounded-full">
                        {carrera.probabilidad}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 dark:bg-gray-700/30 dark:border-gray-600">
                <p className="text-xs text-slate-400 dark:text-gray-500 italic">
                  Sin carreras recomendadas aún.
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};