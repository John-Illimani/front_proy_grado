import React, { useState } from "react";
import { Link, Outlet, replace, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Settings,
  ClipboardList,
  Gamepad2,
  ChevronDown,
  ArrowRight,
  Target,
  Brain,
  BarChart3,
  Heart,
  Users,
  BookOpen,
  GraduationCap,
  LogOut,
  ChevronDownIcon,
  PanelLeftDashedIcon,
  PanelRightIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react";

import {
  FaBook,
  FaCalculator,
  FaShapes,
  FaCog,
  FaVectorSquare,
  FaPenFancy,
  FaStopwatch,
  FaHourglassHalf,
} from "react-icons/fa";
import { ThemeSwitcher } from "../../themeSwitcher";

export const HomeOrientacion = () => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [openAptitudes, setOpenAptitudes] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const tests = [
    {
      label: "Test CHASIDE",
      link: "/homeMarcelo/test_chaside",
      icon: <ClipboardList size={18} />,
    },
    {
      label: "Test de Aptitudes Diferenciales",
      link: "/homeMarcelo/test_aptitudes",
      icon: <ClipboardList size={18} />,
    },
    {
      label: "Test Colmil",
      link: "/homeMarcelo/test_colmil",
      icon: <ClipboardList size={18} />,
    },

    {
      label: "Test de Personalidad (16 Factores)",
      link: "/homeMarcelo/test_personalidad",
      icon: <ClipboardList size={18} />,
    },
  ];

  const aptitudesSections = [
    {
      label: "Razonamiento Verbal",
      link: "/verbal_reasoning",
      icon: <FaBook size={18} />,
    },
    {
      label: "Razonamiento Númerico",
      link: "/numeric_reasoning",
      icon: <FaCalculator size={18} />,
    },
    {
      label: "Razonamiento Abstracto",
      link: "/abstract_reasoning",
      icon: <FaShapes size={18} />,
    },

    {
      label: "Razonamiento Mecánico",
      link: "/mechanical_reasoning",
      icon: <FaCog size={18} />,
    },
    {
      label: "Relaciones Espaciales",
      link: "/spatial_relations",
      icon: <FaVectorSquare size={18} />,
    },
    {
      label: "Ortografía",
      link: "/orthography",
      icon: <FaPenFancy size={18} />,
    },

    {
      label: "Rapidez y Exactitud Perceptiva Parte I",
      link: "/perceptive_speed_1",
      icon: <FaStopwatch size={18} />,
    },
    {
      label: "Rapidez y Exactitud Perceptiva Parte II",
      link: "/perceptive_speed_2",
      icon: <FaHourglassHalf size={18} />,
    },
  ];
  const material = [
    {
      label: "Material",
      link: "/homeMarcelo/material",
      icon: <FileText size={18} />,
    },
  ];

  const extras = [
    {
      label: "Reporte Vocacional",
      link: "/homeMarcelo/vocational_report",
      icon: <FileText size={18} />,
    },
    // {
    //   label: "Información de Carreras",
    //   link: "/homeMarcelo/career_information",
    //   icon: <FileText size={18} />,
    // },
  ];

  const navigate2 = useNavigate();
  const logOutEstudents = () => {
    // para limpiar los datos del local storage
    localStorage.removeItem("access");
    localStorage.removeItem("username");
    localStorage.removeItem("rol");
    localStorage.removeItem("refresh");

    navigate2("/");
  };

  const logOutButton = [
    {
      label: "Cerrar Secion",
      action: logOutEstudents,
      icon: <LogOut size={18} />,
    },
  ];

  localStorage.getItem("colors");

  return (
    <div className="relative min-h-screen h-screen flex text-white overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        className={`
          absolute md:relative z-20 bg-gradient-to-b dark:from-gray-900 dark:to-black from-slate-200 to-slate-100  backdrop-blur-lg border-r border-teal-500/30 flex flex-col shadow-2xl
          text-gray-500 dark:text-gray-400
          max-h-screen h-full
          ${isSidebarOpen ? "w-72" : "w-0"}
        transition-[width] duration-300`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.1 }}
      >
        <button
          onClick={toggleSidebar}
          className="text-white/90 cursor-pointer absolute top-2 -right-1 shadow-sm rounded-full p-2 bg-teal-500/90 translate-x-full"
        >
          <PanelRightIcon className="size-5" />
        </button>
        <div
          className={`overflow-hidden h-full flex flex-col justify-between  ${isSidebarOpen ? "opacity-100" : "opacity-0"} transition`}
        >
          {/* Logo y Unidad */}
          <div>
            <div className="flex flex-col items-center gap-1 mb-5 mt-5">
              <motion.img
                src="/logo.png"
                alt="LOGO MARCELO QUIROGA SANTA CRUZ"
                className="w-32 rounded-xl shadow-lg"
              />
              <h2
                className=" md:text-lg  dark:text-teal-400 text-center  text-black font-bold "
                // style={{
                //   fontFamily: "var(--font-family)",
                //   fontSize: "var(--font-size)",
                //   color: "var(--color-accent)",
                // }}
              >
                Unidad Educativa <br /> Marcelo Quiroga Santa Cruz
              </h2>
            </div>
          </div>
          {/* Opciones */}
          <div className="mt-8 border-b border-t border-gray-700 py-3 flex flex-col gap-1 h-screen overflow-y-auto scrollbar-hide ">
            {/* Tests */}
            <nav className="flex flex-col gap-1 text-black font-bold">
              <h3 className="text-black text-sm font-bold mb-2 px-2 uppercase tracking-wide dark:text-white ">
                Tests disponibles
              </h3>
              {tests.map((item, idx) =>
                item.label === "Test de Aptitudes Diferenciales" ? (
                  <div key={idx}>
                    {/* Botón padre */}
                    <button
                      onClick={() => setOpenAptitudes(!openAptitudes)}
                      className=" flex items-center justify-between gap-3 px-3 py-2 w-full text-left rounded-lg dark:text-gray-300 text-black font-bold hover:text-white dark:hover:text-black hover:bg-lime-400  transition-all"
                    >
                      <span className="flex items-center gap-2 dark:text-white text-black dark:hover:text-black">
                        {item.icon} {item.label}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          openAptitudes ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Subopciones */}
                    <AnimatePresence>
                      {openAptitudes && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="ml-6 mt-2 flex flex-col gap-1"
                        >
                          {aptitudesSections.map((sub, sidx) => (
                            <Link
                              key={sidx}
                              to={`/homeMarcelo/test_aptitudes${sub.link}`}
                              className="flex items-center gap-2 px-3 py-1 text-black dark:text-gray-300 hover:text-black  text-sm dark:hover:text-black hover:bg-lime-300 rounded-lg transition-all"
                            >
                              {sub.icon} {sub.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  // Tests normales
                  <Link
                    key={idx}
                    to={item.link}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-black hover:bg-lime-400 transition-all "
                  >
                    {item.icon} {item.label}
                  </Link>
                ),
              )}
            </nav>

            <div className="border-t border-gray-700 my-4 ">
              <h3 className="text-sm uppercase mb-1 px-2 tracking-wide mt-6 dark:text-white text-black font-bold">
                Material Recomendado
              </h3>
            </div>

            {/* Resto de opciones */}
            {material.map((item, idx) => (
              <Link
                key={idx}
                to={item.link}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-black font-bold dark:text-gray-300 dark:hover:text-black hover:bg-lime-400 transition-all"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            <div className="border-t border-gray-700 my-4 ">
              <h3 className="text-sm uppercase mb-1 px-2 tracking-wide mt-6 dark:text-white text-black font-bold">
                Reporte
              </h3>
            </div>

            {/* Resto de opciones */}
            {extras.map((item, idx) => (
              <Link
                key={idx}
                to={item.link}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-black font-bold dark:text-gray-300  hover:bg-lime-400 dark:hover:text-black transition-all"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {logOutButton.map((btn, index) => (
            <button
              key={index}
              onClick={btn.action}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-black font-bold dark:text-gray-300  hover:bg-red-600 transition-all"
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>
      </motion.aside>

      <main className="relative flex-1 overflow-y-auto">
        <ThemeSwitcher />
        <Outlet />
      </main>
    </div>
  );
};
