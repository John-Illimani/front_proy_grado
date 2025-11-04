// src/components/pages/teacher/general_reports.jsx
import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Datos base
const testsInfo = [
  { id: 1, nombre: "Test Chaside", total_preguntas: 97 },
  { id: 2, nombre: "Test Colmil", total_preguntas: 156 },
  { id: 3, nombre: "Test Personalidad", total_preguntas: 163 },
  { id: 4, nombre: "Razonamiento Verbal", total_preguntas: 47 },
  { id: 5, nombre: "Razonamiento Numérico", total_preguntas: 40 },
  { id: 6, nombre: "Razonamiento Abstracto", total_preguntas: 48 },
  { id: 7, nombre: "Razonamiento Mecánico", total_preguntas: 15 },
  { id: 8, nombre: "Ortografía", total_preguntas: 26 },
  { id: 9, nombre: "Rapidez y exactitud preceptiva 1", total_preguntas: 100 },
  { id: 10, nombre: "Rapidez y exactitud preceptiva 2", total_preguntas: 100 },
];

const aptitudesInfo = [
  { id: 1, nombre: "Lógico-Matemática", tests: [1, 5, 6] },
  { id: 2, nombre: "Verbal-Comunicativa", tests: [4, 3, 2] },
  { id: 3, nombre: "Creativa", tests: [3, 8] },
  { id: 4, nombre: "Mecánica", tests: [7, 6] },
  { id: 5, nombre: "Rapidez y Precisión", tests: [9, 10] },
];

