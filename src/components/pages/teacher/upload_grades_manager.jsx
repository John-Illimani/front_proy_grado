import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { FilePlus, CheckCircle2 } from "lucide-react";

import { getStudents } from "../../../api/api_student";
import { getGrades, addGrade, updateGrade } from "../../../api/api_grades";
import { getCourses } from "../../../api/api_courses";
import { getSections } from "../../../api/api_section";
import { getUsers } from "../../../api/api_user";
import { getTeachers } from "../../../api/api_teacher";

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
  const [trimestre, setTrimestre] = useState("notas1"); // trimestre por defecto

  // Cargar usuario y profesor
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      getUsers().then((resUsers) => {
        setUsers(resUsers.data);
        const user = resUsers.data.find((u) => u.username === username);
        if (!user) return;

        getTeachers().then((resTeachers) => {
          const prof = resTeachers.data.find((t) => t.usuario === user.id);
          if (prof) setProfesorId(prof.id);
        });
      });
    }
  }, []);

  // Cargar cursos y secciones
  useEffect(() => {
    getCourses().then((res) => setCourses(res.data));
    getSections().then((res) => setSections(res.data));
  }, []);

  // Cargar estudiantes y notas según paralelo y materia
  useEffect(() => {
    if (selectedCourse && selectedSection) {
      Promise.all([getStudents(), getGrades()]).then(([resStudents, resGrades]) => {
        const studentsInSection = resStudents.data.filter(
          (st) => st.paralelo === selectedSection.id
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

  // Obtener nota de un estudiante según trimestre
  const getNotaEstudiante = (idEstudiante) =>
    grades.find((g) => g.estudiante === idEstudiante)?.[trimestre] || "";

  // Obtener nombre completo del estudiante
  const getNombreEstudiante = (usuarioId) => {
    const user = users.find((u) => u.id === usuarioId);
    return user ? `${user.first_name} ${user.last_name}`.trim() : "Sin nombre";
  };

  // Guardar o actualizar nota
  const handleSaveGrade = async (student, value) => {
    if (!student || value === "" || isNaN(value)) return;
    setSavingId(student.id);

    try {
      const existing = grades.find((g) => g.estudiante === student.id);
      const payload = {
        estudiante: student.id,
        materia: selectedCourse.id,
        profesor: profesorId,
        notas1: 0,
        notas2: 0,
        notas3: 0,
        [trimestre]: parseInt(value),
      };

      if (existing) {
        await updateGrade(existing.id, { ...existing, [trimestre]: parseInt(value) });
        setGrades((prev) =>
          prev.map((g) =>
            g.estudiante === student.id ? { ...g, [trimestre]: parseInt(value) } : g
          )
        );
      } else {
        const res = await addGrade(payload);
        setGrades((prev) => [...prev, res.data]);
      }
    } catch (err) {
      console.error("Error guardando nota:", err);
    } finally {
      setTimeout(() => setSavingId(null), 800);
    }
  };

  // Subir notas desde Excel
  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const resStudents = await getStudents();

      for (const row of rows) {
        const nombre = row["Nombre"];
        const apellido = row["Apellido"];
        const nota = row["Nota"];

        if (nombre && apellido && nota !== "" && !isNaN(nota)) {
          const nombreCompleto = `${nombre.trim()} ${apellido.trim()}`.toLowerCase();
          const user = users.find(
            (u) =>
              `${u.first_name} ${u.last_name}`.toLowerCase().trim() === nombreCompleto
          );
          if (!user) continue;

          const studentObj = resStudents.data.find((st) => st.usuario === user.id);
          if (studentObj) {
            await handleSaveGrade(studentObj, nota);
          }
        }
      }

      // Reiniciar input
      event.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="dark:text-gray-300 text-gray-700 overflow-y-auto scrollbar-hide h-[90vh]">
      <motion.h1
        className="text-3xl md:text-5xl text-center font-bold text-teal-400 drop-shadow-lg mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Gestión de Notas
      </motion.h1>

      {/* Selección de paralelo, materia y trimestre */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center">
        <div className="flex-1">
          <label className="block mb-2 text-teal-400 font-semibold">Paralelo</label>
          <select
            className="w-full md:w-auto px-4 py-3 rounded-xl border border-teal-400/50 bg-gray-900 text-white focus:ring-2 focus:ring-teal-400"
            onChange={(e) =>
              setSelectedSection(sections.find((s) => s.id === parseInt(e.target.value)))
            }
          >
            <option value="">Seleccione un paralelo</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block mb-2 text-teal-400 font-semibold">Materia</label>
          <select
            className="w-full md:w-auto px-4 py-3 rounded-xl border border-teal-400/50 bg-gray-900 text-white focus:ring-2 focus:ring-teal-400"
            onChange={(e) =>
              setSelectedCourse(courses.find((c) => c.id === parseInt(e.target.value)))
            }
          >
            <option value="">Seleccione una materia</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block mb-2 text-teal-400 font-semibold">Trimestre</label>
          <select
            className="w-full md:w-auto px-4 py-3 rounded-xl border border-teal-400/50 bg-gray-900 text-white focus:ring-2 focus:ring-teal-400"
            value={trimestre}
            onChange={(e) => setTrimestre(e.target.value)}
          >
            <option value="notas1">Primer Trimestre</option>
            <option value="notas2">Segundo Trimestre</option>
            <option value="notas3">Tercer Trimestre</option>
          </select>
        </div>

        <label className="flex items-center gap-2 px-4 py-3 bg-teal-500 rounded-xl cursor-pointer hover:bg-teal-400 transition">
          <FilePlus size={20} /> Cargar Excel
          <input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            onChange={handleExcelUpload}
          />
        </label>
      </div>

      {!selectedCourse || !selectedSection ? (
        <p className="mt-4 text-lg">
          Por favor, seleccione un paralelo, una materia y trimestre para ver las notas.
        </p>
      ) : null}

      {/* Tabla de notas */}
      {selectedCourse && selectedSection && students.length > 0 && (
        <motion.div
          className="bg-gray-800/50 rounded-2xl p-4 shadow-xl backdrop-blur-sm border border-teal-400/20 overflow-x-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <table className="min-w-full divide-y divide-teal-400/20 text-sm md:text-base">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-4 py-2 text-left text-teal-400 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-teal-400 uppercase">Estudiante</th>
                <th className="px-4 py-2 text-left text-teal-400 uppercase">Nota</th>
                <th className="px-4 py-2 text-center text-teal-400 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900/60 divide-y divide-teal-400/20">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-4 py-2">{st.id}</td>
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
                            className={`px-3 py-1 rounded-xl transition text-white ${
                              savingId === st.id
                                ? "bg-green-500"
                                : "bg-teal-500 hover:bg-teal-400"
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
    </div>
  );
};
