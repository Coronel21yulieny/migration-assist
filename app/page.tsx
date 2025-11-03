"use client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        color: "#0f172a",
      }}
    >
      {/* 🗽 Fondo */}
      <Image
        src="/usa-hero.jpg"
        alt="USA Hero"
        fill
        priority
        style={{
          objectFit: "cover",
          objectPosition: "top center",
          filter: "brightness(0.9) contrast(0.95) saturate(0.9)",
        }}
      />

      {/* 🌫️ ÚNICA capa translúcida (uniforme, sin viñeta) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(255, 255, 255, 0.40)", // más transparente para que se vea la estatua
          backdropFilter: "blur(3px)",
          zIndex: 2,
        }}
      />

      {/* 💬 Contenido (sin fondo, sin sombras de caja) */}
      <section
        style={{
          position: "relative",
          zIndex: 3, // por encima de la capa translúcida
          padding: "40px 20px",
          maxWidth: "1000px",
          background: "transparent",
          border: "none",
          boxShadow: "none",
        }}
      >
        {/* 🇺🇸 Títulos rojo/azul (sin degradado gris, sin cuadro) */}
        <h1
          className="flagSolid"
          style={{
            margin: "0 0 10px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: 1,
            lineHeight: 1.05,
            fontSize: "clamp(2.4rem, 5vw, 4.5rem)",
          }}
        >
          BIENVENIDO A
        </h1>

        <h2
          className="flagSolid"
          style={{
            margin: "10px 0 20px",
            fontWeight: 900,
            letterSpacing: 0.5,
            lineHeight: 1.05,
            fontSize: "clamp(2.8rem, 6vw, 5rem)",
            fontStyle: "italic",
          }}
        >
          MIGRATION ASSIST
        </h2>

        {/* ✨ Frase inspiradora */}
        <p
          style={{
            margin: "0 auto 30px",
            maxWidth: 800,
            fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
            color: "#111",
            fontFamily: `'Georgia', 'Times New Roman', serif`,
            fontStyle: "italic",
            lineHeight: 1.7,
            textShadow: "0 1px 6px rgba(255,255,255,0.6)",
          }}
        >
          “Un futuro sin fronteras comienza con el primer paso. Estamos aquí para
          guiarte con claridad y confianza.”
        </p>

        {/* 🔵 Botón principal */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <Link
            href="/opciones"
            style={{
              background: "linear-gradient(90deg, #1e3a8a, #3b82f6, #1d4ed8)",
              color: "#fff",
              padding: "16px 30px",
              borderRadius: 25,
              fontWeight: 800,
              textDecoration: "none",
              fontSize: "1.1rem",
              letterSpacing: "0.5px",
              boxShadow:
                "0 0 20px rgba(59,130,246,0.4), 0 0 40px rgba(37,99,235,0.25), inset 0 0 10px rgba(255,255,255,0.3)",
              transition: "all 0.25s ease",
              textTransform: "uppercase",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 30px rgba(37,99,235,0.55), 0 0 60px rgba(30,64,175,0.4), inset 0 0 15px rgba(255,255,255,0.4)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 20px rgba(59,130,246,0.4), 0 0 40px rgba(37,99,235,0.25), inset 0 0 10px rgba(255,255,255,0.3)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            ATREVETE A HACER REALIDAD TU SUEÑO AMERICANO
          </Link>
        </div>
      </section>

      {/* 🎨 Letras ROJO/AZUL sólidos + ligero blend entre ambos + destellos MUY sutiles
          (sin viñeta, sin cuadros, sin degradados grises) */}
      <style jsx global>{`
        .flagSolid {
          background-image:
            linear-gradient(
              90deg,
              #0a2a8a 0%,
              #0a2a8a 49%,
              #e60019 51%,
              #e60019 100%
            ),
            radial-gradient(
              1.8px 1.8px at 30% 40%,
              rgba(255, 255, 255, 0.18),
              rgba(255, 255, 255, 0) 55%
            ),
            radial-gradient(
              1.6px 1.6px at 75% 65%,
              rgba(255, 255, 255, 0.16),
              rgba(255, 255, 255, 0) 55%
            );
          background-size: 100% 100%, 180% 180%, 160% 160%;
          background-position: center, 10% 20%, 70% 60%;
          background-repeat: no-repeat;

          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent !important;

          /* Sombra MUY discreta solo para definición de borde */
          text-shadow: 0 0 1px rgba(0, 0, 0, 0.08);
        }

        @media (prefers-reduced-motion: reduce) {
          .flagSolid {
            animation: none !important;
          }
        }

        /* Asegura que no haya márgenes del body que simulen “bordes” o “cuadros” */
        html, body {
          margin: 0;
          padding: 0;
          background: transparent;
        }
      `}</style>
    </main>
  );
}