export const ReporteGeneralEstudiantes = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [studentTests, setStudentTests] = useState([]);
  const [aptitudes, setAptitudes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, studentsRes, usersRes, sectionsRes,aptitudesRes] = await Promise.all([
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

        const result = students.map((student) => {
          const user = users.find((u) => u.id === student.usuario);
          const paraleloObj = sectionsData.find((s) => s.id === student.paralelo);

          const studentTestsData = tests.filter((t) => t.estudiante === student.id);
          const promedio =
            studentTestsData.length > 0
              ? (
                  studentTestsData.reduce((acc, t) => acc + t.completo, 0) /
                  studentTestsData.length
                ).toFixed(1)
              : 0;

          return {
            id: student.id,
            nombre: user
              ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                user.username
              : "Desconocido",
            promedio: parseFloat(promedio),
            cantidadTests: studentTestsData.length,
            paralelo: paraleloObj ? paraleloObj.nombre : "Sin paralelo",
          };
        });

        setData(result);
        setFilteredData(result);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // === Filtrado solo por paralelo ===
  useEffect(() => {
    let filtered = data;
    if (selectedSection)
      filtered = filtered.filter((d) => d.paralelo === selectedSection.nombre);
    setFilteredData(filtered);
  }, [selectedSection, data]);

  // === Funciones auxiliares ===
  const getPorcentaje = (studentId, testId) => {
    const st = studentTests.find(
      (t) => t.estudiante === studentId && t.testvocational === testId
    );
    const info = testsInfo.find((t) => t.id === testId);
    if (!st || !info) return 0;
    return ((st.completo / info.total_preguntas) * 100).toFixed(1);
  };

  const getPorcentajeAptitud = (studentId, apt) => {
    let total = 0,
      count = 0;
    apt.tests.forEach((testId) => {
      const pct = parseFloat(getPorcentaje(studentId, testId));
      if (pct) {
        total += pct;
        count++;
      }
    });
    return count > 0 ? (total / count).toFixed(1) : 0;
  };

  // === Generar PDF ===
const generarPDF = () => {
  if (filteredData.length === 0)
    return alert("No hay datos para exportar.");

  const pdf = new jsPDF("p", "mm", "letter");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  const logo = new Image();
  logo.src = "/logo.png";

  filteredData.forEach((student, index) => {
    if (index > 0) pdf.addPage();

    // Fondo blanco
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Marca de agua
    pdf.saveGraphicsState();
    const gState = pdf.GState({ opacity: 0.08 });
    pdf.setGState(gState);
    pdf.addImage(logo, "PNG", 30, 60, 150, 150);
    pdf.restoreGraphicsState();

    // Encabezado
    pdf.setFillColor(0, 102, 204);
    pdf.rect(0, 0, pageWidth, 20, "F");
    pdf.setTextColor(255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("COLEGIO MARCELO QUIROGA SANTA CRUZ", pageWidth / 2, 13, {
      align: "center",
    });

    pdf.addImage(logo, "PNG", pageWidth - 40, 22, 20, 20);

    pdf.setTextColor(0, 76, 153);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("REPORTE VOCACIONAL INDIVIDUAL", pageWidth / 2, 45, {
      align: "center",
    });

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(80);
    pdf.setFontSize(12);
    pdf.text("Área de Orientación y Evaluación Vocacional", pageWidth / 2, 52, {
      align: "center",
    });

    pdf.setFontSize(11);
    pdf.setTextColor(40);
    pdf.text(`Estudiante: ${student.nombre}`, margin, 70);
    pdf.text(`Paralelo: ${student.paralelo}`, margin, 78);
    pdf.text(`Promedio General: ${Math.min(student.promedio, 100)}%`, margin, 86);

    let y = 95;

    // =========================
    // SECCIÓN: PROGRESO POR TEST
    // =========================
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 102, 204);
    pdf.setFontSize(13);
    pdf.text("Progreso por Test", margin, y);
    y += 5;

    testsInfo.forEach((test) => {
      let pct = parseFloat(getPorcentaje(student.id, test.id)) || 0;
      pct = Math.min(Math.max(pct, 0), 100); // Limitar 0–100

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

    // =========================
    // SECCIÓN: APTITUDES REALES
    // =========================
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 102, 0);
    pdf.setFontSize(13);
    pdf.text("Aptitudes del Estudiante", margin, y);
    y += 5;

    const aptitudesEst = aptitudes.find(
      (a) => a.estudiante_id === student.id || a.estudiante === student.id
    );

    if (
      aptitudesEst &&
      Array.isArray(aptitudesEst.aptitudes) &&
      aptitudesEst.aptitudes.length > 0
    ) {
      // Ordenar de mayor a menor
      const sortedAptitudes = [...aptitudesEst.aptitudes].sort(
        (a, b) =>
          parseFloat(b.porcentaje.replace("%", "")) -
          parseFloat(a.porcentaje.replace("%", ""))
      );

      sortedAptitudes.forEach((apt) => {
        let pct = parseFloat(apt.porcentaje.replace("%", "")) || 0;
        const barPct = Math.min(Math.abs(pct), 100);

        // Fondo barra (gris claro)
        pdf.setFillColor(240);
        pdf.rect(margin, y, 150, 6, "F");

        // ⚡ Solo dibujar barra si es positiva
        if (pct >= 0) {
          pdf.setFillColor(255, 193, 7); // Amarillo
          pdf.rect(margin, y, (barPct / 100) * 150, 6, "F");
        }

        // Texto
        pdf.setTextColor(0);
        pdf.setFontSize(10);
        pdf.text(`${apt.aptitud}: ${apt.porcentaje}`, margin + 2, y + 4);

        y += 8;
      });
    } else {
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(10);
      pdf.text("No hay aptitudes registradas para este estudiante.", margin, y);
      y += 5;
    }

    // =========================
    // NOTA FINAL
    // =========================
    y += 10;
    pdf.setTextColor(60);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(10.5);
    pdf.text(
      "Este reporte refleja el desempeño y las aptitudes vocacionales detectadas por el modelo de IA a partir de los tests realizados.",
      margin,
      y,
      { maxWidth: 180 }
    );

    // =========================
    // PIE DE PÁGINA
    // =========================
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100);
    pdf.setFontSize(9);
    pdf.text(
      "Fecha de generación: " + new Date().toLocaleDateString(),
      margin,
      pageHeight - 18
    );
    pdf.text("Sistema Vocacional", pageWidth - margin, pageHeight - 18, {
      align: "right",
    });
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
    <div className=" text-gray-700 dark:text-white overflow-y-auto scrollbar-hide h-[90vh]">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold text-teal-400 flex justify-center items-center gap-2">
          <BarChart3 /> Reporte General de Estudiantes
        </h1>
        <p className=" text-lg mt-2">
          Seguimiento y resultados de rendimiento vocacional
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
  {/* Filtro solo por paralelo */}
  <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
    <label className="text-teal-300 mb-2 md:mb-0 font-semibold">Paralelo</label>
    <select
      className="px-4 py-3 rounded-xl border border-teal-400/50 bg-gray-900 text-white w-full md:w-auto"
      onChange={(e) =>
        setSelectedSection(sections.find((s) => s.id === parseInt(e.target.value)))
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

  {/* Botón PDF */}
  <div className="w-full md:w-auto flex justify-center md:justify-end">
    <button
      onClick={generarPDF}
      className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-cyan-500 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:-translate-y-1"
    >
      <FileDown /> Generar Reporte PDF
    </button>
  </div>
</div>


      {/* Resumen general */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-gradient-to-br dark:from-teal-900/30 dark:to-black/50 from-white/70 to-teal-900/10 p-6 rounded-2xl border border-teal-400/30 shadow-xl">
          <h2 className="text-xl font-bold text-teal-300 flex items-center gap-2">
            <User className="text-teal-300" /> Total de Estudiantes
          </h2>
          <p className="text-3xl font-bold mt-3">{filteredData.length}</p>
        </div>
        <div className="bg-gradient-to-br dark:from-indigo-900/30 dark:to-black/50 from-white/70 to-indigo-900/30 p-6 rounded-2xl border border-indigo-400/30 shadow-xl">
          <h2 className="text-xl font-bold text-indigo-400 dark:text-indigo-300 flex items-center gap-2">
            <GraduationCap /> Promedio General
          </h2>
          <p className="text-3xl font-bold mt-3">
            {filteredData.length > 0
              ? (filteredData.reduce((acc, d) => acc + d.promedio, 0) / filteredData.length).toFixed(1)
              : 0}
            %
          </p>
        </div>
        <div className="bg-gradient-to-br dark:from-amber-900/30 dark:to-black/50 from-white/70 to-amber-900/30 p-6 rounded-2xl border border-amber-400/30 shadow-xl">
          <h2 className="text-xl font-bold text-amber-500 dark:text-amber-300 flex items-center gap-2">
            <BookOpen /> Total de Tests Registrados
          </h2>
          <p className="text-3xl font-bold mt-3">
            {filteredData.reduce((acc, d) => acc + d.cantidadTests, 0)}
          </p>
        </div>
      </motion.div>

      {/* Tabla de rendimiento */}
      <motion.div
        className="bg-gradient-to-br dark:from-gray-800/30 dark:to-black/50 from-white/50 to-white/80 rounded-2xl p-6 shadow-lg border border-teal-500/20 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-teal-300 mb-4 text-center">
          Detalle de Rendimiento por Estudiante
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-800 dark:text-gray-300 border-b border-gray-700">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Nombre del Estudiante</th>
                <th className="px-4 py-2 text-center">Promedio (%)</th>
                <th className="px-4 py-2 text-center">Tests Realizados</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-gray-800 hover:bg-teal-900/20 transition"
                >
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2 flex items-center gap-2 whitespace-nowrap">
                    <User className="text-teal-400" size={16} /> {item.nombre}
                  </td>
                  <td className="px-4 py-2 text-center font-semibold text-teal-300">
                    {item.promedio}%
                  </td>
                  <td className="px-4 py-2 text-center">{item.cantidadTests}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Gráfico */}
      <motion.div
        className="mt-12 bg-gradient-to-br dark:from-gray-800/30 dark:to-black/50 from-white/50 to-white/80 p-6 rounded-2xl border border-teal-500/20 shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-teal-300 mb-6 text-center flex items-center justify-center gap-2">
          <Star /> Promedios Generales
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={filteredData}
            margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="nombre" tick={{ fill: "#ccc" }} />
            <YAxis tick={{ fill: "#ccc" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                borderRadius: "10px",
                color: "#f0f0f0",
              }}
            />
            <Bar dataKey="promedio" fill="#14b8a6" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};
