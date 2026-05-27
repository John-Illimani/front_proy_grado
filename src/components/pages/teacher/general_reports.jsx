// src/components/pages/teacher/general_reports.jsx
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import { getStudentTests } from "../../../api/api_estudent_test";
import { getStudents } from "../../../api/api_student";
import { getUsers } from "../../../api/api_user";
import { getSections } from "../../../api/api_section";
import { getAptitudes } from "../../../api/api_aptitudes";
import { getMajors } from "../../../api/api_majors"; // ← AÑADIDO

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
  if (prom >= 75)
    return {
      label: "Alto",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      dot: "bg-emerald-500",
    };
  if (prom >= 50)
    return {
      label: "Medio",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      dot: "bg-amber-500",
    };
  return {
    label: "Bajo",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    dot: "bg-red-500",
  };
};

const MetricCard = ({ icon: Icon, label, value, sub, color }) => (
  <motion.div
    whileHover={{ y: -3 }}
    className={`bg-gradient-to-br ${color} p-5 rounded-2xl border shadow-sm`}
  >
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
      <span className="text-xs w-20 flex-shrink-0 text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full flex items-center px-2 transition-all duration-700 ${bg}`}
          style={{ width: `${pct}%` }}
        >
          {count > 0 && (
            <span className={`text-xs font-semibold ${textColor}`}>
              {count}
            </span>
          )}
        </div>
      </div>
      <span className={`text-xs font-semibold w-8 text-right ${color}`}>
        {pct}%
      </span>
    </div>
  );
};

