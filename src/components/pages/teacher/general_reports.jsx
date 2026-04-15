// src/components/pages/teacher/general_reports.jsx
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import { getStudentTests } from "../../../api/api_estudent_test";
import { getStudents } from "../../../api/api_student";
import { getUsers } from "../../../api/api_user";
import { getSections } from "../../../api/api_section";
import { getAptitudes } from "../../../api/api_aptitudes";

import {
  BarChart3,
  User,
  GraduationCap,
  BookOpen,
  Loader2,
  Star,
  FileDown,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  ClipboardList,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from "recharts";

const testsInfo = [
  { id: 1, nombre: "Test Chaside", total_preguntas: 97 },
  { id: 2, nombre: "Test Colmil", total_preguntas: 156 },
  { id: 3, nombre: "Test Personalidad", total_preguntas: 163 },
  { id: 4, nombre: "Razonamiento Verbal", total_preguntas: 47 },
  { id: 5, nombre: "Razonamiento Numérico", total_preguntas: 40 },
  { id: 6, nombre: "Razonamiento Abstracto", total_preguntas: 48 },
  { id: 7, nombre: "Razonamiento Mecánico", total_preguntas: 15 },
  { id: 8, nombre: "Ortografía", total_preguntas: 26 },
  { id: 9, nombre: "Rapidez preceptiva 1", total_preguntas: 100 },
  { id: 10, nombre: "Rapidez preceptiva 2", total_preguntas: 100 },
];

const NIVEL = (prom) => {
  if (prom >= 75) return { label: "Alto", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", dot: "bg-emerald-500" };
  if (prom >= 50) return { label: "Medio", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", dot: "bg-amber-500" };
  return { label: "Bajo", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", dot: "bg-red-500" };
};

const MetricCard = ({ icon: Icon, label, value, sub, color }) => (
  <motion.div whileHover={{ y: -3 }} className={`bg-gradient-to-br ${color} p-5 rounded-2xl border shadow-sm`}>
    <div className="flex items-center justify-between mb-3">
      <p className=" font-bold ">{label}</p>
      <Icon size={20} className="" />
    </div>
    <p className="text-3xl font-bold">{value}</p>
    {sub && <p className=" mt-1 ">{sub}</p>}
  </motion.div>
);

const DistBar = ({ label, count, total, color, textColor, bg }) => {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs w-20 flex-shrink-0 text-gray-500 dark:text-gray-400">{label}</span>
      <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full flex items-center px-2 transition-all duration-700 ${bg}`} style={{ width: `${pct}%` }}>
          {count > 0 && <span className={`text-xs font-semibold ${textColor}`}>{count}</span>}
        </div>
      </div>
      <span className={`text-xs font-semibold w-8 text-right ${color}`}>{pct}%</span>
    </div>
  );
};

const MiniBar = ({ value, color = "bg-teal-500" }) => (
  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
    <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const ReporteGeneralEstudiantes = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [studentTests, setStudentTests] = useState([]);
  const [aptitudes, setAptitudes] = useState([]);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [nivelFilter, setNivelFilter] = useState("");
  const [activeTab, setActiveTab] = useState("tabla");

  // Detectar modo dark
  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const obs = new MutationObserver(checkDark);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const colors = {
    grid: isDark ? "#334155" : "#E2E8F0",
    text: isDark ? "#CBD5F5" : "#334155",
    tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
    tooltipText: isDark ? "#F1F5F9" : "#0F172A",
    bar: isDark ? "#2DD4BF" : "#14B8A6",
    radarFill: isDark ? "rgba(45,212,191,0.2)" : "rgba(20,184,166,0.2)",
    radarStroke: isDark ? "#2DD4BF" : "#0F766E",
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, studentsRes, usersRes, sectionsRes, aptitudesRes] = await Promise.all([
          getStudentTests(),
          getStudents(),
          getUsers(),
          getSections(),
          getAptitudes(),
        ]);

        const tests = testsRes.data;
        const students = studentsRes.data;
        const users = usersRes.data;
        const sectionsData = sectionsRes.data;

        setStudentTests(tests);
        setSections(sectionsData);
        setAptitudes(aptitudesRes.data);

        // Crear mapa de usuarios para evitar duplicados
        const userMap = new Map();
        users.forEach(user => {
          userMap.set(user.id, user);
        });

        const result = students.map((student) => {
          const user = userMap.get(student.usuario);
          const paraleloObj = sectionsData.find((s) => s.id === student.paralelo);
          
          // Calcular promedio correcto basado en tests realizados
          const stTests = tests.filter((t) => t.estudiante === student.id);
          let totalCompleto = 0;
          let totalPreguntasRealizadas = 0;

          stTests.forEach(test => {
            const testInfo = testsInfo.find(ti => ti.id === test.testvocational);
            if (testInfo) {
              totalCompleto += test.completo;
              totalPreguntasRealizadas += testInfo.total_preguntas;
            }
          });

          const promedio = totalPreguntasRealizadas > 0 
            ? parseFloat(((totalCompleto / totalPreguntasRealizadas) * 100).toFixed(1))
            : 0;

          return {
            id: student.id,
            nombre: user
              ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username
              : "Desconocido",
            initials: user
              ? `${(user.first_name || "?")[0]}${(user.last_name || "?")[0]}`.toUpperCase()
              : "??",
            promedio,
            cantidadTests: stTests.length,
            paralelo: paraleloObj ? paraleloObj.nombre : "Sin paralelo",
          };
        });

        setData(result);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtrado combinado
  const filteredData = useMemo(() => {
    return data.filter((d) => {
      const matchSection = !selectedSection || d.paralelo === selectedSection.nombre;
      const matchSearch = !searchQuery || d.nombre.toLowerCase().includes(searchQuery.toLowerCase());
      const matchNivel =
        !nivelFilter ||
        (nivelFilter === "alto" && d.promedio >= 75) ||
        (nivelFilter === "medio" && d.promedio >= 50 && d.promedio < 75) ||
        (nivelFilter === "bajo" && d.promedio < 50);
      return matchSection && matchSearch && matchNivel;
    });
  }, [data, selectedSection, searchQuery, nivelFilter]);

  // Stats derivados
  const stats = useMemo(() => {
    if (!filteredData.length) return { avg: 0, tests: 0, high: 0, mid: 0, low: 0 };
    const avg = (filteredData.reduce((a, d) => a + d.promedio, 0) / filteredData.length).toFixed(1);
    return {
      avg,
      tests: filteredData.reduce((a, d) => a + d.cantidadTests, 0),
      high: filteredData.filter((d) => d.promedio >= 75).length,
      mid: filteredData.filter((d) => d.promedio >= 50 && d.promedio < 75).length,
      low: filteredData.filter((d) => d.promedio < 50).length,
    };
  }, [filteredData]);

  const top5 = useMemo(
    () => [...filteredData].sort((a, b) => b.promedio - a.promedio).slice(0, 5),
    [filteredData]
  );

  // Test coverage (promedios por test)
  const testCoverage = useMemo(() => {
    return testsInfo.map((test) => {
      const values = filteredData.map((s) => {
        const st = studentTests.find((t) => t.estudiante === s.id && t.testvocational === test.id);
        return st ? (st.completo / test.total_preguntas) * 100 : 0;
      });
      const avg = values.length
        ? parseFloat((values.reduce((a, v) => a + v, 0) / values.length).toFixed(1))
        : 0;
      return { nombre: test.nombre, avg };
    });
  }, [filteredData, studentTests]);

  // Helper para porcentaje correcto
  const getPorcentaje = (studentId, testId) => {
    const st = studentTests.find((t) => t.estudiante === studentId && t.testvocational === testId);
    const info = testsInfo.find((t) => t.id === testId);
    if (!st || !info) return 0;
    return parseFloat(((st.completo / info.total_preguntas) * 100).toFixed(1));
  };

  // PDF Generation
  const generarPDF = () => {
    if (!filteredData.length) return alert("No hay datos para exportar.");

    const pdf = new jsPDF("p", "mm", "letter");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;

    const logo = new Image();
    logo.src = "/logo.png";

    filteredData.forEach((student, index) => {
      if (index > 0) pdf.addPage();

      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      pdf.saveGraphicsState();
      pdf.setGState(pdf.GState({ opacity: 0.08 }));
      pdf.addImage(logo, "PNG", 30, 60, 150, 150);
      pdf.restoreGraphicsState();

      pdf.setFillColor(0, 102, 204);
      pdf.rect(0, 0, pageWidth, 20, "F");
      pdf.setTextColor(255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("COLEGIO MARCELO QUIROGA SANTA CRUZ", pageWidth / 2, 13, { align: "center" });
      pdf.addImage(logo, "PNG", pageWidth - 40, 22, 20, 20);

      pdf.setTextColor(0, 76, 153);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("REPORTE VOCACIONAL INDIVIDUAL", pageWidth / 2, 45, { align: "center" });

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(80);
      pdf.setFontSize(12);
      pdf.text("Área de Orientación y Evaluación Vocacional", pageWidth / 2, 52, { align: "center" });

      pdf.setFontSize(11);
      pdf.setTextColor(40);
      pdf.text(`Estudiante: ${student.nombre}`, margin, 70);
      pdf.text(`Paralelo: ${student.paralelo}`, margin, 78);
      pdf.text(`Promedio General: ${Math.min(student.promedio, 100)}%`, margin, 86);

      let y = 95;

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 102, 204);
      pdf.setFontSize(13);
      pdf.text("Progreso por Test", margin, y);
      y += 5;

      testsInfo.forEach((test) => {
        let pct = Math.min(Math.max(getPorcentaje(student.id, test.id), 0), 100);
        pdf.setFillColor(235);
        pdf.rect(margin, y, 150, 6, "F");
        pdf.setFillColor(0, 153, 255);
        pdf.rect(margin, y, (pct / 100) * 150, 6, "F");
        pdf.setTextColor(0);
        pdf.setFontSize(10);
        pdf.text(`${test.nombre} - ${pct.toFixed(1)}%`, margin + 2, y + 4);
        y += 8;
      });

      y += 6;

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 102, 0);
      pdf.setFontSize(13);
      pdf.text("Aptitudes del Estudiante", margin, y);
      y += 5;

      const aptitudesEst = aptitudes.find(
        (a) => a.estudiante_id === student.id || a.estudiante === student.id
      );

      if (aptitudesEst?.aptitudes?.length > 0) {
        const sorted = [...aptitudesEst.aptitudes].sort(
          (a, b) =>
            parseFloat(b.porcentaje.replace("%", "")) -
            parseFloat(a.porcentaje.replace("%", ""))
        );
        sorted.forEach((apt) => {
          const pct = Math.min(Math.abs(parseFloat(apt.porcentaje.replace("%", "")) || 0), 100);
          pdf.setFillColor(240);
          pdf.rect(margin, y, 150, 6, "F");
          if (parseFloat(apt.porcentaje) >= 0) {
            pdf.setFillColor(255, 193, 7);
            pdf.rect(margin, y, (pct / 100) * 150, 6, "F");
          }
          pdf.setTextColor(0);
          pdf.setFontSize(10);
          pdf.text(`${apt.aptitud}: ${apt.porcentaje}`, margin + 2, y + 4);
          y += 8;
        });
      } else {
        pdf.setTextColor(150);
        pdf.setFontSize(10);
        pdf.text("No hay aptitudes registradas.", margin, y);
        y += 5;
      }

      y += 10;
      pdf.setTextColor(60);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(10.5);
      pdf.text(
        "Este reporte refleja el desempeño y las aptitudes vocacionales detectadas por el modelo de IA.",
        margin, y, { maxWidth: 180 }
      );

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100);
      pdf.setFontSize(9);
      pdf.text("Fecha: " + new Date().toLocaleDateString(), margin, pageHeight - 18);
      pdf.text("Sistema Vocacional", pageWidth - margin, pageHeight - 18, { align: "right" });
    });

    pdf.save("Reporte_General_Estudiantes.pdf");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-teal-400 w-10 h-10" />
      </div>
    );

  return (
    <div className="text-gray-700 dark:text-white overflow-y-auto scrollbar-hide h-[90vh] space-y-8 pb-8  sm:p-4   ">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold dark:text-teal-400 flex items-center gap-2">
                        <BarChart3 /> Reporte General
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Seguimiento vocacional · Colegio Marcelo Quiroga Santa Cruz
          </p>
        </div>
        <button
          onClick={generarPDF}
          className="flex items-center gap-2 dark:bg-gradient-to-r dark:from-teal-500 dark:to-cyan-600 dark:hover:from-cyan-500 dark:hover:to-teal-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg dark:hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-0.5 w-full lg:w-auto  bg-green-800 hover:bg-green-500  duration-300 "
        >
          <FileDown size={16} /> Exportar PDF
        </button>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
      >
        {/* Buscador */}
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar estudiante…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-teal-400/40 dark:bg-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/50"
          />
        </div>

        {/* Paralelo */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-gray-400 flex-shrink-0" />
          <select
            className="px-3 py-2.5 rounded-xl border border-teal-400/40 dark:bg-gray-900 dark:text-white text-sm flex-1 sm:flex-none"
            onChange={(e) =>
              setSelectedSection(sections.find((s) => s.id === parseInt(e.target.value)) || null)
            }
          >
            <option value="">Todos los paralelos</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Métricas */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <MetricCard
          icon={User}
          label="Estudiantes"
          value={filteredData.length}
          sub="En la selección actual"
          color="dark:from-teal-900/40 dark:to-black/50 from-[green] to-green-500 text-white  font-bold border-teal-300/30 dark:border-teal-700/30 dark:text-teal-100 "
        />
      </motion.div>

      {/* Dashboard: Top 5 + Cobertura Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
        {/* Top 5 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br dark:from-gray-800/40 dark:to-black/50 from-white to-white rounded-2xl  p-5 border border-gray-200/50 dark:border-gray-700/30 shadow-sm order-2 lg:order-1"
        >
          <h3 className="text-sm font-semibold dark:text-gray-200 text-gray-700 mb-4 flex items-center gap-2 ]">
            <Trophy size={14} /> Top 5 estudiantes
          </h3>
          <div className="space-y-2">
            {top5.map((s, i) => {
              const medals = ["🥇", "🥈", "🥉", "4°", "5°"];
              return (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-sm w-6 text-center">{medals[i]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.nombre}</p>
                    <p className="text-xs text-gray-400">{s.paralelo}</p>
                  </div>
                  <span className="text-sm font-bold dark:text-teal-400 text-teal-600">{s.promedio}%</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Cobertura por test */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className=" bg-gradient-to-br dark:from-gray-800/40 dark:to-black/50 from-white to-white rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/30 shadow-sm order-1 lg:order-2"
        >
          <h3 className="text-sm font-semibold dark:text-gray-200 text-gray-700 mb-4 flex items-center gap-2">
            <BookOpen size={14} /> Cobertura promedio por test
          </h3>
          <div className="space-y-2.5 max-h-80  overflow-y-auto">
            {testCoverage.map((t) => (
              <div key={t.nombre} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-full sm:w-40 flex-shrink-0 truncate">{t.nombre}</span>
                <div className="flex-1 w-full sm:w-auto">
                  <MiniBar value={t.avg} />
                </div>
                <span className="text-xs font-semibold dark:text-teal-400 text-teal-600 w-9 text-right">{t.avg}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br dark:from-gray-800/30 dark:to-black/50 from-white/50 to-white/80 rounded-2xl border border-teal-500/20 shadow-sm overflow-hidden"
      >
        <div className="p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-black dark:text-gray-400 border-b border-gray-200 dark:border-gray-700   dark:bg-gray-600 bg-orange-200 ">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Estudiante</th>
                  <th className="px-4 py-3 text-left">Paralelo</th>
                  <th className="px-4 py-3 text-center">Promedio</th>
                  <th className="px-4 py-3 text-left min-w-[100px]">Progreso</th>
                  <th className="px-4 py-3 text-center">Tests</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, i) => {
                  const nivel = NIVEL(item.promedio);
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-medium whitespace-nowrap">{item.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{item.paralelo}</td>
                      <td className="px-4 py-3 text-center font-bold dark:text-teal-300 text-teal-700">
                        {item.promedio}%
                      </td>
                      <td className="px-4 py-3">
                        <MiniBar value={item.promedio} />
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                        {item.cantidadTests}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Mostrando {filteredData.length} de {data.length} estudiantes
          </p>
        </div>
      </motion.div>
    </div>
  );
};
