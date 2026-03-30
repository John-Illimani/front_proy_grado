import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { motion } from "framer-motion";
import {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
} from "../../../api/api_courses";
import { getTeachers } from "../../../api/api_teacher";
import { getUsers } from "../../../api/api_user";
import {
  getSections,
  addSection,
  updateSection,
  deleteSection,
} from "../../../api/api_section"; // ✅ tu API de paralelos
import { Trash2, Edit3, X, BookOpen, Layers } from "lucide-react";

export const CourseCRUD = () => {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]); // ✅ paralelos
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [mode, setMode] = useState("materia"); // ✅ modo actual: 'materia' o 'paralelo'

  // 🟢 Cargar datos
  const fetchData = async () => {
    try {
      const [resCourses, resTeachers, resUsers, resSections] = await Promise.all([
        getCourses(),
        getTeachers(),
        getUsers(),
        getSections(),
      ]);
      setCourses(resCourses.data);
      setTeachers(resTeachers.data);
      setUsers(resUsers.data);
      setSections(resSections.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🧾 Valores iniciales (según modo)
  const initialValues =
    mode === "materia"
      ? editingCourse
        ? {
            nombre: editingCourse.nombre,
            descripcion: editingCourse.descripcion,
            codigo: editingCourse.codigo,
            profesor: editingCourse.profesor,
          }
        : { nombre: "", descripcion: "", codigo: "", profesor: "" }
      : editingSection
      ? { nombre: editingSection.nombre }
      : { nombre: "" };

  // 💾 Guardar (materia o paralelo)
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (mode === "materia") {
        if (editingCourse) {
          await updateCourse(editingCourse.id, values);
        } else {
          await addCourse(values);
        }
      } else {
        if (editingSection) {
          await updateSection(editingSection.id, values);
        } else {
          await addSection(values);
        }
      }
      await fetchData();
      resetForm();
      setEditingCourse(null);
      setEditingSection(null);
      setShowModal(true);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el registro");
    } finally {
      setSubmitting(false);
    }
  };

  // ❌ Eliminar (materia o paralelo)
  const handleDelete = async (id) => {
    try {
      if (mode === "materia") {
        await deleteCourse(id);
      } else {
        await deleteSection(id);
      }
      await fetchData();
      setConfirmDelete({ open: false, id: null });
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar registro");
    }
  };

  const cancelEdit = () => {
    setEditingCourse(null);
    setEditingSection(null);
  };

  // 🧩 Obtener nombre del profesor
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return "Desconocido";
    const user = users.find((u) => u.id === teacher.usuario);
    if (!user) return "Sin usuario";
    const first = user.first_name?.trim() || "";
    const last = user.last_name?.trim() || "";
    if (first && last) return `${first} ${last}`;
    return user.username || `Profesor #${teacher.id}`;
  };

  return (
    <div className="relative z-10 flex-1 overflow-y-auto text-gray-700 dark:text-white p-4 md:p-8 scrollbar-hide h-[95vh] ">
      {/* Encabezado */}
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="flex items-center justify-center gap-3 text-3xl md:text-5xl font-bold dark:text-teal-400 drop-shadow-lg">
          {mode === "materia" ? (
            <>
              <BookOpen className="dark:text-teal-300 w-8 h-8 md:w-10 md:h-10" />
              Gestión de Materias
            </>
          ) : (
            <>
              <Layers className="dark:text-teal-300 w-8 h-8 md:w-10 md:h-10" />
              Gestión de Paralelos
            </>
          )}
        </h1>
        <p className="text-sm md:text-lg dark:text-gray-400 mt-2 max-w-2xl mx-auto">
          {mode === "materia"
            ? "Administra las materias registradas, asignando docentes responsables."
            : "Administra los paralelos registrados dentro del sistema."}
        </p>

        {/* 🔁 Botón para cambiar modo */}
        <button
          onClick={() => setMode(mode === "materia" ? "paralelo" : "materia")}
          className="mt-5 px-5 py-2 dark:bg-teal-600 dark:text-white bg-lime-400  rounded-xl font-bold dark:hover:bg-teal-500 hover:bg-lime-500 shadow-lg transition"
        >
          Cambiar a {mode === "materia" ? "Paralelos" : "Materias"}
        </button>
      </motion.div>

      {/* Formulario */}
      <motion.div
        className="mb-10 bg-white/70 dark:bg-gray-900/60 rounded-2xl p-6 shadow-2xl backdrop-blur-md border border-teal-400/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Formik initialValues={initialValues} enableReinitialize onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field
                name="nombre"
                placeholder={
                  mode === "materia"
                    ? "Nombre de la materia"
                    : "Nombre del paralelo (ej: 6to A)"
                }
                required
                className="px-4 py-2 rounded-xl border border-teal-400/50 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-400 outline-none col-span-full md:col-span-2"
              />

              {/* Campos solo para materias */}
              {mode === "materia" && (
                <>
                  <Field
                    name="descripcion"
                    placeholder="Descripción"
                    required
                    className="px-4 py-2 rounded-xl border border-teal-400/50 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-400 outline-none"
                  />
                  <Field
                    name="codigo"
                    placeholder="Código (ej: MAT-203)"
                    required
                    className="px-4 py-2 rounded-xl border border-teal-400/50 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-400 outline-none"
                  />

                  <Field
                    as="select"
                    name="profesor"
                    required
                    className="px-4 py-2 rounded-xl border border-teal-400/50 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-400 outline-none"
                  >
                    <option value="">Seleccionar profesor</option>
                    {teachers.map((t) => {
                      const user = users.find((u) => u.id === t.usuario);
                      const fullName = `${user?.first_name || ""} ${
                        user?.last_name || ""
                      }`
                        .trim()
                        .replace(/\s+/g, " ");
                      return (
                        <option key={t.id} value={t.id}>
                          {fullName || user?.username || `Profesor #${t.id}`}
                        </option>
                      );
                    })}
                  </Field>
                </>
              )}

              <div className="flex flex-wrap gap-3 mt-2 col-span-full justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl dark:bg-teal-500 dark:text-white font-semibold dark:hover:bg-teal-400 bg-lime-400 hover:bg-lime-500 shadow-lg transition"
                >
                  {editingCourse || editingSection
                    ? isSubmitting
                      ? "Actualizando..."
                      : "Actualizar"
                    : isSubmitting
                    ? "Registrando..."
                    : "Registrar"}
                </button>
                {(editingCourse || editingSection) && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-5 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-500 shadow-lg transition"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </motion.div>

      {/* Tabla */}
      <motion.div
        className="bg-white/70 dark:bg-gray-900/60 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-md border border-teal-400/30 overflow-x-auto scrollbar-hide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h3 className="text-xl md:text-2xl font-bold mb-4 dark:text-teal-400 ">
          {mode === "materia"
            ? `Lista de Materias (${courses.length})`
            : `Lista de Paralelos (${sections.length})`}
        </h3>

        <table className="min-w-full divide-y divide-teal-400/20 text-sm md:text-base">
          <thead className="dark:bg-teal-500/10 dark:text-white bg-orange-200">
            <tr className="dark:bg-gray-600 ">
              <th className="px-4 py-2 text-left dark:text-teal-400 uppercase  ">
                Nombre
              </th>
              {mode === "materia" && (
                <>
                  <th className="px-4 py-2 text-left dark:text-teal-400 uppercase ">
                    Descripción
                  </th>
                  <th className="px-4 py-2 text-left dark:text-teal-400 uppercase">
                    Código
                  </th>
                  <th className="px-4 py-2 text-left dark:text-teal-400 uppercase">
                    Profesor
                  </th>
                </>
              )}
              <th className="px-4 py-2 text-center dark:text-teal-400 uppercase">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
            {mode === "materia"
              ? courses.map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-teal-400/10 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="px-4 py-2">{course.nombre}</td>
                    <td className="px-4 py-2">{course.descripcion}</td>
                    <td className="px-4 py-2">{course.codigo}</td>
                    <td className="px-4 py-2">
                      {getTeacherName(course.profesor)}
                    </td>
                    <td className="px-4 py-2 text-right flex justify-end gap-2">
                      <button
                        onClick={() => setEditingCourse(course)}
                        className="flex items-center gap-1 px-3 py-1 bg-teal-500 text-white rounded-xl hover:bg-teal-400 transition"
                      >
                        <Edit3 size={16} /> Editar
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDelete({ open: true, id: course.id })
                        }
                        className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-xl hover:bg-red-400 transition"
                      >
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              : sections.map((sec) => (
                  <tr
                    key={sec.id}
                    className="hover:bg-teal-400/10 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="px-4 py-2">{sec.nombre}</td>
                    <td className="px-4 py-2 text-right flex justify-center gap-2">
                      <button
                        onClick={() => setEditingSection(sec)}
                        className="flex items-center gap-1 px-3 py-1 bg-teal-500 text-white rounded-xl hover:bg-teal-400 transition"
                      >
                        <Edit3 size={16} /> Editar
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDelete({ open: true, id: sec.id })
                        }
                        className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-xl hover:bg-red-400 transition"
                      >
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </motion.div>

      {/* Modal de éxito */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <motion.div
            className="bg-green-500 rounded-2xl p-6 max-w-sm w-full text-center shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">
              ¡Operación exitosa! 🎉
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="px-5 py-2 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Cerrar
            </button>
          </motion.div>
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmDelete.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <motion.div
            className="bg-red-500 rounded-2xl p-6 max-w-sm w-full text-center shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">
              ¿Eliminar este registro?
            </h2>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="px-5 py-2 bg-white text-red-700 rounded-xl font-semibold hover:bg-gray-100 transition"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmDelete({ open: false, id: null })}
                className="px-5 py-2 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-500 transition flex items-center justify-center gap-1"
              >
                <X size={16} /> Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
