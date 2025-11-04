import React, { useState } from "react";

export const CarrerasConvocatorias = () => {
  const [inputCarreras, setInputCarreras] = useState("");
  const [respuestas, setRespuestas] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleEnviar = async () => {
    if (!inputCarreras.trim()) return;

    const carreras = inputCarreras.split(",").map((c) => c.trim());
    setLoading(true);

    try {
      // Aquí luego conectas a tu backend
      // Ejemplo de fetch:
      // const res = await fetch("http://localhost:5000/recomendaciones", { ... })
      // const data = await res.json();

      // Simulación de respuesta
      const data = carreras.map((carrera) => ({
        carrera,
        universidades: [
          "Universidad Nacional",
          "Universidad Privada",
          "Instituto Superior",
        ],
        convocatorias: [
          "Convocatoria 2025 - Enero",
          "Convocatoria 2025 - Julio",
        ],
        infoAdicional: "Esta carrera tiene alta demanda en el mercado laboral.",
      }));

      setRespuestas(data);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col items-center p-8 relative z-20">
      <h1 className="text-4xl font-bold text-white mb-6">
        Recomendaciones de Carreras
      </h1>

      <div className="w-full max-w-2xl mb-6">
        <input
          type="text"
          placeholder="Ej: ingenieria de sistemas, derecho, electronica"
          value={inputCarreras}
          onChange={(e) => setInputCarreras(e.target.value)}
          className="w-full p-4 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button
          onClick={handleEnviar}
          className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg shadow-lg transition-colors"
        >
          {loading ? "Cargando..." : "Obtener Recomendaciones"}
        </button>
      </div>

      <div className="w-full max-w-3xl space-y-6">
        {respuestas.map((res, idx) => (
          <div
            key={idx}
            className="bg-white bg-opacity-20 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20"
          >
            <h2 className="text-2xl font-semibold mb-2">{res.carrera}</h2>
            <p className="mb-2">
              <strong>Universidades recomendadas:</strong>{" "}
              {res.universidades.join(", ")}
            </p>
            <p className="mb-2">
              <strong>Convocatorias:</strong> {res.convocatorias.join(", ")}
            </p>
            <p className="text-sm italic">{res.infoAdicional}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
