import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { getStudentTests } from "../../../api/api_estudent_test";
import { getMajors } from "../../../api/api_majors";
import { getAptitudes } from "../../../api/api_aptitudes";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getStudentId } from "./studentId";

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
    icon: "⏱️",
    color: "dark:from-green-400 dark:to-teal-500 from-indigo-700 to-indigo-700",
  },
];

// Nuevas aptitudes con tests que contribuyen
const aptitudesInfo = [
  { id: 1, nombre: "Lógico-Matemática", tests: [1, 5, 6] },
  { id: 2, nombre: "Verbal-Comunicativa", tests: [4, 3, 2] },
  { id: 3, nombre: "Creativa", tests: [3, 8] },
  { id: 4, nombre: "Mecánica", tests: [7, 6] },
  { id: 5, nombre: "Rapidez y Precisión", tests: [9, 10] },
];

export const ReporteVocacional = () => {
  const [studentTests, setStudentTests] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recommendedMajors, setRecommendedMajors] = useState([]);
  const reportRef = useRef(null);
  const [studentId, setStudentId] = useState(null);
  const [aptitudes, setAptitudes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Obtener ID del estudiante actual
        const currentStudentId = await getStudentId();
        setStudentId(currentStudentId);

        // ✅ Obtener todos los tests, carreras y aptitudes simultáneamente
        const [testsRes, majorsRes, aptitudesRes] = await Promise.all([
          getStudentTests(),
          getMajors(),
          getAptitudes(),
        ]);

        // ✅ Filtrar tests solo del estudiante logueado
        const filteredTests = testsRes.data.filter(
          (t) => t.estudiante === currentStudentId,
        );
        setStudentTests(filteredTests);

        // ✅ Buscar carreras del estudiante logueado
        const studentMajors = majorsRes.data.find(
          (item) => item.estudiante === currentStudentId,
        );

        if (
          studentMajors &&
          studentMajors.carreras &&
          studentMajors.carreras !== "sin carreras"
        ) {
          try {
            const carrerasArray = JSON.parse(
              studentMajors.carreras.replace(/'/g, '"'),
            );
            setRecommendedMajors(carrerasArray);
          } catch (err) {
            console.error("Error al parsear carreras:", err);
            setRecommendedMajors([]);
          }
        } else {
          setRecommendedMajors([]);
        }

        // ✅ Buscar aptitudes del estudiante actual
        const studentAptitudes = aptitudesRes.data.find(
          (item) => item.estudiante === currentStudentId,
        );

        if (studentAptitudes && studentAptitudes.aptitudes) {
          setAptitudes(studentAptitudes.aptitudes);
        } else {
          setAptitudes([]);
        }
      } catch (error) {
        console.error("❌ Error al obtener datos:", error);
      }
    };

    fetchData();
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getPorcentaje = (testId) => {
    const studentTest = studentTests.find((t) => t.testvocational === testId);
    const info = testsInfo.find((t) => t.id === testId);
    if (!studentTest || !info) return 0;
    return ((studentTest.completo / info.total_preguntas) * 100).toFixed(1);
  };

  const getMotivacion = (porcentaje) => {
    if (porcentaje < 30)
      return "💪 ¡Vamos! Solo un poco más y terminarás este test.";
    if (porcentaje < 60)
      return "🚀 Buen avance, sigue así y completa todos los tests.";
    if (porcentaje < 90)
      return "🔥 ¡Excelente! Estás cerca de completar el test.";
    return "🌟 ¡Fantástico! Has completado todo el test.";
  };

  const promedioTotal = () => {
    if (!testsInfo.length) return 0;

    // total de preguntas del sistema
    const totalPreguntasSistema = testsInfo.reduce(
      (acc, test) => acc + test.total_preguntas,
      0,
    );

    // total respondido por el estudiante
    let respondidas = 0;

    studentTests.forEach((t) => {
      const info = testsInfo.find((x) => x.id === t.testvocational);
      if (info) {
        respondidas += Math.min(t.completo, info.total_preguntas);
      }
    });

    const porcentaje = (respondidas / totalPreguntasSistema) * 100;

    return Math.min(porcentaje, 100).toFixed(1);
  };

  const promedio = parseFloat(promedioTotal());

