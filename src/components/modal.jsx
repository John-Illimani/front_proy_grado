import React from "react";

const ModalResultado = ({ open, onClose, titulo, mensaje, detalles }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[90%] max-w-lg p-6 animate-fadeIn">

        {/* TÍTULO */}
        <h2 className="text-xl font-bold mb-3 text-center">
          {titulo}
        </h2>

        {/* MENSAJE */}
        <p className="text-center mb-4">
          {mensaje}
        </p>

        {/* DETALLES (errores, lista, etc) */}
        {detalles && detalles.length > 0 && (
          <div className="max-h-40 overflow-y-auto text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-4">
            {detalles.map((d, i) => (
              <p key={i}>• {d}</p>
            ))}
          </div>
        )}

        {/* BOTÓN */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalResultado;