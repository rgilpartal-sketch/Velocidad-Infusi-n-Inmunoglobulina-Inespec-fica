
import React from 'react';
import { PatientData } from '../types';

interface Props {
  data: PatientData;
  onChange: React.Dispatch<React.SetStateAction<PatientData>>;
}

const PatientInfo: React.FC<Props> = ({ data, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(prev => ({ 
        ...prev, 
        [name]: name === 'weight' ? (parseFloat(value) || 0) : value 
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre y Apellidos</label>
        <input
          name="name"
          type="text"
          value={data.name}
          onChange={handleChange}
          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-quiron-teal focus:border-quiron-teal outline-none transition-all"
          placeholder="Juan Pérez"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">NHC</label>
          <input
            name="nhc"
            type="text"
            value={data.nhc}
            onChange={handleChange}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-quiron-teal focus:border-quiron-teal outline-none transition-all"
            placeholder="00000000"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cama</label>
          <input
            name="bed"
            type="text"
            value={data.bed}
            onChange={handleChange}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-quiron-teal focus:border-quiron-teal outline-none transition-all"
            placeholder="101A"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha de Nacimiento</label>
        <input
          name="birthDate"
          type="date"
          value={data.birthDate}
          onChange={handleChange}
          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-quiron-teal focus:border-quiron-teal outline-none transition-all"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peso (kg)</label>
        <input
          name="weight"
          type="number"
          step="0.1"
          value={data.weight || ''}
          onChange={handleChange}
          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-quiron-teal focus:border-quiron-teal outline-none transition-all font-bold text-quiron-teal"
          placeholder="70.0"
        />
      </div>
    </div>
  );
};

export default PatientInfo;
