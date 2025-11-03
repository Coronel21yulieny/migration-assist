import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Loading() {
  return (
    <main className={`hero ${inter.className}`}>
      <div className="loader-card">
        <div className="logo-badge">MA</div>
        <div className="spinner" aria-label="Cargando" />
        <p className="loading-text">Cargando…</p>
      </div>

      <style jsx global>{`
        :root {
          --brand-700: #083b6c;
          --brand-500: #0b4c8c;
          --ink-600: #475569;
          --border: #e5e7eb;
        }

        /* ===== Fondo claro con overlay blanco ===== */
        .hero {
          position: relative;
          min-height: 100svh;
          display: grid;
          place-items: center;
          padding: 24px;

          background:
            radial-gradient(1200px 600px at 15% -10%, rgba(11, 76, 140, 0.12), transparent 60%),
            radial-gradient(1200px 600px at 115% 110%, rgba(11, 76, 140, 0.10), transparent 60%),
            #eef2f7;
        }

        .hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,.82), rgba(255,255,255,.64));
          backdrop-filter: blur(5px);
          z-index: 1;
        }

        .hero > * {
          position: relative;
          z-index: 2;
        }

        /* ===== Tarjeta de carga ===== */
        .loader-card {
          width: 100%;
          max-width: 360px;
          border-radius: 18px;
          background: rgba(255,255,255,.92);
          border: 1px solid var(--border);
          box-shadow: 0 14px 40px rgba(2,6,23,.08);
          backdrop-filter: blur(6px);
          padding: 24px;
          text-align: center;
        }

        .logo-badge {
          width: 44px;
          height: 44px;
          margin: 0 auto 10px;
          border-radius: 9999px;
          display: grid;
          place-items: center;
          font-weight: 800;
          color: #fff;
          background: linear-gradient(180deg, var(--brand-500), var(--brand-700));
          box-shadow: 0 8px 22px rgba(11,76,140,.28);
        }

        .spinner {
          width: 36px;
          height: 36px;
          margin: 6px auto 10px;
          border-radius: 9999px;
          border: 3px solid rgba(11,76,140,.18);
          border-top-color: var(--brand-500);
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-text {
          margin: 0;
          font-size: 0.95rem;
          color: var(--ink-600);
        }
      `}</style>
    </main>
  );
}
