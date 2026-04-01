import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStudentId } from "./studentId";
import { getMajors } from "../../../api/api_majors";
import { getAptitudes } from "../../../api/api_aptitudes";

/* ============================================================
   BASE DE DATOS COMPLETA DE CARRERAS
   ============================================================ */
const careersDB = {
  "Ingeniería de Sistemas": {
    descripcion:
      "Forma profesionales capaces de diseñar, desarrollar e implementar soluciones tecnológicas innovadoras. Combina pensamiento lógico, matemáticas aplicadas y creatividad para resolver problemas del mundo real mediante software y sistemas digitales.",
    materias: ["Programación", "Bases de Datos", "IA", "Redes", "Algoritmos", "Ingeniería de Software"],
    universidades: ["UMSA", "UPEA", "UPB", "UNIFRANZ"],
  },
  Medicina: {
    descripcion:
      "Disciplina dedicada al estudio, diagnóstico y tratamiento de enfermedades. Desarrolla competencias científicas, clínicas y humanas para preservar la salud individual y colectiva, integrando ciencias básicas con práctica clínica.",
    materias: ["Anatomía", "Fisiología", "Farmacología", "Clínica", "Cirugía", "Salud Pública"],
    universidades: ["UMSA", "UNIVALLE", "UPSA", "UCB"],
  },
  Derecho: {
    descripcion:
      "Ciencia jurídica que estudia el sistema legal, la justicia y las normas que regulan la convivencia en sociedad. Prepara abogados con capacidad de análisis, argumentación y defensa de derechos ante el ordenamiento jurídico.",
    materias: ["Derecho Penal", "Derecho Civil", "Derecho Constitucional", "Procesal", "Internacional"],
    universidades: ["UMSA", "UPEA", "UCB", "UPSA"],
  },
  Psicología: {
    descripcion:
      "Ciencia que estudia la conducta humana y los procesos mentales. Permite comprender, evaluar e intervenir en situaciones individuales, grupales y organizacionales para promover el bienestar psicológico y el desarrollo personal.",
    materias: ["Psicología Clínica", "Psicología Social", "Neuropsicología", "Evaluación", "Terapias"],
    universidades: ["UMSA", "UCB", "UNIFRANZ", "UPSA"],
  },
  "Ingeniería Agronómica": {
    descripcion:
      "Carrera orientada a la producción agrícola sostenible, manejo de suelos, recursos hídricos y tecnología aplicada al campo. Integra ciencias biológicas con ingeniería para optimizar cultivos y garantizar la seguridad alimentaria.",
    materias: ["Botánica", "Edafología", "Fitotecnia", "Riegos", "Economía Agrícola", "Agroindustria"],
    universidades: ["UMSA", "UMSS", "UAB", "UAGRM"],
  },
  "Medicina Veterinaria y Zootecnia": {
    descripcion:
      "Integra la salud animal con la producción pecuaria sostenible. Forma profesionales para diagnosticar y tratar enfermedades animales, gestionar explotaciones ganaderas y velar por la sanidad animal y la inocuidad alimentaria.",
    materias: ["Anatomía Veterinaria", "Zootecnia", "Clínica Animal", "Sanidad", "Producción Pecuaria"],
    universidades: ["UMSA", "UMSS", "UAB", "UAGRM"],
  },
  Música: {
    descripcion:
      "Formación integral en teoría musical, ejecución instrumental, composición y dirección. Desarrolla sensibilidad artística, disciplina técnica y capacidad de comunicación emocional a través del lenguaje universal de la música.",
    materias: ["Teoría Musical", "Armonía", "Contrapunto", "Historia de la Música", "Composición", "Instrumento"],
    universidades: ["UMSA", "Conservatorio Nacional", "UCB"],
  },
  "Diseño Gráfico y Comunicación Visual": {
    descripcion:
      "Disciplina creativa que combina arte, tecnología y comunicación para transmitir mensajes visuales con impacto. Forma diseñadores capaces de crear identidades, campañas y experiencias visuales en entornos digitales y físicos.",
    materias: ["Diseño Digital", "Tipografía", "Fotografía", "Branding", "UX/UI", "Ilustración"],
    universidades: ["UCB", "UNIFRANZ", "NUR", "UPSA"],
  },
};

