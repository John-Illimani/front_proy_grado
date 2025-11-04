import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Laptop,
  Palette,
  Type,
  Text,
  Contrast,
  Eye,
  EyeOff,
  Grid,
  Columns,
  Layout,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const SettingEstudents = () => {
  const [theme, setTheme] = useState("light");
  const [color, setColor] = useState("indigo");
  const [font, setFont] = useState("sans");
  const [fontSize, setFontSize] = useState("base");
  const [contrast, setContrast] = useState("normal");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [textSpacing, setTextSpacing] = useState("normal");
  const [layout, setLayout] = useState("standard");
  const [showPreview, setShowPreview] = useState(false);
  const [presetThemes] = useState([
    {
      id: "default",
      name: "Por defecto",
      colors: { primary: "indigo", bg: "gray" },
    },
    { id: "ocean", name: "Océano", colors: { primary: "blue", bg: "cyan" } },
    {
      id: "forest",
      name: "Bosque",
      colors: { primary: "green", bg: "emerald" },
    },
    {
      id: "sunset",
      name: "Atardecer",
      colors: { primary: "orange", bg: "red" },
    },
    {
      id: "midnight",
      name: "Medianoche",
      colors: { primary: "purple", bg: "blue" },
    },
  ]);

  const [activePreset, setActivePreset] = useState("default");
  useEffect(() => {
    if (localStorage.getItem("colores")) {
      const values = JSON.parse(localStorage.getItem("colores"));

      setColor(values.color);
      setActivePreset(values.activePreset);
      setTheme(values.theme);
      setFont(values.font);
      setFontSize(values.fontSize);
      setContrast(values.contrast);
      setReducedMotion(values.reducedMotion === "true");
      setTextSpacing(values.textSpacing);
      setLayout(values.layout);
      console.log("el color es: ", color);
    }
  }, []);

  console.log(color);
  console.log(activePreset);

  const colors = {
    indigo: "#6366f1",
    blue: "#3b82f6",
    green: "#10b981",
    red: "#ef4444",
    purple: "#8b5cf6",
    yellow: "#facc15",
    pink: "#ec4899",
    teal: "#14b8a6",
    orange: "#f97316",
    cyan: "#06b6d4",
    emerald: "#059669",
    gray: "#6b7280",
  };

  const fonts = [
    { id: "sans", label: "Sans Serif" },
    { id: "serif", label: "Serif" },
    { id: "mono", label: "Monoespaciada" },
  ];

  const sizes = [
    { id: "sm", label: "Pequeña", value: "0.875rem" },
    { id: "base", label: "Normal", value: "1rem" },
    { id: "lg", label: "Grande", value: "1.125rem" },
    { id: "xl", label: "Extra Grande", value: "1.25rem" },
  ];

  const layouts = [
    { id: "standard", label: "Estándar", icon: <Layout className="w-4 h-4" /> },
    { id: "compact", label: "Compacto", icon: <Grid className="w-4 h-4" /> },
    {
      id: "spacious",
      label: "Espacioso",
      icon: <Columns className="w-4 h-4" />,
    },
  ];

  // 🔥 Aplicar cambios globalmente a toda la página
  useEffect(() => {
    const root = document.documentElement;

    // Tema
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Contraste
    if (contrast === "high") root.classList.add("high-contrast");
    else root.classList.remove("high-contrast");

    // Espaciado de texto
    if (textSpacing === "increased") root.classList.add("increased-spacing");
    else root.classList.remove("increased-spacing");

    // Movimiento
    if (reducedMotion) root.classList.add("reduced-motion");
    else root.classList.remove("reduced-motion");

    // Layout
    root.setAttribute("data-layout", layout);

    // Variables CSS globales
    root.style.setProperty("--color-accent", colors[color]);
    root.style.setProperty(
      "--font-family",
      font === "serif" ? "serif" : font === "mono" ? "monospace" : "sans-serif"
    );
    const selectedSize = sizes.find((s) => s.id === fontSize)?.value || "1rem";
    root.style.setProperty("--font-size", selectedSize);

    console.log("el color del bernardo es: ", color);
  }, [
    theme,
    color,
    font,
    fontSize,
    contrast,
    reducedMotion,
    textSpacing,
    layout,
  ]);

  const applyPreset = (presetId) => {
    const preset = presetThemes.find((p) => p.id === presetId);
    if (preset) {
      setColor(preset.colors.primary);
      setActivePreset(presetId);
      const themesColors = {
        color: preset.colors.primary,
        activePreset: presetId,
        theme: theme,
        font: font,
        fontSize: fontSize,
        contrast: contrast,
        reducedMotion: reducedMotion,
        textSpacing: textSpacing,
        layout: layout,
      };

      localStorage.setItem("colores", JSON.stringify(themesColors));
    }
  };

  const resetSettings = () => {
    setTheme("light");
    setColor("indigo");
    setFont("sans");
    setFontSize("base");
    setContrast("normal");
    setReducedMotion(false);
    setTextSpacing("normal");
    setLayout("standard");
    setActivePreset("default");
  };


  return (
    <div
      className="relative z-10 h-full p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
      style={{
        fontFamily: "var(--font-family)",
        fontSize: "var(--font-size)",
        color: "var(--color-accent)",
      }}
    >      
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Configuración de Apariencia</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
            >
              {showPreview ? (
                <EyeOff className="w-4 h-4 inline" />
              ) : (
                <Eye className="w-4 h-4 inline" />
              )}
              {showPreview ? " Ocultar Vista Previa" : " Mostrar Vista Previa"}
            </button>
            <button
              onClick={resetSettings}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4 inline" /> Restablecer
            </button>
          </div>
        </div>

        {/* VISTA PREVIA */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 rounded-2xl shadow-lg bg-white dark:bg-gray-800"
            >
              <h3 className="font-bold mb-2">Vista Previa</h3>
              <p className="mb-3">
                Texto de ejemplo para ver los cambios en colores, tipografía y
                tamaño de letra.
              </p>
              <button
                className="px-4 py-2 rounded text-white"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                Botón de Ejemplo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OPCIONES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* TEMAS */}
          <div className="p-6 rounded-2xl shadow bg-white dark:bg-gray-800">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" /> Temas Predefinidos
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {presetThemes.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`p-3 rounded border-2 flex flex-col items-center ${
                    activePreset === preset.id
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors[preset.colors.primary] }}
                    ></div>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors[preset.colors.bg] }}
                    ></div>
                  </div>
                  <span className="text-sm">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* COLOR PRINCIPAL */}
          <div className="p-6 rounded-2xl shadow bg-white dark:bg-gray-800">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" /> Color Principal
            </h2>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(colors).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setActivePreset("custom");
                  }}
                  style={{ backgroundColor: colors[c] }}
                  className={`w-10 h-10 rounded-full border-2 ${
                    color === c
                      ? "border-black dark:border-white scale-110"
                      : "border-transparent"
                  }`}
                ></button>
              ))}
            </div>
          </div>

          {/* TIPOGRAFÍA */}
          <div className="p-6 rounded-2xl shadow bg-white dark:bg-gray-800">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Type className="w-5 h-5" /> Tipografía
            </h2>
            <div className="flex flex-col gap-2">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFont(f.id)}
                  className={`px-3 py-2 rounded ${
                    font === f.id
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  }`}
                  style={{
                    fontFamily:
                      f.id === "serif"
                        ? "serif"
                        : f.id === "mono"
                        ? "monospace"
                        : "sans-serif",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* TAMAÑO DE FUENTE */}
          <div className="p-6 rounded-2xl shadow bg-white dark:bg-gray-800">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Text className="w-5 h-5" /> Tamaño de Fuente
            </h2>
            <div className="flex flex-col gap-2">
              {sizes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFontSize(s.id)}
                  className={`px-3 py-2 rounded ${
                    fontSize === s.id
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  }`}
                  style={{ fontSize: s.value }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
