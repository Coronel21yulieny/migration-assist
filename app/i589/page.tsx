'use client';

import React, { useEffect, useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { authedFetch } from "@/lib/auth";

/* ===== util debounce para autosave ===== */
function useDebouncedCallback<T extends (...args: any[]) => any>(fn: T, delay = 900) {
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useMemo(
    () => (...args: Parameters<T>) => {
      if (ref.current) clearTimeout(ref.current);
      ref.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

/* ===== UI base (mismo estilo USCIS que tu página 2) ===== */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="uscis-field">
      <label className="uscis-label">
        {label} <span className="uscis-hint">(Opcional)</span>
      </label>
      {children}
    </div>
  );
}
function Section({ title, description, children }:{
  title:string; description?:string; children:React.ReactNode;
}) {
  return (
    <section className="uscis-section">
      <h2 className="uscis-section-title">{title}</h2>
      {description && <p className="uscis-section-desc">{description}</p>}
      <div className="uscis-section-body">{children}</div>
    </section>
  );
}
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) =>
  <input {...p} className={`uscis-input ${p.className||''}`} />;
const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) =>
  <textarea {...p} className={`uscis-input uscis-textarea ${p.className||''}`} />;

/* ===== Stepper labels iguales a la página 2, incluyendo la Hoja 1 ===== */
const STEP_LABELS: Array<{ n: number; label: string }> = [
  { n: 1, label: "Parte A.I — Información" },
  { n: 2, label: "Parte A.II — Cónyuge" },
  { n: 3, label: "Parte A.II — Hijo/a 1" },
  { n: 4, label: "Parte A.II — Hijo/a 2" },
  { n: 5, label: "Parte A.II — Hijo/a 3" },
  { n: 6, label: "Parte A.II — Hijo/a 4" },
  { n: 7, label: "Parte B — Domicilios" },
  { n: 8, label: "Parte B — Empleos" },
  { n: 9, label: "Parte B — Estudios" },
  { n: 10, label: "Parte B — Familia" },
  { n: 11, label: "Parte C — Solicitud" },
  { n: 12, label: "Parte D — Declaración y firma" },
  { n: 13, label: "Enviar" },
];
const ALL_STEPS = STEP_LABELS.map(s => s.n);

