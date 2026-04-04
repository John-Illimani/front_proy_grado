import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { FilePlus, CheckCircle2 } from "lucide-react";

import { getStudents } from "../../../api/api_student";
import { getGrades, addGrade, updateGrade,addGradeBulk } from "../../../api/api_grades";
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
  const [savingIds, setSavingIds] = useState({});
  const [isLoadingExcel, setIsLoadingExcel] = useState(false);
  const [progresoExcel, setProgresoExcel] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState({ titulo: "", mensaje: "", detalles: [] });

  // ─── Cargar usuario y profesor ────────────────────────────────────────────────
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) return;
    getUsers().then((resUsers) => {
      setUsers(resUsers.data);
      const user = resUsers.data.find((u) => u.username === username);
      if (!user) return;
      getTeachers().then((resTeachers) => {
        const prof = resTeachers.data.find((t) => Number(t.usuario) === Number(user.id));
        if (prof) setProfesorId(prof.id);
      });
    });
  }, []);

  // ─── Cargar cursos y secciones ────────────────────────────────────────────────
  useEffect(() => {
    getCourses().then((res) => setCourses(res.data));
    getSections().then((res) => setSections(res.data));
  }, []);

  // ─── Cargar estudiantes y notas ───────────────────────────────────────────────
  useEffect(() => {
    if (selectedCourse && selectedSection) {
      Promise.all([getStudents(), getGrades()]).then(([resStudents, resGrades]) => {
        const studentsInSection = resStudents.data.filter(
          (st) => Number(st.paralelo) === Number(selectedSection.id) && st.usuario != null
        );
        const filteredGrades = resGrades.data.filter(
          (g) =>
            Number(g.materia) === Number(selectedCourse.id) &&
            studentsInSection.some((st) => Number(st.id) === Number(g.estudiante))
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
  const getNotaEstudiante = (idEstudiante, trimestre) =>
    grades.find((g) => Number(g.estudiante) === Number(idEstudiante))?.[trimestre] ?? "";

  const getNombreEstudiante = (usuarioId) => {
    const user = users.find((u) => Number(u.id) === Number(usuarioId));
    return user ? `${user.first_name} ${user.last_name}`.trim() : "Sin nombre";
  };

  // ─── Guardar nota manual (individual) ────────────────────────────────────────
  const handleSaveGrade = async (studentId, trimestre, value) => {
    if (!studentId || value === "" || isNaN(value) || !profesorId) return;
    setSavingIds((prev) => ({ ...prev, [`${studentId}-${trimestre}`]: true }));
    try {
      const gradeExist = grades.find(
        (g) =>
          Number(g.estudiante) === Number(studentId) &&
          Number(g.materia) === Number(selectedCourse.id)
      );
      if (gradeExist) {
        const payload = { ...gradeExist, [trimestre]: parseInt(value), profesor: profesorId };
        const res = await updateGrade(gradeExist.id, payload);
        setGrades((prev) =>
          prev.map((g) => (Number(g.id) === Number(gradeExist.id) ? { ...g, ...res.data } : g))
        );
      } else {
        const payload = {
          estudiante: studentId,
          materia: selectedCourse.id,
          profesor: profesorId,
          notas1: trimestre === "notas1" ? parseInt(value) : 0,
          notas2: trimestre === "notas2" ? parseInt(value) : 0,
          notas3: trimestre === "notas3" ? parseInt(value) : 0,
        };
        const res = await addGrade(payload);
        setGrades((prev) => [...prev, res.data]);
      }
    } catch (err) {
      console.error("❌ Error guardando nota:", err.response?.data || err);
    } finally {
      setSavingIds((prev) => {
        const next = { ...prev };
        delete next[`${studentId}-${trimestre}`];
        return next;
      });
    }
  };

  // ─── Normalizar texto ─────────────────────────────────────────────────────────
  const normalizar = (t) =>
    String(t ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

  // ─── Buscar usuario flexible ──────────────────────────────────────────────────
  const buscarUsuarioPorNombre = (todosUsers, nombreCompleto) => {
    const nc = normalizar(nombreCompleto);
    if (!nc) return null;
    // Intento 1: exacto
    const exacto = todosUsers.find(
      (u) => normalizar(`${u.first_name} ${u.last_name}`) === nc
    );
    if (exacto) return exacto;
    // Intento 2: contención en cualquier dirección (nombres compuestos)
    const parcial = todosUsers.find((u) => {
      const full = normalizar(`${u.first_name} ${u.last_name}`);
      return full.includes(nc) || nc.includes(full);
    });
    return parcial || null;
  };

  // ─── NUEVA FUNCIÓN: Validar payload antes de enviar ───────────────────────────
  const validarPayload = (payload, nombreCompleto, idx) => {
    const errores = [];
    
    if (!payload.estudiante || isNaN(payload.estudiante)) {
      errores.push(`❌ Fila ${idx + 1}: Sin ID estudiante válido`);
      return null;
    }
    if (!payload.materia || isNaN(payload.materia)) {
      errores.push(`❌ Fila ${idx + 1}: Sin ID materia válido`);
      return null;
    }
    if (!payload.profesor || isNaN(payload.profesor)) {
      errores.push(`❌ Fila ${idx + 1}: Sin ID profesor válido`);
      return null;
    }
    
    // Verificar que al menos tenga UNA nota válida (no todas 0)
    if (payload.notas1 === 0 && payload.notas2 === 0 && payload.notas3 === 0) {
      errores.push(`⚠️ Fila ${idx + 1}: Todas las notas son 0 - omitido`);
      return null;
    }
    
    console.log(`✅ Fila ${idx + 1} VALIDADA: "${nombreCompleto}" →`, {
      estudiante: payload.estudiante,
      materia: payload.materia,
      profesor: payload.profesor,
      notas: `${payload.notas1}/${payload.notas2}/${payload.notas3}`
    });
    
    return payload;
  };

  // ─── SUBIR EXCEL — CORREGIDO con validación y logs detallados ─────────────────
  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !profesorId || !selectedCourse || !selectedSection) {
      alert("Seleccione materia, paralelo y asegúrese de estar logueado");
      return;
    }
    event.target.value = "";
    setIsLoadingExcel(true);
    setProgresoExcel("Leyendo archivo...");
    console.log("🚀 INICIANDO PROCESO EXCEL");

    const reader = new FileReader();

    reader.onload = async (e) => {
      let fallos = [];
      let payloadsValidos = [];
      let totalIntentos = 0;

      try {
        // ── Leer Excel ────────────────────────────────────────────────────────
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        console.log(`📊 Filas en Excel: ${rows.length}`);
        if (rows[0]) console.log("📋 Columnas:", Object.keys(rows[0]));

        setProgresoExcel("Cargando datos del servidor...");

        // ── Datos frescos del servidor ────────────────────────────────────────
        const [resStudents, resUsers] = await Promise.all([
          getStudents(),
          getUsers(),
        ]);

        const todosUsers = resUsers.data;
        const todosStudents = resStudents.data;

        // Map usuarioId → studentId
        const mapUsuarioToStudent = new Map();
        todosStudents.forEach((st) => {
          if (st.usuario != null) {
            mapUsuarioToStudent.set(Number(st.usuario), Number(st.id));
          }
        });

        console.log(`👥 Usuarios: ${todosUsers.length} | 🎓 Estudiantes mapeados: ${mapUsuarioToStudent.size}`);

        // ── Procesar cada fila ─────────────────────────────────────────────────
        setProgresoExcel("Procesando estudiantes...");
        
        for (const [idx, row] of rows.entries()) {
          totalIntentos++;
          
          // Leer nombre completo
          let nombreCompleto = "";
          if (row["Nombre Completo"] || row["nombre completo"]) {
            nombreCompleto = String(row["Nombre Completo"] || row["nombre completo"]).trim();
          } else {
            const nombre = String(row["Nombre"] || row["nombre"] || "").trim();
            const apellido = String(row["Apellido"] || row["apellido"] || "").trim();
            nombreCompleto = `${nombre} ${apellido}`.trim();
          }

          if (!nombreCompleto) {
            console.log(`⏭️ Fila ${idx + 1}: Nombre vacío, omitida`);
            continue;
          }

          console.log(`\n🔍 Procesando fila ${idx + 1}: "${nombreCompleto}"`);

          // Buscar usuario
          const user = buscarUsuarioPorNombre(todosUsers, nombreCompleto);
          if (!user) {
            const errorMsg = `Fila ${idx + 1}: "${nombreCompleto}" no encontrado`;
            fallos.push(errorMsg);
            console.warn(`❌ ${errorMsg}`);
            continue;
          }

          // Obtener studentId
          const studentId = mapUsuarioToStudent.get(Number(user.id));
          if (!studentId) {
            const errorMsg = `Fila ${idx + 1}: "${nombreCompleto}" (user ${user.id}) sin registro estudiante`;
            fallos.push(errorMsg);
            console.warn(`❌ ${errorMsg}`);
            continue;
          }

          // Leer notas
          const nota1 = parseFloat(
            row["1er Trimestre"] ?? row["1° Trimestre"] ?? row["Trimestre 1"] ??
            row["Nota1"] ?? row["notas1"] ?? row["T1"] ?? 0
          ) || 0;
          const nota2 = parseFloat(
            row["2do Trimestre"] ?? row["2° Trimestre"] ?? row["Trimestre 2"] ??
            row["Nota2"] ?? row["notas2"] ?? row["T2"] ?? 0
          ) || 0;
          const nota3 = parseFloat(
            row["3er Trimestre"] ?? row["3° Trimestre"] ?? row["Trimestre 3"] ??
            row["Nota3"] ?? row["notas3"] ?? row["T3"] ?? 0
          ) || 0;

          // Crear payload
          const payload = {
            estudiante: studentId,
            materia: Number(selectedCourse.id),
            profesor: profesorId,
            notas1: Math.round(nota1),
            notas2: Math.round(nota2),
            notas3: Math.round(nota3),
          };

          // VALIDAR ANTES DE AGREGAR
          const payloadValidado = validarPayload(payload, nombreCompleto, idx);
          if (payloadValidado) {
            payloadsValidos.push(payloadValidado);
          }
        }

        console.log(`\n📈 RESUMEN PROCESAMIENTO:`);
        console.log(`- Total filas Excel: ${totalIntentos}`);
        console.log(`- Payloads válidos: ${payloadsValidos.length}`);
        console.log(`- Fallos: ${fallos.length}`);

        if (payloadsValidos.length === 0) {
          setModalData({
            titulo: "Sin datos válidos",
            mensaje: "No se encontró ningún estudiante válido con notas en el Excel.",
            detalles: fallos,
          });
          setOpenModal(true);
          return;
        }

        // ── MOSTRAR PREVIEW ANTES DE ENVIAR ────────────────────────────────────
        console.log(`\n📤 PREVIEW - ${payloadsValidos.length} payloads listos para enviar:`);
        payloadsValidos.forEach((p, i) => {
          console.log(`  ${i + 1}. Est:${p.estudiante} Mat:${p.materia} Prof:${p.profesor} → ${p.notas1}/${p.notas2}/${p.notas3}`);
        });

        // ── UN SOLO POST con todo el array ────────────────────────────────────
        console.log(`\n🚀 ENVIANDO ${payloadsValidos.length} notas al backend...`);
        setProgresoExcel(`Enviando ${payloadsValidos.length} notas...`);
        
        const resultado = await addGradeBulk(payloadsValidos);
        console.log("📥 RESPUESTA BACKEND:", resultado);

        // ── VERIFICAR resultado del backend ────────────────────────────────────
        let procesados = 0;
        let fallidosBackend = [];
        
        if (resultado?.procesados) {
          procesados = resultado.procesados;
        } else if (resultado?.resultados) {
          procesados = resultado.resultados.filter(r => r.exito).length;
          fallidosBackend = resultado.resultados.filter(r => !r.exito).map(r => r.mensaje || `ID ${r.id}`);
        } else {
          procesados = payloadsValidos.length; // Fallback
        }

        console.log(`✅ Backend reportó: ${procesados} procesados`);
        if (fallidosBackend.length > 0) {
          console.log(`❌ Backend fallos:`, fallidosBackend);
        }

        // ── VERIFICAR EN BD - DOBLE CHECK ──────────────────────────────────────
        setProgresoExcel("Verificando en base de datos...");
        const resGradesPost = await getGrades();
        const gradesPostUpload = resGradesPost.data.filter(
          (g) =>
            Number(g.materia) === Number(selectedCourse.id) &&
            Number(g.profesor) === Number(profesorId) &&
            payloadsValidos.some(p => Number(p.estudiante) === Number(g.estudiante))
        );
        
        console.log(`🔍 VERIFICACIÓN FINAL: ${gradesPostUpload.length} notas encontradas en BD`);
        
        // Comparar qué se guardó realmente
        const estudiantesEnviados = new Set(payloadsValidos.map(p => p.estudiante));
        const estudiantesGuardados = new Set(gradesPostUpload.map(g => g.estudiante));
        const faltantes = Array.from(estudiantesEnviados).filter(id => !estudiantesGuardados.has(id));
        
        if (faltantes.length > 0) {
          console.warn(`⚠️ FALTANTES EN BD:`, faltantes);
          fallidosBackend.push(`Estudiantes no guardados: ${faltantes.join(', ')}`);
        }

        // Actualizar tabla
        setGrades(gradesPostUpload);
        setProgresoExcel("");

        // ── Modal resultado final ──────────────────────────────────────────────
        const totalFallos = fallos.length + fallidosBackend.length;
        const exitoTotal = payloadsValidos.length - totalFallos;
        
        setModalData({
          titulo: totalFallos === 0 ? "¡Carga 100% exitosa!" : "Carga completada",
          mensaje: totalFallos === 0 
            ? `✅ ${exitoTotal} notas registradas correctamente`
            : `✅ ${exitoTotal} notas guardadas | ⚠️ ${totalFallos} problemas`,
          detalles: [
            ...fallos,
            ...fallidosBackend.map(f => `Backend: ${f}`)
          ].slice(0, 20), // Limitar detalles
        });
        setOpenModal(true);

      } catch (err) {
        console.error("💥 Error general:", err);
        setModalData({
          titulo: "Error",
          mensaje: "Error al procesar el archivo o comunicarse con el servidor",
          detalles: [err.message],
        });
        setOpenModal(true);
      } finally {
        setIsLoadingExcel(false);
        setProgresoExcel("");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // ─── Resto del JSX igual ──────────────────────────────────────────────────────
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
              setSelectedSection(sections.find((s) => Number(s.id) === parseInt(e.target.value)))
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
              setSelectedCourse(courses.find((c) => Number(c.id) === parseInt(e.target.value)))
            }
          >
            <option value="">Seleccione una materia</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* Botón Excel + progreso */}
        <div className="flex flex-col items-center gap-1">
          <label
            className={`flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition text-white font-bold ${
              isLoadingExcel
                ? "dark:bg-gray-600 bg-gray-400 cursor-not-allowed"
                : "dark:bg-teal-500 hover:dark:bg-teal-400 bg-green-800 hover:bg-green-500"
            }`}
          >
            <FilePlus size={20} />
            {isLoadingExcel ? "Procesando..." : "Cargar Excel"}
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={handleExcelUpload}
              disabled={isLoadingExcel}
            />
          </label>
          {progresoExcel && (
            <span className="text-xs dark:text-teal-300 text-green-800 font-semibold animate-pulse text-center max-w-[200px]">
              {progresoExcel}
            </span>
          )}
        </div>
      </div>

      {(!selectedCourse || !selectedSection) && (
        <p className="mt-4 text-lg">
          Por favor, seleccione un paralelo y una materia para ver las notas.
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
                <th className="px-4 py-2 text-center dark:text-teal-400 uppercase">1er Trimestre</th>
                <th className="px-4 py-2 text-center dark:text-teal-400 uppercase">2do Trimestre</th>
                <th className="px-4 py-2 text-center dark:text-teal-400 uppercase">3er Trimestre</th>
                <th className="px-4 py-2 text-center dark:text-teal-400 uppercase w-24">Estado</th>
              </tr>
            </thead>
            <tbody className="dark:bg-gray-900/60 divide-y divide-teal-400/20">
              {students.map((st) => {
                const hasAnyGrade =
                  getNotaEstudiante(st.id, "notas1") !== "" ||
                  getNotaEstudiante(st.id, "notas2") !== "" ||
                  getNotaEstudiante(st.id, "notas3") !== "";
                return (
                  <tr key={st.id} className="dark:hover:bg-gray-800/50 hover:bg-gray-200/50 dark:text-white text-black transition">
                    <td className="px-4 py-2 font-medium">{getNombreEstudiante(st.usuario)}</td>

                    {/* 1er Trimestre */}
                    <td className="px-2 py-2 text-center">
                      <Formik
                        initialValues={{ nota1: getNotaEstudiante(st.id, "notas1") }}
                        enableReinitialize
                        onSubmit={({ nota1 }) => handleSaveGrade(st.id, "notas1", nota1)}
                      >
                        {({ handleSubmit }) => (
                          <Form className="flex items-center gap-1 justify-center" onSubmit={handleSubmit}>
                            <Field name="nota1" type="number" min="0" max="100" className="border p-1 rounded w-16 text-black text-xs" />
                            <motion.button type="submit" whileTap={{ scale: 0.9 }}
                              className={`p-1 rounded transition ${savingIds[`${st.id}-notas1`] ? "bg-green-500" : "dark:bg-teal-500 dark:hover:bg-teal-400 bg-lime-400 hover:bg-lime-500"}`}
                              disabled={savingIds[`${st.id}-notas1`]}>
                              {savingIds[`${st.id}-notas1`] ? <CheckCircle2 size={14} /> : "G"}
                            </motion.button>
                          </Form>
                        )}
                      </Formik>
                    </td>

                    {/* 2do Trimestre */}
                    <td className="px-2 py-2 text-center">
                      <Formik
                        initialValues={{ nota2: getNotaEstudiante(st.id, "notas2") }}
                        enableReinitialize
                        onSubmit={({ nota2 }) => handleSaveGrade(st.id, "notas2", nota2)}
                      >
                        {({ handleSubmit }) => (
                          <Form className="flex items-center gap-1 justify-center" onSubmit={handleSubmit}>
                            <Field name="nota2" type="number" min="0" max="100" className="border p-1 rounded w-16 text-black text-xs" />
                            <motion.button type="submit" whileTap={{ scale: 0.9 }}
                              className={`p-1 rounded transition ${savingIds[`${st.id}-notas2`] ? "bg-green-500" : "dark:bg-teal-500 dark:hover:bg-teal-400 bg-lime-400 hover:bg-lime-500"}`}
                              disabled={savingIds[`${st.id}-notas2`]}>
                              {savingIds[`${st.id}-notas2`] ? <CheckCircle2 size={14} /> : "G"}
                            </motion.button>
                          </Form>
                        )}
                      </Formik>
                    </td>

                    {/* 3er Trimestre */}
                    <td className="px-2 py-2 text-center">
                      <Formik
                        initialValues={{ nota3: getNotaEstudiante(st.id, "notas3") }}
                        enableReinitialize
                        onSubmit={({ nota3 }) => handleSaveGrade(st.id, "notas3", nota3)}
                      >
                        {({ handleSubmit }) => (
                          <Form className="flex items-center gap-1 justify-center" onSubmit={handleSubmit}>
                            <Field name="nota3" type="number" min="0" max="100" className="border p-1 rounded w-16 text-black text-xs" />
                            <motion.button type="submit" whileTap={{ scale: 0.9 }}
                              className={`p-1 rounded transition ${savingIds[`${st.id}-notas3`] ? "bg-green-500" : "dark:bg-teal-500 dark:hover:bg-teal-400 bg-lime-400 hover:bg-lime-500"}`}
                              disabled={savingIds[`${st.id}-notas3`]}>
                              {savingIds[`${st.id}-notas3`] ? <CheckCircle2 size={14} /> : "G"}
                            </motion.button>
                          </Form>
                        )}
                      </Formik>
                    </td>

                    <td className="px-4 py-2 text-center">{hasAnyGrade ? "✅" : "❌"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      {selectedCourse && selectedSection && students.length === 0 && (
        <p className="text-gray-400 mt-4">No hay estudiantes en este paralelo para esta materia.</p>
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