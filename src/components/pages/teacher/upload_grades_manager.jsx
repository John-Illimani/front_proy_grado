import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { FilePlus, CheckCircle2 } from "lucide-react";

import { getStudents } from "../../../api/api_student";
import { getGrades, addGrade,updateGrade } from "../../../api/api_grades";
import { getCourses } from "../../../api/api_courses";
import { getSections } from "../../../api/api_section";
import { getUsers } from "../../../api/api_user";
import { getTeachers } from "../../../api/api_teacher";

import ModalResultado from "../../modal.jsx";

export const TeacherGradesManager = () => {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [profesorId, setProfesorId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [trimestre, setTrimestre] = useState("notas1");

  // ─── Cargar usuario y profesor ────────────────────────────────────────────────
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) return;

    getUsers().then((resUsers) => {
      setUsers(resUsers.data);
      const user = resUsers.data.find((u) => u.username === username);
      if (!user) return;

      getTeachers().then((resTeachers) => {
        const prof = resTeachers.data.find((t) => t.usuario === user.id);
        if (prof) setProfesorId(prof.id);
      });
    });
  }, []);

  // ─── Cargar cursos y secciones ────────────────────────────────────────────────
  useEffect(() => {
    getCourses().then((res) => setCourses(res.data));
    getSections().then((res) => setSections(res.data));
  }, []);

  // ─── Cargar estudiantes y notas al cambiar paralelo o materia ─────────────────
  useEffect(() => {
    if (selectedCourse && selectedSection) {
      Promise.all([getStudents(), getGrades()]).then(([resStudents, resGrades]) => {
        const studentsInSection = resStudents.data.filter(
          (st) => st.paralelo === selectedSection.id && st.usuario != null
        );
        const filteredGrades = resGrades.data.filter(
          (g) =>
            g.materia === selectedCourse.id &&
            studentsInSection.some((st) => st.id === g.estudiante)
        );
        setStudents(studentsInSection);
        setGrades(filteredGrades);
      });
    } else {
      setStudents([]);
      setGrades([]);
    }
  }, [selectedCourse, selectedSection]);

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const getNotaEstudiante = (idEstudiante) =>
    grades.find((g) => g.estudiante === idEstudiante)?.[trimestre] ?? "";

  const getNombreEstudiante = (usuarioId) => {
    const user = users.find((u) => u.id === usuarioId);
    return user ? `${user.first_name} ${user.last_name}`.trim() : "Sin nombre";
  };

  // ─── Guardar nota manual ──────────────────────────────────────────────────────
  const handleSaveGrade = async (student, value) => {
    if (!student || value === "" || isNaN(value)) return;

    setSavingId(student.id);
    try {
      const payload = {
        estudiante: student.id,
        materia: selectedCourse.id,
        profesor: profesorId,
        notas1: 0,
        notas2: 0,
        notas3: 0,
        [trimestre]: parseInt(value),
      };

      const res = await addGrade(payload);

      setGrades((prev) => {
        const existe = prev.find(
          (g) => g.estudiante === student.id && g.materia === selectedCourse.id
        );
        if (existe) {
          return prev.map((g) =>
            g.estudiante === student.id && g.materia === selectedCourse.id
              ? { ...g, ...res.data }
              : g
          );
        }
        return [...prev, res.data];
      });
    } catch (err) {
      console.error("❌ Error guardando nota:", err.response?.data || err);
    } finally {
      setSavingId(null);
    }
  };