const generateDynamicInfo = (career) => ({
  descripcion: `La carrera de ${career} desarrolla competencias profesionales especializadas que permiten al estudiante insertarse en el mercado laboral con una sólida base teórica y práctica.`,
  materias: ["Formación Básica", "Especialidad I", "Especialidad II", "Prácticas Profesionales"],
  universidades: ["UMSA", "UPEA", "UCB", "Universidades Privadas"],
});

/* ============================================================
   MOTOR DE INSIGHTS POR CARRERA
   ============================================================ */
const generateCareerInsights = (career, aptitudes) => {
  const top = [...aptitudes]
    .sort((a, b) => parseFloat(b.porcentaje) - parseFloat(a.porcentaje))
    .slice(0, 3);
  const topNames = top.map((a) => a.aptitud);

  const rules = {
    "Ingeniería de Sistemas": {
      campo: [
        "Desarrollador Full Stack",
        "Ingeniero de Software",
        "Data Scientist",
        "DevOps Engineer",
        "Arquitecto de Sistemas",
        "Analista de Ciberseguridad",
        "Especialista en IA / Machine Learning",
      ],
      perfil: "Analítico, lógico, con alta capacidad de resolución de problemas y atención al detalle",
      ventajas: [
        "Alta demanda laboral nacional e internacional",
        "Excelentes salarios competitivos",
        "Posibilidad de trabajo remoto y freelance",
        "Sector en constante crecimiento e innovación",
        "Amplia variedad de especializaciones",
      ],
      riesgos: [
        "Riesgo de sedentarismo y burnout",
        "Alta competencia en el mercado global",
        "Necesidad de actualización tecnológica constante",
        "Presión por cumplimiento de plazos",
      ],
    },
    Medicina: {
      campo: [
        "Médico General",
        "Especialista (Cardiología, Neurología, etc.)",
        "Médico Investigador",
        "Salubrista Público",
        "Médico de Urgencias",
        "Consultor Clínico",
      ],
      perfil: "Empático, disciplinado, vocación de servicio, resiliencia emocional y capacidad de trabajo bajo presión",
      ventajas: [
        "Estabilidad laboral garantizada",
        "Alto impacto social y reconocimiento",
        "Posibilidades de especialización diversas",
        "Demanda permanente en todos los contextos",
        "Posibilidad de ejercicio independiente",
      ],
      riesgos: [
        "Larga duración de la carrera (6-10 años con especialidad)",
        "Alto nivel de estrés y responsabilidad",
        "Exposición a situaciones emocionalmente demandantes",
        "Guardias nocturnas y horarios irregulares",
      ],
    },
    Derecho: {
      campo: [
        "Abogado Litigante",
        "Fiscal / Ministerio Público",
        "Juez o Magistrado",
        "Asesor Legal Corporativo",
        "Diplomático / Relaciones Internacionales",
        "Notario Público",
      ],
      perfil: "Argumentativo, verbal, líder natural con sentido de justicia, ética y habilidad de negociación",
      ventajas: [
        "Amplio campo laboral en sector público y privado",
        "Alta influencia en decisiones sociales y políticas",
        "Posibilidad de ejercicio independiente",
        "Reconocimiento social y profesional",
        "Complementariedad con otras carreras",
      ],
      riesgos: [
        "Alta competencia en el mercado legal",
        "Mercado saturado en algunas áreas",
        "Dependencia de contactos y red profesional",
        "Procesos judiciales lentos y frustrantes",
      ],
    },
    Psicología: {
      campo: [
        "Psicólogo Clínico",
        "Psicólogo Organizacional",
        "Neuropsicólogo",
        "Psicólogo Educativo",
        "Terapeuta Familiar",
        "Investigador en Salud Mental",
      ],
      perfil: "Empático, observador, paciente y con habilidad para escuchar activamente y comprender conductas humanas complejas",
      ventajas: [
        "Creciente demanda en salud mental",
        "Posibilidad de consulta privada independiente",
        "Aplicación en empresas, hospitales y educación",
        "Alta satisfacción personal por ayudar a otros",
        "Campo en expansión postpandemia",
      ],
      riesgos: [
        "Riesgo de fatiga por compasión",
        "Proceso de habilitación profesional extenso",
        "Ingresos variables al iniciar",
        "Alta carga emocional del trabajo clínico",
      ],
    },
    "Ingeniería Agronómica": {
      campo: [
        "Ingeniero Agrónomo",
        "Consultor Agrícola",
        "Especialista en Cultivos",
        "Gestor de Proyectos Rurales",
        "Investigador Agropecuario",
        "Especialista en Agroexportación",
      ],
      perfil: "Observador, práctico, con amor por la naturaleza y capacidad de gestión en entornos rurales y productivos",
      ventajas: [
        "Sector estratégico para la seguridad alimentaria",
        "Apoyo de organismos internacionales (FAO, BID)",
        "Vinculación con innovación tecnológica agrícola",
        "Posibilidad de emprendimiento propio",
        "Trabajo en entornos naturales y dinámicos",
      ],
      riesgos: [
        "Trabajo en zonas rurales alejadas",
        "Dependencia de condiciones climáticas",
        "Salarios variables en el sector privado",
        "Requiere movilidad geográfica frecuente",
      ],
    },
    "Medicina Veterinaria y Zootecnia": {
      campo: [
        "Médico Veterinario",
        "Especialista en Animales de Compañía",
        "Veterinario de Producción Animal",
        "Inspector de Sanidad Alimentaria",
        "Investigador en Salud Animal",
        "Docente Universitario",
      ],
      perfil: "Paciente, amante de los animales, meticuloso y con capacidad para trabajo en entornos rurales y urbanos",
      ventajas: [
        "Mercado en crecimiento (mascotas + ganadería)",
        "Posibilidad de consulta privada propia",
        "Aplicación en salud pública y control alimentario",
        "Variedad de especializaciones disponibles",
        "Alta satisfacción por el cuidado animal",
      ],
      riesgos: [
        "Alta inversión inicial en equipamiento clínico",
        "Exposición a riesgos biológicos",
        "Larga formación para especializaciones",
        "Trabajo físicamente demandante",
      ],
    },
    Música: {
      campo: [
        "Músico Profesional / Intérprete",
        "Compositor / Arreglista",
        "Director de Orquesta o Coro",
        "Docente de Música",
        "Productor Musical",
        "Musicoterapeuta",
      ],
      perfil: "Creativo, disciplinado, sensible, con alto nivel de dedicación y capacidad de expresión emocional",
      ventajas: [
        "Alta satisfacción personal y expresión artística",
        "Versatilidad de entornos laborales",
        "Posibilidad de construir marca personal",
        "Creciente industria de producción digital",
        "Vinculación con educación y terapia",
      ],
      riesgos: [
        "Ingresos inestables al inicio de la carrera",
        "Alta competencia en el mercado artístico",
        "Requiere práctica diaria intensa y sostenida",
        "Mercado laboral más reducido en Bolivia",
      ],
    },
    "Diseño Gráfico y Comunicación Visual": {
      campo: [
        "Diseñador Gráfico",
        "Director de Arte",
        "Diseñador UX/UI",
        "Motion Designer",
        "Brand Designer / Identidad Visual",
        "Ilustrador Digital",
        "Diseñador de Packaging",
      ],
      perfil: "Creativo, visual, con habilidad para comunicar ideas de forma estética y funcional en distintos medios",
      ventajas: [
        "Alta demanda en entornos digitales y agencias",
        "Posibilidad de freelance y trabajo remoto global",
        "Sector creativo en constante expansión",
        "Herramientas y plataformas en crecimiento",
        "Multidisciplinariedad con marketing y tecnología",
      ],
      riesgos: [
        "Alta competencia y saturación del mercado",
        "Clientes con expectativas poco claras",
        "Evolución rápida de herramientas y tendencias",
        "Valoración del trabajo creativo subestimada",
      ],
    },
  };

  const base = rules[career] || {
    campo: ["Profesional Independiente", "Consultor Especializado", "Investigador", "Docente Universitario"],
    perfil: "Perfil adaptable, con capacidad de aprendizaje continuo y resolución de problemas en su área",
    ventajas: ["Desarrollo profesional continuo", "Posibilidad de especialización", "Aplicación en múltiples sectores"],
    riesgos: ["Dependencia del mercado laboral local", "Necesidad de actualización constante"],
  };

  const hasVerbal = topNames.includes("Verbal");
  const hasSocial = topNames.includes("Social");
  const hasAbstracto = topNames.includes("Abstracto");

  const recomendacion = `Se recomienda ${career} porque destacas en ${topNames.join(", ")}, habilidades que potencian directamente el desempeño en esta carrera.`;
  const advertencia = hasSocial
    ? "Tu aptitud social es una fortaleza clave. Úsala para el trabajo colaborativo y la comunicación profesional."
    : hasVerbal
    ? "Tu capacidad verbal te ayudará en la redacción, argumentación y comunicación dentro de esta carrera."
    : hasAbstracto
    ? "Tu pensamiento abstracto te permitirá resolver problemas complejos con mayor facilidad."
    : "Refuerza tus habilidades de comunicación interpersonal, ya que son fundamentales en cualquier campo profesional.";

  return { ...base, recomendacion, advertencia };
};

