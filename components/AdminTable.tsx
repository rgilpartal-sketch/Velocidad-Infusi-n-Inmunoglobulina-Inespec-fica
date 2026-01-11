
import React from 'react';
import { AdminTram } from '../types';

interface Props {
  trams: AdminTram[];
}

const AdminTable: React.FC<Props> = ({ trams }) => {
  return (
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tramo</th>
          <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tiempo</th>
          <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Velocidad</th>
          <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vol. Tramo</th>
          <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Apertura Vial</th>
          <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Acumulado</th>
          <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Restante</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-slate-100">
        {trams.map((t) => (
          <tr key={t.step} className="hover:bg-slate-50 transition-colors">
            <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-quiron-teal">#{t.step}</td>
            <td className="px-3 py-4 whitespace-nowrap text-xs text-slate-600 font-semibold">{t.timeRange}</td>
            <td className="px-3 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{t.rateMlh} ml/h</span>
                    <span className="text-[9px] text-slate-400 italic">({t.rateMlKgH} ml/kg/h)</span>
                </div>
            </td>
            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{t.volumeInTram} ml</td>
            <td className="px-3 py-4 whitespace-nowrap">
                {t.vialNote ? (
                  <div className="flex flex-col gap-1">
                    {t.vialNote.split(' + ').map((note, i) => (
                      <span key={i} className="px-2 py-0.5 text-[9px] font-bold rounded bg-quiron-teal text-white shadow-sm flex items-center gap-1 w-fit">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                        {note}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-300 italic">—</span>
                )}
            </td>
            <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                {t.cumulativeVolume} ml
            </td>
            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-quiron-red">
                {t.remainingVolume} ml
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminTable;
