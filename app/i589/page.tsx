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

/* ===== UI base (reutiliza tu estilo USCIS) ===== */
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

  const goNext = () => router.push('/i589/2');

  return (
    <FormProvider {...form}>
      <main className="uscis-page">
        {/* Header institucional */}
        <header className="uscis-header">
          <div className="uscis-header-inner">
            <h1 className="uscis-title">Formulario I-589</h1>
            <p className="uscis-subtitle">Hoja 1 — Parte A.I · Información sobre usted</p>
          </div>
        </header>

        <div className="uscis-container">
          <div className="uscis-content">
            {/* Identificadores */}
            <Section
              title="Identificadores y nombres (Parte A.I)"
              description="Escriba su información personal tal como aparece en sus documentos."
            >
              <div className="uscis-grid uscis-grid-3">
                <Field label="A-Number"><Input {...register('identifiers.aNumber')} placeholder="A###-###-### o N/A" /></Field>
                <Field label="SSN (si tiene)"><Input {...register('identifiers.ssn')} placeholder="###-##-#### o N/A" /></Field>
                <Field label="USCIS Online Account #"><Input {...register('identifiers.uscisAccount')} placeholder="N/A si no aplica" /></Field>
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

          {/* Navegación */}
          <div className="uscis-nav">
            <div />
            <button
              type="button"
              className="uscis-btn uscis-btn-primary"
              onClick={handleSubmit(goNext)}
              title="Ir a la Hoja 2"
            >
              Continuar a la Hoja 2
            </button>
          </div>
        </div>
      </main>
    </FormProvider>
  );
}
