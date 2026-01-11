
export enum Indication {
  IDP = 'Tratamiento restitutivo en síndromes de inmunodeficiencia primaria (IDP)',
  IDS = 'Inmunodeficiencias secundarias',
  PTI = 'Púrpura trombocitopénica inmune (PTI)',
  GUILLAIN_BARRE = 'Síndrome de Guillain-Barré',
  KAWASAKI = 'Enfermedad de Kawasaki',
  PDIC = 'Polineuropatía desmielinizante inflamatoria crónica (PDIC)',
  NMM = 'Neuropatía motora multifocal (NMM)'
}

export interface PatientData {
  name: string;
  nhc: string;
  birthDate: string;
  bed: string;
  weight: number;
}

export interface Prescription {
  indication: Indication;
  dosePerKg: number; // in g/kg
  totalDoseAdjusted: number; // in g (adjustable by pharmacist)
}

export interface AdminTram {
  step: number;
  timeRange: string;
  rateMlKgH: number;
  rateMlh: number;
  volumeInTram: number;
  cumulativeVolume: number;
  remainingVolume: number;
  vialNote?: string;
}

export interface VialPresentation {
  grams: number;
  ml: number;
  label: string;
}
