'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { authedFetch } from "@/lib/auth"; // <-- usa headers con x-user-id

/* ========= Helper robusto para paths ========= */
const path = (...segs: Array<string | number>) => segs.join(".");

/* ========= Tipos para los renderers ========= */
type StepArgs = { register: any; watch: any; control: any };
type StepRenderer = (args: StepArgs) => React.ReactNode;

/* ========= UI base (estilo USCIS) ========= */
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
    <section className="uscis-section">
      <h2 className="uscis-section-title">{title}</h2>
      {description && <p className="uscis-section-desc">{description}</p>}
      <div className="uscis-section-body">{children}</div>
    </section>
  );
}

const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className={`uscis-input ${p.className || ""}`} />
);

const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className={`uscis-input uscis-textarea ${p.className || ""}`} />
);

function RadioInline({
  name,
  register,
  options,
}: {
  name: string;
  register: any;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="uscis-radio-inline">
      {options.map((opt) => (
        <label key={opt.value} className="uscis-radio">
          <input type="radio" value={opt.value} {...register(name)} /> {opt.label}
        </label>
      ))}
    </div>
  );
}

/* ========= PARTE A.II — CÓNYUGE ========= */
const renderSpouse: StepRenderer = ({ register }) => (
  <Section title="Datos del cónyuge" description="Parte A.II — Información sobre el cónyuge (si aplica).">
    <div className="uscis-grid uscis-grid-3">
      <Field label="Apellido"><Input {...register('spouse.last_name')} /></Field>
      <Field label="Primer nombre"><Input {...register('spouse.first_name')} /></Field>
      <Field label="Segundo nombre"><Input {...register('spouse.middle_name')} /></Field>
    </div>
    <div className="uscis-grid uscis-grid-4">
      <Field label="A-Number"><Input {...register('spouse.a_number')} placeholder="A###-###-###" /></Field>
      <Field label="Nacimiento (mm/dd/yyyy)"><Input {...register('spouse.dob')} placeholder="mm/dd/yyyy" /></Field>
      <Field label="Ciudad y país de nacimiento"><Input {...register('spouse.birth_city_country')} /></Field>
      <Field label="Nacionalidad"><Input {...register('spouse.nationality')} /></Field>
    </div>
    <div className="uscis-grid uscis-grid-3">
      <Field label="Pasaporte #"><Input {...register('spouse.passport_number')} /></Field>
      <Field label="País emisor"><Input {...register('spouse.passport_country')} /></Field>
      <Field label="Vence (mm/dd/yyyy)"><Input {...register('spouse.passport_expiry')} placeholder="mm/dd/yyyy" /></Field>
    </div>
    <div className="uscis-grid uscis-grid-2">
      <Field label="¿Acompañará? (acompañante)"><Input {...register('spouse.will_accompany')} placeholder="Yes / No / Unknown" /></Field>
      <Field label="¿Se unirá después? (follow-to-join)"><Input {...register('spouse.will_follow_to_join')} placeholder="Yes / No / Unknown" /></Field>
    </div>
  </Section>
);

