import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import * as cheerio from "cheerio";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  ExternalLink,
  ImageOff,
  SunMedium,
  MoonStar,
  University,
} from "lucide-react";
import { getStudentId } from "./studentId";
import { getMajors } from "../../../api/api_majors";

// 🏫 Logos (puedes colocar imágenes en /public/logos/)
const LOGOS = {
  utb: "/logos/utb.png",
  ucb: "/logos/ucb.png",
  umsa: "/logos/umsa.png",
  unipol: "/logos/unipol.png",
  upds: "/logos/upds.png",
  unifranz: "/logos/unifranz.png",
  umss: "/logos/umss.png",
  uagrm: "/logos/uagrm.png",
  upea: "/logos/upea.png",
};

// 📚 Universidades y fuentes oficiales
const FUENTES = [
  {
    id: "umsa",
    nombre: "Universidad Mayor de San Andrés (UMSA)",
    url: "https://admision.umsa.bo/",
  },
  {
    id: "ucb",
    nombre: "Universidad Católica Boliviana (UCB)",
    url: "https://www.ucb.edu.bo/convocatorias/",
  },
  {
    id: "utb",
    nombre: "Universidad Tecnológica Boliviana (UTB)",
    url: "https://www.utb.edu.bo/convocatoria/",
  },
  {
    id: "upds",
    nombre: "Universidad Privada Domingo Savio (UPDS)",
    url: "https://www.upds.edu.bo/convocatorias/",
  },
  {
    id: "unifranz",
    nombre: "Universidad Privada Franz Tamayo (UNIFRANZ)",
    url: "https://www.unifranz.edu.bo/convocatorias/",
  },
  {
    id: "unipol",
    nombre: "Universidad Policial (UNIPOL)",
    url: "https://www.unipol.edu.bo/?cat=17",
  },
  {
    id: "umss",
    nombre: "Universidad Mayor de San Simón (UMSS)",
    url: "https://www.umss.edu.bo/convocatorias/",
  },
  {
    id: "uagrm",
    nombre: "Universidad Autónoma Gabriel René Moreno (UAGRM)",
    url: "https://admision.uagrm.edu.bo/",
  },
  {
    id: "upea",
    nombre: "Universidad Pública de El Alto (UPEA)",
    url: "https://www.upea.bo/convocatorias/",
  },
];

