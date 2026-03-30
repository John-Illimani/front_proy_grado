import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {  FiUserPlus, FiLogOut, FiFileText, FiBook } from "react-icons/fi";
import { ThemeSwitcher } from "../../themeSwitcher";
import { ArrowRightIcon, BuildingIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";


export const AdminPanel = () => {
  // Datos de ejemplo
  const [profesores, setProfesores] = useState([
    { id: 1, nombre: "Juan", apellido: "Perez", email: "jperez@colegio.edu" },
    { id: 2, nombre: "Ana", apellido: "Lopez", email: "alopez@colegio.edu" },
  ]);

  const [formProfesor, setFormProfesor] = useState({ nombre: "", apellido: "", email: "" });
  const [nuevoAdmin, setNuevoAdmin] = useState({ username: "", email: "", password: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleInputProfesor = (e) => {
    setFormProfesor({ ...formProfesor, [e.target.name]: e.target.value });
  };

  const handleAgregarProfesor = () => {
    if (!formProfesor.nombre || !formProfesor.apellido || !formProfesor.email) return;
    const nuevo = { id: Date.now(), ...formProfesor };
    setProfesores([...profesores, nuevo]);
    setFormProfesor({ nombre: "", apellido: "", email: "" });
  };

  const handleEliminarProfesor = (id) => {
    setProfesores(profesores.filter((p) => p.id !== id));
  };

  const handleAgregarAdmin = () => {
    console.log("Crear nuevo admin:", nuevoAdmin);
    setNuevoAdmin({ username: "", email: "", password: "" });
  };
  const navigate  =  useNavigate()
  const logOut = () => {
    localStorage.clear();
    navigate('/')
    // Redirigir al login si usas react-router
  };

  // Menú principal con links directos
  const menuItems = [
    {
      id: "nuevoAdmin",
      label: "Administradores",
      icon: FiUserPlus,
      link: "/admin/add-admin",
    },
    {
      id: "crudProfesores",
      label: "Profesores",
      icon: FiUserPlus,
      link: "/admin/add-teacher",
    },
    {
      id: "materias",
      label: "Materias y Paralelos",
      icon: FiBook,
      link: "/admin/add-courses",
    },
     {
      id: "reporteGeneral",
      label: "Reportes",
      icon: FiFileText,
      link: "/admin/report",
    },
  ];

  const OnToggleSidebar = () =>{    
    setIsSidebarOpen((status)=>!status)
  }

  return (
    <div className="relative min-h-screen h-screen flex font-sans bg-gray-100 dark:bg-black/90 overflow-hidden">
      
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
          <h2 className={`text-center dark:text-teal-400 text-black font-semibold text-lg ${!isSidebarOpen ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}> 
            Panel de Administración
          </h2>
        </div>
        <button 
          className={`absolute right-0 px-0.5 py-4 translate-x-full text-white/90 shadow-sm bg-teal-400/50 rounded-full 
            `}
          onClick={OnToggleSidebar}
        >
          <ChevronLeftIcon className={`size-5 ${isSidebarOpen ?"rotate-0":"rotate-180"} transition`} />
        </button>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.link}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 w-full rounded-lg transition-all text-black dark:text-white hover:bg-red-500 font-bold
                ${isActive
                  ? "dark:text-teal-400 text-white bg-red-700 "
                  : "hover:text-white "}
                `
              }
            >
              <item.icon className="min-w-5 size-5" />
              <p
                className={`${
                  !isSidebarOpen ? "opacity-0 hidden" : "opacity-100"
                } transition-opacity duration-300`}
              >
                {item.label}
              </p>
            </NavLink>
          ))}
        </nav>

        <div className="flex mt-auto border-t border-gray-700 pt-4">
          <button
            onClick={logOut}
            className="w-full flex justify-center items-center gap-2 px-3 py-2 rounded-lg  hover:text-red-400 hover:bg-red-300 dark:hover:bg-orange-900 transition-all"
          >
            <FiLogOut className="min-w-5 size-5" /> 
            <p
              className={`${
                !isSidebarOpen ? "opacity-0 hidden  " : "opacity-100 " 
              } transition-opacity duration-400 dark:text-white  text-black font-bold `}
            >
              Cerrar Sesión
            </p>            
          </button>
        </div>
      </motion.aside>

      
      <main className="relative flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br dark:from-gray-900 dark:to-black  from-orange-100 sm:p-4 md:px-6">
        <motion.div
          className="pl-10 md:pl-0 pt-3 sm:pt-4 md:pt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ThemeSwitcher />
          
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};
