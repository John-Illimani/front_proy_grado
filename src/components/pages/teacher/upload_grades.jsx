import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiBook,
  FiBarChart2,
  FiAlertCircle,
  FiLogOut,
} from "react-icons/fi";
import { ChevronLeftIcon } from "lucide-react";
import { ThemeSwitcher } from "../../themeSwitcher";

export const TeacherGrades = () => {
  const navigate = useNavigate();
  const [isSidebarOpen,setIsSidebarOpen]= useState(true)
  const logOut = () => {
    localStorage.clear();
    navigate("/");
  };


   const OnToggleSidebar = () =>{    
    setIsSidebarOpen((status)=>!status)
  }

  const menuItems = [
    {
      id: "RegistrodeEstudiantes",
      label: "Registro de Estudiantes",
      icon: FiUsers,
      link: "/upload_grades/upload_students",
    },
    {
      id: "Notas",
      label: "Cargar Notas",
      icon: FiBook,
      link: "/upload_grades/grades",
    },
   
    {
      id: "Observaciones",
      label: "Observaciones y Recomendaciones",
      icon: FiBook,
      link: "/upload_grades/observations",
    },
    {
      id: "Reportes",
      label: "Reportes Generales",
      icon: FiAlertCircle,
      link: "/upload_grades/general_report",
    },
  ];

  return (
    <div className="relative min-h-screen h-screen flex font-sans bg-gray-100 dark:bg-black/90bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        className={`absolute md:relative z-20 bg-gradient-to-b flex flex-col shadow-2xl h-screen
          dark:from-gray-900 dark:to-black from-slate-200 to-slate-100 dark:text-gray-300 text-gray-700
            ${isSidebarOpen ? "w-72" : "w-10 md:w-12"} transition-[width] duration-500 ease-in-out
        `}
        initial={{ x: -100, opacity: 0 }}        
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
         <div className="flex flex-col items-center mb-8">
           <motion.img
             src="/logo.png"
             alt="Logo"
             className="min-w-10 w-36 rounded-xl shadow-lg mb-2 m-2"
           />
           <h2 className={`text-center text-teal-400 font-semibold text-lg ${!isSidebarOpen ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}> 
             Panel Docente
           </h2>
         </div>

         <button 
          className={`absolute right-0 px-0.5 py-4 translate-x-full text-white/90 shadow-sm bg-teal-400/50 rounded-full 
            `}
          onClick={OnToggleSidebar}
        >
          <ChevronLeftIcon className={`size-5 ${isSidebarOpen ?"rotate-0":"rotate-180"} transition`} />
        </button>

        <nav className="flex flex-col gap-2 h-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.link}
              className={({isActive})=>                
                `flex items-center gap-2 px-3 py-2 w-full rounded-lg  hover:text-teal-400 hover:bg-white/5 transition-all
                ${isActive ? "!bg-teal-700 text-white font-bold":""}
                `
              } 
            >
              <item.icon className="min-w-5 size-5"/>
              <p
                className={`${
                  !isSidebarOpen ? "opacity-0 hidden " : "opacity-100"
                } transition-opacity duration-300`}
              >
                {item.label}
              </p>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-gray-700 pt-4">
          <button
            onClick={logOut}
            className="w-full flex justify-center items-center gap-2 px-3 py-2 rounded-lg hover:text-red-400 hover:bg-red-400/20 transition-all"
          >
            <FiLogOut className="min-w-5 size-5" /> 
            <p
              className={`${
                !isSidebarOpen ? "opacity-0 hidden" : "opacity-100"
              } transition-opacity duration-300`}
            >
              Cerrar Sesión
            </p>  
          </button>
        </div>
      </motion.aside>

 

      <main className="relative flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br dark:from-gray-900 dark:to-black from-gray-200 to-gray-100 p-2 sm:p-4 md:p-6">
        <motion.div
          className="pl-10 md:pl-0 pt-3 sm:pt-4 md:pt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Aquí renderizamos las rutas hijas con Outlet */}
          <ThemeSwitcher />
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};
