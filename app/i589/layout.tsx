'use client';

import React from "react";

export default function I589Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="i589-layout">
      {/* Marca de agua global */}
      <div className="i589-watermark" aria-hidden>
        I-589
      </div>

      {/* Contenido de las páginas del formulario */}
      <div className="i589-content">{children}</div>

      {/* ======== ESTILOS GLOBALES DEL LAYOUT ======== */}
      <style jsx global>{`
        :root {
          --i589-blue-1: #f0f5ff;
          --i589-blue-2: #e7effb;
          --i589-blue-3: #dfe8f6;
        }

        /* Fondo general con degradado institucional */
        .i589-layout {
          position: relative;
          min-height: 100vh;
          background: radial-gradient(1000px 600px at 20% 0%, var(--i589-blue-1), transparent 60%),
                      radial-gradient(1000px 600px at 80% 30%, var(--i589-blue-2), transparent 60%),
                      linear-gradient(180deg, var(--i589-blue-3), #f8fafc);
          overflow-x: hidden;
        }

        /* Marca de agua central “I-589” */
        .i589-watermark {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: clamp(6rem, 16vw, 18rem);
          color: #94a3b8;
          opacity: 0.15;
          letter-spacing: -0.03em;
          user-select: none;
          pointer-events: none;
          z-index: 0;
          filter: blur(0.5px);
        }

        /* Contenedor del contenido */
        .i589-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          min-height: 100vh;
        }

        /* Ajuste global para tipografía base */
        body {
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          color: #0f172a;
          background-color: #f9fafb;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
