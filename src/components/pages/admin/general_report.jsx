import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import { getStudentTests } from "../../../api/api_estudent_test";
import { getStudents } from "../../../api/api_student";
import { getUsers } from "../../../api/api_user";
import { getSections } from "../../../api/api_section";
import { getMajors } from "../../../api/api_majors";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  BarChart3,
  User,
  GraduationCap,
  BookOpen,
  Star,
  FileDown,
  Users,
  Search,
  Table,
  LayoutGrid,
} from "lucide-react";
import { getAptitudes } from "../../../api/api_aptitudes";


const testsInfo = [
  { id: 1, nombre: "Test Chaside", total_preguntas: 97, icon: "🧮" },
  { id: 2, nombre: "Test Colmil", total_preguntas: 156, icon: "👥" },
  { id: 3, nombre: "Test Personalidad", total_preguntas: 163, icon: "🎨" },
  { id: 4, nombre: "Razonamiento Verbal", total_preguntas: 47, icon: "🗣️" },
  { id: 5, nombre: "Razonamiento Numérico", total_preguntas: 40, icon: "📊" },
  { id: 6, nombre: "Razonamiento Abstracto", total_preguntas: 48, icon: "🧠" },
  { id: 7, nombre: "Razonamiento Mecánico", total_preguntas: 15, icon: "⚙️" },
  { id: 8, nombre: "Ortografía", total_preguntas: 26, icon: "✍️" },
  { id: 9, nombre: "Rapidez y Exactitud 1", total_preguntas: 100, icon: "⏱️" },
  { id: 10, nombre: "Rapidez y Exactitud 2", total_preguntas: 100, icon: "⏱️" },
];

const aptitudesInfo = [
  { id: 1, nombre: "Lógico-Matemática", tests: [1, 5, 6] },
  { id: 2, nombre: "Verbal-Comunicativa", tests: [2, 3, 4] },
  { id: 3, nombre: "Creativa", tests: [3, 8] },
  { id: 4, nombre: "Mecánica", tests: [6, 7] },
  { id: 5, nombre: "Rapidez y Precisión", tests: [9, 10] },
];

