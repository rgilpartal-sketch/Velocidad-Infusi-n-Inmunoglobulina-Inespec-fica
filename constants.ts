
import { Indication, VialPresentation } from './types';

export const VIAL_PRESENTATIONS: VialPresentation[] = [
  { grams: 10, ml: 100, label: '10 g / 100 ml' },
  { grams: 5, ml: 50, label: '5 g / 50 ml' },
  { grams: 2.5, ml: 25, label: '2.5 g / 25 ml' }
];

export const INDICATION_RANGES: Record<Indication, { min: number; max: number; fixed?: number }> = {
  [Indication.IDP]: { min: 0.2, max: 0.8 },
  [Indication.IDS]: { min: 0.2, max: 0.4 },
  [Indication.PTI]: { min: 0.4, max: 1.0 },
  [Indication.GUILLAIN_BARRE]: { min: 0.4, max: 0.4, fixed: 0.4 },
  [Indication.KAWASAKI]: { min: 2.0, max: 2.0, fixed: 2.0 },
  [Indication.PDIC]: { min: 1.0, max: 2.0 },
  [Indication.NMM]: { min: 1.0, max: 2.0 }
};

// Escalado rápido de ficha técnica
export const ADMIN_RATES_STANDARD = [0.3, 0.6, 1.2, 2.4, 4.8];

// Escalado suave para ajuste fino (progresión más lenta)
export const ADMIN_RATES_FLEXIBLE = [0.3, 0.6, 0.9, 1.2, 1.8, 2.4, 3.6, 4.8];

export const IDP_EXTRA_RATE = 7.2;

export const REMINDERS = [
  "Privigen no requiere dilución.",
  "Si se desea diluir, utilizar glucosa al 5% hasta 50 mg/ml (5%): diluir volumen prescrito 1:1 con glucosa 5%.",
  "Antes de iniciar, purgar el equipo con suero fisiológico o glucosa 5%. Nunca usar medicación para purgar.",
  "Administrar mediante equipo de perfusión con ventilación (filtro de aire) por viales rígidos.",
  "Perforar el tapón siempre en el centro, dentro de la zona marcada.",
  "La solución debe ser límpida/opalescente e incolora/amarillo pálido. No usar si hay turbidez o depósitos.",
  "Aumentar velocidad gradualmente solo si hay tolerancia.",
  "En caso de reacción adversa, reducir la velocidad o interrumpir la administración."
];
