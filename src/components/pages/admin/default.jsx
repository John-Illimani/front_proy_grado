import React from "react";
import { motion } from "framer-motion";

export const AdminWelcome = () => {
  return (
    <div className="flex items-center justify-center   h-[95vh] font-sans">
      <motion.div
        className="bg-lime-200 dark:bg-gray-950/60 backdrop-blur-lg p-12 rounded-2xl shadow-2xl border  dark:border-cyan-700  w-full max-w-xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-extrabold dark:text-cyan-400 mb-4">
          👋 Bienvenido al Panel de Administrador
        </h1>
        <p className="dark:text-cyan-100 text-lg">
          Aquí puedes gestionar administradores y profesores.
        </p>
        <p className="mt-4 dark:text-cyan-200">
          Selecciona una opción del menú para comenzar 🚀
        </p>
      </motion.div>
    </div>
  );
};