/* ========= PARTE A.II — HIJO/A N (Opción 2) ========= */
const renderChild = (n: number): StepRenderer => {
  return ({ register, watch }: StepArgs) => {
    const inUS = watch(path("children", n, "in_us"));

    return (
      <Section
        title={`Datos del hijo/a ${n}`}
        description="Parte A.II — Información sobre hijos (si aplica)."
      >
        <div className="uscis-grid uscis-grid-3">
          <Field label="Apellido"><Input {...register(path("children", n, "last_name"))} /></Field>
          <Field label="Primer nombre"><Input {...register(path("children", n, "first_name"))} /></Field>
          <Field label="Segundo nombre"><Input {...register(path("children", n, "middle_name"))} /></Field>
        </div>

        <div className="uscis-grid uscis-grid-4">
          <Field label="Nacimiento (mm/dd/yyyy)">
            <Input {...register(path("children", n, "dob"))} placeholder="mm/dd/yyyy" />
          </Field>
          <Field label="Ciudad y país de nacimiento">
            <Input {...register(path("children", n, "birth_city_country"))} />
          </Field>
          <Field label="Nacionalidad">
            <Input {...register(path("children", n, "nationality"))} />
          </Field>
          <Field label="A-Number">
            <Input {...register(path("children", n, "a_number"))} placeholder="A###-###-###" />
          </Field>
        </div>

        <Field label="¿Actualmente está en Estados Unidos?">
          <RadioInline
            name={path("children", n, "in_us")}
            register={register}
            options={[
              { label: "Sí", value: "Yes" },
              { label: "No", value: "No" },
            ]}
          />
        </Field>

        {inUS === "No" && (
          <div className="uscis-box">
            <p className="uscis-note">Ubicación actual (fuera de EE. UU.).</p>
            <div className="uscis-grid uscis-grid-3">
              <Field label="Ciudad actual"><Input {...register(path("children", n, "current_city"))} /></Field>
              <Field label="País actual"><Input {...register(path("children", n, "current_country"))} /></Field>
              <Field label="¿Se unirá después? (follow-to-join)">
                <Input {...register(path("children", n, "will_follow_to_join"))} placeholder="Yes / No / Unknown" />
              </Field>
            </div>
          </div>
        )}

        {inUS === "Yes" && (
          <div className="uscis-box">
            <p className="uscis-note">Entrada y estatus en EE. UU.</p>
            <div className="uscis-grid uscis-grid-3">
              <Field label="Fecha de última entrada (mm/dd/yyyy)">
                <Input {...register(path("children", n, "us_entry_date"))} placeholder="mm/dd/yyyy" />
              </Field>
              <Field label="Lugar/puerto de entrada">
                <Input {...register(path("children", n, "us_entry_place"))} placeholder="Ciudad/Estado o Aeropuerto / Puerto" />
              </Field>
              <Field label="I-94 #">
                <Input {...register(path("children", n, "i94_number"))} placeholder="N/A si no aplica" />
              </Field>
            </div>

            <div className="uscis-grid uscis-grid-3">
              <Field label="Forma de entrada (manner of entry)">
                <Input {...register(path("children", n, "manner_of_entry"))} placeholder="Visa B2 / Parole / Sin inspección, etc." />
              </Field>
              <Field label="Estatus al entrar">
                <Input {...register(path("children", n, "status_at_entry"))} placeholder="B2 / Parole / N/A" />
              </Field>
              <Field label="Estatus actual">
                <Input {...register(path("children", n, "current_status"))} placeholder="B2 / TPS / DED / N/A" />
              </Field>
            </div>

            <div className="uscis-grid uscis-grid-3">
              <Field label="Expiración del estatus (mm/dd/yyyy)">
                <Input {...register(path("children", n, "status_expires"))} placeholder="mm/dd/yyyy o N/A" />
              </Field>
              <Field label="¿Acompañará?">
                <Input {...register(path("children", n, "will_accompany"))} placeholder="Yes / No / Unknown" />
              </Field>
              <Field label="¿Se unirá después?">
                <Input {...register(path("children", n, "will_follow_to_join"))} placeholder="Yes / No / Unknown" />
              </Field>
            </div>
          </div>
        )}
      </Section>
    );
  };
};

