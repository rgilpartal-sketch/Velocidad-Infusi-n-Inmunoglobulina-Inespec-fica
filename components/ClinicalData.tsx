
import React from 'react';
import { Prescription, Indication } from '../types';
import { INDICATION_RANGES } from '../constants';

interface Props {
  weight: number;
  prescription: Prescription;
  onChange: React.Dispatch<React.SetStateAction<Prescription>>;
}

const ClinicalData: React.FC<Props> = ({ prescription, onChange }) => {
  const range = INDICATION_RANGES[prescription.indication];

  const handleIndicationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as Indication;
    const newRange = INDICATION_RANGES[val];
    onChange(prev => ({
      ...prev,
      indication: val,
      dosePerKg: newRange.fixed || newRange.min
    }));
  };

  const handleDoseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    onChange(prev => ({ ...prev, dosePerKg: val }));
  };

  const isDoseValid = range.fixed 
    ? prescription.dosePerKg === range.fixed 
    : (prescription.dosePerKg >= range.min && prescription.dosePerKg <= range.max);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Indicación Clínica</label>
        <select
          value={prescription.indication}
          onChange={handleIndicationChange}
          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-quiron-teal focus:border-quiron-teal outline-none transition-all bg-white"
        >
          {Object.values(Indication).map(ind => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          Dosis Prescrita (g/kg)
          <span className="ml-2 text-[10px] text-slate-400 normal-case font-normal italic">
            Rango: {range.min === range.max ? `${range.min} g/kg` : `${range.min} - ${range.max} g/kg`}
          </span>
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.1"
            value={prescription.dosePerKg || ''}
            onChange={handleDoseChange}
            readOnly={!!range.fixed}
            className={`w-full p-2 pr-10 border rounded-lg focus:ring-2 outline-none transition-all font-bold ${
              isDoseValid ? 'border-slate-300 focus:ring-quiron-teal' : 'border-quiron-red focus:ring-quiron-red text-quiron-red'
            } ${range.fixed ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'}`}
            placeholder="0.4"
          />
          <div className="absolute right-3 top-2.5">
            {isDoseValid ? (
              <svg className="w-5 h-5 text-quiron-teal" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-5 h-5 text-quiron-red" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            )}
          </div>
        </div>
        {!isDoseValid && (
          <p className="mt-1 text-[10px] text-quiron-red font-bold uppercase italic">La dosis no se ajusta a ficha técnica para esta indicación</p>
        )}
      </div>
    </div>
  );
};

export default ClinicalData;
