import React, { memo, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getUsers } from "../api/api_user";

export const TestHeader = memo(({ title, description }) => {
  const [name, setName] = useState();
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    async function val() {
      const username = localStorage.getItem("username");
      const users = await getUsers();
      const nameUser = users.data.find(
        (u) => u.username === username
      )?.first_name;
      setName(nameUser);
    }

    val();
  }, []);

  return (
    <motion.div
      className="text-center mb-5 bg-gradient-to-b dark:from-black/50 dark:to-gray-900/50 from-[#053F5C] to-[#053F5C]  rounded-3xl p-6 shadow-2xl backdrop-blur-md border border-teal-400/30"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-3xl md:text-5xl font-bold dark:text-teal-400 mb-4 drop-shadow-lg text-white">
        Hola {name}
      </h1>
      <h2 className="text-2xl md:text-4xl font-bold dark:text-white mb-2 text-ehite">
        {title}
      </h2>
      <p className="dark:text-gray-200 text-base md:text-xl text-white">{description}</p>
    </motion.div>
  );
});