// ─── NORMALIZAR ─────────────────────────────
const normalizar = (t) =>
  String(t || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

// ─── MATCH SIMPLE ───────────────────────────
const matchNombre = (u, nombre, apellido) => {
  return (
    normalizar(u.first_name) === nombre &&
    normalizar(u.last_name) === apellido
  );
};

// ─── MAPEO TRIMESTRE ───────────────────────
const obtenerCampoNota = (trimestre) => {
  const map = {
    1: "notas1",
    2: "notas2",
    3: "notas3",
    notas1: "notas1",
    notas2: "notas2",
    notas3: "notas3",
  };
  return map[trimestre];
};

const [openModal, setOpenModal] = useState(false);
const [modalData, setModalData] = useState({
  titulo: "",
  mensaje: "",
  detalles: [],
});

// ─── SUBIR EXCEL ───────────────────────────
const handleExcelUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  event.target.value = "";

  const reader = new FileReader();

  reader.onload = async (e) => {
    let nuevos = [];
    let fallos = [];

    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const estudiantesUsuarios = users.filter(
        (u) => u.rol === "estudiante"
      );

      const resStudents = await getStudents();
      const allStudents = resStudents.data;

      const mapStudent = new Map();
      allStudents.forEach((st) => {
        mapStudent.set(Number(st.usuario), st.id);
      });

      const campoNota = obtenerCampoNota(trimestre);
      if (!campoNota) {
        alert("Trimestre inválido");
        return;
      }

      for (const row of rows) {
        const nombre = normalizar(row["Nombre"]);
        const apellido = normalizar(row["Apellido"]);
        const nota = parseInt(row["Nota"]);

        if (!nombre || isNaN(nota)) continue;

        const user = estudiantesUsuarios.find((u) =>
          matchNombre(u, nombre, apellido)
        );

        if (!user) {
          fallos.push(`${nombre} ${apellido}`);
          continue;
        }

        const studentId = mapStudent.get(Number(user.id));
        if (!studentId) {
          fallos.push(`${nombre} ${apellido}`);
          continue;
        }

        const resCheck = await getGrades();
        const gradeExist = resCheck.data.find(
          (g) =>
            g.estudiante === studentId &&
            g.materia === selectedCourse.id
        );

        const payload = {
          estudiante: studentId,
          materia: selectedCourse.id,
          profesor: profesorId,
          [campoNota]: nota,
        };

        try {
          let res;

          if (gradeExist) {
            res = await updateGrade(gradeExist.id, payload);
          } else {
            res = await addGrade(payload);
          }

          nuevos.push(res.data);
        } catch {
          fallos.push(`${nombre} ${apellido}`);
        }
      }

      // 🔥 ACTUALIZAR UI
      setGrades((prev) => {
        const updated = [...prev];

        nuevos.forEach((nuevo) => {
          const index = updated.findIndex(
            (g) =>
              g.estudiante === nuevo.estudiante &&
              g.materia === nuevo.materia
          );

          if (index !== -1) {
            updated[index] = { ...updated[index], ...nuevo };
          } else {
            updated.push(nuevo);
          }
        });

        return updated;
      });

      // 🔥 MODAL FINAL
      setModalData({
        titulo: fallos.length
          ? "Carga completada con errores"
          : "Carga completada",
        mensaje: `Se registraron ${nuevos.length} correctamente`,
        detalles: fallos,
      });

      setOpenModal(true);

    } catch (err) {
      setModalData({
        titulo: "Error",
        mensaje: "Ocurrió un error al procesar el archivo",
        detalles: [],
      });
      setOpenModal(true);
    }
  };

  reader.readAsArrayBuffer(file);
};
  
  return (
    <div className="dark:text-gray-300 text-gray-700 overflow-y-auto scrollbar-hide h-[90vh]">
      <motion.h1
        className="text-3xl md:text-5xl text-center font-bold dark:text-teal-400 drop-shadow-lg mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Gestión de Notas
      </motion.h1>

      {/* Controles */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center">
        {/* Paralelo */}
        <div className="flex-1">
          <label className="block mb-2 dark:text-teal-400 font-semibold">Paralelo</label>
          <select
            className="w-full md:w-auto px-4 py-3 rounded-xl border border-teal-400/50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-teal-400"
            onChange={(e) =>
              setSelectedSection(sections.find((s) => s.id === parseInt(e.target.value)))
            }
          >
            <option value="">Seleccione un paralelo</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        {/* Materia */}
        <div className="flex-1">
          <label className="block mb-2 dark:text-teal-400 font-semibold">Materia</label>
          <select
            className="w-full md:w-auto px-4 py-3 rounded-xl border border-teal-400/50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-teal-400"
            onChange={(e) =>
              setSelectedCourse(courses.find((c) => c.id === parseInt(e.target.value)))
            }
          >
            <option value="">Seleccione una materia</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* Trimestre */}
        <div className="flex-1">
          <label className="block mb-2 dark:text-teal-400 font-semibold">Trimestre</label>
          <select
            className="w-full md:w-auto px-4 py-3 rounded-xl border border-teal-400/50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-teal-400"
            value={trimestre}
            onChange={(e) => setTrimestre(e.target.value)}
          >
            <option value="notas1">Primer Trimestre</option>
            <option value="notas2">Segundo Trimestre</option>
            <option value="notas3">Tercer Trimestre</option>
          </select>
        </div>

        {/* Excel */}
        <label className="flex items-center gap-2 px-4 py-3 dark:bg-teal-500 rounded-xl cursor-pointer dark:hover:bg-teal-400 transition text-white bg-green-800 hover:bg-green-500 font-bold">
          <FilePlus size={20} /> Cargar Excel
          <input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            onChange={handleExcelUpload}
          />
        </label>
      </div>

      {(!selectedCourse || !selectedSection) && (
        <p className="mt-4 text-lg">
          Por favor, seleccione un paralelo, una materia y trimestre para ver las notas.
        </p>
      )}

      {/* Tabla */}
      {selectedCourse && selectedSection && students.length > 0 && (
        <motion.div
          className="dark:from-gray-800/30 dark:to-black/50 rounded-2xl p-4 shadow-xl backdrop-blur-sm border border-teal-400/20 overflow-x-auto bg-gradient-to-br from-white/50 to-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <table className="min-w-full divide-y divide-teal-400/20 text-sm md:text-base">
            <thead className="dark:bg-gray-600 bg-orange-200">
              <tr>
                <th className="px-4 py-2 text-left dark:text-teal-400 uppercase">Estudiante</th>
                <th className="px-4 py-2 text-left dark:text-teal-400 uppercase">Nota</th>
                <th className="px-4 py-2 text-center dark:text-teal-400 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="dark:bg-gray-900/60 divide-y divide-teal-400/20">
              {students.map((st) => (
                <tr
                  key={st.id}
                  className="dark:hover:bg-gray-800/50 hover:bg-gray-200/50 dark:text-white text-black transition"
                >
                  <td className="px-4 py-2">{getNombreEstudiante(st.usuario)}</td>
                  <td className="px-4 py-2">
                    <Formik
                      initialValues={{ nota: getNotaEstudiante(st.id) }}
                      enableReinitialize
                      onSubmit={({ nota }) => handleSaveGrade(st, nota)}
                    >
                      {({ handleSubmit }) => (
                        <Form className="flex items-center gap-2" onSubmit={handleSubmit}>
                          <Field
                            name="nota"
                            type="number"
                            min="0"
                            max="100"
                            className="border p-2 rounded w-20 text-black"
                          />
                          <motion.button
                            type="submit"
                            whileTap={{ scale: 0.9 }}
                            className={`px-3 py-1 rounded-xl transition dark:text-white font-bold ${
                              savingId === st.id
                                ? "bg-green-500"
                                : "dark:bg-teal-500 dark:hover:bg-teal-400 bg-lime-400"
                            }`}
                          >
                            {savingId === st.id ? <CheckCircle2 size={18} /> : "Guardar"}
                          </motion.button>
                        </Form>
                      )}
                    </Formik>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {getNotaEstudiante(st.id) !== "" ? "✅" : "❌"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {selectedCourse && selectedSection && students.length === 0 && (
        <p className="text-gray-400 mt-4">
          No hay estudiantes en este paralelo para esta materia.
        </p>
      )}
    <ModalResultado
  open={openModal}
  onClose={() => setOpenModal(false)}
  titulo={modalData.titulo}
  mensaje={modalData.mensaje}
  detalles={modalData.detalles}
/>
    </div>
  );
};