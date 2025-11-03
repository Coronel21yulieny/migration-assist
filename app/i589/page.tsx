'use client';

import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

/* ========= SCHEMA ========= */
const OptStr = z.string().nullish();
const OptDate = z.string().nullish();

const IdentifiersSchema = z.object({
  aNumber: OptStr,
  ssn: OptStr,
  uscisAccount: OptStr,
  lastName: OptStr,
  firstName: OptStr,
  middleName: OptStr,
  otherNames: OptStr,
}).partial();

const AddressSchema = z.object({
  res_street: OptStr,
  res_apt: OptStr,
  res_city: OptStr,
  res_state: OptStr,
  res_zip: OptStr,
  res_phone: OptStr,
  mail_street: OptStr,
  mail_apt: OptStr,
  mail_city: OptStr,
  mail_state: OptStr,
  mail_zip: OptStr,
  mail_phone: OptStr,
}).partial();

const BioSchema = z.object({
  sex: z.enum(["Male", "Female"] as const).nullish(),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"] as const).nullish(),
  dob: OptDate,
  birth_city: OptStr,
  birth_country: OptStr,
  nationality_present: OptStr,
  nationality_birth: OptStr,
  race_ethnic_tribe: OptStr,
  religion: OptStr,
}).partial();

const StatusTravelSchema = z.object({
  current_status: OptStr,
  i94: OptStr,
  last_left_date: OptDate,
  last_left_place: OptStr,
  last_left_country: OptStr,
  last_arrival_date: OptDate,
  last_arrival_place: OptStr,
  status_at_arrival: OptStr,
  status_expires: OptDate,
  passport_number: OptStr,
  travel_doc_number: OptStr,
  passport_country: OptStr,
  passport_expiration: OptDate,
}).partial();

const LanguagesSchema = z.object({
  native_language: OptStr,
  fluent_english: z.enum(["Yes", "No"] as const).nullish(),
  other_languages: OptStr,
}).partial();

const Page1Schema = z.object({
  identifiers: IdentifiersSchema.optional(),
  address: AddressSchema.optional(),
  bio: BioSchema.optional(),
  statusTravel: StatusTravelSchema.optional(),
  languages: LanguagesSchema.optional(),
});

type FormData = z.infer<typeof Page1Schema>;

/* ========= UI ========= */
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

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white/85 border border-white/40 shadow-lg p-6 backdrop-blur-md">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}

/* ========= PASOS ========= */
const steps = [
  { key: "identifiers", label: "Identificación" },
  { key: "address", label: "Direcciones" },
  { key: "bio", label: "Datos biográficos" },
  { key: "statusTravel", label: "Estatus y viaje" },
  { key: "languages", label: "Idiomas" },
] as const;

