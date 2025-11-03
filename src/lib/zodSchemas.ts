import { z } from "zod";

// Datos de persona
export const PersonSchema = z.object({
  aNumber: z.string().optional(),
  familyName: z.string(),
  givenName: z.string(),
  middleName: z.string().optional(),
  dob: z.string(), // fecha de nacimiento
  pobCity: z.string().optional(), // ciudad de nacimiento
  pobCountry: z.string(),
  citizenship: z.string(),
  sex: z.enum(["M", "F", "X"]).optional(),
});

// Esquema del I-589 (asilo)
export const I589Schema = z.object({
  applicant: PersonSchema,
  usAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
  }),
  arrival: z
    .object({
      date: z.string().optional(),
      place: z.string().optional(),
      manner: z.string().optional(),
      i94: z.string().optional(),
    })
    .optional(),
  defensive: z.boolean().default(false),
  narrative: z.string().min(30),
  dependents: z.array(PersonSchema).default([]),
});

// Esquema del I-765 (permiso de trabajo por asilo)
export const I765Schema = z.object({
  category: z.literal("c8"),
  applicant: PersonSchema,
  usAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
  }),
  ssnRequested: z.boolean().default(false),
});
