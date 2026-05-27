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
  { id: 11, nombre: "Razonamiento Espacial", total_preguntas: 30, icon: "🧠" },
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

  if (!st || !info) return 0;

  const porcentaje = (st.completo / info.total_preguntas) * 100;

  // 🔹 Limitar máximo a 100%
  return Math.min(porcentaje, 100).toFixed(1);
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
  const pdf = new jsPDF("l", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const logo = "/logo.png";

  // ─────────────────────────────────────────────
  // Fondo institucional
  // ─────────────────────────────────────────────
  const addBackground = () => {
    // Fondo claro
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Barra superior
    pdf.setFillColor(10, 36, 99);
    pdf.rect(0, 0, pageWidth, 18, "F");

    // Barra inferior
    pdf.setFillColor(10, 36, 99);
    pdf.rect(0, pageHeight - 10, pageWidth, 10, "F");

    // Marca de agua
    try {
      pdf.saveGraphicsState();
      pdf.setGState(new pdf.GState({ opacity: 0.05 }));
      pdf.addImage(
        logo,
        "PNG",
        pageWidth / 2 - 35,
        pageHeight / 2 - 35,
        70,
        70
      );
      pdf.restoreGraphicsState();
    } catch (e) {}

    // Línea dorada
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(1);
    pdf.line(0, 18, pageWidth, 18);
  };

  // ─────────────────────────────────────────────
  // Encabezado
  // ─────────────────────────────────────────────
  const addHeader = (pageNum) => {
    addBackground();

    try {
      pdf.addImage(logo, "PNG", 8, 2, 12, 12);
    } catch (e) {}

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);

    pdf.text(
      "COLEGIO MARCELO QUIROGA SANTA CRUZ",
      pageWidth / 2,
      8,
      { align: "center" }
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    pdf.text(
      "Sistema de Orientación Vocacional — Reporte General de Docentes",
      pageWidth / 2,
      14,
      { align: "center" }
    );

    pdf.setFontSize(8);
    pdf.setTextColor(220, 230, 255);

    pdf.text(
      `Fecha: ${new Date().toLocaleDateString("es-BO")}`,
      pageWidth - 10,
      8,
      { align: "right" }
    );

    pdf.text(`Página ${pageNum}`, pageWidth - 10, 14, {
      align: "right",
    });
  };

  // ─────────────────────────────────────────────
  // Pie de página
  // ─────────────────────────────────────────────
  const addFooter = () => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);

    pdf.text(
      "Sistema Vocacional — Colegio Marcelo Quiroga Santa Cruz | Documento generado automáticamente",
      pageWidth / 2,
      pageHeight - 4,
      { align: "center" }
    );
  };

  // ─────────────────────────────────────────────
  // PORTADA
  // ─────────────────────────────────────────────
  addBackground();

  try {
    pdf.addImage(logo, "PNG", pageWidth / 2 - 25, 25, 50, 50);
  } catch (e) {}

  // Caja título
  pdf.setFillColor(10, 36, 99);
  pdf.roundedRect(40, 85, pageWidth - 80, 30, 4, 4, "F");

  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.8);
  pdf.roundedRect(40, 85, pageWidth - 80, 30, 4, 4, "D");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(255, 255, 255);

  pdf.text("REPORTE GENERAL DE DOCENTES", pageWidth / 2, 102, {
    align: "center",
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(212, 175, 55);

  pdf.text(
    "Listado Institucional de Docentes Registrados",
    pageWidth / 2,
    111,
    { align: "center" }
  );

  // Caja información
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(180, 195, 220);

  pdf.roundedRect(70, 128, pageWidth - 140, 45, 3, 3, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(30, 58, 120);

  pdf.text("Información del Reporte", pageWidth / 2, 138, {
    align: "center",
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(50, 50, 80);

  pdf.text("Total de docentes:", 90, 150);

  pdf.setFont("helvetica", "bold");
  pdf.text(`${teachers.length}`, 145, 150);

  pdf.setFont("helvetica", "normal");
  pdf.text("Fecha de generación:", 90, 160);

  pdf.setFont("helvetica", "bold");
  pdf.text(new Date().toLocaleString("es-BO"), 145, 160);

  addFooter();

  // ─────────────────────────────────────────────
  // TABLA DOCENTES
  // ─────────────────────────────────────────────
  pdf.addPage("a4", "l");

  let page = 2;

  addHeader(page);

  let y = 32;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(10, 36, 99);

  pdf.text("▸ Listado General de Docentes", 10, y);

  y += 8;

  // Columnas
  const colWidths = [15, 80, 60, 70, 40];
  const colX = [];

  let x = 10;

  colWidths.forEach((w) => {
    colX.push(x);
    x += w;
  });

  const tableWidth = colWidths.reduce((a, b) => a + b, 0);

  // Header tabla
  pdf.setFillColor(10, 36, 99);
  pdf.rect(10, y, tableWidth, 10, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);

  const headers = [
    "#",
    "Nombre Completo",
    "Usuario",
    "Estado",
    "Rol",
  ];

  headers.forEach((h, i) => {
    pdf.text(h, colX[i] + colWidths[i] / 2, y + 6, {
      align: "center",
    });
  });

  y += 10;

  // ─────────────────────────────────────────────
  // Filas docentes
  // ─────────────────────────────────────────────
  teachers.forEach((doc, idx) => {
    if (y + 10 > pageHeight - 18) {
      addFooter();

      page++;
      pdf.addPage("a4", "l");
      addHeader(page);

      y = 35;

      pdf.setFillColor(10, 36, 99);
      pdf.rect(10, y, tableWidth, 10, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);

      headers.forEach((h, i) => {
        pdf.text(h, colX[i] + colWidths[i] / 2, y + 6, {
          align: "center",
        });
      });

      y += 10;
    }

    // Fondo alternado
    if (idx % 2 === 0) {
      pdf.setFillColor(235, 242, 255);
    } else {
      pdf.setFillColor(255, 255, 255);
    }

    pdf.rect(10, y, tableWidth, 9, "F");

    // Línea izquierda azul
    pdf.setFillColor(10, 36, 99);
    pdf.rect(10, y, 2, 9, "F");

    // Texto
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(40, 40, 60);

    const nombreCompleto =
      `${doc.first_name || ""} ${doc.last_name || ""}`
        .trim()
        .replace(/\s+/g, " ") || "Sin nombre";

    // #
    pdf.text(`${idx + 1}`, colX[0] + colWidths[0] / 2, y + 5.8, {
      align: "center",
    });

    // Nombre
    pdf.setFont("helvetica", "bold");

    pdf.text(nombreCompleto, colX[1] + 2, y + 5.8, {
      maxWidth: colWidths[1] - 4,
    });

    // Usuario
    pdf.setFont("helvetica", "normal");

    pdf.text(doc.username || "-", colX[2] + colWidths[2] / 2, y + 5.8, {
      align: "center",
    });

    // Estado
    pdf.setFont("helvetica", "bold");

    pdf.setTextColor(22, 163, 74);

    pdf.text("ACTIVO", colX[3] + colWidths[3] / 2, y + 5.8, {
      align: "center",
    });

    // Rol
    pdf.setTextColor(10, 36, 99);

    pdf.text("DOCENTE", colX[4] + colWidths[4] / 2, y + 5.8, {
      align: "center",
    });

    // Línea inferior
    pdf.setDrawColor(200, 210, 235);
    pdf.setLineWidth(0.2);

    pdf.line(10, y + 9, 10 + tableWidth, y + 9);

    y += 9;
  });

  addFooter();

  pdf.save("Reporte_General_Docentes.pdf");
};


const generarPDF = () => {
  const pdf = new jsPDF("landscape", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const logo = "/logo.png";

  // 🔹 Limpiar caracteres raros
  const cleanText = (text) => {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x20-\x7E]/g, "");
  };

  // 🔹 Fondo institucional
  const addBackground = () => {
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Header
    pdf.setFillColor(10, 36, 99);
    pdf.rect(0, 0, pageWidth, 18, "F");

    // Footer
    pdf.setFillColor(10, 36, 99);
    pdf.rect(0, pageHeight - 10, pageWidth, 10, "F");

    // Marca de agua
    try {
      pdf.saveGraphicsState();

      pdf.setGState(
        new pdf.GState({
          opacity: 0.05,
        })
      );

      pdf.addImage(
        logo,
        "PNG",
        pageWidth / 2 - 45,
        pageHeight / 2 - 45,
        90,
        90
      );

      pdf.restoreGraphicsState();
    } catch (e) {}

    // Línea dorada
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(1);
    pdf.line(0, 18, pageWidth, 18);
  };

  // 🔹 Header
  const addHeader = (pageNum) => {
    addBackground();

    try {
      pdf.addImage(logo, "PNG", 8, 2.5, 12, 12);
    } catch (e) {}

    pdf.setTextColor(255, 255, 255);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);

    pdf.text(
      cleanText("COLEGIO MARCELO QUIROGA SANTA CRUZ"),
      pageWidth / 2,
      8,
      {
        align: "center",
      }
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);

    pdf.text(
      cleanText("Sistema de Orientacion Vocacional"),
      pageWidth / 2,
      13.5,
      {
        align: "center",
      }
    );

    pdf.setFontSize(7.5);
    pdf.setTextColor(210, 225, 255);

    pdf.text(
      `Fecha: ${new Date().toLocaleDateString("es-BO")}`,
      pageWidth - 10,
      7,
      {
        align: "right",
      }
    );

    pdf.text(`Pagina ${pageNum}`, pageWidth - 10, 12.5, {
      align: "right",
    });
  };

  // 🔹 Footer
  const addFooter = () => {
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7.5);

    pdf.text(
      cleanText(
        "Sistema Vocacional - Colegio Marcelo Quiroga Santa Cruz"
      ),
      pageWidth / 2,
      pageHeight - 4,
      {
        align: "center",
      }
    );
  };

  // =========================================================
  // PORTADA
  // =========================================================

  addBackground();

  try {
    pdf.addImage(logo, "PNG", pageWidth / 2 - 22, 30, 44, 44);
  } catch (e) {}

  // Caja principal
  pdf.setFillColor(10, 36, 99);

  pdf.roundedRect(
    pageWidth / 2 - 85,
    88,
    170,
    28,
    4,
    4,
    "F"
  );

  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.8);

  pdf.roundedRect(
    pageWidth / 2 - 85,
    88,
    170,
    28,
    4,
    4,
    "D"
  );

  pdf.setTextColor(255, 255, 255);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);

  pdf.text(
    cleanText("REPORTE GENERAL VOCACIONAL"),
    pageWidth / 2,
    104,
    {
      align: "center",
    }
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  pdf.setTextColor(212, 175, 55);

  pdf.text(
    cleanText("Resultados Consolidados de Estudiantes"),
    pageWidth / 2,
    112,
    {
      align: "center",
    }
  );

  // Caja información
  pdf.setFillColor(255, 255, 255);

  pdf.roundedRect(
    pageWidth / 2 - 70,
    128,
    140,
    42,
    3,
    3,
    "FD"
  );

  pdf.setDrawColor(180, 195, 220);

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(10, 36, 99);
  pdf.setFontSize(10);

  pdf.text(
    cleanText("Informacion General del Reporte"),
    pageWidth / 2,
    138,
    {
      align: "center",
    }
  );

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(50);

  const paralelo =
    selectedSection?.nombre || "Todos los paralelos";

  pdf.text(
    `Paralelo seleccionado: ${cleanText(paralelo)}`,
    pageWidth / 2,
    148,
    {
      align: "center",
    }
  );

  pdf.text(
    `Total de estudiantes: ${filteredData.length}`,
    pageWidth / 2,
    156,
    {
      align: "center",
    }
  );

  pdf.text(
    `Fecha de generacion: ${new Date().toLocaleString("es-BO")}`,
    pageWidth / 2,
    164,
    {
      align: "center",
    }
  );

  addFooter();

  // =========================================================
  // TABLA GENERAL
  // =========================================================

  const headers = [
    "#",
    "Estudiante",
    "Paralelo",
    
    "Tests",
    ...testsInfo.map((t) =>
      cleanText(
        t.nombre
          .replace(/^Razonamiento\s+/i, "R. ")
          .replace(/^Rapidez y Exactitud/i, "R. Exact.")
      )
    ),
  ];

  const widths = [
    8,
    42,
    24,
    20,
    18,
    ...testsInfo.map(() => 15),
  ];

  const colX = [];

  let currentX = 8;

  widths.forEach((w) => {
    colX.push(currentX);
    currentX += w;
  });

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

    pdf.text(
      cleanText(
        "Resultados Generales por Estudiante"
      ),
      pageWidth / 2,
      y,
      {
        align: "center",
      }
    );

    y += 8;

    // Header tabla
    pdf.setFillColor(10, 36, 99);

    pdf.rect(
      (pageWidth - tableWidth) / 2,
      y,
      tableWidth,
      10,
      "F"
    );

    pdf.setTextColor(255, 255, 255);

    pdf.setFontSize(6.5);

    headers.forEach((h, i) => {
      pdf.text(
        h,
        (pageWidth - tableWidth) / 2 +
          colX[i] -
          8 +
          widths[i] / 2,
        y + 6,
        {
          align: "center",
          maxWidth: widths[i] - 1,
        }
      );
    });

    y += 10;
  };

  startTablePage();

  // =========================================================
  // FILAS
  // =========================================================

  filteredData.forEach((student, idx) => {
    const rowHeight = 8;

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

    pdf.rect(
      (pageWidth - tableWidth) / 2,
      y,
      tableWidth,
      rowHeight,
      "F"
    );

    pdf.setDrawColor(215, 225, 240);
    pdf.setLineWidth(0.2);

    pdf.rect(
      (pageWidth - tableWidth) / 2,
      y,
      tableWidth,
      rowHeight
    );

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(35, 35, 55);
    pdf.setFontSize(6.5);

    const rowData = [
      idx + 1,
      cleanText(student.nombre),
      cleanText(student.paralelo),
      
      `${student.cantidadTests}/${testsInfo.length}`,
      ...testsInfo.map(
        (t) => `${getPorcentaje(student.id, t.id)}%`
      ),
    ];

    rowData.forEach((cell, i) => {
      pdf.text(
        String(cell),
        (pageWidth - tableWidth) / 2 +
          colX[i] -
          8 +
          widths[i] / 2,
        y + 5.3,
        {
          align: "center",
          maxWidth: widths[i] - 1,
        }
      );
    });

    y += rowHeight;
  });

  // =========================================================
  // TABLA CARRERAS
  // =========================================================

  addFooter();

  page++;

  pdf.addPage("a4", "landscape");

  addHeader(page);

  y = 30;

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(10, 36, 99);
  pdf.setFontSize(11);

  pdf.text(
    cleanText("Carreras Recomendadas"),
    pageWidth / 2,
    y,
    {
      align: "center",
    }
  );

  y += 8;

  const recHeaders = [
    "#",
    "Estudiante",
    "Paralelo",
    "Carreras Recomendadas",
  ];

  const recWidths = [10, 55, 30, 150];

  const recX = [];

  let rx = 0;

  recWidths.forEach((w) => {
    recX.push(rx);
    rx += w;
  });

  const recTableWidth = recWidths.reduce((a, b) => a + b, 0);

  // Header carreras
  pdf.setFillColor(10, 36, 99);

  pdf.rect(
    (pageWidth - recTableWidth) / 2,
    y,
    recTableWidth,
    10,
    "F"
  );

  pdf.setTextColor(255, 255, 255);

  pdf.setFontSize(8);

  recHeaders.forEach((h, i) => {
    pdf.text(
      cleanText(h),
      (pageWidth - recTableWidth) / 2 +
        recX[i] +
        recWidths[i] / 2,
      y + 6,
      {
        align: "center",
      }
    );
  });

  y += 10;

  filteredData.forEach((student, idx) => {
    if (!student.carrerasRecomendadas?.length) return;

    const carrerasText = cleanText(
      student.carrerasRecomendadas
        .map(
          (c) =>
            `${c.carrera} (${c.probabilidad})`
        )
        .join("  •  ")
    );

    const lines = pdf.splitTextToSize(
      carrerasText,
      recWidths[3] - 4
    );

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

    pdf.rect(
      (pageWidth - recTableWidth) / 2,
      y,
      recTableWidth,
      rowHeight,
      "F"
    );

    pdf.setDrawColor(215, 225, 240);

    pdf.rect(
      (pageWidth - recTableWidth) / 2,
      y,
      recTableWidth,
      rowHeight
    );

    pdf.setTextColor(35, 35, 55);
    pdf.setFontSize(7);

    const row = [
      idx + 1,
      cleanText(student.nombre),
      cleanText(student.paralelo),
    ];

    row.forEach((cell, i) => {
      pdf.text(
        String(cell),
        (pageWidth - recTableWidth) / 2 +
          recX[i] +
          recWidths[i] / 2,
        y + 6,
        {
          align: "center",
          maxWidth: recWidths[i] - 2,
        }
      );
    });

    lines.forEach((line, li) => {
      pdf.text(
        line,
        (pageWidth - recTableWidth) / 2 +
          recX[3] +
          2,
        y + 6 + li * 5
      );
    });

    y += rowHeight;
  });

  addFooter();

  pdf.save("Reporte_Vocacional_General.pdf");
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
                className="flex items-center gap-2 bg-gradient-to-r dark:from-teal-500 dark:to-cyan-600 dark:hover:from-cyan-500 dark:hover:to-teal-600  text-white px-6 py-3 from-green-800 to-green-800  hover:from-green-500 hover:to-green-500  duration-300 rounded-xl font-semibold shadow-lg dark:hover:shadow-cyan-500/50 transition-all transform hover:-translate-y-1"
              >
                <FileDown /> Generar PDF Estudiantes
              </button>
            ) : (
              <button
                onClick={generarPDFDocentes}
                className="flex items-center gap-2 bg-gradient-to-r from-green-800 to-green-800  hover:from-green-500 hover:to-green-500  dark:from-amber-500 dark:to-orange-600 dark:hover:from-orange-500 dark:hover:to-amber-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg dark:hover:shadow-amber-500/50 transition-all transform hover:-translate-y-1"
              >
                <FileDown /> Generar PDF Docentes
              </button>
            )}
          </div>
        </div>

        {/* Vista Condicional */}
        {viewMode === "docentes" ? (
          <motion.div
            className="bg-white/70 dark:bg-black/40 p-6  border border-teal-500/20 shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold dark:text-white text-black mb-4 flex items-center gap-2">
              <Users /> Lista de Docentes
            </h2>
            <table className="w-full dark:border dark:border-gray-600  overflow-hidden text-sm">
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