function formatearNombre(nombre) {
  const palabras = nombre.trim().split(/\s+/);

  // 🔥 Caso 1: Razonamiento → quitar "Razonamiento"
  if (palabras[0].toLowerCase() === "razonamiento") {
    return palabras[1]; // Verbal, Numérico, etc.
  }

  // 🔥 Caso 2: Rapidez y exactitud preceptiva 1/2
  if (palabras[0].toLowerCase() === "rapidez") {
    return `Rapidez ${palabras[palabras.length - 1]}`; // Rapidez 1 o 2
  }

  // 🔥 Caso 3: Test Chaside, Test Colmil, etc.
  if (palabras[0].toLowerCase() === "test") {
    return palabras[1]; // Chaside, Colmil, etc.
  }

  // 🔥 Caso general (Ortografía, etc.)
  return palabras[0];
}

 
  

  const lineData = testsInfo.map((test) => ({
    name: formatearNombre(test.nombre),
    progreso: parseFloat(getPorcentaje(test.id)),
  }));

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "¡Buenos días! ☀️";
    if (hour < 18) return "¡Buenas tardes! 🌤️";
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
      ? "🌱 Apenas comienzas, ¡sigue avanzando!"
      : promedio < 60
        ? "🚀 Vas por buen camino, mantén el ritmo."
        : promedio < 90
          ? "🔥 Estás a punto de lograrlo, sigue con fuerza."
          : "🏆 ¡Excelente! Completaste casi todos los tests.";

  // Función para obtener porcentaje de cada aptitud
  const getPorcentajeAptitud = (apt) => {
    let total = 0;
    let count = 0;
    apt.tests.forEach((testId) => {
      const pct = parseFloat(getPorcentaje(testId));
      if (pct) {
        total += pct;
        count++;
      }
    });
    return count > 0 ? (total / count).toFixed(1) : 0;
  };

  // PDF en tamaño carta
  const handleDownload = () => {
    const pdf = new jsPDF("p", "mm", "letter");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;

    // 🧹 Función para limpiar texto y quitar caracteres raros
    const cleanText = (text) => {
      if (!text) return "";
      return text.replace(/[^\x20-\x7EáéíóúÁÉÍÓÚñÑüÜ.,:;¡!¿?()\-+\/ ]/g, "");
    };

    // 🖋️ Función para dibujar texto centrado
    const drawCenteredText = (
      text,
      y,
      fontSize = 12,
      fontStyle = "normal",
      color = [0, 0, 0],
    ) => {
      const safeText = cleanText(text);
      pdf.setFont("helvetica", fontStyle);
      pdf.setFontSize(fontSize);
      pdf.setTextColor(...color);
      const textWidth = pdf.getTextWidth(safeText);
      const x = (pageWidth - textWidth) / 2;
      pdf.text(safeText, x, y);
    };

    // 🎨 Fondo blanco
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // 🏫 Encabezado
    drawCenteredText(
      "Colegio Marcelo Quiroga Santa Cruz",
      margin,
      16,
      "bold",
      [0, 102, 204],
    );

    let y = margin + 10;

    // 🖼️ Logo como marca de agua
    const img = new Image();
    img.src = "/logo.png";
    img.onload = () => {
      const logoWidth = 120;
      const logoHeight = (img.height / img.width) * logoWidth;
      pdf.setGState(new pdf.GState({ opacity: 0.05 }));
      pdf.addImage(
        img,
        "PNG",
        (pageWidth - logoWidth) / 2,
        (pageHeight - logoHeight) / 2,
        logoWidth,
        logoHeight,
      );
      pdf.setGState(new pdf.GState({ opacity: 1 }));

      y += 10;

      // Saludo y fecha
      drawCenteredText(cleanText(greeting()), y, 14, "bold");
      y += 7;
      drawCenteredText(cleanText(formattedDate), y, 12);
      y += 7;

      //  Mensaje global
      drawCenteredText(cleanText(globalMessage), y, 12, "normal", [50, 50, 50]);
      y += 8;

      // Línea separadora
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;

      const colWidth = (pageWidth - 3 * margin) / 2;
      const barHeight = 8;
      const spacingY = 12;

      // 📊 Tests
      testsInfo.forEach((test, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = margin + col * (colWidth + margin);
        const pct = getPorcentaje(test.id);

        // Fondo barra
        pdf.setFillColor(220, 220, 220);
        pdf.roundedRect(x, y + row * spacingY, colWidth, barHeight, 2, 2, "F");

        // Barra progreso
        pdf.setFillColor(59, 130, 246); // azul fijo
        pdf.roundedRect(
          x,
          y + row * spacingY,
          (pct / 100) * colWidth,
          barHeight,
          2,
          2,
          "F",
        );

        // Texto
        const text = `${test.nombre} - ${pct}%`;
        const textWidth = pdf.getTextWidth(cleanText(text));
        const textX = x + (colWidth - textWidth) / 2;
        pdf.text(cleanText(text), textX, y + row * spacingY + 6);
      });

      y += Math.ceil(testsInfo.length / 2) * spacingY + 8;

      //  Aptitudes
      drawCenteredText("Aptitudes", y, 12, "bold", [255, 102, 0]);
      y += 6;

      if (aptitudes.length > 0) {
        aptitudes.forEach((apt, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const x = margin + col * (colWidth + margin);

          // Convertir porcentaje tipo "20.5%" a número
          let pct = parseFloat(apt.porcentaje.replace("%", "")) || 0;

          // 🔒 Evitar que se salga del rango visible
          const barPct = Math.max(0, Math.min(pct, 100));

          // 🎨 Color según si es negativo
          const barColor =
            parseFloat(apt.porcentaje) < 0 ? [255, 99, 71] : [234, 179, 8]; // rojo o ámbar
          pdf.setFillColor(220, 220, 220);
          pdf.roundedRect(
            x,
            y + row * spacingY,
            colWidth,
            barHeight,
            2,
            2,
            "F",
          );

          pdf.setFillColor(...barColor);
          pdf.roundedRect(
            x,
            y + row * spacingY,
            (barPct / 100) * colWidth,
            barHeight,
            2,
            2,
            "F",
          );

          const text = `${apt.aptitud}  ${apt.porcentaje}`;
          const textWidth = pdf.getTextWidth(cleanText(text));
          const textX = x + (colWidth - textWidth) / 2;
          pdf.text(cleanText(text), textX, y + row * spacingY + 6);
        });
      } else {
        drawCenteredText("No hay aptitudes disponibles", y, 11);
      }

      y += Math.ceil(aptitudes.length / 2) * spacingY + 8;

      // 🎓 Carreras recomendadas
      drawCenteredText("Carreras Recomendadas", y, 12, "bold", [0, 102, 204]);
      y += 8;

      if (recommendedMajors.length > 0) {
        recommendedMajors.forEach((carrera) => {
          const text = `${carrera.carrera} - ${carrera.probabilidad}`;
          drawCenteredText(cleanText(text), y, 11);
          y += 6;
        });
      } else {
        drawCenteredText("No hay carreras recomendadas disponibles", y, 11);
        y += 6;
      }

      pdf.save("Reporte_Vocacional.pdf");
    };
  };

  const handleShare = () => {
    let resultsText = "📊 *Mi progreso en los tests vocacionales* 📊\n\n";

    // Tests con emojis
    testsInfo.forEach((test) => {
      const porcentaje = getPorcentaje(test.id);
      resultsText += `${test.icon || "📝"} *${test.nombre}*: ${porcentaje}%\n`;
    });

    resultsText += "\n⭐ *Mis aptitudes* ⭐\n";

    // ✅ Aptitudes reales del backend
    if (aptitudes.length > 0) {
      aptitudes.forEach((apt) => {
        const emoji = "💡";
        resultsText += `${emoji} *${apt.aptitud}*: ${apt.porcentaje}\n`;
      });
    } else {
      resultsText += "⚠️ No hay aptitudes disponibles.\n";
    }

    // Agregar carreras recomendadas al texto para compartir
    if (recommendedMajors.length > 0) {
      resultsText += "\n🎓 *Carreras Recomendadas* 🎓\n";
      recommendedMajors.forEach((carrera) => {
        resultsText += `🏫 ${carrera.carrera}: ${carrera.probabilidad}\n`;
      });
    }

    resultsText += `\n🔗 Revisa tus resultados aquí: ${window.location.href}`;

    // WhatsApp y Facebook
    const whatsapp = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      resultsText,
    )}`;
    const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href,
    )}`;

    window.open(whatsapp, "_blank");
    window.open(facebook, "_blank");
    navigator.clipboard.writeText(resultsText);
    alert("¡Resultados copiados al portapapeles y listos para compartir! 📤");
  };

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (promedio / 100) * circumference;

  const [isDark, setIsDark] = useState(false);

  // Detectar modo dark dinámicamente
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // 🎨 Colores dinámicos
  const colors = {
    grid: isDark ? "#334155" : "#E2E8F0",
    axis: isDark ? "#CBD5F5" : "#334155",
    tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
    tooltipText: isDark ? "#F1F5F9" : "#0F172A",
    bar: isDark ? "#2DD4BF" : "#14B8A6",
  };

  return (
    <div
      className="relative  w-full  px-2 md:px-6  overflow-hidden "
      ref={reportRef}
    >
   
      <div className="absolute "></div>

      <div className="relative z-10 max-w-[90%] h-screen   mx-auto md:py-12  overflow-y-auto scrollbar-hide ">
        <motion.div
          className="text-center mb-6 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-black to-black dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
            Reporte Vocacional
          </h1>
          <p className="dark:text-gray-300 mt-1 md:mt-2 text-sm md:text-lg text-black">
            {greeting()}
          </p>
          <p className="dark:text-gray-400 mt-1 text-xs md:text-sm text-black">
            {formattedDate}
          </p>
          <p className="dark:text-gray-300 mt-1 md:mt-2 text-sm text-black">
            Descubre tu camino profesional ideal
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Panel izquierdo: Circular */}
          <motion.div
            className="relative bg-gradient-to-r from-white to-white dark:from-black/50 dark:to-gray-900/50 rounded-3xl p-4 md:p-6 backdrop-blur-md border border-slate-700/50 shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-lg md:text-xl font-bold dark:text-white text-black mb-4 flex justify-between w-full px-4">
              Progreso General <span>📈</span>
            </h2>
            <div className="relative w-72 h-56 md:w-64 md:h-64 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  r={radius}
                  cx="50%"
                  cy="50%"
                  className="stroke-slate-300 dark:stroke-slate-700"
                  strokeWidth="15"
                  fill="transparent"
                />

                {/* Progreso */}
                <motion.circle
                  r={radius}
                  cx="50%"
                  cy="50%"
                  className="stroke-lime-400 dark:stroke-cyan-400"
                  strokeWidth="15"
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
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-3xl md:text-4xl font-extrabold text-black dark:text-cyan-400 drop-shadow-[0_0_10px_#06b6d4]">
                  {promedio}%
                </span>
                <p className="dark:text-gray-300 text-black text-xs md:text-sm mt-1 text-center max-w-[160px] leading-tight">
                  {globalMessage}
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Centro: Tests y gráfico */}
          <motion.div
            className="lg:col-span-2 bg-gradient-to-r dark:from-black/50 dark:to-gray-900/50  from-white to-white rounded-3xl p-4 md:p-6 backdrop-blur-md border border-slate-700/30 shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold dark:text-white text-black">
                Resultados de Evaluación
              </h2>
              <span className="text-xl md:text-2xl">📊</span>
            </div>

            {/* Tests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-8">
              {testsInfo.map((test, idx) => {
                const porcentaje = getPorcentaje(test.id);
                const motivacion = getMotivacion(porcentaje);
                return (
                  <motion.div
                    key={test.id}
                    className=" dark:bg-gradient-to-r dark:from-black/50 dark:to-gray-900/50 rounded-xl p-3 md:p-4 dark:border dark:border-slate-600/30 border-2 border-black  hover:border-cyan-500/50 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-1 md:mb-2 text-black">
                      <span className="text-xl md:text-2xl">{test.icon}</span>
                      <span className="dark:text-cyan-300 font-bold text-black ">
                        {porcentaje}%
                      </span>
                    </div>
                    <h3 className="dark:text-white font-medium mb-1 md:mb-2 text-sm md:text-base text-black">
                      {test.nombre}
                    </h3>
                    <div className="w-full dark:bg-slate-600 bg-slate-300 h-2 rounded-full overflow-hidden mb-1 md:mb-2">
                      <motion.div
                        className={`h-2 rounded-full bg-gradient-to-r ${test.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${porcentaje}%` }}
                        transition={{ duration: 1.5, delay: idx * 0.1 }}
                      />
                    </div>
                    <p className="text-xs md:text-sm dark:text-gray-300 text-black mt-0.5">
                      {motivacion}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Aptitudes reales del modelo */}
            <h3 className="dark:text-white text-black font-semibold mb-2 text-sm md:text-base">
              Aptitudes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
              {aptitudes.length > 0 ? (
                aptitudes.map((apt, index) => (
                  <div
                    key={index}
                    className="dark:bg-slate-700/30  text-black rounded-xl p-3 md:p-4 dark:border border-2 border-black dark:border-slate-600/30"
                  >
                    <h3 className="dark:text-white font-medium mb-1 md:mb-2 text-sm md:text-base ">
                      {apt.aptitud}
                    </h3>
                    <div className="w-full dark:bg-slate-600 bg-slate-300 h-2 rounded-full overflow-hidden mb-1 md:mb-2">
                      <motion.div
                        className="h-2 rounded-full bg-gradient-to-r dark:from-yellow-400 dark:to-red-500 from-lime-400 to-lime-400"
                        initial={{ width: 0 }}
                        animate={{ width: apt.porcentaje }}
                        transition={{ duration: 1.5 }}
                      />
                    </div>
                    <p className="dark:text-cyan-300  font-bold">
                      {apt.porcentaje}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No hay aptitudes disponibles.</p>
              )}
            </div>

            <h3 className="text-white font-semibold mb-1 md:mb-2 text-sm md:text-base">
              Progreso por Test
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={lineData}
                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
              >
                {/* Grid */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={colors.grid}
                  strokeWidth={1.5}
                />

                {/* Eje X */}
                <XAxis
                  dataKey="name"
                  tick={{ fill: colors.axis, fontSize: 12 }}
                  stroke={colors.axis}
                  strokeWidth={3}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                />

                {/* Eje Y */}
                <YAxis
                  tick={{ fill: colors.axis }}
                  stroke={colors.axis}
                  strokeWidth={3}
                />

                {/* Tooltip */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.tooltipBg,
                    borderRadius: "10px",
                    color: colors.tooltipText,
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  labelStyle={{ color: colors.tooltipText }}
                />

                {/* Línea */}
                <Line
                  type="monotone"
                  dataKey="progreso"
                  stroke={colors.line}
                  strokeWidth={3}
                  dot={{
                    fill: colors.dot,
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: colors.dotActive,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Panel derecho */}
          <motion.div
            className=" bg-gradient-to-r from-white to-white dark:from-black/50 dark:to-gray-900/50 rounded-3xl p-4 md:p-6 backdrop-blur-md border border-slate-700/30 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <h2 className="text-lg md:text-xl font-bold dark:text-white mb-2 md:mb-4 text-black">
              Carreras Recomendadas
            </h2>
            <ul className="space-y-1 md:space-y-2 dark:text-gray-300 text-xs md:text-sm  md:font-bold text-black">
              {recommendedMajors.length > 0 ? (
                recommendedMajors.map((carrera, index) => (
                  <li key={index}>
                    🎓 {carrera.carrera} -{" "}
                    <span className="text-black dark:text-cyan-300">
                      {carrera.probabilidad}
                    </span>
                  </li>
                ))
              ) : (
                <li>No hay carreras recomendadas disponibles</li>
              )}
            </ul>
            <p className="text-black dark:text-gray-300 mt-2 md:mt-4 text-xs md:text-sm md:font-bold">
              Estas sugerencias se basan en tu rendimiento global.
            </p>
          </motion.div>
        </div>

        {/* Botones */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mb-6 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <motion.button
            onClick={handleDownload}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 md:px-6 py-2 md:py-3 rounded-xl font-bold bg-gradient-to-r from-lime-400 to-lime-800 dark:from-cyan-500 dark:to-blue-600 text-white shadow-lg flex items-center justify-center gap-2"
          >
            📄 Descargar Reporte
          </motion.button>
          <motion.button
            onClick={handleShare}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 md:px-6 py-2 md:py-3 rounded-xl font-bold bg-gradient-to-r dark:from-purple-500 dark:to-pink-600 from-lime-400 to-lime-800 text-white shadow-lg flex items-center justify-center gap-2"
          >
            📤 Compartir Resultados
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};