export default function I589Page1() {
  const router = useRouter();
  const form = useForm({ mode: "onChange" });
  const { register, watch, reset, handleSubmit } = form;

  // 1) Cargar snapshot local al entrar
  useEffect(() => {
    try {
      const raw = localStorage.getItem('i589_step_1');
      if (raw) reset(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Autosave local + backend
  const autosaveServer = useDebouncedCallback(async (patch:any) => {
    try {
      await authedFetch("/api/cases/i589/save", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ step: 1, patch }),
      });
    } catch {}
  }, 900);

  useEffect(() => {
    const sub = watch((data) => {
      try {
        localStorage.setItem('i589_step_1', JSON.stringify(data));
        autosaveServer(data);
      } catch {}
    });
    return () => sub.unsubscribe();
  }, [watch, autosaveServer]);

  const go = (n: number) => router.push(`/i589/${n}`);
  const goNext = () => go(2);

  /* ===== progreso + etiqueta activa (igual que en página 2) ===== */
  const stepNum = 1;
  const idx = Math.max(0, Math.min(ALL_STEPS.length - 1, ALL_STEPS.indexOf(stepNum)));
  const progressPct = ((idx + 1) / ALL_STEPS.length) * 100;
  const currentLabel = STEP_LABELS.find(s => s.n === stepNum)?.label ?? `Hoja ${stepNum}`;

  return (
    <FormProvider {...form}>
      <main className="uscis-page">
        {/* Header institucional */}
        <header className="uscis-header">
          <div className="uscis-header-inner">
            <h1 className="uscis-title">Formulario I-589</h1>
            <p className="uscis-subtitle">{currentLabel} · Completa la información con precisión.</p>
          </div>
        </header>

        {/* Contenedor central */}
        <div className="uscis-container">
          {/* Progress bar */}
          <div className="uscis-progress">
            <div className="uscis-progress-bar" style={{ width: `${progressPct}%` }} />
          </div>

          {/* Stepper con las mismas “pastillas” */}
          <nav className="uscis-steps uscis-steps-named">
            {STEP_LABELS.map(({ n, label }) => {
              const active = n === stepNum;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => go(n)}
                  className={`uscis-step ${active ? "is-active" : ""}`}
                  title={`Ir a: ${label}`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Contenido (tus campos) */}
          <div className="uscis-content">
            {/* Identificadores */}
            <Section
              title="Identificadores y nombres (Parte A.I)"
              description="Escriba su información personal tal como aparece en sus documentos."
            >
              <div className="uscis-grid uscis-grid-3">
                <Field label="A-Number">
                  <Input {...register('identifiers.aNumber')} placeholder="A###-###-### o N/A" />
                </Field>
                <Field label="SSN (si tiene)">
                  <Input {...register('identifiers.ssn')} placeholder="###-##-#### o N/A" />
                </Field>
                <Field label="USCIS Online Account #">
                  <Input {...register('identifiers.uscisAccount')} placeholder="N/A si no aplica" />
                </Field>
              </div>

              <div className="uscis-grid uscis-grid-3">
                <Field label="Apellido"><Input {...register('identifiers.lastName')} /></Field>
                <Field label="Primer nombre"><Input {...register('identifiers.firstName')} /></Field>
                <Field label="Segundo nombre"><Input {...register('identifiers.middleName')} /></Field>
              </div>

              <Field label="Alias / otros nombres">
                <Input {...register('identifiers.otherNames')} placeholder="Incluya apodos, nombres anteriores, etc." />
              </Field>
            </Section>

            {/* Direcciones en EE. UU. */}
            <Section title="Direcciones en Estados Unidos" description="Su dirección física y de envío (si son distintas).">
              <div className="uscis-box">
                <p className="uscis-note"><b>Dirección de residencia</b></p>
                <div className="uscis-grid uscis-grid-3">
                  <Field label="Calle y número"><Input {...register('address.res_street')} /></Field>
                  <Field label="Ciudad"><Input {...register('address.res_city')} /></Field>
                  <Field label="Estado"><Input {...register('address.res_state')} /></Field>
                </div>
                <div className="uscis-grid uscis-grid-3">
                  <Field label="Código postal"><Input {...register('address.res_zip')} /></Field>
                  <Field label="Teléfono"><Input {...register('address.res_phone')} placeholder="(###) ###-####" /></Field>
                </div>
              </div>

              <div className="uscis-box">
                <p className="uscis-note"><b>Dirección de envío</b> (si es distinta)</p>
                <div className="uscis-grid uscis-grid-3">
                  <Field label="Calle y número"><Input {...register('address.mail_street')} /></Field>
                  <Field label="Ciudad"><Input {...register('address.mail_city')} /></Field>
                  <Field label="Estado"><Input {...register('address.mail_state')} /></Field>
                </div>
                <div className="uscis-grid uscis-grid-3">
                  <Field label="Código postal"><Input {...register('address.mail_zip')} /></Field>
                  <Field label="Teléfono"><Input {...register('address.mail_phone')} placeholder="(###) ###-####" /></Field>
                </div>
              </div>
            </Section>

            {/* Datos biográficos */}
            <Section title="Datos biográficos">
              <div className="uscis-grid uscis-grid-3">
                <Field label="Sexo (M/F)"><Input {...register('bio.sex')} placeholder="Male / Female" /></Field>
                <Field label="Estado civil"><Input {...register('bio.maritalStatus')} placeholder="Single / Married / Divorced / Widowed" /></Field>
                <Field label="Fecha de nacimiento"><Input {...register('bio.dob')} placeholder="mm/dd/yyyy" /></Field>
              </div>
              <div className="uscis-grid uscis-grid-3">
                <Field label="Ciudad de nacimiento"><Input {...register('bio.birth_city')} /></Field>
                <Field label="País de nacimiento"><Input {...register('bio.birth_country')} /></Field>
                <Field label="Religión (si desea)"><Input {...register('bio.religion')} /></Field>
              </div>
              <div className="uscis-grid uscis-grid-3">
                <Field label="Nacionalidad actual"><Input {...register('bio.nationality_present')} /></Field>
                <Field label="Nacionalidad al nacer"><Input {...register('bio.nationality_birth')} /></Field>
                <Field label="Raza/Grupo étnico/Tribu"><Input {...register('bio.race_ethnic_tribe')} /></Field>
              </div>
            </Section>

            {/* Estatus y viaje */}
            <Section title="Estatus migratorio y viaje">
              <div className="uscis-grid uscis-grid-3">
                <Field label="Estatus actual en EE. UU."><Input {...register('statusTravel.current_status')} placeholder="B2 / Parole / TPS / N/A" /></Field>
                <Field label="I-94 #"><Input {...register('statusTravel.i94')} placeholder="N/A si no aplica" /></Field>
                <Field label="Estatus expira (mm/dd/yyyy)"><Input {...register('statusTravel.status_expires')} placeholder="mm/dd/yyyy" /></Field>
              </div>
              <div className="uscis-grid uscis-grid-3">
                <Field label="Fecha última salida"><Input {...register('statusTravel.last_left_date')} placeholder="mm/dd/yyyy" /></Field>
                <Field label="Lugar/País de salida"><Input {...register('statusTravel.last_left_place')} placeholder="Ciudad / Aeropuerto · País" /></Field>
                <Field label="País al que salió"><Input {...register('statusTravel.last_left_country')} /></Field>
              </div>
              <div className="uscis-grid uscis-grid-3">
                <Field label="Fecha última llegada"><Input {...register('statusTravel.last_arrival_date')} placeholder="mm/dd/yyyy" /></Field>
                <Field label="Lugar de llegada"><Input {...register('statusTravel.last_arrival_place')} placeholder="Ciudad/Estado o Puerto/Aeropuerto" /></Field>
                <Field label="Estatus al llegar"><Input {...register('statusTravel.status_at_arrival')} placeholder="B2 / Parole / N/A" /></Field>
              </div>
              <div className="uscis-grid uscis-grid-3">
                <Field label="Pasaporte #"><Input {...register('statusTravel.passport_number')} /></Field>
                <Field label="País del pasaporte"><Input {...register('statusTravel.passport_country')} /></Field>
                <Field label="Pasaporte vence (mm/dd/yyyy)"><Input {...register('statusTravel.passport_expiration')} placeholder="mm/dd/yyyy" /></Field>
              </div>
              <div className="uscis-grid uscis-grid-2">
                <Field label="Documento de viaje # (si distinto)"><Input {...register('statusTravel.travel_doc_number')} /></Field>
              </div>
            </Section>

            {/* Idiomas */}
            <Section title="Idiomas">
              <div className="uscis-grid uscis-grid-3">
                <Field label="Idioma nativo"><Input {...register('languages.native_language')} /></Field>
                <Field label="¿Habla inglés?"><Input {...register('languages.fluent_english')} placeholder="Yes / No" /></Field>
                <Field label="Otros idiomas"><Input {...register('languages.other_languages')} /></Field>
              </div>
            </Section>
          </div>

          {/* Navegación inferior (mismo patrón) */}
          <div className="uscis-nav">
            <button
              type="button"
              className="uscis-btn uscis-btn-secondary"
              disabled
              title="Inicio"
            >
              Anterior
            </button>
            <div className="uscis-nav-right">
              <button
                type="button"
                className="uscis-btn uscis-btn-secondary"
                onClick={() => go(2)}
              >
                Siguiente sección
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Si tu app NO carga los estilos globales desde la página 2, deja este bloque.
          Si ya los tienes globales, puedes eliminarlo para evitar duplicación. */}
      <style jsx global>{`
        :root {
          --uscis-blue: #0b57a2;
          --ink: #0f172a;
          --ink-2: #334155;
          --line: #e5e7eb;
          --bg: #f6f9fc;
          --card: #ffffff;
        }
        html, body { padding: 0; margin: 0; }
        body { background: var(--bg); color: var(--ink); font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }

        .uscis-page { min-height: 100vh; display: flex; flex-direction: column; }

        .uscis-header { background: linear-gradient(90deg, var(--uscis-blue), #194f87); color: #fff; }
        .uscis-header-inner { max-width: 960px; margin: 0 auto; padding: 20px 16px; text-align: center; }
        .uscis-title { margin: 0; font-weight: 700; font-size: 28px; letter-spacing: -0.2px; }
        .uscis-subtitle { margin: 6px 0 0; opacity: 0.95; font-size: 14px; }

        .uscis-container { max-width: 960px; margin: 20px auto; padding: 0 16px; }

        .uscis-progress {
          height: 8px; background: #e6eef8; border-radius: 999px; overflow: hidden;
          margin: 12px auto 18px; max-width: 800px;
        }
        .uscis-progress-bar { height: 100%; background: var(--uscis-blue); width: 0%; transition: width .25s ease; }

        .uscis-steps {
          display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;
          margin: 0 auto 16px; max-width: 800px;
        }
        .uscis-steps-named .uscis-step {
          padding: 8px 14px;
          border-radius: 12px;
          font-size: 13px;
          white-space: nowrap;
        }
        .uscis-step {
          appearance: none; border: 1px solid #cdd9ea; background: #fff;
          padding: 6px 10px; border-radius: 10px; font-size: 13px; color: var(--ink-2); cursor: pointer;
        }
        .uscis-step.is-active {
          background: linear-gradient(90deg, #164a96, #b11d2a); color: #fff; border-color: transparent;
          box-shadow: 0 1px 10px rgba(0,0,0,.08);
        }

        .uscis-content {
          background: var(--card); border: 1px solid #e9eef6; box-shadow: 0 6px 24px rgba(2,48,94,.06);
          border-radius: 16px; padding: 20px; margin: 0 auto 18px; max-width: 800px;
        }

        .uscis-section { margin-bottom: 14px; }
        .uscis-section-title { font-size: 18px; font-weight: 700; margin: 0 0 6px; }
        .uscis-section-desc { margin: 0 0 12px; color: var(--ink-2); font-size: 14px; }
        .uscis-section-body { display: grid; gap: 12px; }

        .uscis-grid { display: grid; gap: 12px; }
        .uscis-grid.uscis-grid-2 { grid-template-columns: 1fr; }
        .uscis-grid.uscis-grid-3 { grid-template-columns: 1fr; }
        .uscis-grid.uscis-grid-4 { grid-template-columns: 1fr; }
        @media (min-width: 780px) {
          .uscis-grid.uscis-grid-2 { grid-template-columns: 1fr 1fr; }
          .uscis-grid.uscis-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
          .uscis-grid.uscis-grid-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
        }

        .uscis-field { display: flex; flex-direction: column; gap: 6px; }
        .uscis-label { font-size: 13px; font-weight: 600; color: var(--ink); }
        .uscis-hint { color: #6b7280; font-size: 11px; font-weight: 400; margin-left: 4px; }

        .uscis-input {
          width: 100%; border: 1px solid #cdd9ea; border-radius: 10px;
          padding: 10px 12px; font-size: 14px; background: #fff;
          transition: box-shadow .15s ease, border-color .15s ease;
        }
        .uscis-input:focus {
          outline: none; border-color: var(--uscis-blue);
          box-shadow: 0 0 0 3px rgba(11, 87, 162, 0.15); background: #fff;
        }
        .uscis-textarea { min-height: 96px; resize: vertical; }

        .uscis-radio-inline { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
        .uscis-radio { display: inline-flex; align-items: center; gap: 8px; }

        .uscis-box {
          background: #f8fbff;
          border: 1px solid #e1eaf7;
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 12px;
        }
        .uscis-innerbox {
          background: #ffffff;
          border: 1px dashed #cdd9ea;
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 12px;
        }
        .uscis-note { margin: 0 0 10px; font-size: 13px; color: #334155; }

        .uscis-nav {
          display: flex; align-items: center; justify-content: space-between;
          max-width: 800px; margin: 0 auto 40px; gap: 12px;
        }
        .uscis-nav-right { display: flex; gap: 10px; }

        .uscis-btn {
          appearance: none; border: 1px solid #cdd9ea; padding: 10px 16px; border-radius: 999px;
          font-size: 14px; cursor: pointer;
          transition: transform .1s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
        }
        .uscis-btn:disabled { opacity: .5; cursor: not-allowed; }
        .uscis-btn-secondary { background: #fff; color: #0f172a; }
        .uscis-btn-secondary:hover { background: #f8fafc; border-color: var(--uscis-blue); }
        .uscis-btn-primary {
          background: linear-gradient(90deg, #1e3a8a 0%, #b91c1c 100%); color: #fff; border-color: transparent;
          box-shadow: 0 6px 18px rgba(30,58,138,.25);
        }
        .uscis-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 26px rgba(30,58,138,.35); }
      `}</style>
    </FormProvider>
  );
}
