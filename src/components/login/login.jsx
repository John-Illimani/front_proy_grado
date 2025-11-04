import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { postLogin } from "../../api/api_login";

export const Login = ({
  onLogin = (credentials) => console.log("login:", credentials),
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      // Llamada al backend para login
      const response = await postLogin({ username, password });

      const { access, refresh, rol, username: backendUsername } = response.data;

      // Guardar en localStorage
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("rol", rol);
      localStorage.setItem("username", username);

      // Enviar token al endpoint /homeMarcelo si es estudiante
      if (rol === "estudiante") {
        navigate("/homeMarcelo");
      } else if (rol === "docente") {
        navigate("/upload_grades");
      } else if (rol === "admin") {
        navigate("/admin");
      }

      // Opcional: callback externo
      onLogin({ access, refresh, rol, username });
    } catch (err) {
      console.error("Error en login:", err);
      setError("Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 120 },
    },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02, boxShadow: "0 10px 25px rgba(79, 70, 229, 0.3)" },
    tap: { scale: 0.98 },
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-6 bg-[url('/fondo_login.jpg')] bg-cover bg-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, -20, 0], opacity: [0, 0.3, 0] }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        className="w-full max-w-3xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="p-8 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="mb-8 text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h3
              className="text-4xl font-extrabold text-white mb-2"
              variants={itemVariants}
            >
              Inicio de Sesión
            </motion.h3>
            <motion.p
              className="text-xl text-white/70 font-extrabold"
              variants={itemVariants}
            >
              Accede con tu cuenta institucional
            </motion.p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {error && (
              <motion.div
                className="text-sm text-rose-300 bg-rose-900/20 p-3 rounded-md border border-rose-700/30"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            <motion.label className="block" variants={itemVariants}>
              <span className="text-xl font-extrabold text-white/80 mb-2 block">
                Usuario
              </span>
              <motion.input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Jorge Daniel Mayta Cori 🡆 jmayta"
                className="mt-2 w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 transition-all duration-300"
                required
                whileFocus={{ scale: 1.01 }}
              />
            </motion.label>

            <motion.label className="block relative" variants={itemVariants}>
              <span className="text-xl font-extrabold text-white/80 mb-2 block">
                Contraseña
              </span>
              <motion.input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="jorge_mayta"
                className="mt-2 w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 transition-all duration-300 pr-14"
                required
                whileFocus={{ scale: 1.01 }}
              />
              <motion.button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-[3.2rem] px-3 py-1 rounded-md text-xs bg-white/10 text-white/80 hover:bg-white/20 transition font-extrabold"
                aria-label="Mostrar contraseña"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showPass ? "Ocultar" : "Mostrar"}
              </motion.button>
            </motion.label>

           

            <motion.button
              type="submit"
              className="mt-2 w-full px-4 py-3 rounded-lg text-white font-semibold disabled:opacity-60 flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-emerald-500 shadow-lg relative overflow-hidden"
              disabled={loading}
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              {loading && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-emerald-600"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </motion.svg>
                ) : (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    🔐
                  </motion.span>
                )}
                {loading ? "Iniciando..." : "Ingresar"}
              </span>
            </motion.button>
          </motion.form>

          <motion.footer
            className="mt-8 text-xl text-white/50 text-center border-t border-white/10 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Unidad Educativa Marcelo Quiroga — Sistema de Orientación Vocacional
          </motion.footer>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
