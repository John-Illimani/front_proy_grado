import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStudentTests } from "../../../api/api_estudent_test";
import { getMajors } from "../../../api/api_majors";
import { getAptitudes } from "../../../api/api_aptitudes";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  LabelList,
} from "recharts";
import { getStudentId } from "./studentId";
import { getUsers } from "../../../api/api_user";

const testsInfo = [
  {
    id: 1,
    nombre: "Test Chaside",
    total_preguntas: 97,
    icon: "🧮",
    color: "dark:from-blue-500 dark:to-cyan-500 from-indigo-700 to-indigo-700",
  },
  {
    id: 2,
    nombre: "Test Colmil",
    total_preguntas: 156,
    icon: "👥",
    color:
      "dark:from-green-500 dark:to-emerald-500 from-indigo-700 to-indigo-700",
  },
  {
    id: 3,
    nombre: "Test Personalidad",
    total_preguntas: 163,
    icon: "🎨",
    color:
      "dark:from-purple-500 dark:to-pink-500 from-indigo-700 to-indigo-700",
  },
  {
    id: 4,
    nombre: "Razonamiento Verbal",
    total_preguntas: 47,
    icon: "🗣️",
    color: "dark:from-orange-500 dark:to-red-500 from-indigo-700 to-indigo-700",
  },
  {
    id: 5,
    nombre: "Razonamiento Numérico",
    total_preguntas: 40,
    icon: "📊",
    color:
      "dark:from-indigo-500 dark:to-blue-500 from-indigo-700 to-indigo-700",
  },
  {
    id: 6,
    nombre: "Razonamiento Abstracto",
    total_preguntas: 48,
    icon: "🧠",
    color:
      "dark:from-yellow-500 dark:to-amber-500 from-indigo-700 to-indigo-700",
  },
  {
    id: 7,
    nombre: "Razonamiento Mecánico",
    total_preguntas: 15,
    icon: "⚙️",
    color: "dark:from-pink-500 dark:to-red-400 from-indigo-700 to-indigo-700",
  },
  {
    id: 8,
    nombre: "Ortografía",
    total_preguntas: 26,
    icon: "✍️",
    color: "dark:from-cyan-500 dark:to-blue-400 from-indigo-700 to-indigo-700",
  },
  {
    id: 9,
    nombre: "Rapidez y exactitud preceptiva 1",
    total_preguntas: 100,
    icon: "⏱️",
    color:
      "dark:from-purple-500 dark:to-indigo-500 from-indigo-700 to-indigo-700",
  },
  {
    id: 10,
    nombre: "Rapidez y exactitud preceptiva 2",
    total_preguntas: 100,
    icon: "⏱️",
    color: "dark:from-green-400 dark:to-teal-500 from-indigo-700 to-indigo-700",
  },
  {
    id: 11,
    nombre: "Razonamiento Espacial",
    total_preguntas: 30,
    icon: "🔮",
    color: "dark:from-green-400 dark:to-teal-500 from-indigo-700 to-indigo-700",
  },
];

// Paleta de colores para las carreras
const careerColors = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-600",
  "from-lime-500 to-green-600",
  "from-fuchsia-500 to-violet-600",
];

const careerIcons = [
  "🏛️",
  "🔬",
  "💻",
  "⚕️",
  "⚖️",
  "🎨",
  "📐",
  "🌍",
  "📈",
  "🏗️",
];

