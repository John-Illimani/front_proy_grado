import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { motion } from "framer-motion";
import { getUsers, addUser, updateUser, deleteUser } from "../../../api/api_user";
import { Users, Settings, Trash2, Edit3, X } from "lucide-react";

export const TeacherCRUD = () => {
  const [teachers, setTeachers] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetchTeachers = async () => {
    try {
      const res = await getUsers();
      const docentes = res.data.filter((u) => u.rol === "docente");
      setTeachers(docentes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const initialValues = editingTeacher
    ? {
        first_name: editingTeacher.first_name,
        last_name: editingTeacher.last_name,
        password: "",
      }
    : { first_name: "", last_name: "", password: "" };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      let payload = { ...values };

      if (editingTeacher) {
        if (!payload.password) delete payload.password;
      } else {
        delete payload.password;
        payload.rol = "docente";
      }

      if (editingTeacher) {
        await updateUser(editingTeacher.id, payload);
      } else {
        await addUser(payload);
      }

      await fetchTeachers();
      resetForm();
      setEditingTeacher(null);
      setShowModal(true);
      setShowPassword(false);
    } catch (err) {
      console.error("Error al crear/editar docente:", err.response?.data || err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      fetchTeachers();
      setConfirmDelete({ open: false, id: null });
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => {
    setEditingTeacher(null);
    setShowPassword(false);
  };

  return (
    <div className="relative z-10 flex-1 overflow-y-auto h-[95vh] scrollbar-hide ">
      {/* Header */}
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold dark:text-teal-400 mb-2 drop-shadow-lg">
          Gestión de Docentes
        </h1>
        <p className="text-lg md:text-xl text-black dark:text-white/80 max-w-2xl mx-auto">
          Administra tu lista de docentes de manera eficiente y segura.
        </p>
      </motion.div>

      {/* Formulario */}
      <motion.div
        className="mb-8 bg-gradient-to-br dark:from-gray-800/30 dark:to-black/50 from-white/50 to-white/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-teal-400/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <Formik initialValues={initialValues} enableReinitialize onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form className="flex flex-wrap justify-center md:justify-start gap-4 items-center dark:text-white text-gray-700">
              <Field
                name="first_name"
                placeholder="Nombre"
                className="min-w-[250px] w-full flex-1 px-4 py-2 rounded-lg border border-teal-400/50 bg-white/70 dark:bg-gray-900 focus:ring-2 focus:ring-teal-400 focus:outline-none"
              />
              <Field
                name="last_name"
                placeholder="Apellido"
                className="min-w-[250px] w-full flex-1 px-4 py-2 rounded-lg border border-teal-400/50 bg-white/70 dark:bg-gray-900 focus:ring-2 focus:ring-teal-400 focus:outline-none"
              />
              {editingTeacher && (
                <div className="flex-1 relative">
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nueva contraseña"
                    className="w-full min-w-[150px] px-4 py-2 rounded-lg border border-yellow-400/50 bg-white/70 dark:bg-gray-900 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/80 hover:text-yellow-400 transition"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-teal-500 text-white font-semibold hover:bg-teal-400 transition"
                >
                  {editingTeacher
                    ? isSubmitting
                      ? "Actualizando..."
                      : "Actualizar"
                    : isSubmitting
                    ? "Registrando..."
                    : "Registrar"}
                </button>
                {editingTeacher && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-5 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </motion.div>

      {/* Modal de éxito */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-green-500 rounded-2xl p-6 max-w-sm w-full text-center shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">¡Operación exitosa!</h2>
            <button
              onClick={() => setShowModal(false)}
              className="px-5 py-2 bg-white text-green-700 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {confirmDelete.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <motion.div
            className="bg-red-500 rounded-2xl p-6 max-w-sm w-full text-center shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">
              ¿Eliminar este docente?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="px-5 py-2 bg-white text-red-700 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmDelete({ open: false, id: null })}
                className="px-5 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition flex items-center gap-1"
              >
                <X size={16} /> Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Lista de docentes */}
      <motion.div
        className="bg-gradient-to-br dark:from-gray-800/30 dark:to-black/50 from-white/50 to-white/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm border border-teal-400/20 overflow-x-auto overflow-y-auto scrollbar-hide "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <table className="min-w-full divide-y divide-teal-400/20">
          <thead className="dark:bg-gray-900/50 bg-gray-300">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-teal-400 uppercase">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-teal-400 uppercase">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-teal-400 uppercase">
                Apellido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-teal-400 uppercase">
                Contraseña
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-black dark:text-teal-400 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="dark:bg-gray-900/60 bg-gray-200 dark:text-white text-gray-700 divide-y divide-teal-400/20">
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="dark:hover:bg-gray-800/50 hover:bg-white/50 transition">
                <td className="px-6 py-4 whitespace-nowrap">{teacher.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{teacher.first_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{teacher.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">********</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                  <button
                    onClick={() => setEditingTeacher(teacher)}
                    className="flex items-center gap-1 px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-400 transition"
                  >
                    <Edit3 size={16} /> Editar
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ open: true, id: teacher.id })}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-400 transition"
                  >
                    <Trash2 size={16} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};
