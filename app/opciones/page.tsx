"use client";

import Image from "next/image";
import Link from "next/link";

export default function OpcionesPage() {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 3,
        padding: "48px 20px 72px",
      }}
    >
      {/* Encabezado */}
      <header style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 className="title">Elige cómo quieres empezar</h1>
        <p className="subtitle">
          Selecciona una de las siguientes opciones:
        </p>
      </header>

      {/* Tarjetas */}
      <section className="cards">
        {/* I-589 */}
        <article className="card">
          <div className="thumb">
            <Image
              src="/i-589 Asilo.jpg"
              alt="Formulario I-589 — Asilo"
              fill
              priority
              style={{ objectFit: "cover" }}
            />
          </div>

          <div className="cardBody">
            <h3 className="cardTitle">Formulario I-589 — Asilo</h3>
            <p className="cardText">
              Completa tu solicitud de asilo paso a paso con validación y
              revisión.
            </p>
            <Link href="/i589" className="cardBtn">
              Empezar I-589
            </Link>
          </div>
        </article>

        {/* I-765 */}
        <article className="card">
          <div className="thumb">
            <Image
              src="/I-765- permiso de trabajo.jpg"
              alt="Permiso de trabajo (I-765)"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>

          <div className="cardBody">
            <h3 className="cardTitle">Permiso de trabajo (I-765)</h3>
            <p className="cardText">
              Solicita tu Employment Authorization con guía clara en cada campo.
            </p>
            <Link href="/i765" className="cardBtn">
              Empezar I-765
            </Link>
          </div>
        </article>

        {/* Traducciones */}
        <article className="card">
          <div className="thumb">
            <Image
              src="/Traducciones - Documentos.jpg"
              alt="Traducción de documentos"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>

          <div className="cardBody">
            <h3 className="cardTitle">Traducción de documentos</h3>
            <p className="cardText">
              Sube tus archivos y obtén traducciones certificadas listas para
              presentar.
            </p>
            <Link href="/translation" className="cardBtn">
              Solicitar traducción
            </Link>
          </div>
        </article>
      </section>

      {/* Estilos locales */}
      <style jsx>{`
        .title {
          font-size: clamp(1.8rem, 2.6vw, 2.4rem);
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px;
          text-shadow: 0 8px 34px rgba(2, 6, 23, 0.16);
        }
        .subtitle {
          color: #334155;
          font-size: clamp(0.95rem, 1.6vw, 1.05rem);
          margin: 0 0 12px;
        }

        .cards {
          margin: 0 auto;
          max-width: 1160px;
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 20px;
        }

        .card {
          grid-column: span 12;
          background: #ffffff;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(2, 6, 23, 0.2);
          display: grid;
          grid-template-rows: 200px auto;
          transition: transform 120ms ease, box-shadow 120ms ease;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 48px rgba(2, 6, 23, 0.26);
        }

        @media (min-width: 880px) {
          .card {
            grid-column: span 4;
          }
        }

        .thumb {
          position: relative;
          width: 100%;
          height: 100%;
          background: #f1f5f9;
        }
        .cardBody {
          padding: 16px 16px 18px;
          color: #0f172a;
          display: grid;
          gap: 8px;
        }
        .cardTitle {
          font-size: 1.1rem;
          font-weight: 800;
          margin: 0 0 2px;
        }
        .cardText {
          font-size: 0.975rem;
          color: #475569;
          min-height: 44px;
          margin: 0 0 4px;
        }
        .cardBtn {
          margin-top: 8px;
          justify-self: start;
          text-decoration: none;
          font-weight: 800;
          font-size: 0.95rem;
          background: #0f172a;
          color: #fff;
          padding: 10px 16px;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(2, 6, 23, 0.22);
          transition: transform 120ms ease, box-shadow 120ms ease,
            background 120ms ease;
        }
        .cardBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(2, 6, 23, 0.28);
          background: #111827;
        }
      `}</style>
    </div>
  );
}