export const ReporteVocacional = () => {
  const [studentTests, setStudentTests] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recommendedMajors, setRecommendedMajors] = useState([]);
  const reportRef = useRef(null);
  const [studentId, setStudentId] = useState(null);
  const [aptitudes, setAptitudes] = useState([]);
  const [Usuarios, setUsuarios] = useState([]);
  const [activeTab, setActiveTab] = useState("tests"); // "tests" | "aptitudes" | "carreras"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentStudentId = await getStudentId();
        setStudentId(currentStudentId);

        const [testsRes, majorsRes, aptitudesRes] = await Promise.all([
          getStudentTests(),
          getMajors(),
          getAptitudes(),
        ]);

        const filteredTests = testsRes.data.filter(
          (t) => t.estudiante === currentStudentId,
        );
        setStudentTests(filteredTests);

        const studentMajors = majorsRes.data.find(
          (item) => item.estudiante === currentStudentId,
        );

        if (
          studentMajors?.carreras &&
          studentMajors.carreras !== "sin carreras"
        ) {
          try {
            const carrerasArray = JSON.parse(
              studentMajors.carreras.replace(/'/g, '"'),
            );
            setRecommendedMajors(carrerasArray);
          } catch (err) {
            setRecommendedMajors([]);
          }
        } else {
          setRecommendedMajors([]);
        }

        const studentAptitudes = aptitudesRes.data.find(
          (item) => item.estudiante === currentStudentId,
        );
        setAptitudes(studentAptitudes?.aptitudes ?? []);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const username = localStorage.getItem("username");

  useEffect(() => {
    async function Users() {
      let respUsers = await getUsers();
      setUsuarios(respUsers.data);
    }
    Users();
  }, []);

  const nombre = Usuarios.find((u) => u.username === username);

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const getPorcentaje = (testId) => {
    const studentTest = studentTests.find((t) => t.testvocational === testId);
    const info = testsInfo.find((t) => t.id === testId);
    if (!studentTest || !info) return 0;
    let pct = ((studentTest.completo / info.total_preguntas) * 100).toFixed(1);
    return Math.min(Math.max(parseFloat(pct), 0), 100);
  };

  const porcentajeAptitudes = (apt) => {
    let pct = parseFloat(apt.porcentaje) || 0;
    return Math.max(0, Math.min(100, pct));
  };

  const promedioTotal = () => {
    if (!testsInfo.length) return 0;
    const totalPreguntasSistema = testsInfo.reduce(
      (acc, t) => acc + t.total_preguntas,
      0,
    );
    let respondidas = 0;
    studentTests.forEach((t) => {
      const info = testsInfo.find((x) => x.id === t.testvocational);
      if (info) respondidas += Math.min(t.completo, info.total_preguntas);
    });
    return Math.min((respondidas / totalPreguntasSistema) * 100, 100).toFixed(
      1,
    );
  };

  const promedio = parseFloat(promedioTotal());

  const getMotivacion = (p) => {
    if (p < 30) return "Solo un poco más…";
    if (p < 60) return "Buen avance, sigue así";
    if (p < 90) return "¡Estás muy cerca!";
    return "¡Test completado!";
  };

  // Filtros: solo items con > 0%

  const normalizarProbabilidades = (carreras) => {
    if (!carreras.length) return [];

    // valor mínimo base
    const base = 45;

    // obtener el máximo original
    const max = Math.max(
      ...carreras.map((c) => parseProbabilidad(c.probabilidad)),
    );

    return carreras.map((c) => {
      const original = parseProbabilidad(c.probabilidad);

      // escala suavizada
      const nuevo = base + (original / max) * 20;

      return {
        ...c,
        probabilidad: `${nuevo.toFixed(1)}%`,
      };
    });
  };

  const activeTests = testsInfo.filter((t) => getPorcentaje(t.id) > 0);
  const activeAptitudes = aptitudes.filter((a) => porcentajeAptitudes(a) > 0);
  const activeCarreras = recommendedMajors.filter((c) => {
    const pct = parseFloat(c.probabilidad) || 0;
    return pct > 0;
  });

  const parseProbabilidad = (p) => {
    if (!p) return 0;
    return parseFloat(String(p).replace("%", "")) || 0;
  };

  function formatearNombre(nombre) {
    const palabras = nombre.trim().split(/\s+/);
    if (palabras[0].toLowerCase() === "razonamiento") return palabras[1];
    if (palabras[0].toLowerCase() === "rapidez")
      return `Rapidez ${palabras[palabras.length - 1]}`;
    if (palabras[0].toLowerCase() === "test") return palabras[1];
    return palabras[0];
  }

  const lineData = activeTests.map((test) => ({
    name: formatearNombre(test.nombre),
    progreso: getPorcentaje(test.id),
  }));

  const completeTest = testsInfo.map((test) => ({
    name: formatearNombre(test.nombre),
    progreso: getPorcentaje(test.id),
  }));

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "¡Buenos días! ☀️";
    if (h < 18) return "¡Buenas tardes! 🌤️";
    return "¡Buenas noches! 🌙";
  };

  const formattedDate = currentTime.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const globalMessage =
    promedio < 30
      ? " Apenas comienzas, ¡sigue avanzando!"
      : promedio < 60
        ? " Vas por buen camino, mantén el ritmo."
        : promedio < 90
          ? " Estás a punto de lograrlo."
          : " ¡Excelente! Completaste  todos los tests.";

