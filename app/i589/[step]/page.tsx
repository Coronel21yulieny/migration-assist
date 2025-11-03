'use client';

import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

/* ========= Componentes UI ========= */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-800">
        {label} <span className="text-[11px] text-slate-400">(Opcional)</span>
      </label>
      {children}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white/85 border border-white/40 shadow-lg p-6 backdrop-blur-md">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}

const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className={`input ${p.className || ""}`} />
);

const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className={`input min-h-[90px] ${p.className || ""}`} />
);

/* ========= Formularios por paso ========= */
type StepRenderer = (register: any) => React.ReactNode;

/* CÓNYUGE */
const renderSpouse: StepRenderer = (register) => (
  <Section title="Datos del cónyuge" description="Solo si tienes cónyuge o pareja que quieras incluir en tu caso.">
    <div className="grid md:grid-cols-3 gap-4">
      <Field label="Apellido"><Input {...register('spouse.last_name')} /></Field>
      <Field label="Primer nombre"><Input {...register('spouse.first_name')} /></Field>
      <Field label="Segundo nombre"><Input {...register('spouse.middle_name')} /></Field>
    </div>
    <div className="grid md:grid-cols-4 gap-4">
      <Field label="A-Number"><Input {...register('spouse.a_number')} placeholder="A###-###-###" /></Field>
      <Field label="Nacimiento (mm/dd/yyyy)"><Input {...register('spouse.dob')} placeholder="mm/dd/yyyy" /></Field>
      <Field label="Ciudad y país de nacimiento"><Input {...register('spouse.birth_city_country')} /></Field>
      <Field label="Nacionalidad"><Input {...register('spouse.nationality')} /></Field>
    </div>
    <div className="grid md:grid-cols-3 gap-4">
      <Field label="Pasaporte #"><Input {...register('spouse.passport_number')} /></Field>
      <Field label="País emisor"><Input {...register('spouse.passport_country')} /></Field>
      <Field label="Vence (mm/dd/yyyy)"><Input {...register('spouse.passport_expiry')} placeholder="mm/dd/yyyy" /></Field>
    </div>
    <Field label="¿Vendrá con usted?"><Input {...register('spouse.will_accompany')} placeholder="Yes / No / Desconoce" /></Field>
  </Section>
);

/* HIJOS */
const renderChild = (n: number): StepRenderer => (register) => (
  <Section title={`Datos del hijo/a ${n}`}>
    <div className="grid md:grid-cols-3 gap-4">
      <Field label="Apellido"><Input {...register(`children.${n}.last_name`)} /></Field>
      <Field label="Primer nombre"><Input {...register(`children.${n}.first_name`)} /></Field>
      <Field label="Segundo nombre"><Input {...register(`children.${n}.middle_name`)} /></Field>
    </div>
    <div className="grid md:grid-cols-4 gap-4">
      <Field label="Nacimiento (mm/dd/yyyy)"><Input {...register(`children.${n}.dob`)} placeholder="mm/dd/yyyy" /></Field>
      <Field label="Ciudad y país"><Input {...register(`children.${n}.birth_city_country`)} /></Field>
      <Field label="Nacionalidad"><Input {...register(`children.${n}.nationality`)} /></Field>
      <Field label="A-Number"><Input {...register(`children.${n}.a_number`)} placeholder="A###-###-###" /></Field>
    </div>
  </Section>
);

/* HISTORIAL */
const renderHistory: StepRenderer = (register) => (
  <Section title="Historial: direcciones, empleos y estudios">
    <Field label="Última dirección fuera de EE. UU."><Input {...register('history.last_foreign_address')} /></Field>
    <Field label="Empleo más reciente"><Input {...register('history.last_employment')} /></Field>
    <Field label="Estudios más recientes"><Input {...register('history.last_study')} /></Field>
  </Section>
);

/* MOTIVOS Y DETALLES DEL CASO */
const renderClaimMain: StepRenderer = (register) => (
  <Section title="Motivo principal de asilo">
    <Textarea {...register('claim.summary')} placeholder="Explique brevemente las razones por las cuales solicita asilo..." />
  </Section>
);

const renderPastHarm: StepRenderer = (register) => (
  <Section title="Daños sufridos o amenazas">
    <Textarea {...register('claim.past_harm')} placeholder="Describa los daños, amenazas o torturas sufridas..." />
  </Section>
);