const MiniBar = ({ value, color = "bg-teal-500" }) => (
  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full ${color}`}
      style={{ width: `${Math.min(value, 100)}%` }}
    />
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
    const checkDark = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const obs = new MutationObserver(checkDark);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
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
        const [testsRes, studentsRes, usersRes, sectionsRes, aptitudesRes, majorsRes] =
          await Promise.all([
            getStudentTests(),
            getStudents(),
            getUsers(),
            getSections(),
            getAptitudes(),
            getMajors(), // ← AÑADIDO
          ]);

        const tests = testsRes.data;
        const students = studentsRes.data;
        const users = usersRes.data;
        const sectionsData = sectionsRes.data;
        const majorsData = majorsRes.data; // ← AÑADIDO

        setStudentTests(tests);
        setSections(sectionsData);
        setAptitudes(aptitudesRes.data);

        // ── Procesar carreras recomendadas (igual que en ReporteGeneralVocacional) ──
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

        // Crear mapa de usuarios para evitar duplicados
        const userMap = new Map();
        users.forEach((user) => {
          userMap.set(user.id, user);
        });

        const result = students.map((student) => {
          const user = userMap.get(student.usuario);
          const paraleloObj = sectionsData.find(
            (s) => s.id === student.paralelo,
          );

          // Calcular promedio correcto basado en tests realizados
          const stTests = tests.filter((t) => t.estudiante === student.id);
          let totalCompleto = 0;
          let totalPreguntasRealizadas = 0;

          stTests.forEach((test) => {
            const testInfo = testsInfo.find(
              (ti) => ti.id === test.testvocational,
            );
            if (testInfo) {
              totalCompleto += test.completo;
              totalPreguntasRealizadas += testInfo.total_preguntas;
            }
          });

          const promedio =
            totalPreguntasRealizadas > 0
              ? (() => {
                  const valor =
                    (totalCompleto / totalPreguntasRealizadas) * 100;
                  if (valor >= 100) return 100;
                  return Number(valor.toFixed(1));
                })()
              : 0;

          return {
            id: student.id,
            nombre: user
              ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                user.username
              : "Desconocido",
            initials: user
              ? `${(user.first_name || "?")[0]}${(user.last_name || "?")[0]}`.toUpperCase()
              : "??",
            promedio,
            cantidadTests: stTests.length,
            paralelo: paraleloObj ? paraleloObj.nombre : "Sin paralelo",
            carrerasRecomendadas: majorsMap[student.id] || [], // ← AÑADIDO
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
      const matchSection =
        !selectedSection || d.paralelo === selectedSection.nombre;
      const matchSearch =
        !searchQuery ||
        d.nombre.toLowerCase().includes(searchQuery.toLowerCase());
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
    if (!filteredData.length)
      return { avg: 0, tests: 0, high: 0, mid: 0, low: 0 };
    const avg = (
      filteredData.reduce((a, d) => a + d.promedio, 0) / filteredData.length
    ).toFixed(1);
    return {
      avg,
      tests: filteredData.reduce((a, d) => a + d.cantidadTests, 0),
      high: filteredData.filter((d) => d.promedio >= 75).length,
      mid: filteredData.filter((d) => d.promedio >= 50 && d.promedio < 75)
        .length,
      low: filteredData.filter((d) => d.promedio < 50).length,
    };
  }, [filteredData]);

  const top5 = useMemo(
    () => [...filteredData].sort((a, b) => b.promedio - a.promedio).slice(0, 5),
    [filteredData],
  );

  // Test coverage (promedios por test)
  const testCoverage = useMemo(() => {
    return testsInfo.map((test) => {
      const values = filteredData.map((s) => {
        const st = studentTests.find(
          (t) => t.estudiante === s.id && t.testvocational === test.id,
        );
        return st ? (st.completo / test.total_preguntas) * 100 : 0;
      });
      const avg = values.length
        ? parseFloat(
            (values.reduce((a, v) => a + v, 0) / values.length).toFixed(1),
          )
        : 0;
      return { nombre: test.nombre, avg };
    });
  }, [filteredData, studentTests]);

  // Helper para porcentaje correcto
  const getPorcentaje = (studentId, testId) => {
    const st = studentTests.find(
      (t) => t.estudiante === studentId && t.testvocational === testId,
    );
    const info = testsInfo.find((t) => t.id === testId);
    if (!st || !info) return 0;
    const porcentaje = (st.completo / info.total_preguntas) * 100;
    if (porcentaje >= 100) return 100;
    return Number(porcentaje.toFixed(1));
  };

  // PDF Generation
  const generarPDF = () => {
    const pdf = new jsPDF("landscape", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const logo = "/logo.png";

    if (!filteredData.length)
      return alert("No hay datos para exportar.");

    const cleanText = (text) =>
      String(text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x20-\x7E]/g, "");

    const addBackground = () => {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setFillColor(10, 36, 99);
      pdf.rect(0, 0, pageWidth, 18, "F");
      pdf.rect(0, pageHeight - 10, pageWidth, 10, "F");
      try {
        pdf.saveGraphicsState();
        pdf.setGState(new pdf.GState({ opacity: 0.05 }));
        pdf.addImage(logo, "PNG", pageWidth / 2 - 45, pageHeight / 2 - 45, 90, 90);
        pdf.restoreGraphicsState();
      } catch (e) {}
      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(1);
      pdf.line(0, 18, pageWidth, 18);
    };

    const addHeader = (pageNum) => {
      addBackground();
      try {
        pdf.addImage(logo, "PNG", 8, 2.5, 12, 12);
      } catch (e) {}
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.text(cleanText("COLEGIO MARCELO QUIROGA SANTA CRUZ"), pageWidth / 2, 8, { align: "center" });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.text(cleanText("Sistema de Orientacion Vocacional"), pageWidth / 2, 13.5, { align: "center" });
      pdf.setFontSize(7.5);
      pdf.setTextColor(210, 225, 255);
      pdf.text(`Fecha: ${new Date().toLocaleDateString("es-BO")}`, pageWidth - 10, 7, { align: "right" });
      pdf.text(`Pagina ${pageNum}`, pageWidth - 10, 12.5, { align: "right" });
    };

    const addFooter = () => {
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7.5);
      pdf.text(
        cleanText("Sistema Vocacional - Colegio Marcelo Quiroga Santa Cruz"),
        pageWidth / 2,
        pageHeight - 4,
        { align: "center" }
      );
    };

    // ── PORTADA ──────────────────────────────────────────────────────────────
    addBackground();
    try {
      pdf.addImage(logo, "PNG", pageWidth / 2 - 22, 30, 44, 44);
    } catch (e) {}

    pdf.setFillColor(10, 36, 99);
    pdf.roundedRect(pageWidth / 2 - 85, 88, 170, 28, 4, 4, "F");
    pdf.setDrawColor(212, 175, 55);
    pdf.roundedRect(pageWidth / 2 - 85, 88, 170, 28, 4, 4, "D");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text(cleanText("REPORTE GENERAL VOCACIONAL"), pageWidth / 2, 104, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(212, 175, 55);
    pdf.text(cleanText("Resultados Consolidados de Estudiantes"), pageWidth / 2, 112, { align: "center" });
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(pageWidth / 2 - 70, 128, 140, 42, 3, 3, "FD");
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(10, 36, 99);
    pdf.setFontSize(10);
    pdf.text(cleanText("Informacion General del Reporte"), pageWidth / 2, 138, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(50);
    const paralelo = selectedSection?.nombre || "Todos los paralelos";
    pdf.text(`Paralelo seleccionado: ${cleanText(paralelo)}`, pageWidth / 2, 148, { align: "center" });
    pdf.text(`Total de estudiantes: ${filteredData.length}`, pageWidth / 2, 156, { align: "center" });
    pdf.text(`Fecha de generacion: ${new Date().toLocaleString("es-BO")}`, pageWidth / 2, 164, { align: "center" });
    addFooter();

    // ── TABLA GENERAL ────────────────────────────────────────────────────────
    const headers = [
      "#",
      "Estudiante",
      "Paralelo",
      "Promedio",
      "Tests",
      "Carreras Recomendadas",
    ];
    const widths = [8, 40, 25, 20, 14, 121];
    const colX = [];
    let currentX = 8;
    widths.forEach((w) => { colX.push(currentX); currentX += w; });
    const tableWidth = widths.reduce((a, b) => a + b, 0);

    let page = 2;
    let y = 0;

    const startTablePage = () => {
      pdf.addPage("a4", "landscape");
      addHeader(page);
      y = 28;
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(10, 36, 99);
      pdf.setFontSize(10);
      pdf.text(cleanText("Resultados Generales de Estudiantes"), pageWidth / 2, y, { align: "center" });
      y += 8;
      pdf.setFillColor(10, 36, 99);
      pdf.rect((pageWidth - tableWidth) / 2, y, tableWidth, 10, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(6.8);
      headers.forEach((h, i) => {
        pdf.text(
          cleanText(h),
          (pageWidth - tableWidth) / 2 + colX[i] + widths[i] / 2,
          y + 6,
          { align: "center" }
        );
      });
      y += 10;
    };

    startTablePage();

    // ── FILAS ─────────────────────────────────────────────────────────────────
    filteredData.forEach((student, idx) => {
      // Calcular altura de fila según líneas de carreras
      const carrerasText = cleanText(
        student.carrerasRecomendadas?.length
          ? student.carrerasRecomendadas
              .map((c) => `${c.carrera} (${c.probabilidad})`)
              .join("  •  ")
          : "Sin carreras registradas"
      );
      const carrerasLines = pdf.splitTextToSize(carrerasText, widths[5] - 4);
      const rowHeight = Math.max(10, carrerasLines.length * 5 + 4);

      if (y + rowHeight > pageHeight - 18) {
        addFooter();
        page++;
        startTablePage();
      }

      // Fondo alternado
      if (idx % 2 === 0) {
        pdf.setFillColor(238, 244, 255);
      } else {
        pdf.setFillColor(255, 255, 255);
      }
      pdf.rect((pageWidth - tableWidth) / 2, y, tableWidth, rowHeight, "F");
      pdf.setDrawColor(215, 225, 240);
      pdf.rect((pageWidth - tableWidth) / 2, y, tableWidth, rowHeight);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(35, 35, 55);
      pdf.setFontSize(6.5);

      // Columnas simples (centradas)
      const simpleCols = [
        { val: idx + 1,                       i: 0 },
        { val: cleanText(student.nombre),     i: 1 },
        { val: cleanText(student.paralelo),   i: 2 },
        { val: `${student.promedio}%`,        i: 3 },
        { val: `${student.cantidadTests}/${testsInfo.length}`, i: 4 },
      ];

      simpleCols.forEach(({ val, i }) => {
        pdf.text(
          String(val),
          (pageWidth - tableWidth) / 2 + colX[i] + widths[i] / 2,
          y + rowHeight / 2 + 1.5,
          { align: "center", maxWidth: widths[i] - 2 }
        );
      });

      // Columna carreras (alineada a la izquierda, con wrap)
      carrerasLines.forEach((line, li) => {
        pdf.text(
          line,
          (pageWidth - tableWidth) / 2 + colX[5] + 2,
          y + 5.5 + li * 5
        );
      });

      y += rowHeight;
    });

    addFooter();

    // ── TABLA CARRERAS DETALLE ────────────────────────────────────────────────
    page++;
    pdf.addPage("a4", "landscape");
    addHeader(page);

    y = 30;
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(10, 36, 99);
    pdf.setFontSize(11);
    pdf.text(cleanText("Carreras Recomendadas por Estudiante"), pageWidth / 2, y, { align: "center" });
    y += 8;

    const recHeaders = ["#", "Estudiante", "Paralelo", "Carreras Recomendadas"];
    const recWidths = [10, 55, 30, 150];
    const recX = [];
    let rx = 0;
    recWidths.forEach((w) => { recX.push(rx); rx += w; });
    const recTableWidth = recWidths.reduce((a, b) => a + b, 0);

    pdf.setFillColor(10, 36, 99);
    pdf.rect((pageWidth - recTableWidth) / 2, y, recTableWidth, 10, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    recHeaders.forEach((h, i) => {
      pdf.text(
        cleanText(h),
        (pageWidth - recTableWidth) / 2 + recX[i] + recWidths[i] / 2,
        y + 6,
        { align: "center" }
      );
    });
    y += 10;

    filteredData.forEach((student, idx) => {
      if (!student.carrerasRecomendadas?.length) return;

      const carrerasText = cleanText(
        student.carrerasRecomendadas
          .map((c) => `${c.carrera} (${c.probabilidad})`)
          .join("  •  ")
      );
      const lines = pdf.splitTextToSize(carrerasText, recWidths[3] - 4);
      const rowHeight = Math.max(10, lines.length * 5 + 3);

      if (y + rowHeight > pageHeight - 18) {
        addFooter();
        page++;
        pdf.addPage("a4", "landscape");
        addHeader(page);
        y = 35;
      }

      if (idx % 2 === 0) {
        pdf.setFillColor(238, 244, 255);
      } else {
        pdf.setFillColor(255, 255, 255);
      }
      pdf.rect((pageWidth - recTableWidth) / 2, y, recTableWidth, rowHeight, "F");
      pdf.setDrawColor(215, 225, 240);
      pdf.rect((pageWidth - recTableWidth) / 2, y, recTableWidth, rowHeight);

      pdf.setTextColor(35, 35, 55);
      pdf.setFontSize(7);

      const row = [idx + 1, cleanText(student.nombre), cleanText(student.paralelo)];
      row.forEach((cell, i) => {
        pdf.text(
          String(cell),
          (pageWidth - recTableWidth) / 2 + recX[i] + recWidths[i] / 2,
          y + 6,
          { align: "center", maxWidth: recWidths[i] - 2 }
        );
      });
      lines.forEach((line, li) => {
        pdf.text(
          line,
          (pageWidth - recTableWidth) / 2 + recX[3] + 2,
          y + 6 + li * 5
        );
      });

      y += rowHeight;
    });

    addFooter();
    pdf.save("Reporte_Vocacional_General.pdf");
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
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
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
              setSelectedSection(
                sections.find((s) => s.id === parseInt(e.target.value)) || null,
              )
            }
          >
            <option value="">Todos los paralelos</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
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
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <span className="text-sm w-6 text-center">{medals[i]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.nombre}</p>
                    <p className="text-xs text-gray-400">{s.paralelo}</p>
                  </div>
                  <span className="text-sm font-bold dark:text-teal-400 text-teal-600">
                    {s.promedio}%
                  </span>
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
              <div
                key={t.nombre}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
              >
                <span className="text-xs text-gray-500 dark:text-gray-400 w-full sm:w-40 flex-shrink-0 truncate">
                  {t.nombre}
                </span>
                <div className="flex-1 w-full sm:w-auto">
                  <MiniBar value={t.avg} />
                </div>
                <span className="text-xs font-semibold dark:text-teal-400 text-teal-600 w-9 text-right">
                  {t.avg}%
                </span>
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
                  <th className="px-4 py-3 text-left min-w-[100px]">
                    Progreso
                  </th>
                  <th className="px-4 py-3 text-center">Tests</th>
                  {/* ── COLUMNA CARRERAS AÑADIDA ── */}
                  <th className="px-4 py-3 text-left min-w-[200px]">
                    🎓 Carreras Recomendadas
                  </th>
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
                          <span className="font-medium whitespace-nowrap">
                            {item.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {item.paralelo}
                      </td>
                      <td className="px-4 py-3 text-center font-bold dark:text-teal-300 text-teal-700">
                        {item.promedio}%
                      </td>
                      <td className="px-4 py-3">
                        <MiniBar value={item.promedio} />
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                        {item.cantidadTests}/11
                      </td>
                      {/* ── CELDA CARRERAS AÑADIDA ── */}
                      <td className="px-4 py-3">
                        {item.carrerasRecomendadas?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.carrerasRecomendadas.map((carrera, ci) => (
                              <span
                                key={ci}
                                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-black dark:text-white border border-teal-200 dark:border-teal-700/50 whitespace-nowrap"
                              >
                                {carrera.carrera}
                                <span className="text-black dark:text-white font-semibold">
                                  {carrera.probabilidad}
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-black dark:text-white italic">
                            Sin datos
                          </span>
                        )}
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