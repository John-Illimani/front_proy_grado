import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { motion } from "framer-motion";
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../../../api/api_user";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "../../../api/api_student";
import { getSections } from "../../../api/api_section";
import { Trash2, Edit3, X, FilePlus } from "lucide-react";
import * as XLSX from "xlsx";
import { deleteMajors, getMajors } from "../../../api/api_majors";
import { deleteTest } from "../../../api/api_tests";



export const StudentCRUD = () => {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [selectedParallel, setSelectedParallel] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");

  // Fetch inicial de estudiantes, usuarios y secciones
  const fetchStudents = async () => {
    try {
      const [studentsRes, usersRes, sectionsRes] = await Promise.all([
        getStudents(),
        getUsers(),
        getSections(),
      ]);

      const studentsData = studentsRes.data.filter((st) => st.usuario != null);

      const usersData = usersRes.data.filter((u) => u.rol === "estudiante");
      const sectionsData = sectionsRes.data;

      const combinedStudents = studentsData.map((student) => {
        const user = usersData.find((u) => u.id === student.usuario);
        const section = sectionsData.find((s) => s.id === student.paralelo);
        return {
          id: student.id,
          usuario_id: student.usuario,
          paralelo_id: student.paralelo,
          username: user?.username || "",
          first_name: user?.first_name || "",
          last_name: user?.last_name || "",
          paralelo: section?.nombre || "-",
          email: user?.email || "",
        };
      });

      setStudents(combinedStudents);
      setAllUsers(usersData);
      setSections(sectionsData);

      if (sectionsData.length > 0) {
        const firstSection = sectionsData[0];

        // Solo setea el ID y el nombre si *aún* no hay una sección seleccionada
        // (es decir, en el primer render/montaje).
        if (!selectedSectionId) {
          setSelectedSectionId(firstSection.id.toString());
          setSelectedParallel(firstSection.nombre);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = selectedSectionId
    ? students.filter(
        (student) => student.paralelo_id === parseInt(selectedSectionId),
      )
    : students;

  const initialValues = editingStudent
    ? {
        first_name: editingStudent.first_name,
        last_name: editingStudent.last_name,
        password: "",
      }
    : {
        first_name: "",
        last_name: "",
        password: "",
      };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (editingStudent) {
        let userPayload = {
          first_name: values.first_name,
          last_name: values.last_name,
        };
        if (values.password && values.password.trim() !== "") {
          userPayload.password = values.password;
        }
        await updateUser(editingStudent.usuario_id, userPayload);

        if (
          selectedSectionId &&
          editingStudent.paralelo_id !== parseInt(selectedSectionId)
        ) {
          const studentPayload = { paralelo: parseInt(selectedSectionId) };
          await updateStudent(editingStudent.id, studentPayload);
        }
      } else {
        const userPayload = {
          first_name: values.first_name,
          last_name: values.last_name,
          rol: "estudiante",
        };

        // 1. Crear el usuario y esperar la respuesta real
        const userRes = await addUser(userPayload);
        const newUserId = userRes.data.id;

        // 2. Traer estudiantes para encontrar el registro vinculado
        const response = await getStudents();
        const studentObj = response.data.find((st) => st.usuario === newUserId);

        if (studentObj) {
          const newPayload = {
            usuario: newUserId,
            paralelo: parseInt(selectedSectionId),
          };
          await updateStudent(studentObj.id, newPayload);
        }
      }

      await fetchStudents();
      resetForm();
      setEditingStudent(null);
      setShowModal(true);
      setShowPassword(false);
    } catch (err) {
      console.error("Error completo:", err);
      alert("Error: " + JSON.stringify(err.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (studentId) => {
    try {
      // Buscar el estudiante seleccionado
      const student = students.find((s) => s.id === studentId);
      if (!student) {
        alert("Estudiante no encontrado");
        return;
      }

      const usuarioId = student.usuario_id;

      console.log("el id del usuario es: ", usuarioId);

      const safeDelete = async (fn, id, label) => {
        try {
          await fn(id);
        } catch (error) {
          if (error.response?.status === 404) {
            console.warn(`${label} no encontrado`);
          } else {
            console.error(`Error eliminando ${label}`, error);
          }
        }
      };

      await safeDelete(deleteUser, usuarioId, "Usuario");
      await safeDelete(deleteMajors, student.id, "Majors");
      await safeDelete(deleteTest, student.id, "Test");
      await safeDelete(deleteStudent, student.id, "Student");

      // Refrescar lista
      await fetchStudents();

      setConfirmDelete({ open: false, id: null });
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar estudiante");
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedSectionId) {
      alert("Por favor seleccione un paralelo primero");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        for (const row of json) {
          const userPayload = {
            first_name: row.Nombre || row.nombre,
            last_name: row.Apellido || row.apellido,
            rol: "estudiante",
            // Sugerencia: El backend debería generar el username,
            // si no, asegúrate de enviarlo si es requerido.
          };

          // 🔥 CORRECCIÓN: Obtener el usuario recién creado del response
          const userResponse = await addUser(userPayload);
          const newUser = userResponse.data;

          // Buscamos el registro de "Student" que se crea automáticamente (si tu backend lo hace)
          // o creamos la relación directamente.
          const resStudents = await getStudents();
          const studentRecord = resStudents.data.find(
            (st) => st.usuario === newUser.id,
          );

          if (studentRecord) {
            const studentPayload = {
              usuario: newUser.id,
              paralelo: parseInt(selectedSectionId),
            };
            await updateStudent(studentRecord.id, studentPayload);
          } else {
            // Si tu backend NO crea el registro Student automáticamente al crear un User:
            await addStudent({
              usuario: newUser.id,
              paralelo: parseInt(selectedSectionId),
            });
          }
        }

        await fetchStudents();
        alert("Estudiantes cargados exitosamente");
      } catch (error) {
        console.error("Error al cargar estudiantes:", error);
        alert(
          "Error al cargar: " +
            (error.response?.data?.detail || "Verifica el formato del Excel"),
        );
      }
    };
    reader.readAsBinaryString(file);
  };

  const cancelEdit = () => {
    setEditingStudent(null);
    setShowPassword(false);
  };

  const handleSectionChange = (e) => {
    const sectionId = e.target.value;
    const section = sections.find((s) => s.id === parseInt(sectionId));
    setSelectedSectionId(sectionId);
    setSelectedParallel(section ? section.nombre : "");
  };

  return (
    <div className="relative z-10 flex-1 overflow-y-auto  text-gray-700 dark:text-white  scrollbar-hide h-[90vh] px-1">
      {/* Header */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-3xl md:text-5xl font-bold dark:text-teal-400 drop-shadow-lg">
          Gestión de Estudiantes
        </h1>
        <p className="text-sm md:text-lg max-w-2xl mx-auto mt-2">
          Administra tu lista de estudiantes de manera eficiente y segura.
        </p>
      </motion.div>

      {/* Selección de paralelo y carga Excel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex-1 w-full">
          <h2 className="text-xl md:text-2xl font-bold  mb-2 text-center md:text-left">
            Seleccione el paralelo
          </h2>
          <select
            value={selectedSectionId}
            onChange={handleSectionChange}
            className="w-full md:w-auto px-4 py-3 rounded-xl border border-teal-400/50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-teal-400 focus:outline-none text-sm md:text-lg"
          >
            <option value="">Seleccione un paralelo</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.nombre}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 px-4 py-3 dark:bg-teal-500 rounded-xl cursor-pointer dark:hover:bg-teal-400 text-white bg-green-800 hover:bg-green-500 font-bold transition">
          <FilePlus size={20} /> Cargar Excel
          <input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            onChange={handleExcelUpload}
          />
        </label>
      </div>

      {/* Formulario */}
      {selectedSectionId && (
        <motion.div
          className="mb-8 bg-gradient-to-br dark:from-gray-800/30 dark:to-black/50 from-white/50 to-white/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-teal-400/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Formik
            initialValues={initialValues}
            enableReinitialize
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="text-gray-700 dark:text-gray-300 flex flex-wrap flex-row gap-4 items-center justify-center md:justify-start">
                <Field
                  name="first_name"
                  placeholder="Nombre"
                  required
                  className="w-full min-w-[250px] flex-1 px-4 py-2 rounded-xl border border-teal-400/50 bg-white/50 dark:bg-gray-900 focus:ring-2 focus:ring-teal-400 focus:outline-none"
                />
                <Field
                  name="last_name"
                  placeholder="Apellido"
                  required
                  className="w-full min-w-[250px] flex-1 px-4 py-2 rounded-xl border border-teal-400/50 bg-white/50 dark:bg-gray-900 focus:ring-2 focus:ring-teal-400 focus:outline-none"
                />
                {editingStudent && (
                  <div className="flex-1 relative w-full md:w-auto">
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nueva contraseña (opcional)"
                      className="w-full min-w-[150px] px-4 py-2 rounded-xl border border-yellow-400/50 bg-white/50 dark:bg-gray-900 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-yellow-400 transition"
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl dark:bg-teal-500 dark:text-white bg-lime-400 dark:hover:bg-teal-400  hover:bg-lime-500 font-bold transition"
                  >
                    {editingStudent
                      ? isSubmitting
                        ? "Actualizando..."
                        : "Actualizar"
                      : isSubmitting
                        ? "Registrando..."
                        : "Registrar"}
                  </button>
                  {editingStudent && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-5 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-500 transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </motion.div>
      )}

      {/* Lista de estudiantes */}
      {selectedSectionId && (
        <motion.div
          className="bg-gradient-to-br dark:from-gray-800/30 dark:to-black/50 from-white/50 to-white/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm border border-teal-400/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h3 className="text-xl md:text-2xl font-bold mb-4">
            Estudiantes de {selectedParallel} ({filteredStudents.length})
          </h3>
          <div className="py-2 overflow-x-auto">
            <table className="min-w-full divide-y divide-teal-400/20 text-sm md:text-base">
              <thead className="dark:bg-gray-900/50 dark:bg-gray-300">
                <tr className="dark:bg-gray-600 bg-orange-200 ">
                  <th className="px-4 py-2 text-left dark:text-teal-400 uppercase font-bold">
                    Username
                  </th>
                  <th className="px-4 py-2 text-left dark:text-teal-400 uppercase">
                    Nombre
                  </th>
                  <th className="px-4 py-2 text-left dark:text-teal-400 uppercase">
                    Apellido
                  </th>
                  <th className="px-4 py-2 text-left dark:text-teal-400 uppercase">
                    Paralelo
                  </th>
                  <th className="px-4 py-2 text-left dark:text-teal-400 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-2 text-center dark:text-teal-400 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="dark:bg-gray-900/60  dark:text-white text-black divide-y divide-teal-400/20">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="dark:hover:bg-gray-800/50 hover:bg-white/50 transition"
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      {student.username}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {student.first_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {student.last_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {student.paralelo}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {student.email}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right flex gap-2 justify-center">
                      <button
                        onClick={() => setEditingStudent(student)}
                        className="flex items-center gap-1 px-3 py-1 bg-teal-500 text-white rounded-xl hover:bg-teal-400 transition"
                      >
                        <Edit3 size={16} /> Editar
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDelete({ open: true, id: student.id })
                        }
                        className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-xl hover:bg-red-400 transition"
                      >
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-4 text-center text-white"
                    >
                      No hay estudiantes en este paralelo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Modal de éxito */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <motion.div
            className="bg-green-500 rounded-2xl p-6 max-w-sm w-full text-center shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">
              ¡Operación exitosa!
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

      {/* Modal de confirmación de eliminación */}
      {confirmDelete.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <motion.div
            className="bg-red-500 rounded-2xl p-6 max-w-sm w-full text-center shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">
              ¿Eliminar este estudiante?
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