const renderFutureRisk: StepRenderer = (register) => (
  <Section title="Riesgo futuro y protección">
    <Textarea {...register('claim.future_risk')} placeholder="¿Qué cree que sucedería si regresa a su país?" />
    <Textarea {...register('claim.protection_attempts')} placeholder="¿Buscó ayuda o protección? ¿Qué ocurrió?" />
  </Section>
);

/* INFORMACIÓN ADICIONAL Y CONTACTO */
const renderOtherInfo: StepRenderer = (register) => (
  <Section title="Información adicional">
    <Textarea {...register('other.affiliations')} placeholder="Grupos, partidos, iglesias o afiliaciones." />
    <Textarea {...register('other.arrests')} placeholder="Arrestos, condenas o procesos (si aplica)." />
    <Textarea {...register('other.travels')} placeholder="Viajes a terceros países (si aplica)." />
  </Section>
);

const renderSignature: StepRenderer = (register) => (
  <Section title="Contacto y firma">
    <div className="grid md:grid-cols-2 gap-4">
      <Field label="Teléfono"><Input {...register('contact.phone')} placeholder="(###) ###-####" /></Field>
      <Field label="Correo electrónico"><Input {...register('contact.email')} placeholder="you@email.com" /></Field>
    </div>
    <Field label="Dirección de envío"><Input {...register('contact.mailing')} placeholder="Calle, Ciudad, Estado, ZIP" /></Field>
    <Field label="Lugar y fecha"><Input {...register('contact.place_date')} placeholder="Ciudad, Estado — mm/dd/yyyy" /></Field>
  </Section>
);

/* MAPEO DE PASOS */
const RENDERERS: Record<number, StepRenderer> = {
  2: renderSpouse,
  3: renderChild(1),
  4: renderChild(2),
  5: renderChild(3),
  6: renderChild(4),
  7: renderHistory,
  8: renderClaimMain,
  9: renderPastHarm,
  10: renderFutureRisk,
  11: renderOtherInfo,
  12: renderSignature,
};

/* ========= Página dinámica ========= */
export default function I589StepPage({ params }: { params: { step: string } }) {
  const router = useRouter();
  const stepNum = Number(params.step);
  const form = useForm({ mode: "onChange" });
  const { register, handleSubmit, watch } = form;

  useEffect(() => {
    const sub = watch((data) => {
      try {
        localStorage.setItem(`i589_step_${stepNum}`, JSON.stringify(data));
      } catch {}
    });
    return () => sub.unsubscribe();
  }, [watch, stepNum]);

  const go = (n: number) => router.push(`/i589/${n}`);
  const onSubmit = () => { if (stepNum < 12) go(stepNum + 1); };

  const render = RENDERERS[stepNum];

  return (
    <FormProvider {...form}>
      <main className="max-w-5xl mx-auto grid gap-6">
        <header className="grid gap-1 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Formulario I-589 — Paso {stepNum}
          </h1>
          <p className="text-sm text-slate-700">
            Todos los campos son opcionales. Completa solo lo que aplique.
          </p>
        </header>

        {render ? render(register) : <p>No se encontró contenido para este paso.</p>}

        <div className="flex items-center justify-between pt-4 pb-8">
          <button
            type="button"
            onClick={() => go(stepNum > 2 ? stepNum - 1 : 2)}
            className="btn-outline"
          >
            Anterior
          </button>
          {stepNum < 12 ? (
            <button type="button" onClick={handleSubmit(onSubmit)} className="btn">
              Siguiente página
            </button>
          ) : (
            <button type="button" onClick={() => router.push('/')} className="btn">
              Terminar
            </button>
          )}
        </div>
      </main>

      {/* ==== estilos globales ==== */}
      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgba(148, 163, 184, 0.4);
          border-radius: 0.75rem;
          padding: 0.55rem 0.9rem;
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.2s ease;
        }
        .input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
          background: white;
        }
        .btn {
          background: linear-gradient(90deg, #1e3a8a 0%, #b91c1c 100%);
          color: #fff;
          padding: 0.55rem 1.4rem;
          border-radius: 9999px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .btn:hover { transform: scale(1.03); box-shadow: 0 6px 20px rgba(30,58,138,.35); }
        .btn-outline {
          background: rgba(255, 255, 255, 0.9);
          color: #0f172a;
          border: 1px solid rgba(148, 163, 184, 0.6);
          padding: 0.55rem 1.4rem;
          border-radius: 9999px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        .btn-outline:hover {
          background: white;
          border-color: #2563eb;
        }
      `}</style>
    </FormProvider>
  );
}