/* ============================================================
   BASE DE DATOS DE RECURSOS POR CARRERA
   ============================================================ */
const resourcesByCareer = {
  "Ingeniería de Sistemas": {
    recursos: [
      { titulo: "GitHub - Repositorios de Código", url: "https://github.com/explore", descripcion: "Millones de proyectos open source para aprender", icono: "💻" },
      { titulo: "Stack Overflow", url: "https://stackoverflow.com/", descripcion: "Comunidad de desarrolladores para resolver dudas", icono: "🔧" },
      { titulo: "LeetCode - Práctica de Algoritmos", url: "https://leetcode.com/", descripcion: "Plataforma para practicar problemas de programación", icono: "🎯" },
      { titulo: "MDN Web Docs", url: "https://developer.mozilla.org/", descripcion: "Documentación completa de tecnologías web", icono: "📖" },
    ],
  },
  Medicina: {
    recursos: [
      { titulo: "PubMed - Biblioteca Médica", url: "https://pubmed.ncbi.nlm.nih.gov/", descripcion: "Base de datos de artículos médicos científicos", icono: "🔬" },
      { titulo: "Medscape", url: "https://www.medscape.com/", descripcion: "Recursos clínicos y educación médica continua", icono: "⚕️" },
      { titulo: "WHO - Organización Mundial de la Salud", url: "https://www.who.int/", descripcion: "Información global de salud pública", icono: "🌍" },
    ],
  },
  Derecho: {
    recursos: [
      { titulo: "Gaceta Oficial de Bolivia", url: "https://www.gacetaoficialdebolivia.gob.bo/", descripcion: "Publicación oficial de leyes bolivianas", icono: "⚖️" },
      { titulo: "Tribunal Constitucional Plurinacional", url: "https://www.tcpbolivia.bo/", descripcion: "Sentencias y jurisprudencia constitucional", icono: "🏛️" },
      { titulo: "Lexivox - Legislación Boliviana", url: "https://www.lexivox.org/", descripcion: "Biblioteca digital de normativa boliviana", icono: "📚" },
    ],
  },
  Psicología: {
    recursos: [
      { titulo: "APA - American Psychological Association", url: "https://www.apa.org/", descripcion: "Recursos y publicaciones de psicología", icono: "🧠" },
      { titulo: "Psychology Today", url: "https://www.psychologytoday.com/", descripcion: "Artículos y recursos psicológicos actualizados", icono: "💭" },
    ],
  },
  "Ingeniería Agronómica": {
    recursos: [
      { titulo: "FAO - Organización de Alimentos y Agricultura", url: "https://www.fao.org/", descripcion: "Recursos técnicos de agricultura mundial", icono: "🌾" },
      { titulo: "INIAF Bolivia", url: "https://www.iniaf.gob.bo/", descripcion: "Instituto Nacional de Innovación Agropecuaria", icono: "🇧🇴" },
      { titulo: "PROINPA - Fundación Bolivia", url: "https://www.proinpa.org/", descripcion: "Investigación en papa y granos andinos", icono: "🥔" },
    ],
  },
  "Medicina Veterinaria y Zootecnia": {
    recursos: [
      { titulo: "SENASAG Bolivia", url: "https://www.senasag.gob.bo/", descripcion: "Servicio Nacional de Sanidad Agropecuaria", icono: "🐄" },
      { titulo: "OIE - Organización Mundial de Sanidad Animal", url: "https://www.woah.org/", descripcion: "Estándares internacionales de salud animal", icono: "🌍" },
    ],
  },
  Música: {
    recursos: [
      { titulo: "MuseScore", url: "https://musescore.org/", descripcion: "Software gratuito de notación musical", icono: "🎼" },
      { titulo: "musictheory.net", url: "https://www.musictheory.net/", descripcion: "Lecciones y ejercicios de teoría musical", icono: "🎹" },
    ],
  },
  "Diseño Gráfico y Comunicación Visual": {
    recursos: [
      { titulo: "Behance", url: "https://www.behance.net/", descripcion: "Portfolio y proyectos de diseño mundial", icono: "🎨" },
      { titulo: "Dribbble", url: "https://dribbble.com/", descripcion: "Comunidad de diseñadores y creativos", icono: "✨" },
      { titulo: "Google Fonts", url: "https://fonts.google.com/", descripcion: "Fuentes tipográficas gratuitas", icono: "🔤" },
    ],
  },
};