/* ========= PARTE B — DOMICILIOS ========= */
const RenderAddresses: StepRenderer = ({ register, control }) => {
  const { fields, append, remove } = useFieldArray({ control, name: "us_addresses" });
  return (
    <>
      <Section
        title="Última dirección fuera de Estados Unidos"
        description="Parte B — Información general: domicilio inmediatamente anterior a su llegada a EE. UU."
      >
        <div className="uscis-grid uscis-grid-3">
          <Field label="Calle y número"><Input {...register('foreign_last_address.street')} /></Field>
          <Field label="Ciudad"><Input {...register('foreign_last_address.city')} /></Field>
          <Field label="Provincia/Estado"><Input {...register('foreign_last_address.state_province')} /></Field>
        </div>
        <div className="uscis-grid uscis-grid-3">
          <Field label="País"><Input {...register('foreign_last_address.country')} /></Field>
          <Field label="Código postal"><Input {...register('foreign_last_address.postal')} /></Field>
          <Field label="Periodo (mm/yyyy - mm/yyyy)"><Input {...register('foreign_last_address.period')} placeholder="01/2020 - 03/2023" /></Field>
        </div>
      </Section>

      <Section
        title="Direcciones en Estados Unidos (últimos 5 años)"
        description="Parte B — Información general: su dirección actual y anteriores."
      >
        {fields.map((f, idx) => (
          <div key={f.id} className="uscis-box">
            <div className="uscis-grid uscis-grid-3">
              <Field label="Calle y número"><Input {...register(path("us_addresses", idx, "street"))} /></Field>
              <Field label="Ciudad"><Input {...register(path("us_addresses", idx, "city"))} /></Field>
              <Field label="Estado"><Input {...register(path("us_addresses", idx, "state"))} /></Field>
            </div>
            <div className="uscis-grid uscis-grid-3">
              <Field label="Código postal"><Input {...register(path("us_addresses", idx, "zip"))} /></Field>
              <Field label="Desde (mm/yyyy)"><Input {...register(path("us_addresses", idx, "from"))} placeholder="mm/yyyy" /></Field>
              <Field label="Hasta (mm/yyyy o 'Actual')"><Input {...register(path("us_addresses", idx, "to"))} placeholder="mm/yyyy o Actual" /></Field>
            </div>
            <div className="uscis-grid uscis-grid-2">
              <Field label="¿Es la dirección actual?"><Input {...register(path("us_addresses", idx, "is_current"))} placeholder="Yes / No" /></Field>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                <button type="button" className="uscis-btn uscis-btn-secondary" onClick={() => remove(idx)}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="uscis-btn uscis-btn-secondary" onClick={() => append({})}>
          + Agregar dirección
        </button>
      </Section>
    </>
  );
};

/* ========= PARTE B — EMPLEOS ========= */
const RenderEmployment: StepRenderer = ({ register, control }) => {
  const { fields, append, remove } = useFieldArray({ control, name: "employment" });
  return (
    <Section title="Historial de empleos" description="Parte B — Información general: empleos más recientes (incluya trabajos en EE. UU.).">
      {fields.map((f, idx) => (
        <div key={f.id} className="uscis-box">
          <div className="uscis-grid uscis-grid-4">
            <Field label="Empleador/Empresa"><Input {...register(path("employment", idx, "employer"))} /></Field>
            <Field label="Cargo/Posición"><Input {...register(path("employment", idx, "position"))} /></Field>
            <Field label="Ciudad"><Input {...register(path("employment", idx, "city"))} /></Field>
            <Field label="Estado o País"><Input {...register(path("employment", idx, "region"))} placeholder="Ej.: TX o Colombia" /></Field>
          </div>
          <div className="uscis-grid uscis-grid-3">
            <Field label="Desde (mm/yyyy)"><Input {...register(path("employment", idx, "from"))} placeholder="mm/yyyy" /></Field>
            <Field label="Hasta (mm/yyyy o 'Actual')"><Input {...register(path("employment", idx, "to"))} placeholder="mm/yyyy o Actual" /></Field>
            <Field label="¿Este empleo fue en EE. UU.?"><Input {...register(path("employment", idx, "in_us"))} placeholder="Yes / No" /></Field>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="uscis-btn uscis-btn-secondary" onClick={() => remove(idx)}>Eliminar</button>
          </div>
        </div>
      ))}
      <button type="button" className="uscis-btn uscis-btn-secondary" onClick={() => append({})}>
        + Agregar empleo
      </button>
    </Section>
  );
};

/* ========= PARTE B — ESTUDIOS ========= */
const RenderEducation: StepRenderer = ({ register, control }) => {
  const { fields, append, remove } = useFieldArray({ control, name: "education" });
  return (
    <Section title="Historial de estudios" description="Parte B — Información general: educación (secundaria, técnico, universidad).">
      {fields.map((f, idx) => (
        <div key={f.id} className="uscis-box">
          <div className="uscis-grid uscis-grid-3">
            <Field label="Institución"><Input {...register(path("education", idx, "institution"))} /></Field>
            <Field label="Ciudad"><Input {...register(path("education", idx, "city"))} /></Field>
            <Field label="País"><Input {...register(path("education", idx, "country"))} /></Field>
          </div>
          <div className="uscis-grid uscis-grid-3">
            <Field label="Nivel o Título"><Input {...register(path("education", idx, "level"))} placeholder="Secundaria / Licenciatura / etc." /></Field>
            <Field label="Desde (mm/yyyy)"><Input {...register(path("education", idx, "from"))} placeholder="mm/yyyy" /></Field>
            <Field label="Hasta (mm/yyyy o 'Actual')"><Input {...register(path("education", idx, "to"))} placeholder="mm/yyyy o Actual" /></Field>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="uscis-btn uscis-btn-secondary" onClick={() => remove(idx)}>Eliminar</button>
          </div>
        </div>
      ))}
      <button type="button" className="uscis-btn uscis-btn-secondary" onClick={() => append({})}>
        + Agregar estudio
      </button>
    </Section>
  );
};

/* ========= PARTE B — FAMILIA ========= */
const RenderFamily: StepRenderer = ({ register, control }) => {
  const { fields, append, remove } = useFieldArray({ control, name: "siblings" });
  const canAddMore = fields.length < 5;

  return (
    <Section title="Información de la familia" description="Parte B — Padre, madre y hasta 5 hermanos: nacimiento, ubicación actual o fallecimiento.">
      {/* Padre */}
      <div className="uscis-box">
        <p className="uscis-note"><b>Padre</b></p>
        <div className="uscis-grid uscis-grid-3">
          <Field label="Apellido"><Input {...register('father.last_name')} /></Field>
          <Field label="Primer nombre"><Input {...register('father.first_name')} /></Field>
          <Field label="Segundo nombre"><Input {...register('father.middle_name')} /></Field>
        </div>
        <div className="uscis-grid uscis-grid-3">
          <Field label="Nacimiento (mm/dd/yyyy)"><Input {...register('father.dob')} placeholder="mm/dd/yyyy" /></Field>
          <Field label="Lugar de nacimiento (Ciudad, País)"><Input {...register('father.birth_city_country')} /></Field>
          <Field label="¿Fallecido?"><Input {...register('father.deceased')} placeholder="Yes / No" /></Field>
        </div>
        <div className="uscis-grid uscis-grid-2">
          <Field label="Ubicación actual (Ciudad, País)"><Input {...register('father.current_city_country')} placeholder="Si falleció, N/A" /></Field>
          <Field label="Nacionalidad"><Input {...register('father.nationality')} /></Field>
        </div>
      </div>

      {/* Madre */}
      <div className="uscis-box">
        <p className="uscis-note"><b>Madre</b></p>
        <div className="uscis-grid uscis-grid-3">
          <Field label="Apellido"><Input {...register('mother.last_name')} /></Field>
          <Field label="Primer nombre"><Input {...register('mother.first_name')} /></Field>
          <Field label="Segundo nombre"><Input {...register('mother.middle_name')} /></Field>
        </div>
        <div className="uscis-grid uscis-grid-3">
          <Field label="Nacimiento (mm/dd/yyyy)"><Input {...register('mother.dob')} placeholder="mm/dd/yyyy" /></Field>
          <Field label="Lugar de nacimiento (Ciudad, País)"><Input {...register('mother.birth_city_country')} /></Field>
          <Field label="¿Fallecida?"><Input {...register('mother.deceased')} placeholder="Yes / No" /></Field>
        </div>
        <div className="uscis-grid uscis-grid-2">
          <Field label="Ubicación actual (Ciudad, País)"><Input {...register('mother.current_city_country')} placeholder="Si falleció, N/A" /></Field>
          <Field label="Nacionalidad"><Input {...register('mother.nationality')} /></Field>
        </div>
      </div>

      {/* Hermanos (hasta 5) */}
      <div className="uscis-box">
        <p className="uscis-note"><b>Hermanos (hasta 5)</b></p>
        {fields.map((f, idx) => (
          <div key={f.id} className="uscis-innerbox">
            <p className="uscis-note"><b>Hermano/a {idx + 1}</b></p>
            <div className="uscis-grid uscis-grid-3">
              <Field label="Apellido"><Input {...register(path("siblings", idx, "last_name"))} /></Field>
              <Field label="Primer nombre"><Input {...register(path("siblings", idx, "first_name"))} /></Field>
              <Field label="Segundo nombre"><Input {...register(path("siblings", idx, "middle_name"))} /></Field>
            </div>
            <div className="uscis-grid uscis-grid-3">
              <Field label="Nacimiento (mm/dd/yyyy)"><Input {...register(path("siblings", idx, "dob"))} placeholder="mm/dd/yyyy" /></Field>
              <Field label="Lugar de nacimiento (Ciudad, País)"><Input {...register(path("siblings", idx, "birth_city_country"))} /></Field>
              <Field label="¿Fallecido/a?"><Input {...register(path("siblings", idx, "deceased"))} placeholder="Yes / No" /></Field>
            </div>
            <div className="uscis-grid uscis-grid-2">
              <Field label="Ubicación actual (Ciudad, País)"><Input {...register(path("siblings", idx, "current_city_country"))} placeholder="Si falleció, N/A" /></Field>
              <Field label="Nacionalidad"><Input {...register(path("siblings", idx, "nationality"))} /></Field>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="uscis-btn uscis-btn-secondary" onClick={() => remove(idx)}>Eliminar</button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="uscis-btn uscis-btn-secondary"
          disabled={!canAddMore}
          onClick={() => canAddMore && append({})}
          title={canAddMore ? "Agregar hermano/a" : "Límite de 5 alcanzado"}
        >
          + Agregar hermano/a
        </button>
      </div>
    </Section>
  );
};

/* ========= PARTE C — SOLICITUD ========= */
const RenderClaimCombined: StepRenderer = ({ register }) => (
  <Section title="Información sobre su solicitud (motivos y riesgos)" description="Parte C — Fundamentos del asilo y protección.">
    <Textarea {...register('claim.summary')} placeholder="Resumen de las razones por las cuales solicita asilo." />
    <Textarea {...register('claim.past_harm')} placeholder="Daños, amenazas o torturas sufridas." />
    <Textarea {...register('claim.future_risk')} placeholder="Qué sucedería si regresa a su país." />
    <Textarea {...register('claim.protection_attempts')} placeholder="Si buscó ayuda o protección y resultado." />
  </Section>
);

/* ========= PARTE D — DECLARACIÓN Y FIRMA ========= */
const RenderOtherAndSignature: StepRenderer = ({ register }) => (
  <>
    <Section title="Información adicional (si corresponde)" description="Espacio para aclaraciones complementarias.">
      <Textarea {...register('other.affiliations')} placeholder="Grupos, partidos, iglesias o afiliaciones." />
      <Textarea {...register('other.arrests')} placeholder="Arrestos, condenas o procesos (si aplica)." />
      <Textarea {...register('other.travels')} placeholder="Viajes a terceros países (si aplica)." />
    </Section>
    <Section title="Declaración del solicitante y firma" description="Parte D — Datos de contacto y certificación.">
      <div className="uscis-grid uscis-grid-2">
        <Field label="Teléfono"><Input {...register('contact.phone')} placeholder="(###) ###-####" /></Field>
        <Field label="Correo electrónico"><Input {...register('contact.email')} placeholder="you@email.com" /></Field>
      </div>
      <Field label="Dirección de envío"><Input {...register('contact.mailing')} placeholder="Calle, Ciudad, Estado, ZIP" /></Field>
      <Field label="Lugar y fecha"><Input {...register('contact.place_date')} placeholder="Ciudad, Estado — mm/dd/yyyy" /></Field>
    </Section>
  </>
);

/* ========= PASO FINAL — ENVIAR ========= */
const RenderSubmit: StepRenderer = () => {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const collectAll = () => {
    const nums = [2,3,4,5,6,7,8,9,10,11,12];
    const merged: any = {};
    nums.forEach((n) => {
      try {
        const raw = localStorage.getItem(`i589_step_${n}`);
        if (raw) Object.assign(merged, JSON.parse(raw));
      } catch {}
    });
    return merged;
  };

  const sendNow = async () => {
    try {
      setStatus("sending");
      setMessage("");
      const payload = collectAll();

      const res = await authedFetch("/api/i589/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setStatus("sent");
      setMessage("Tu formulario ha sido completado.");
    } catch {
      setStatus("error");
      setMessage("No se pudo enviar. Revisa tu conexión o el endpoint /api/i589/submit.");
    }
  };

  if (status === "sent") {
    return (
      <Section title="¡Listo!">
        <div className="uscis-success">
          <div className="uscis-success-icon">✓</div>
          <div>
            <h3 className="uscis-success-title">Tu formulario ha sido completado.</h3>
            <p className="uscis-success-text">Puedes volver a las hojas si deseas actualizar algún dato.</p>
          </div>
        </div>
        <div className="uscis-nav" style={{ marginTop: 12 }}>
          <a href="/i589/2" className="uscis-btn uscis-btn-secondary">Volver al inicio</a>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Enviar solicitud" description="Cuando estés conforme, presiona Enviar.">
      <div className="uscis-nav" style={{ margin: 0 }}>
        <button
          type="button"
          disabled={status === "sending"}
          className="uscis-btn uscis-btn-primary"
          onClick={sendNow}
        >
          {status === "sending" ? "Enviando..." : "Enviar ahora"}
        </button>

        <div className="uscis-nav-right">
          <a href="/i589/12" className="uscis-btn uscis-btn-secondary">
            Volver a la hoja 12
          </a>
        </div>
      </div>

      {message && (
        <p style={{ marginTop: 10, color: status === "error" ? "#b11d2a" : "#0b57a2" }}>
          {message}
        </p>
      )}
    </Section>
  );
};

/* ========= MAPEO DE HOJAS (2..13) ========= */
const RENDERERS: Record<number, StepRenderer> = {
  2: renderSpouse,
  3: renderChild(1),
  4: renderChild(2),
  5: renderChild(3),
  6: renderChild(4),
  7: RenderAddresses,
  8: RenderEmployment,
  9: RenderEducation,
  10: RenderFamily,
  11: RenderClaimCombined,
  12: RenderOtherAndSignature,
  13: RenderSubmit,
};

/* ========= Etiquetas del stepper (español) ========= */
const STEP_LABELS: Array<{ n: number; label: string }> = [
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

/* ========= debounce util para autosave ========= */
function useDebouncedCallback<T extends (...args: any[]) => any>(fn: T, delay = 800) {
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useMemo(
    () => (...args: Parameters<T>) => {
      if (ref.current) clearTimeout(ref.current);
      ref.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

/* ========= Página ========= */
export default function I589StepPage({ params }: { params: { step: string } }) {
  const router = useRouter();
  const stepNum = Number(params.step);
  const form = useForm({ mode: "onChange" });
  const { register, handleSubmit, watch, control, reset } = form;

  // 1) Cargar snapshot local al entrar a la hoja
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`i589_step_${stepNum}`);
      if (raw) reset(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepNum]);

  // 2) Autosave: localStorage + backend (debounced)
  const autosaveServer = useDebouncedCallback(async (patch: any) => {
    try {
      await authedFetch("/api/cases/i589/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: stepNum, patch }),
      });
    } catch {
      // silencioso; no romper UI si falla el autosave
    }
  }, 900);

  useEffect(() => {
    const sub = watch((data) => {
      try {
        localStorage.setItem(`i589_step_${stepNum}`, JSON.stringify(data));
        autosaveServer(data);
      } catch {}
    });
    return () => sub.unsubscribe();
  }, [watch, stepNum, autosaveServer]);

  const go = (n: number) => router.push(`/i589/${n}`);
  const onSubmit = () => { if (stepNum < 13) go(stepNum + 1); };

  const render = RENDERERS[stepNum];

  const idx = Math.max(0, Math.min(ALL_STEPS.length - 1, ALL_STEPS.indexOf(stepNum)));
  const progressPct = ((idx + 1) / ALL_STEPS.length) * 100;
  const currentLabel = STEP_LABELS.find(s => s.n === stepNum)?.label ?? `Hoja ${stepNum}`;

  return (
    <FormProvider {...form}>
      <main className="uscis-page">
        {/* Header institucional con título centrado */}
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

          {/* Stepper con etiquetas del PDF (en español) */}
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

          {/* Contenido */}
          <div className="uscis-content">
            {render ? render({ register, watch, control }) : <p className="uscis-missing">No se encontró contenido para esta hoja.</p>}
          </div>

          {/* Navegación inferior */}
          <div className="uscis-nav">
            <button
              type="button"
              onClick={() => go(stepNum > 2 ? stepNum - 1 : 2)}
              className="uscis-btn uscis-btn-secondary"
            >
              Anterior
            </button>
            <div className="uscis-nav-right">
              {stepNum < 13 ? (
                <button type="button" onClick={handleSubmit(onSubmit)} className="uscis-btn uscis-btn-secondary">
                  {stepNum === 12 ? "Enviar" : "Siguiente sección"}
                </button>
              ) : (
                <button type="button" onClick={() => go(2)} className="uscis-btn uscis-btn-secondary">
                  Volver al inicio
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ====== ESTILOS GLOBALES (tipo USCIS) ====== */}
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

        .uscis-success {
          display: flex; gap: 12px; align-items: center;
          background: #f0f9ff; border: 1px solid #c7e6ff; padding: 16px; border-radius: 12px;
        }
        .uscis-success-icon {
          width: 32px; height: 32px; border-radius: 999px; display: grid; place-items: center;
          background: #0ea5e9; color: #fff; font-weight: 700;
        }
        .uscis-success-title { margin: 0; font-size: 16px; font-weight: 700; }
        .uscis-success-text { margin: 2px 0 0; color: #334155; font-size: 14px; }

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

        .uscis-missing { text-align: center; color: #334155; }
      `}</style>
    </FormProvider>
  );
}
