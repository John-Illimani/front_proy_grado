import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaBook, FaCalculator, FaShapes, FaCog, FaVectorSquare, FaPenFancy, FaStopwatch, FaHourglassHalf } from "react-icons/fa";

export const AptitudesHome = ({ nombre = "JOHN" }) => {
  const sections = [
    {
      title: "PARTE 1",
      items: [
        { name: "RAZONAMIENTO VERBAL", path: "/verbal_reasoning", icon: <FaBook size={24} /> },
        { name: "RAZONAMIENTO NUMÉRICO", path: "/numeric_reasoning", icon: <FaCalculator size={24} /> },
        { name: "RAZONAMIENTO ABSTRACTO", path: "/abstract_reasoning", icon: <FaShapes size={24} /> },
      ],
    },
    {
      title: "PARTE 2",
      items: [
        { name: "RAZONAMIENTO MECÁNICO", path: "/mechanical_reasoning", icon: <FaCog size={24} /> },
        { name: "RELACIONES ESPACIALES", path: "/spatial_relations", icon: <FaVectorSquare size={24} /> },
        { name: "ORTOGRAFÍA", path: "/orthography", icon: <FaPenFancy size={24} /> },
      ],
    },
    {
      title: "PARTE 3",
      items: [
        { name: "RAPIDEZ Y EXACTITUD PERCEPTIVA PARTE I", path: "/perceptive_speed_1", icon: <FaStopwatch size={24} /> },
        { name: "RAPIDEZ Y EXACTITUD PERCEPTIVA PARTE II", path: "/perceptive_speed_2", icon: <FaHourglassHalf size={24} /> },
      ],
    },
  ];

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 px-8 py-12">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">Hola {nombre}</h1>
      <p className="text-gray-300 text-lg md:text-xl mb-10 text-center">
        Descubre tus fortalezas y potencia tus aptitudes
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {sections.map((section, idx) =>
          section.items.map((item, i) => (
            <motion.div
              key={`${idx}-${i}`}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,255,255,0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
            >
              <Link
                to={item.path}
                className="text-white font-semibold text-center flex flex-col items-center gap-2"
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
