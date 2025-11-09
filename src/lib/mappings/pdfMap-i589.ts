// src/lib/pdfMap-i589.ts
export const textMap = [
  { pdf: 'FirstName', path: 'identifiers.firstName' },
  { pdf: 'LastName', path: 'identifiers.lastName' },
  { pdf: 'DOB', path: 'bio.dob' },
];

export const checkMap = [];
export const radioMap = [];

export function getProp(obj: any, dot: string) {
  return dot.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj);
}

export function isOn(v: any) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.toLowerCase().trim();
    return ['yes', 'si', 'sí', 'true', '1', 'x'].includes(s);
  }
  return !!v;
}