export const ReporteGeneralVocacional = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [studentTests, setStudentTests] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("estudiantes"); // estudiantes | docentes
  const [teachers, setTeachers] = useState([]);
  const [recommendedMajors, setRecommendedMajors] = useState([]);
  const [aptitudes, setAptitudes] = useState([]);

  const reportRef = useRef(null);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, testsRes, usersRes, sectionsRes, majorsRes,aptitudesRes] =
          await Promise.all([
            getStudents(),
            getStudentTests(),
            getUsers(),
            getSections(),
            getMajors(),
            getAptitudes(),
          ]);

        const students = studentsRes.data;
        const tests = testsRes.data;
        const users = usersRes.data;
        const sectionsData = sectionsRes.data;
        const majorsData = majorsRes.data;

        // Procesar carreras recomendadas
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

        setAptitudes(aptitudesRes.data);

        // Docentes
        const docentes = users.filter((u) => u.rol === "docente");
        setTeachers(docentes);

        setStudentTests(tests);
        setSections(sectionsData);

        const formatted = students.map((student) => {
          const user = users.find((u) => u.id === student.usuario);
          const paraleloObj = sectionsData.find(
            (s) => s.id === student.paralelo
          );
          const studentTestsData = tests.filter(
            (t) => t.estudiante === student.id
          );
          const promedio =
            studentTestsData.length > 0
              ? (
                  studentTestsData.reduce((acc, t) => acc + t.completo, 0) /
                  studentTestsData.length
                ).toFixed(1)
              : 0;

          // Obtener carreras recomendadas para este estudiante
          const studentMajors = majorsMap[student.id] || [];

          return {
            id: student.id,
            nombre: user
              ? `${user.first_name} ${user.last_name}`.trim() || user.username
              : "Desconocido",
            promedio: parseFloat(promedio),
            cantidadTests: studentTestsData.length,
            paralelo: paraleloObj ? paraleloObj.nombre : "Sin paralelo",
            carrerasRecomendadas: studentMajors,
          };
        });

        setStudentsData(formatted);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  // --- Filtrado ---
  const filteredData = studentsData
    .filter((s) =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
    .filter((s) =>
      selectedSection ? s.paralelo === selectedSection.nombre : true
    );

  // --- Funciones ---
  const getPorcentaje = (studentId, testId) => {
    const st = studentTests.find(
      (t) => t.estudiante === studentId && t.testvocational === testId
    );
    const info = testsInfo.find((t) => t.id === testId);
    return st && info
      ? ((st.completo / info.total_preguntas) * 100).toFixed(1)
      : 0;
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


  const generarPDFDocentes = () => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const logo = "/logo.png"; // Ruta del logo institucional

  // --- Fondo institucional ---
  pdf.setFillColor(232, 245, 253); // celeste claro
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // --- Encabezado institucional ---
  pdf.addImage(logo, "PNG", 15, 10, 30, 30);
  pdf.setFontSize(20);
  pdf.setTextColor("#0d47a1");
  pdf.text("Colegio Marcelo Quiroga Santa Cruz", pageWidth / 2, 25, {
    align: "center",
  });

  pdf.setFontSize(14);
  pdf.setTextColor("#000");
  pdf.text("Reporte General de Docentes", pageWidth / 2, 33, {
    align: "center",
  });

  pdf.setFontSize(11);
  pdf.setTextColor("#444");
  pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - 20, 33, {
    align: "right",
  });

  // --- Línea divisoria ---
  pdf.setDrawColor(13, 71, 161);
  pdf.setLineWidth(0.8);
  pdf.line(15, 38, pageWidth - 15, 38);

  let y = 50;

  // --- Título de sección ---
  pdf.setFontSize(13);
  pdf.setTextColor("#1565c0");
  pdf.text("Listado de Docentes Registrados", 20, y);
  y += 8;

  teachers.forEach((doc, i) => {
    // --- Caja individual del docente ---
    pdf.setDrawColor(21, 101, 192);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(15, y, pageWidth - 30, 20, 3, 3, "FD");

    // --- Contenido del docente ---
    pdf.setFontSize(11);
    pdf.setTextColor("#0d47a1");
    pdf.text(`${i + 1}. ${doc.first_name} ${doc.last_name}`, 20, y + 7);

    pdf.setFontSize(10);
    pdf.setTextColor("#000");
    pdf.text(`Usuario: ${doc.username}`, 20, y + 14);

    pdf.setFontSize(10);
    pdf.setTextColor("#ff8f00");
    

    y += 25;

    
    if (y > 260) {
      pdf.addPage();

      
      pdf.setFillColor(232, 245, 253);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // Título repetido
      pdf.addImage(logo, "PNG", 15, 10, 30, 30);
      pdf.setFontSize(14);
      pdf.setTextColor("#0d47a1");
      pdf.text("Reporte General de Docentes", pageWidth / 2, 25, {
        align: "center",
      });

      pdf.setDrawColor(13, 71, 161);
      pdf.setLineWidth(0.8);
      pdf.line(15, 38, pageWidth - 15, 38);

      y = 50;
    }
  });

  // --- Pie de página institucional ---
  pdf.setFontSize(10);
  pdf.setTextColor("#777");
  pdf.text(
    "Sistema Vocacional - Colegio Marcelo Quiroga Santa Cruz",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  pdf.save("Reporte_Docentes.pdf");
};


const generarPDF = () => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();

  const logo = "/logo.png"; // ruta del logo

  filteredData.forEach((student, index) => {
    if (index > 0) pdf.addPage(); // nueva página por estudiante

    let startY = 40;

    // --- Encabezado ---
    pdf.addImage(logo, "PNG", 15, 10, 30, 30);
    pdf.setFontSize(20);
    pdf.setTextColor("#0d47a1");
    pdf.text("Colegio Marcelo Quiroga Santa Cruz", pageWidth / 2, 25, {
      align: "center",
    });

    pdf.setFontSize(14);
    pdf.setTextColor("#000");
    pdf.text("Reporte Vocacional Estudiantil", pageWidth / 2, 33, {
      align: "center",
    });

    pdf.setFontSize(11);
    pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - 20, 33, {
      align: "right",
    });

    // --- Caja del estudiante ---
    const boxHeight =
      30 +
      testsInfo.length * 10 +
      (student.carrerasRecomendadas.length > 0
        ? student.carrerasRecomendadas.length * 8 + 15
        : 0);
    pdf.setDrawColor(21, 101, 192);
    pdf.setFillColor(232, 245, 253);
    pdf.roundedRect(15, startY, pageWidth - 30, boxHeight, 5, 5, "FD");

    // --- Información básica ---
    pdf.setFontSize(12);
    pdf.setTextColor("#1565c0");
    pdf.text(`Estudiante: ${student.nombre}`, 20, startY + 10);
    pdf.setTextColor("#000");
    pdf.text(`Paralelo: ${student.paralelo}`, 20, startY + 18);
    pdf.text(`Promedio: ${student.promedio}%`, 80, startY + 18);
    pdf.text(`Tests realizados: ${student.cantidadTests}`, 140, startY + 18);

    let yOffset = startY + 28;

    // --- Resultados por Tests ---
    testsInfo.forEach((t) => {
      const pct = parseFloat(getPorcentaje(student.id, t.id));
      const testName = t.nombre
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      pdf.setFontSize(10);
      pdf.setTextColor("#000");
      pdf.text(testName, 20, yOffset);

      const barraAlto = 4;
      const barraX = 70;
      const anchoMax = pageWidth - barraX - 40; // 🔹 reducido para evitar desbordes
      const barWidth = anchoMax * (Math.min(pct, 100) / 100);

      pdf.setFillColor(21, 101, 192); // azul
      pdf.roundedRect(barraX, yOffset - barraAlto / 2, barWidth, barraAlto, 2, 2, "F");

      pdf.setDrawColor(0);
      pdf.roundedRect(barraX, yOffset - barraAlto / 2, anchoMax, barraAlto, 2, 2);

      pdf.setFontSize(9);
      pdf.text(`${pct}%`, barraX + anchoMax + 5, yOffset, { align: "left" });

      yOffset += 8;
    });

    // --- Separador y subtítulo de Aptitudes Reales ---
    yOffset += 4;
    pdf.setDrawColor(200);
    pdf.setLineWidth(0.3);
    pdf.line(20, yOffset, pageWidth - 20, yOffset);
    yOffset += 6;

    pdf.setFontSize(12);
    pdf.setTextColor("#d97706"); // ámbar
    pdf.text("Aptitudes del Estudiante", 20, yOffset);
    yOffset += 6;

    // Buscar las aptitudes reales
    const aptitudesEst = aptitudes.find(
      (a) =>
        parseInt(a.estudiante_id || a.estudiante?.id || a.estudiante) ===
        student.id
    );

    if (
      aptitudesEst &&
      Array.isArray(aptitudesEst.aptitudes) &&
      aptitudesEst.aptitudes.length > 0
    ) {
      // Ordenar por porcentaje descendente
      const sortedAptitudes = [...aptitudesEst.aptitudes].sort(
        (a, b) =>
          parseFloat(b.porcentaje.replace("%", "")) -
          parseFloat(a.porcentaje.replace("%", ""))
      );

      sortedAptitudes.forEach((apt) => {
        const pct = parseFloat(apt.porcentaje.replace("%", "")) || 0;
        const barPct = Math.min(Math.abs(pct), 100);
        const barraAlto = 4;
        const barraX = 70;
        const anchoMax = pageWidth - barraX - 40; // 🔹 reducido también aquí
        const barWidth = anchoMax * (barPct / 100);

        pdf.setFontSize(10);
        pdf.setTextColor("#000");
        pdf.text(`${apt.aptitud}`, 20, yOffset);

        // Fondo gris
        pdf.setFillColor(240);
        pdf.rect(barraX, yOffset - barraAlto / 2, anchoMax, barraAlto, "F");

        // 🔸 Si el valor es positivo, colorear; si es negativo, dejar sin color
        if (pct > 0) {
          pdf.setFillColor(234, 179, 8); // dorado
          pdf.rect(barraX, yOffset - barraAlto / 2, barWidth, barraAlto, "F");
        }

        // Texto de porcentaje
        pdf.setFontSize(9);
        pdf.text(`${apt.porcentaje}`, barraX + anchoMax + 5, yOffset, {
          align: "left",
        });

        yOffset += 8;
      });
    } else {
      pdf.setFontSize(10);
      pdf.setTextColor("#999");
      pdf.text("No hay aptitudes reales registradas para este estudiante.", 20, yOffset);
      yOffset += 8;
    }

    // --- Carreras Recomendadas ---
    if (student.carrerasRecomendadas.length > 0) {
      yOffset += 4;
      pdf.setDrawColor(200);
      pdf.setLineWidth(0.3);
      pdf.line(20, yOffset, pageWidth - 20, yOffset);
      yOffset += 6;

      pdf.setFontSize(12);
      pdf.setTextColor("#0d47a1");
      pdf.text("Carreras Recomendadas", 20, yOffset);
      yOffset += 6;

      student.carrerasRecomendadas.forEach((carrera) => {
        pdf.setFontSize(10);
        pdf.setTextColor("#000");
        pdf.text(`• ${carrera.carrera} - ${carrera.probabilidad}`, 25, yOffset);
        yOffset += 8;
      });
    }
  });

  pdf.save("Reporte_Vocacional_PorEstudiante.pdf");
};




  const chartData = filteredData.map((s) => ({
    nombre: s.nombre,
    promedio: s.promedio,
  }));

  return (
    <div
      className=" h-[95vh]  overflow-y-auto scrollbar-hide dark:text-white w-full "
      ref={reportRef}
    >
      <div className="">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 "
        >
          <h1 className="text-4xl font-bold dark:text-teal-400 flex justify-center items-center gap-2">
            <BarChart3 /> Reporte General Vocacional
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-lg mt-2">
            Resumen completo del desempeño de los estudiantes o docentes
          </p>
        </motion.div>

        {/* Controles */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 p-5">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <label className="text-black mb-2 md:mb-0 font-semibold dark:text-white">
              Paralelo
            </label>
            <select
              className="px-4 py-3 rounded-xl border border-teal-400/50 dark:bg-gray-900 dark:text-white w-full md:w-auto"
              onChange={(e) =>
                setSelectedSection(
                  sections.find((s) => s.id === parseInt(e.target.value))
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

          {/* Búsqueda */}
          {viewMode === "estudiantes" && (
            <div className="relative w-full md:w-1/3">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-500 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto justify-center md:justify-end">
            <button
              onClick={() =>
                setViewMode(
                  viewMode === "estudiantes" ? "docentes" : "estudiantes"
                )
              }
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-purple-500 hover:to-indigo-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:-translate-y-1"
            >
              {viewMode === "estudiantes" ? (
                <>
                  <Table /> Ver Docentes
                </>
              ) : (
                <>
                  <LayoutGrid /> Ver Estudiantes
                </>
              )}
            </button>

            {viewMode === "estudiantes" ? (
              <button
                onClick={generarPDF}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-cyan-500 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:-translate-y-1"
              >
                <FileDown /> Generar PDF Estudiantes
              </button>
            ) : (
              <button
                onClick={generarPDFDocentes}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-orange-500 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-amber-500/50 transition-all transform hover:-translate-y-1"
              >
                <FileDown /> Generar PDF Docentes
              </button>
            )}
          </div>
        </div>

        {/* Vista Condicional */}
        {viewMode === "docentes" ? (
          <motion.div
            className="bg-white/70 dark:bg-black/40 p-6 rounded-2xl border border-teal-500/20 shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
              <Users /> Lista de Docentes
            </h2>
            <table className="w-full border border-gray-600 rounded-xl overflow-hidden text-sm">
              <thead className="dark:bg-teal-600 dark:text-white bg-orange-200">
                <tr>
                  <th className="py-2 px-4 text-left">#</th>
                  <th className="py-2 px-4 text-left">Nombre</th>
                  <th className="py-2 px-4 text-left">Usuario</th>
                  
                </tr>
              </thead>
              <tbody>
                {teachers.map((doc, i) => (
                  <tr
                    key={doc.id}
                    className="border-b border-gray-600 hover:bg-gray-800/40 transition"
                  >
                    <td className="py-2 px-4">{i + 1}</td>
                    <td className="py-2 px-4">{`${doc.first_name} ${doc.last_name}`}</td>
                    <td className="py-2 px-4">{doc.username}</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <>
            {/* Cards de estudiantes */}
            <motion.div
              className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5  "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {filteredData.map((student) => (
                <div
                  key={student.id}
                  className="bg-gradient-to-br dark:from-gray-900/70 dark:to-black/60 from-white/70 to-gray-100 p-6 rounded-2xl border border-teal-400/30 shadow-lg hover:shadow-teal-500/50 transition-all"
                >
                  <h3 className="text-xl font-bold text-black dark:text-teal-300 mb-1">
                    {student.nombre}
                  </h3>
                  <p className="text-black dark:text-gray-400 mb-2 ">
                    Paralelo:{" "}
                    <span className="text-black dark:text-white font-semibold">
                      {student.paralelo}
                    </span>
                  </p>
                  <p className="text-black dark:text-gray-400 mb-2">
                    Promedio:{" "}
                    <span className="text-black dark:text-white font-semibold">
                      {student.promedio}%
                    </span>
                  </p>
                  <p className="text-black dark:text-gray-400 mb-2">
                    Tests Realizados:{" "}
                    <span className="text-black dark:text-white font-semibold">
                      {student.cantidadTests}
                    </span>
                  </p>

                  <div className="mt-3">
                    <h4 className="text-black dark:text-teal-400 font-semibold mb-1">
                      Resultados por Test:
                    </h4>
                    {testsInfo.map((t) => (
                      <p
                        key={t.id}
                        className="text-gray-700 dark:text-gray-300 text-sm"
                      >
                        {t.icon} {t.nombre}:{" "}
                        <span className="text-black dark:text-white font-medium">
                          {getPorcentaje(student.id, t.id)}%
                        </span>
                      </p>
                    ))}
                  </div>

                 

                  {/* Aptitudes Reales del Backend */}
{/* Aptitudes Reales del Backend */}
{(() => {
  const aptitudesEst = aptitudes.find(
    (a) =>
      parseInt(a.estudiante_id || a.estudiante?.id || a.estudiante) === student.id
  );

  if (
    aptitudesEst &&
    Array.isArray(aptitudesEst.aptitudes) &&
    aptitudesEst.aptitudes.length > 0
  ) {
    return (
      <div className="mt-3 bg-amber-500/10 p-3 rounded-xl border border-amber-500/30">
        <h4 className="text-black dark:text-amber-400 font-semibold mb-1">
          Aptitudes Reales (Backend):
        </h4>
        {aptitudesEst.aptitudes.map((apt, i) => (
          <p key={i} className="text-gray-700 dark:text-gray-300 text-sm">
            {apt.aptitud}:{" "}
            <span className="text-black dark:text-white font-medium">
              {apt.porcentaje}
            </span>
          </p>
        ))}
      </div>
    );
  } else {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
        No hay aptitudes reales registradas.
      </p>
    );
  }
})()}


                  {/* Carreras Recomendadas */}
                  {student.carrerasRecomendadas.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-black dark:text-teal-400 font-semibold mb-1">
                        🎓 Carreras Recomendadas:
                      </h4>
                      {student.carrerasRecomendadas.map((carrera, index) => (
                        <p
                          key={index}
                          className="text-gray-700 dark:text-gray-300 text-sm"
                        >
                          {carrera.carrera}:{" "}
                          <span className="text-black dark:text-white font-medium">
                            {carrera.probabilidad}
                          </span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
            {/* Gráfico de promedios */}
            <motion.div
              className=" mt-12 bg-white/70 dark:bg-black/40 p-6 rounded-2xl border border-teal-500/20 shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold dark:text-teal-300 mb-6 text-center flex items-center justify-center gap-2">
                <Star /> Promedios Generales
              </h2>
              <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 40, left: 10 }}
        >
          {/* Grid */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.grid}
            strokeWidth={1.5}
          />

          {/* Eje X */}
          <XAxis
            dataKey="nombre"
            tick={{ fill: colors.axis, fontSize: 12 }}
            stroke={colors.axis}
            strokeWidth={3}
            angle={-20}
            textAnchor="end"
            interval={0}
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

          {/* Barras */}
          <Bar
            dataKey="promedio"
            fill={colors.bar}
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};