/* ========= PÁGINA ========= */
export default function I589Page1() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  const methods = useForm<FormData>({
    resolver: zodResolver(Page1Schema),
    mode: "onChange",
    defaultValues: {
      identifiers: {},
      address: {},
      bio: {},
      statusTravel: {},
      languages: {},
    },
  });

  const { register, handleSubmit } = methods;

  const onSubmit = (data: FormData) => {
    console.log("I-589 Page 1 DATA:", data);
    router.push("/i589/2");
  };

  function renderStep() {
    const k = steps[current].key;

    if (k === "identifiers") {
      return (
        <Section
          title="Identificadores y nombres (Part A.I)"
          description="Escribe tu información personal tal como aparece en tus documentos."
        >
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="A-Number">
              <input {...register("identifiers.aNumber")} className="input" placeholder="A123-456-789 o N/A" />
            </Field>
            <Field label="U.S. Social Security Number">
              <input {...register("identifiers.ssn")} className="input" placeholder="###-##-#### o N/A" />
            </Field>
            <Field label="USCIS Online Account Number">
              <input {...register("identifiers.uscisAccount")} className="input" placeholder="N/A si no aplica" />
            </Field>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-2">
            <Field label="Apellido"><input {...register("identifiers.lastName")} className="input" /></Field>
            <Field label="Nombre"><input {...register("identifiers.firstName")} className="input" /></Field>
            <Field label="Segundo nombre"><input {...register("identifiers.middleName")} className="input" /></Field>
          </div>
          <Field label="Alias / otros nombres"><input {...register("identifiers.otherNames")} className="input" /></Field>
        </Section>
      );
    }

    if (k === "address") {
      return (
        <Section title="Direcciones en EE. UU." description="Si tienes dirección de residencia y de envío distintas, llena ambas.">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Calle"><input {...register("address.res_street")} className="input" /></Field>
            <Field label="Ciudad"><input {...register("address.res_city")} className="input" /></Field>
            <Field label="Estado"><input {...register("address.res_state")} className="input" /></Field>
            <Field label="Código postal"><input {...register("address.res_zip")} className="input" /></Field>
          </div>
        </Section>
      );
    }

    if (k === "bio") {
      return (
        <Section title="Datos biográficos">
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Sexo">
              <select {...register("bio.sex")} className="input">
                <option value="">Seleccione</option>
                <option value="Male">Masculino</option>
                <option value="Female">Femenino</option>
              </select>
            </Field>
            <Field label="Estado civil">
              <select {...register("bio.maritalStatus")} className="input">
                <option value="">Seleccione</option>
                <option value="Single">Soltero(a)</option>
                <option value="Married">Casado(a)</option>
                <option value="Divorced">Divorciado(a)</option>
                <option value="Widowed">Viudo(a)</option>
              </select>
            </Field>
            <Field label="Fecha de nacimiento">
              <input {...register("bio.dob")} className="input" placeholder="mm/dd/yyyy" />
            </Field>
          </div>
        </Section>
      );
    }

    if (k === "statusTravel") {
      return (
        <Section title="Estatus migratorio y viajes">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Estatus actual"><input {...register("statusTravel.current_status")} className="input" /></Field>
            <Field label="Número I-94"><input {...register("statusTravel.i94")} className="input" /></Field>
          </div>
        </Section>
      );
    }

    return (
      <Section title="Idiomas">
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Idioma nativo"><input {...register("languages.native_language")} className="input" /></Field>
          <Field label="¿Habla inglés?">
            <div className="flex gap-4">
              <label><input type="radio" value="Yes" {...register("languages.fluent_english")} /> Sí</label>
              <label><input type="radio" value="No" {...register("languages.fluent_english")} /> No</label>
            </div>
          </Field>
          <Field label="Otros idiomas"><input {...register("languages.other_languages")} className="input" /></Field>
        </div>
      </Section>
    );
  }

  return (
    <FormProvider {...methods}>
      {/* SIN fondos locales: el fondo lo pone app/i589/layout.tsx */}
      <main className="flex flex-col gap-6">
        <header className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Formulario I-589 — Página 1</h1>
          <p className="text-sm text-slate-700 mt-1">
            Todos los campos son opcionales. Si no aplica, deja vacío o usa <b>N/A</b>.
          </p>
        </header>

        {/* Stepper */}
        <div className="flex justify-center gap-3 flex-wrap bg-white/70 backdrop-blur rounded-2xl p-2 border border-white/60 shadow-sm">
          {steps.map((s, idx) => {
            const active = idx === current;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setCurrent(idx)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition
                  ${active ? "bg-gradient-to-r from-blue-700 to-red-600 text-white shadow-md"
                           : "text-slate-700 hover:bg-white/80"}`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Contenido del paso */}
        {renderStep()}

        {/* Navegación */}
        <div className="flex items-center justify-between pt-4 pb-6">
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="btn-outline disabled:opacity-40"
          >
            Atrás
          </button>
          <div className="flex gap-2">
            {current < steps.length - 1 && (
              <button type="button" onClick={() => setCurrent((c) => c + 1)} className="btn-outline">
                Siguiente sección
              </button>
            )}
            <button type="button" onClick={handleSubmit(onSubmit)} className="btn">
              Ir a Página 2
            </button>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgba(148, 163, 184, 0.4);
          border-radius: 0.75rem;
          padding: 0.55rem 0.9rem;
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
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
          padding: 0.55rem 1.2rem;
          border-radius: 9999px;
          font-size: 0.9rem;
          font-weight: 500;
          box-shadow: 0 4px 15px rgba(30, 58, 138, 0.25);
          transition: all 0.2s ease;
        }
        .btn:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(30,58,138,.35); }
        .btn-outline {
          background: rgba(255, 255, 255, 0.85);
          color: #0f172a;
          border: 1px solid rgba(148, 163, 184, 0.5);
          padding: 0.55rem 1.2rem;
          border-radius: 9999px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        .btn-outline:hover { background: white; border-color: #2563eb; }
      `}</style>
    </FormProvider>
  );
}