/* ============================================================
   RECURSOS POR APTITUD
   ============================================================ */
const resourcesByAptitude = {
  Verbal: {
    recursos: [
      { titulo: "Grammarly", url: "https://www.grammarly.com/", descripcion: "Corrector gramatical avanzado", icono: "✍️" },
      { titulo: "Hemingway Editor", url: "https://hemingwayapp.com/", descripcion: "Mejora la claridad de tu escritura", icono: "📝" },
    ],
  },
  Calculo: {
    recursos: [
      { titulo: "Khan Academy - Cálculo", url: "https://www.khanacademy.org/math/calculus-1", descripcion: "Videos y ejercicios interactivos gratuitos", icono: "📊" },
      { titulo: "Wolfram Alpha", url: "https://www.wolframalpha.com/", descripcion: "Calculadora simbólica y gráficas", icono: "🔢" },
    ],
  },
  Abstracto: {
    recursos: [
      { titulo: "Brilliant.org", url: "https://brilliant.org/", descripcion: "Problemas de pensamiento lógico y matemático", icono: "🧩" },
    ],
  },
  Espacial: {
    recursos: [
      { titulo: "Tinkercad", url: "https://www.tinkercad.com/", descripcion: "Diseño 3D fácil para principiantes", icono: "🔷" },
      { titulo: "SketchUp Free", url: "https://www.sketchup.com/", descripcion: "Modelado 3D gratuito en línea", icono: "📦" },
    ],
  },
  Mecanico: {
    recursos: [
      { titulo: "Engineering Toolbox", url: "https://www.engineeringtoolbox.com/", descripcion: "Calculadoras y referencias de ingeniería", icono: "⚙️" },
      { titulo: "HyperPhysics", url: "http://hyperphysics.phy-astr.gsu.edu/hbase/index.html", descripcion: "Conceptos de física aplicada", icono: "🔧" },
    ],
  },
};

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
export const CareerResources = () => {
  const [studentId, setStudentId] = useState(null);
  const [careers, setCareers] = useState([]);
  const [aptitudes, setAptitudes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [selectedTab, setSelectedTab] = useState({});

  const toggleCard = (id) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const setTab = (cardId, tab) =>
    setSelectedTab((prev) => ({ ...prev, [cardId]: tab }));

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

  useEffect(() => {
    if (!studentId) return;
    (async () => {
      try {
        const data = await getMajors();
        const sd = data.data.find((i) => Number(i.estudiante) === Number(studentId));
        if (sd) {
          const parsed = JSON.parse(sd.carreras.replace(/'/g, '"'));
          setCareers(parsed);
        }
      } catch {
        setError("Error al obtener las carreras.");
      }
    })();
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;
    (async () => {
      try {
        const data = await getAptitudes();
        const sd = data.data.find((i) => Number(i.estudiante) === Number(studentId));
        if (sd) {
          const filtered = sd.aptitudes.filter((a) => parseFloat(a.porcentaje) > 0);
          setAptitudes(filtered);
        }
      } catch {
        setError("Error al obtener aptitudes.");
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId]);

  const getTopAptitudes = () =>
    [...aptitudes]
      .sort((a, b) => parseFloat(b.porcentaje) - parseFloat(a.porcentaje))
      .slice(0, 3);

  /* ---- LOADING ---- */
  if (loading) {
    return (
      <div className="relative text-white overflow-hidden h-screen">
        <motion.div
          className="absolute inset-0 dark:bg-[url('/fondo_marcelo.jpg')] dark:bg-cover dark:bg-center bg-gradient-to-br from-[#b9edfa]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <div className="absolute inset-0 dark:bg-black/60" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 dark:border-cyan-400 border-lime-600 mx-auto mb-4" />
            <p className="text-xl dark:text-cyan-300 text-black font-bold">Cargando recursos...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ---- ERROR ---- */
  if (error) {
    return (
      <div className="relative text-white overflow-hidden h-screen">
        <motion.div
          className="absolute inset-0 dark:bg-[url('/fondo_marcelo.jpg')] dark:bg-cover dark:bg-center bg-gradient-to-br from-[#b9edfa]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <div className="absolute inset-0 dark:bg-black/60" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="dark:bg-red-900/50 bg-red-100 border dark:border-red-500/30 border-red-400 rounded-2xl p-6 max-w-md">
            <p className="dark:text-red-300 text-red-700 font-semibold text-lg">⚠️ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ---- RENDER ---- */
  return (
    <div className="relative dark:text-white text-black overflow-hidden min-h-screen">
      {/* Fondo animado */}
      <motion.div
        className="absolute inset-0 dark:bg-[url('/fondo_marcelo.jpg')] dark:bg-cover dark:bg-center bg-gradient-to-br from-[#b9edfa]"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      <div className="absolute inset-0 dark:bg-black/60" />

      {/* Contenido principal */}
      <div className="relative z-10 max-w-6xl mx-auto py-12 px-6 h-[100vh] overflow-y-auto scrollbar-hide">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="from-black to-black text-4xl md:text-5xl font-bold bg-gradient-to-r dark:from-cyan-400 dark:via-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-3">
            Biblioteca de Recursos Personalizada
          </h1>
          <p className="dark:text-gray-300 text-black font-semibold text-lg mb-2">
            Recursos para tu desarrollo
          </p>
        </motion.div>

        {/* ============================
            SECCIÓN CARRERAS
        ============================ */}
        {careers.length > 0 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="text-4xl">🎓</span>
              <span className="dark:bg-gradient-to-r dark:from-green-400 dark:to-emerald-400 bg-black  bg-clip-text text-transparent">
                Recursos por carrera
              </span>
            </h2>

            <div className="grid md:grid-cols-1 gap-6">
              {careers.map((c, index) => {
                const cardId = `career-${index}`;
                const isExpanded = expandedCards.has(cardId);
                const info = careersDB[c.carrera] || generateDynamicInfo(c.carrera);
                const insights = generateCareerInsights(c.carrera, aptitudes);
                const resources = resourcesByCareer[c.carrera] || {};
                const currentTab = selectedTab[cardId] || "info";

                const recursosExtra = resources.recursos || [];
                const topApt = getTopAptitudes();

                return (
                  <motion.div
                    key={index}
                    className="bg-gradient-to-r dark:from-black/50 dark:to-gray-900/50 from-white to-white rounded-2xl border dark:border-green-500/30 border-green-400/60 shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  
                  >
                    {/* Header tarjeta */}
                    <div className="p-5 border-b dark:border-green-500/20 border-green-300/50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold dark:text-green-300 text-black">{c.carrera}</h3>
                          <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">{info.descripcion}</p>
                        </div>
                        <span className="text-sm dark:bg-green-500/20 bg-green-100 dark:text-green-300 text-black px-3 py-1 rounded-full font-semibold border dark:border-green-500/30 border-green-400 whitespace-nowrap ml-3">
                          {c.probabilidad}
                        </span>
                      </div>

                      {/* Aptitudes top */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {topApt.map((a, idx) => (
                          <span key={idx} className="dark:bg-cyan-500/10 bg-cyan-100 border dark:border-cyan-500/30 border-cyan-400/50 dark:text-cyan-300 text-cyan-700 px-2 py-1 text-xs rounded-full">
                            {a.aptitud} · {a.porcentaje}
                          </span>
                        ))}
                      </div>

                      {/* Materias */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {info.materias.map((m, idx) => (
                          <span key={idx} className="dark:bg-gray-700/50 bg-gray-100 dark:text-gray-300 text-gray-700 px-2 py-1 text-xs rounded">
                            {m}
                          </span>
                        ))}
                      </div>

                      {/* Universidades */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {info.universidades.map((u, idx) => (
                          <span key={idx} className="dark:bg-emerald-500/10 bg-emerald-50 border dark:border-emerald-500/30 border-emerald-400/50 dark:text-emerald-300 text-emerald-700 px-2 py-1 text-xs rounded">
                            🏛 {u}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex gap-3 text-sm font-bold dark:text-gray-500 text-black">
                          <span>🔗 {recursosExtra.length} recursos</span>
                        </div>
                        <motion.button
                          onClick={() => toggleCard(cardId)}
                          className="dark:text-cyan-400 text-black font-bold dark:hover:text-cyan-300 hover:text-cyan-500 text-sm flex items-center gap-1 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isExpanded ? "Ocultar detalle" : "Ver detalle completo"}
                          <motion.svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </motion.svg>
                        </motion.button>
                      </div>
                    </div>

                    {/* Contenido expandible */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          className="p-5"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35 }}
                        >
                          {/* Tabs */}
                          <div className="flex gap-2 mb-5 flex-wrap">
                            {[
                              { key: "info", label: "🎯 Perfil & Campo Laboral" },
                              { key: "recursos", label: `🔗 Recursos (${recursosExtra.length})` },
                            ].map(({ key, label }) => {
                              const isActive = currentTab === key;
                              const bg = isActive
                                ? key === "info"
                                  ? "bg-[yellow] text-black shadow-lg"
                                  : "bg-lime-400 text-black shadow-lg"
                                : "dark:bg-gray-800/50 bg-gray-100 dark:text-gray-400 text-gray-600 dark:hover:bg-gray-700/50 hover:bg-gray-200";
                              return (
                                <button
                                  key={key}
                                  onClick={() => setTab(cardId, key)}
                                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${bg}`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>

                          {/* ---- TAB: INFO / PERFIL ---- */}
                          {currentTab === "info" && (
                            <motion.div
                              className="space-y-4"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              {/* Recomendación */}
                              <div className="bg-gradient-to-r dark:from-green-900/40 dark:to-emerald-900/30 from-green-50 to-green-50 border dark:border-green-500/30 border-green-300 p-4 rounded-xl">
                                <p className="text-sm dark:text-green-200 text-green-800">🎯 {insights.recomendacion}</p>
                              </div>

                              {/* Perfil */}
                              <div className="dark:bg-gray-800/40 bg-gray-50 border dark:border-gray-700/50 border-gray-200 p-4 rounded-xl">
                                <h4 className="text-sm font-bold dark:text-cyan-300 text-cyan-700 uppercase tracking-wider mb-2">
                                  👤 Perfil del estudiante ideal
                                </h4>
                                <p className="text-sm dark:text-gray-300 text-gray-700">{insights.perfil}</p>
                              </div>

                              {/* Campo laboral */}
                              <div className="dark:bg-gray-800/40 bg-gray-50 border dark:border-gray-700/50 border-gray-200 p-4 rounded-xl">
                                <h4 className="text-sm font-bold dark:text-cyan-300 text-cyan-700 uppercase tracking-wider mb-3">
                                  💼 Campo laboral
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {insights.campo.map((campo, i) => (
                                    <motion.div
                                      key={i}
                                      className="dark:bg-cyan-500/10 bg-cyan-50 border dark:border-cyan-500/20 border-cyan-300/50 rounded-lg p-2 text-center"
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: i * 0.06 }}
                                    >
                                      <p className="text-xs dark:text-cyan-300 text-cyan-700 font-medium">{campo}</p>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>

                              {/* Ventajas y riesgos */}
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="dark:bg-gray-800/40 bg-gray-50 border dark:border-emerald-500/20 border-emerald-300/50 p-4 rounded-xl">
                                  <h4 className="text-sm font-bold dark:text-emerald-400 text-emerald-700 uppercase tracking-wider mb-3">
                                    ✅ Ventajas
                                  </h4>
                                  <ul className="space-y-1">
                                    {insights.ventajas.map((v, i) => (
                                      <li key={i} className="text-xs dark:text-gray-300 text-gray-700 flex items-start gap-2">
                                        <span className="dark:text-emerald-400 text-emerald-600 mt-0.5">▸</span>
                                        {v}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="dark:bg-gray-800/40 bg-gray-50 border dark:border-red-500/20 border-red-300/50 p-4 rounded-xl">
                                  <h4 className="text-sm font-bold dark:text-red-400 text-red-600 uppercase tracking-wider mb-3">
                                    ⚠️ Riesgos a considerar
                                  </h4>
                                  <ul className="space-y-1">
                                    {insights.riesgos.map((r, i) => (
                                      <li key={i} className="text-xs dark:text-gray-300 text-gray-700 flex items-start gap-2">
                                        <span className="dark:text-red-400 text-red-500 mt-0.5">▸</span>
                                        {r}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {/* Advertencia inteligente */}
                              <div className="dark:bg-yellow-900/30 bg-yellow-50 border dark:border-yellow-500/30 border-yellow-300 p-3 rounded-xl">
                                <p className="text-xs dark:text-yellow-200 text-yellow-800">🤖 {insights.advertencia}</p>
                              </div>
                            </motion.div>
                          )}

                          {/* ---- TAB: RECURSOS ---- */}
                          {currentTab === "recursos" && (
                            <div className="space-y-3">
                              {recursosExtra.length === 0 ? (
                                <p className="text-sm dark:text-gray-400 text-gray-500 italic text-center py-6">No hay recursos extra para esta carrera aún.</p>
                              ) : (
                                recursosExtra.map((r, i) => (
                                  <motion.a
                                    key={i}
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block dark:bg-gray-800/50 bg-gray-50 p-4 rounded-xl border dark:border-emerald-500/20 border-emerald-300/40 dark:hover:border-emerald-500/40 hover:border-emerald-400 transition-all"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                    whileHover={{ scale: 1.01, boxShadow: "0 0 15px rgba(16,185,129,0.2)" }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-3xl">{r.icono}</span>
                                      <div className="flex-1">
                                        <h4 className="font-bold dark:text-emerald-300 text-emerald-700 mb-1">{r.titulo}</h4>
                                        <p className="text-xs dark:text-gray-400 text-gray-500">{r.descripcion}</p>
                                      </div>
                                      <svg className="w-5 h-5 dark:text-emerald-400 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </div>
                                  </motion.a>
                                ))
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ============================
            SECCIÓN APTITUDES
        ============================ */}
        {aptitudes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="text-4xl">🧠</span>
              <span className="dark:bg-gradient-to-r dark:from-purple-400 dark:to-pink-400  bg-black bg-clip-text text-transparent">
                Recursos para tus aptitudes
              </span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {aptitudes.map((a, index) => {
                const cardId = `aptitude-${index}`;
                const isExpanded = expandedCards.has(cardId);
                const resources = resourcesByAptitude[a.aptitud] || {};
                const recursosExtra = resources.recursos || [];

                return (
                  <motion.div
                    key={index}
                    className="bg-gradient-to-r dark:from-black/50 dark:to-gray-900/50 from-white to-white rounded-2xl border dark:border-purple-500/30 border-purple-400/50 shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    
                  >
                    <div className="p-5 border-b dark:border-purple-500/20 border-purple-300/40">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold dark:text-purple-300 text-black">{a.aptitud}</h3>
                        <span className="text-sm dark:bg-purple-500/20 bg-purple-100 dark:text-purple-300 text-black px-3 py-1 rounded-full font-semibold border dark:border-purple-500/30 border-purple-400 ml-2">
                          {a.porcentaje}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 text-sm font-bold dark:text-gray-400 text-black ">
                          <span>🔗 {recursosExtra.length}</span>
                        </div>
                        <motion.button
                          onClick={() => toggleCard(cardId)}
                          className="dark:text-pink-400 text-black  dark:hover:text-pink-300 hover:text-pink-500 font-bold text-sm flex items-center gap-1 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isExpanded ? "Ocultar" : "Ver recursos"}
                          <motion.svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </motion.svg>
                        </motion.button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          className="p-5"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {recursosExtra.length > 0 && (
                            <div className="space-y-2">
                              {recursosExtra.map((r, i) => (
                                <motion.a
                                  key={i}
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block dark:bg-gray-800/50 bg-gray-50 p-3 rounded-xl border dark:border-emerald-500/20 border-emerald-300/40 dark:hover:border-emerald-500/40 hover:border-emerald-400 transition-all"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  whileHover={{ scale: 1.01 }}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{r.icono}</span>
                                    <div className="flex-1">
                                      <h4 className="font-bold dark:text-emerald-300 text-emerald-700 text-sm">{r.titulo}</h4>
                                      <p className="text-xs dark:text-gray-400 text-gray-500">{r.descripcion}</p>
                                    </div>
                                  </div>
                                </motion.a>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Sin datos */}
        {careers.length === 0 && aptitudes.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="dark:bg-gradient-to-r dark:from-gray-800/50 dark:to-gray-900/50 bg-white rounded-2xl p-12 border dark:border-cyan-500/30 border-cyan-400/50 shadow-lg">
              <svg className="mx-auto h-16 w-16 dark:text-cyan-400 text-cyan-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="dark:text-cyan-300 text-cyan-700 font-bold text-xl mb-2">Aún no tienes recursos disponibles</p>
              <p className="dark:text-gray-400 text-gray-600">Completa los tests para obtener recomendaciones personalizadas</p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};