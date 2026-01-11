
import React from 'react';
import { REMINDERS } from '../constants';

const NursingReminders: React.FC = () => {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <svg className="w-5 h-5 text-quiron-red" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Recordatorios a Enfermería
        </h2>
      </div>
      <div className="p-6">
        <ul className="space-y-3">
          {REMINDERS.map((text, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-quiron-teal flex-shrink-0" />
              <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default NursingReminders;