// 🔎 Extrae convocatorias relevantes (con requisitos)
function extractConvocatorias(html, baseUrl, carrera) {
  const $ = cheerio.load(html);
  const convocatorias = [];
  const seen = new Set();

  const includeRe =
    /(convocatoria|admisión|admision|postulaci[oó]n|inscripci[oó]n|beca|preinscripci[oó]n|registro|proceso de admisión)/i;
  const excludeRe =
    /(docente|administrativo|rrhh|personal|empleo|requerimiento|contratación|cargo|plantel|profesorado)/i;

  const palabras = (carrera || "").split(/\s+/).filter((w) => w.length > 3);
  const carreraRe =
    palabras.length > 0 ? new RegExp(palabras.join("|"), "i") : null;

  $("article, div, section, a, li, p, h2, h3").each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim().replace(/\s+/g, " ");
    if (!text || text.length < 30) return;

    if (!includeRe.test(text)) return;
    if (excludeRe.test(text)) return;
    if (carreraRe && !carreraRe.test(text)) return;

    let link = $el.attr("href") || $el.find("a[href]").attr("href");
    if (link && !/^https?:\/\//i.test(link)) {
      try {
        link = new URL(link, baseUrl).href;
      } catch {
        link = baseUrl;
      }
    }

    let img =
      $el.find("img").attr("src") ||
      $el.closest("article, .post, .card, .entry").find("img").attr("src");
    if (img && !/^https?:\/\//i.test(img)) {
      try {
        img = new URL(img, baseUrl).href;
      } catch {
        img = null;
      }
    }

    // Busca requisitos
    let requisitos = "";
    const reqMatch = text.match(
      /(requisitos|documentos requeridos|presentar|deberá|necesita|debe contar con)[^]{0,350}/i
    );
    if (reqMatch) requisitos = reqMatch[0].trim() + "...";

    const title = text.slice(0, 120);
    if (seen.has(title)) return;
    seen.add(title);

    convocatorias.push({ title, link, requisitos, img });
  });

  return convocatorias
    .sort((a, b) => {
      const aScore =
        (a.requisitos ? 1 : 0) + (carreraRe?.test(a.title) ? 1 : 0);
      const bScore =
        (b.requisitos ? 1 : 0) + (carreraRe?.test(b.title) ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, 5);
}

export const CareerResources = () => {
  const [theme, setTheme] = useState("dark");
  const [studentId, setStudentId] = useState(null);
  const [carreras, setCarreras] = useState([]);
  const [bloques, setBloques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("cr_theme");
    if (saved) setTheme(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("cr_theme", theme);
  }, [theme]);

  // Obtener ID estudiante
  useEffect(() => {
    (async () => {
      try {
        const id = await getStudentId();
        if (id) setStudentId(id);
        else setError("No se encontró el ID del estudiante.");
      } catch {
        setError("No se pudo obtener el ID del estudiante.");
      }
    })();
  }, []);

  // Obtener carreras
  useEffect(() => {
    if (!studentId) return;
    (async () => {
      try {
        const resp = await getMajors();
        const todos = Array.isArray(resp.data?.results)
          ? resp.data.results
          : Array.isArray(resp.data)
          ? resp.data
          : [];
        const registro = todos.find(
          (c) => c.estudiante == studentId || c.estudiante_id == studentId
        );
        if (!registro) {
          setError("No se encontraron carreras para este estudiante.");
          return;
        }
        const parsed = JSON.parse(String(registro.carreras).replace(/'/g, '"'));
        setCarreras(parsed.map((c) => c.carrera));
      } catch {
        setError("Error al cargar las carreras recomendadas.");
      }
    })();
  }, [studentId]);

  // Buscar convocatorias por carrera
  useEffect(() => {
    if (!carreras.length) return;
    (async () => {
      setLoading(true);
      const salida = [];

      for (const carrera of carreras) {
        const uniResultados = await Promise.all(
          FUENTES.map(async (f) => {
            try {
              const resp = await axios.get(
                `http://localhost:8000/api/proxy/?url=${encodeURIComponent(
                  f.url
                )}`
              );
              if (resp.data?.error) {
                return {
                  id: f.id,
                  nombre: f.nombre,
                  items: [],
                  error: "No se pudo acceder a la página.",
                  url: f.url,
                };
              }
              const items = extractConvocatorias(resp.data.html, f.url, carrera);
              return { id: f.id, nombre: f.nombre, items, url: f.url };
            } catch {
              return {
                id: f.id,
                nombre: f.nombre,
                items: [],
                error: "Error al acceder a la página.",
                url: f.url,
              };
            }
          })
        );
        salida.push({ carrera, universidades: uniResultados });
      }

      setBloques(salida);
      setLoading(false);
    })();
  }, [carreras]);

  const isDark = theme === "dark";

  const wrapperClasses = useMemo(
    () =>
      [
        "min-h-screen transition-colors duration-300",
        isDark
          ? "bg-gray-950 text-gray-100"
          : "bg-gradient-to-b from-slate-50 to-white text-slate-800",
      ].join(" "),
    [isDark]
  );

  const cardClasses = isDark
    ? "bg-gray-900/70 border border-teal-400/15 shadow-lg"
    : "bg-white/80 border border-teal-600/10 shadow";

  const uniCardClasses = isDark
    ? "bg-gray-800/70 hover:bg-gray-800/90"
    : "bg-white hover:bg-slate-50";

  return (
    <div className={wrapperClasses}>
      {/* Header */}
      <div className="relative">
        <motion.div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[url('/fondo_marcelo.jpg')] opacity-10"
              : "bg-gradient-to-r from-teal-50 to-sky-50"
          } bg-cover bg-center`}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        <div className="relative z-10 px-6 md:px-10 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-teal-400" />
            <h1
              className={`text-2xl md:text-3xl font-bold ${
                isDark ? "text-teal-300" : "text-teal-700"
              }`}
            >
              Convocatorias específicas para tus carreras
            </h1>
          </div>
          <button
            aria-label="Cambiar tema"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 border transition ${
              isDark
                ? "border-teal-500/20 bg-gray-900/60 hover:bg-gray-900"
                : "border-teal-600/20 bg-white hover:bg-slate-50"
            }`}
          >
            {isDark ? <SunMedium size={18} /> : <MoonStar size={18} />}
            <span className="text-sm">{isDark ? "Claro" : "Oscuro"}</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 px-6 md:px-10 pb-16">
        {error && (
          <div className="max-w-5xl mx-auto my-6 rounded-xl p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300">
            {error}
          </div>
        )}

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto grid gap-6"
            >
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-6 ${cardClasses} overflow-hidden`}
                >
                  <div className="h-6 w-64 animate-pulse rounded bg-gray-500/20 mb-5" />
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, j) => (
                      <div
                        key={j}
                        className={`rounded-xl p-3 ${uniCardClasses} border border-transparent`}
                      >
                        <div className="h-40 w-full rounded-md bg-gray-500/20 animate-pulse mb-2" />
                        <div className="h-4 w-3/4 rounded bg-gray-500/20 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto grid gap-8">
          {bloques.map((bloque, idx) => (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className={`rounded-2xl p-6 ${cardClasses}`}
            >
              <h2
                className={`text-xl md:text-2xl font-semibold mb-4 ${
                  isDark ? "text-teal-300" : "text-teal-700"
                }`}
              >
                {bloque.carrera}
              </h2>

              <div className="space-y-6">
                {bloque.universidades.map((u, k) => {
                  const logoSrc = LOGOS[u.id];
                  const tieneItems = u.items && u.items.length > 0;

                  return (
                    <div key={k} className="space-y-3">
                      <div className="flex items-center gap-3">
                        {logoSrc ? (
                          <img
                            src={logoSrc}
                            alt={u.nombre}
                            className="h-8 w-8 object-contain rounded"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-teal-500/20 flex items-center justify-center">
                            <University
                              size={18}
                              className={
                                isDark ? "text-teal-300" : "text-teal-700"
                              }
                            />
                          </div>
                        )}
                        <a
                          href={u.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-semibold hover:underline ${
                            isDark ? "text-white" : "text-slate-800"
                          }`}
                          title="Ir al sitio"
                        >
                          {u.nombre}
                        </a>
                      </div>

                      {tieneItems ? (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {u.items.map((it, j) => (
                            <a
                              key={j}
                              href={it.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`block rounded-xl p-4 transition border group ${uniCardClasses}`}
                            >
                              {it.img ? (
                                <img
                                  src={it.img}
                                  alt={it.title}
                                  className="w-full h-40 object-cover rounded-md mb-3"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-40 rounded-md mb-3 grid place-items-center border border-dashed">
                                  <ImageOff
                                    size={24}
                                    className={
                                      isDark
                                        ? "text-gray-400"
                                        : "text-slate-400"
                                    }
                                  />
                                </div>
                              )}

                              <h5 className="font-semibold text-teal-300 text-sm mb-2 group-hover:underline">
                                {it.title}
                              </h5>

                              {it.requisitos ? (
                                <p className="text-xs text-gray-300 line-clamp-4 leading-relaxed mb-2">
                                  {it.requisitos}
                                </p>
                              ) : (
                                <p className="text-xs italic text-gray-500 mb-2">
                                  Sin detalles de requisitos.
                                </p>
                              )}

                              <div className="flex justify-end">
                                <ExternalLink
                                  size={16}
                                  className="opacity-60 group-hover:opacity-100 shrink-0"
                                />
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div
                          className={`text-sm italic ${
                            isDark ? "text-gray-400" : "text-slate-500"
                          }`}
                        >
                          {u.error
                            ? `⚠️ ${u.error}`
                            : "🚫 No se encontraron convocatorias en esta página."}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
};
