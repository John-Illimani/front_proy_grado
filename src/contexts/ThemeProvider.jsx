import { ThemeContext } from "./ThemeContext";
import { useState, useEffect } from "react";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const html = document.documentElement;

    if (savedTheme) {
      setTheme(savedTheme);
      html.setAttribute("class", savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const defaultTheme = prefersDark ? "dark" : "light";
      setTheme(defaultTheme);
      html.setAttribute("class", defaultTheme);
    }
  }, []);

  const switchTheme = () => {
    const html = document.documentElement;
    const newTheme = theme === "dark" ? "light" : "dark";
    html.setAttribute("class", newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