const handleDownload = async () => {
  const pdf = new jsPDF("l", "mm", "letter");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const logo = "/logo.png";

  // ───────────────────────── HELPERS ─────────────────────────
  const cleanText = (text) =>
    String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x20-\x7E]/g, "");

  const studentName =
    `${nombre?.first_name || ""} ${nombre?.last_name || ""}`.trim() ||
    "Estudiante";

  // ───────────────────────── PALETA ─────────────────────────
  const NAVY = [15, 23, 42];
  const BLUE = [30, 64, 175];
  const GOLD = [212, 175, 55];

  const WHITE = [255, 255, 255];
  const LIGHT = [248, 250, 252];
  const DARK = [30, 41, 59];

  const RULE = [226, 232, 240];
  const MUTED = [100, 116, 139];

  // ───────────────────────── NOMBRES TESTS ─────────────────────────
  const shortTest = (name) =>
    ({
      "Razonamiento Mecanico": "Razonamiento Mecánico",
      "Razonamiento Espacial": "Razonamiento Espacial",
      "Razonamiento Verbal": "Razonamiento Verbal",
      "Razonamiento Abstracto": "Razonamiento Abstracto",

      "Rapidez y exactitud perceptiva 1":
        "Rapidez y Exactitud Perceptiva I",

      "Rapidez y exactitud perceptiva 2":
        "Rapidez y Exactitud Perceptiva II",

      Ortografia: "Ortografía",

      "Test Chaside": "Test CHASIDE",

      "Test Colmi": "Test COLMI",

      "Test Personalidad": "Test de Personalidad",
    }[name] || name);

  // ───────────────────────── BACKGROUND ─────────────────────────
  pdf.setFillColor(...LIGHT);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // ───────────────────────── HEADER ─────────────────────────
  pdf.setFillColor(...NAVY);
  pdf.rect(0, 0, pageWidth, 20, "F");

  pdf.setFillColor(...GOLD);
  pdf.rect(0, 20, pageWidth, 0.8, "F");

  try {
    pdf.addImage(logo, "PNG", 10, 4, 12, 12);
  } catch {}

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(...WHITE);

  pdf.text(
    "COLEGIO MARCELO QUIROGA SANTA CRUZ",
    pageWidth / 2,
    9,
    {
      align: "center",
    }
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(210, 220, 240);

  pdf.text(
    "Sistema de Orientación y Evaluación Vocacional",
    pageWidth / 2,
    14,
    {
      align: "center",
    }
  );

  // ───────────────────────── BANNER ESTUDIANTE ─────────────────────────
  const bannerY = 24;

  pdf.setFillColor(...WHITE);

  pdf.roundedRect(
    10,
    bannerY,
    pageWidth - 20,
    16,
    2.5,
    2.5,
    "F"
  );

  pdf.setDrawColor(...RULE);
  pdf.setLineWidth(0.3);

  pdf.roundedRect(
    10,
    bannerY,
    pageWidth - 20,
    16,
    2.5,
    2.5
  );

  pdf.setFillColor(...BLUE);
  pdf.rect(10, bannerY, 2, 16, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(...DARK);

  pdf.text(cleanText(studentName), pageWidth / 2, bannerY + 6.5, {
    align: "center",
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(...MUTED);

  pdf.text(
    `Reporte Vocacional | ${formattedDate} | Promedio General: ${promedio}%`,
    pageWidth / 2,
    bannerY + 11.5,
    {
      align: "center",
    }
  );

  // ───────────────────────── LAYOUT ─────────────────────────
  const startY = bannerY + 20;

  const margin = 10;
  const gap = 3;

  const usable = pageWidth - margin * 2 - gap * 2;

  const colA = usable * 0.32;
  const colB = usable * 0.27;
  const colC = usable * 0.41;

  const xA = margin;
  const xB = xA + colA + gap;
  const xC = xB + colB + gap;

  const headerH = 8;

  const tableH = pageHeight - startY - 15;

  const bodyY = startY + headerH;

  const rows = Math.max(
    testsInfo.length,
    activeAptitudes.length,
    activeCarreras.length
  );

  const rowH = (tableH - headerH) / rows;

  // ───────────────────────── CARRERAS ORDENADAS ─────────────────────────
  const sorted = [...activeCarreras].sort(
    (a, b) =>
      parseProbabilidad(b.probabilidad) -
      parseProbabilidad(a.probabilidad)
  );

  // ───────────────────────── TARJETAS ─────────────────────────
  const drawCard = (x, w, h) => {
    pdf.setFillColor(220, 225, 235);

    pdf.roundedRect(
      x + 0.8,
      startY + 0.8,
      w,
      h,
      2,
      2,
      "F"
    );

    pdf.setFillColor(...WHITE);

    pdf.roundedRect(x, startY, w, h, 2, 2, "F");

    pdf.setDrawColor(...RULE);
    pdf.setLineWidth(0.25);

    pdf.roundedRect(x, startY, w, h, 2, 2);
  };

  drawCard(xA, colA, tableH);
  drawCard(xB, colB, tableH);
  drawCard(xC, colC, tableH);

  // ───────────────────────── ENCABEZADOS ─────────────────────────
  const drawColHeader = (title, x, w) => {
    pdf.setFillColor(...NAVY);

    pdf.roundedRect(x, startY, w, headerH, 2, 2, "F");

    pdf.setFillColor(...GOLD);
    pdf.rect(x, startY + headerH - 0.5, w, 0.5, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.8);
    pdf.setTextColor(...WHITE);

    pdf.text(title, x + w / 2, startY + 5.2, {
      align: "center",
    });
  };

  drawColHeader("TESTS APLICADOS", xA, colA);

  drawColHeader(
    "APTITUDES IDENTIFICADAS",
    xB,
    colB
  );

  drawColHeader(
    "CARRERAS SUGERIDAS",
    xC,
    colC
  );

  // ───────────────────────── FILAS ─────────────────────────
  const drawRow = (
    label,
    pct,
    x,
    w,
    i,
    highlight = false
  ) => {
    const y = bodyY + i * rowH;
    const midY = y + rowH / 2;

    // Fondo alternado
    if (highlight) {
      pdf.setFillColor(255, 248, 235);
      pdf.rect(x, y, w, rowH, "F");

      pdf.setFillColor(...GOLD);
      pdf.rect(x, y, 1.5, rowH, "F");
    } else if (i % 2 === 0) {
      pdf.setFillColor(250, 251, 253);
      pdf.rect(x, y, w, rowH, "F");
    }

    // Texto
    pdf.setFont(
      "helvetica",
      highlight ? "bold" : "normal"
    );

    pdf.setFontSize(7.3);
    pdf.setTextColor(...DARK);

    pdf.text(cleanText(label), x + 4, midY + 0.8);

    // Porcentaje
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.3);
    pdf.setTextColor(...DARK);

    pdf.text(`${pct}%`, x + w - 4, midY + 0.8, {
      align: "right",
    });

    // Separador
    pdf.setDrawColor(...RULE);
    pdf.setLineWidth(0.2);

    pdf.line(
      x + 2,
      y + rowH,
      x + w - 2,
      y + rowH
    );
  };

  // ───────────────────────── TESTS ─────────────────────────
  testsInfo.forEach((t, i) => {
    drawRow(
      shortTest(t.nombre),
      getPorcentaje(t.id),
      xA,
      colA,
      i
    );
  });

  // ───────────────────────── APTITUDES ─────────────────────────
  activeAptitudes.forEach((a, i) => {
    drawRow(
      a.aptitud,
      porcentajeAptitudes(a),
      xB,
      colB,
      i
    );
  });

  // ───────────────────────── CARRERAS ─────────────────────────
  sorted.forEach((carr, i) => {
    const pct = parseProbabilidad(carr.probabilidad);

    drawRow(
      carr.carrera,
      pct,
      xC,
      colC,
      i,
      i === 0
    );
  });

  // ───────────────────────── LEYENDA ─────────────────────────
  const legendY = pageHeight - 14;

  const items = [
    { label: "Nivel Alto (>=90%)" },
    { label: "Nivel Medio (>=60%)" },
    { label: "Nivel Básico (>0%)" },
    { label: "Sin Información" },
  ];

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.3);
  pdf.setTextColor(...MUTED);

  pdf.text("Interpretación:", xA, legendY + 3);

  let lx = xA + 18;

  items.forEach(({ label }) => {
    pdf.setFillColor(80, 80, 80);

    pdf.circle(lx, legendY + 2.2, 1.1, "F");

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...DARK);

    pdf.text(label, lx + 2.5, legendY + 3);

    lx += 36;
  });

  // ───────────────────────── FOOTER ─────────────────────────
  pdf.setFillColor(...NAVY);

  pdf.rect(0, pageHeight - 8, pageWidth, 8, "F");

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(210, 220, 240);

  pdf.text(
    "Sistema de Orientación Vocacional | Colegio Marcelo Quiroga Santa Cruz",
    pageWidth / 2,
    pageHeight - 3,
    {
      align: "center",
    }
  );

  // ───────────────────────── EXPORTAR ─────────────────────────
  pdf.save("Reporte_Vocacional.pdf");
};
  const handleShare = () => {
    let txt = "📊 *Mi progreso vocacional* 📊\n\n";
    activeTests.forEach((t) => {
      txt += `${t.icon} *${t.nombre}*: ${getPorcentaje(t.id)}%\n`;
    });
    if (activeAptitudes.length > 0) {
      txt += "\n⭐ *Mis aptitudes*\n";
      activeAptitudes.forEach((a) => {
        txt += `💡 *${a.aptitud}*: ${porcentajeAptitudes(a)}%\n`;
      });
    }
    if (activeCarreras.length > 0) {
      txt += "\n🎓 *Carreras Recomendadas*\n";
      activeCarreras.forEach((c) => {
        txt += `🏫 ${c.carrera}: ${c.probabilidad}\n`;
      });
    }
    txt += `\n🔗 ${window.location.href}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`,
      "_blank",
    );
    navigator.clipboard.writeText(txt);
    alert("¡Resultados copiados al portapapeles! 📤");
  };

  // ─── Circular progress ───────────────────────────────────────────────────────
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (promedio / 100) * circumference;

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  const colors = {
    grid: isDark ? "#334155" : "#E2E8F0",
    axis: isDark ? "#CBD5F5" : "#334155",
    tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
    tooltipText: isDark ? "#F1F5F9" : "#0F172A",
    line: isDark ? "#2DD4BF" : "#4f46e5",
    dot: isDark ? "#2DD4BF" : "#4f46e5",
    dotActive: isDark ? "#06b6d4" : "#6366f1",
  };

  // ─── UI helpers ──────────────────────────────────────────────────────────────

  const tabs = [
    { id: "tests", label: "Tests", emoji: "📋", count: activeTests.length },
    {
      id: "aptitudes",
      label: "Aptitudes",
      emoji: "💡",
      count: activeAptitudes.length,
    },
    {
      id: "carreras",
      label: "Carreras",
      emoji: "🎓",
      count: activeCarreras.length,
    },
  ];

  return (
    <div
      className="relative w-full px-2 md:px-6 overflow-hidden"
      ref={reportRef}
    >
      <div className="relative z-10 max-w-[95%] h-screen mx-auto md:py-8 overflow-y-auto scrollbar-hide">
        {/* ── HEADER ── */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-black to-black dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
            Reporte Vocacional
          </h1>
          <p className="dark:text-gray-300 mt-1 text-sm md:text-lg text-black">
            {greeting()}
          </p>
          <p className="dark:text-gray-400 mt-0.5 text-xs md:text-sm text-black">
            {formattedDate}
          </p>
          {nombre && (
            <p className="dark:text-cyan-300 mt-1 text-sm font-semibold text-indigo-700">
              {nombre.first_name} {nombre.last_name}
            </p>
          )}
        </motion.div>

        {/* ── TOP ROW: Circular + Stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* Circular Progress */}
          <motion.div
            className="bg-gradient-to-br from-white to-slate-50 dark:from-black/50 dark:to-gray-900/50 rounded-3xl p-5 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 shadow-xl flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-base md:text-lg font-bold dark:text-white text-black mb-3 w-full flex justify-between">
              Progreso Global <span>📈</span>
            </h2>
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  r={radius}
                  cx="50%"
                  cy="50%"
                  className="stroke-slate-200 dark:stroke-slate-700"
                  strokeWidth="14"
                  fill="transparent"
                />
                <motion.circle
                  r={radius}
                  cx="50%"
                  cy="50%"
                  className="stroke-lime-400 dark:stroke-cyan-400"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference}
                  strokeLinecap="round"
                  animate={{ strokeDashoffset: progressOffset }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </svg>
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <span className="text-3xl font-extrabold text-black dark:text-cyan-400 drop-shadow-[0_0_10px_#06b6d4]">
                  {promedio}%
                </span>
                <p className="dark:text-gray-300 text-black text-xs mt-1 text-center max-w-[130px] leading-tight">
                  {globalMessage}
                </p>
              </motion.div>
            </div>

            {/* Mini stats */}
            <div className="w-full grid grid-cols-3 gap-2 mt-4">
              {[
                {
                  label: "Tests",
                  value: activeTests.length,
                  total: testsInfo.length,
                },
                { label: "Aptitudes", value: activeAptitudes.length },
                { label: "Carreras", value: activeCarreras.length },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center rounded-xl bg-slate-100 dark:bg-slate-800/50 py-2"
                >
                  <p className="text-lg font-bold text-black dark:text-cyan-300">
                    {s.value}
                    {s.total ? `/${s.total}` : ""}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Line chart span */}
          <motion.div
            className="lg:col-span-3 bg-gradient-to-br from-white to-slate-50 dark:from-black/50 dark:to-gray-900/50 rounded-3xl p-5 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 shadow-xl"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-base md:text-lg font-bold dark:text-white text-black mb-4 flex justify-between">
              Progreso por Test <span>📊</span>
            </h2>

            {activeTests.length > 0 ? (
              <ResponsiveContainer width="100%" height={290}>
                <BarChart
                  data={completeTest}
                  margin={{ top: 15, right: 20, left: 0, bottom: 30 }}
                >
                  <defs>
                    <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={colors.line}
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor={colors.dot}
                        stopOpacity={0.5}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke={colors.grid}
                    opacity={0.5}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{ fill: colors.axis, fontSize: 11 }}
                    stroke={colors.axis}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: colors.axis }}
                    stroke={colors.axis}
                  />

                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      backgroundColor: colors.tooltipBg,
                      borderRadius: "12px",
                      border: "none",
                      color: colors.tooltipText,
                      boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                    }}
                    formatter={(value) => [`${value}%`, "Avance"]}
                  />

                  <Bar
                    dataKey="progreso"
                    radius={[12, 12, 0, 0]}
                    fill="url(#barColor)"
                    barSize={28}
                  >
                    <LabelList
                      dataKey="progreso"
                      position="top"
                      formatter={(v) => `${v}%`}
                      fill={colors.axis}
                      fontSize={11}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-sm">
                Aún no hay tests completados
              </div>
            )}
          </motion.div>
        </div>

        {/* ── TABS ── */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-1.5 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-700 text-black dark:text-white shadow-md"
                    : "text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                    activeTab === tab.id
                      ? "bg-lime-400 dark:bg-cyan-500 text-black dark:text-black"
                      : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">
          {/* ── TESTS TAB ── */}
          {activeTab === "tests" && (
            <motion.div
              key="tests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {activeTests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
                  <span className="text-5xl mb-3">📋</span>
                  <p className="text-lg font-medium">
                    Aún no has completado ningún test
                  </p>
                  <p className="text-sm mt-1">
                    ¡Empieza ahora para ver tus resultados aquí!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeTests.map((test, idx) => {
                    const porcentaje = getPorcentaje(test.id);
                    const motivacion = getMotivacion(porcentaje);
                    return (
                      <motion.div
                        key={test.id}
                        className="bg-white dark:bg-gradient-to-br dark:from-black/60 dark:to-gray-900/60 rounded-2xl p-4 border-2 border-slate-100 dark:border-slate-700/50 hover:border-lime-400 dark:hover:border-cyan-500/50 shadow-md hover:shadow-xl transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.06 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">{test.icon}</span>
                          <span
                            className={`text-lg font-extrabold ${
                              porcentaje >= 90
                                ? "text-lime-600 dark:text-cyan-300"
                                : porcentaje >= 60
                                  ? "text-amber-600 dark:text-yellow-300"
                                  : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {porcentaje}%
                          </span>
                        </div>
                        <h3 className="font-semibold text-black dark:text-white text-sm mb-2 leading-snug">
                          {test.nombre}
                        </h3>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-2">
                          <motion.div
                            className={`h-2.5 rounded-full bg-gradient-to-r ${test.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${porcentaje}%` }}
                            transition={{
                              duration: 1.2,
                              delay: idx * 0.06 + 0.2,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {motivacion}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── APTITUDES TAB ── */}
          {activeTab === "aptitudes" && (
            <motion.div
              key="aptitudes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {activeAptitudes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
                  <span className="text-5xl mb-3">💡</span>
                  <p className="text-lg font-medium">
                    No hay aptitudes para mostrar aún
                  </p>
                  <p className="text-sm mt-1">
                    Completa más tests para ver tus aptitudes
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeAptitudes.map((apt, index) => {
                    const pct = porcentajeAptitudes(apt);
                    const barColor =
                      pct >= 80
                        ? "from-lime-400 to-emerald-500 dark:from-cyan-400 dark:to-teal-500"
                        : pct >= 60
                          ? "from-yellow-400 to-amber-500 dark:from-yellow-400 dark:to-amber-500"
                          : pct >= 40
                            ? "from-orange-400 to-rose-400 dark:from-orange-400 dark:to-rose-400"
                            : "from-slate-400 to-slate-500 dark:from-slate-500 dark:to-slate-600";

                    return (
                      <motion.div
                        key={index}
                        className="bg-white dark:bg-gradient-to-br dark:from-black/60 dark:to-gray-900/60 rounded-2xl p-5 border-2 border-slate-100 dark:border-slate-700/50 hover:border-lime-400 dark:hover:border-cyan-500/50 shadow-md hover:shadow-xl transition-all duration-300"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.07 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-black dark:text-white text-base leading-snug pr-2">
                            {apt.aptitud}
                          </h3>
                          <span
                            className={`text-xl font-extrabold shrink-0 ${
                              pct >= 80
                                ? "text-lime-600 dark:text-cyan-300"
                                : pct >= 60
                                  ? "text-amber-600 dark:text-yellow-300"
                                  : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>

                        {/* Barra */}
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden mb-3">
                          <motion.div
                            className={`h-3 rounded-full bg-gradient-to-r ${barColor}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{
                              duration: 1.3,
                              delay: index * 0.07 + 0.2,
                              ease: "easeOut",
                            }}
                          />
                        </div>

                        {/* Nivel */}
                        <span
                          className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                            pct >= 80
                              ? "bg-lime-100 text-lime-700 dark:bg-cyan-900/40 dark:text-cyan-300"
                              : pct >= 60
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : pct >= 40
                                  ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                          }`}
                        >
                          {pct >= 80
                            ? "⭐ Alta"
                            : pct >= 60
                              ? "👍 Media-Alta"
                              : pct >= 40
                                ? "📈 Media"
                                : "🔄 En desarrollo"}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── CARRERAS TAB ── */}
          {activeTab === "carreras" && (
            <motion.div
              key="carreras"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {activeCarreras.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
                  <span className="text-5xl mb-3">🎓</span>
                  <p className="text-lg font-medium">
                    Aún no hay carreras recomendadas
                  </p>
                  <p className="text-sm mt-1">
                    Completa los tests para recibir sugerencias personalizadas
                  </p>
                </div>
              ) : (
                <>
                  {/* Top carrera destacada */}
                  {(() => {
                    const top = [...activeCarreras].sort(
                      (a, b) =>
                        parseProbabilidad(b.probabilidad) -
                        parseProbabilidad(a.probabilidad),
                    )[0];
                    const topPct = parseProbabilidad(top.probabilidad);
                    return (
                      <motion.div
                        className="mb-5 relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-slate-900/80 dark:via-slate-900/80 dark:to-slate-900/80  p-6 shadow-2xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div
                          className="absolute inset-0 opacity-10 dark:opacity-5 "
                          style={{
                            backgroundImage:
                              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                            backgroundSize: "30px 30px",
                          }}
                        />
                        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <p className="text-white/70 text-sm font-medium mb-1">
                              ⭐ Tu mejor coincidencia
                            </p>
                            <h3 className="text-white text-2xl md:text-3xl font-extrabold">
                              {top.carrera}
                            </h3>
                            <p className="text-white/80 text-sm mt-2 max-w-md">
                              Esta carrera es la más alineada con tu perfil
                              vocacional actual. Tu compatibilidad es{" "}
                              <strong className="text-white">
                                {top.probabilidad}
                              </strong>
                              .
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="text-5xl font-extrabold text-white drop-shadow">
                              {topPct}%
                            </div>
                            <p className="text-white/70 text-xs mt-1">
                              compatibilidad
                            </p>
                          </div>
                        </div>
                        {/* Mini progress */}
                        <div className="relative z-10 mt-4 w-full bg-white/20 h-2 rounded-full overflow-hidden">
                          <motion.div
                            className="h-2 bg-white rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${topPct}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    );
                  })()}

                  {/* Grid de carreras */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...activeCarreras]
                      .sort(
                        (a, b) =>
                          parseProbabilidad(b.probabilidad) -
                          parseProbabilidad(a.probabilidad),
                      )
                      .map((carrera, index) => {
                        const pct = parseProbabilidad(carrera.probabilidad);
                        const colorClass =
                          careerColors[index % careerColors.length];
                        const icon = careerIcons[index % careerIcons.length];
                        const isTop = index === 0;

                        return (
                          <motion.div
                            key={index}
                            className={`relative rounded-2xl overflow-hidden shadow-lg border-2 transition-all duration-300 hover:shadow-2xl ${
                              isTop
                                ? "border-indigo-400 dark:border-cyan-400"
                                : "border-slate-100 dark:border-slate-700/50"
                            }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.07 }}
                            whileHover={{ scale: 1.02, y: -3 }}
                          >
                            {/* Color header strip */}
                            <div
                              className={`bg-gradient-to-r ${colorClass} p-4 relative`}
                            >
                              {isTop && (
                                <span className="absolute top-2 right-2 text-xs bg-white/30 text-white font-bold px-2 py-0.5 rounded-full">
                                  ⭐ Top
                                </span>
                              )}
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{icon}</span>
                                <div>
                                  <p className="text-white/70 text-xs font-medium">
                                    Carrera recomendada
                                  </p>
                                  <h3 className="text-white font-bold text-base leading-snug">
                                    {carrera.carrera}
                                  </h3>
                                </div>
                              </div>
                            </div>

                            {/* Body */}
                            <div className="bg-white dark:bg-slate-900/80 p-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                  Compatibilidad
                                </span>
                                <span
                                  className={`text-xl font-extrabold ${
                                    pct >= 80
                                      ? "text-emerald-600 dark:text-cyan-300"
                                      : pct >= 60
                                        ? "text-amber-600 dark:text-yellow-300"
                                        : "text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  {carrera.probabilidad}
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-2.5 rounded-full bg-gradient-to-r ${colorClass}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{
                                    duration: 1.2,
                                    delay: index * 0.07 + 0.3,
                                    ease: "easeOut",
                                  }}
                                />
                              </div>

                              {/* Badge nivel */}
                              <div className="mt-3">
                                <span
                                  className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    pct >= 80
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-cyan-900/30 dark:text-cyan-300"
                                      : pct >= 60
                                        ? "bg-amber-100 text-amber-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                        : pct >= 40
                                          ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300"
                                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                  }`}
                                >
                                  {pct >= 80
                                    ? "🎯 Muy alta compatibilidad"
                                    : pct >= 60
                                      ? "✅ Alta compatibilidad"
                                      : pct >= 40
                                        ? "📈 Compatibilidad media"
                                        : "🔄 Compatibilidad baja"}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>

                  <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-5">
                    Las sugerencias son orientativas y se actualizan a medida
                    que completas más tests.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BOTONES ── */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-3 mt-8 mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <motion.button
            onClick={handleDownload}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-lime-400 to-lime-700 dark:from-cyan-500 dark:to-blue-600 text-white shadow-lg flex items-center justify-center gap-2"
          >
            📄 Descargar Reporte PDF
          </motion.button>
          <motion.button
            onClick={handleShare}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-violet-500 to-pink-600 dark:from-purple-500 dark:to-pink-600 text-white shadow-lg flex items-center justify-center gap-2"
          >
            📤 Compartir por WhatsApp
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};
