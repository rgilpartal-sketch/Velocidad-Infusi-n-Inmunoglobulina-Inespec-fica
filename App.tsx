
import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientData, Prescription, Indication, AdminTram } from './types';
import { 
  INDICATION_RANGES, 
  ADMIN_RATES_STANDARD, 
  ADMIN_RATES_FLEXIBLE, 
  IDP_EXTRA_RATE, 
  REMINDERS 
} from './constants';
import PatientInfo from './components/PatientInfo';
import ClinicalData from './components/ClinicalData';
import AdminTable from './components/AdminTable';
import NursingReminders from './components/NursingReminders';

const App: React.FC = () => {
  const [patient, setPatient] = useState<PatientData>({
    name: '',
    nhc: '',
    birthDate: '',
    bed: '',
    weight: 0
  });

  const [prescription, setPrescription] = useState<Prescription>({
    indication: Indication.IDP,
    dosePerKg: 0.4,
    totalDoseAdjusted: 0
  });

  const [isFlexibleScale, setIsFlexibleScale] = useState(false);

  const [vialCounts, setVialCounts] = useState<Record<string, number>>({
    '10g': 0,
    '5g': 0,
    '2.5g': 0
  });

  useEffect(() => {
    const calculatedDose = patient.weight * prescription.dosePerKg;
    const roundedDose = Number(calculatedDose.toFixed(2));
    setPrescription(prev => ({ ...prev, totalDoseAdjusted: roundedDose }));

    let remaining = roundedDose;
    const autoVials = { '10g': 0, '5g': 0, '2.5g': 0 };
    autoVials['10g'] = Math.floor(remaining / 10);
    remaining %= 10;
    autoVials['5g'] = Math.floor(remaining / 5);
    remaining %= 5;
    autoVials['2.5g'] = Math.ceil(remaining / 2.5);
    setVialCounts(autoVials);
  }, [patient.weight, prescription.dosePerKg]);

  const totalVolume = useMemo(() => {
    return Number((prescription.totalDoseAdjusted * 10).toFixed(1));
  }, [prescription.totalDoseAdjusted]);

  const formatTime = (totalMinutes: number) => {
    if (totalMinutes <= 0) return '0 min';
    const h = Math.floor(totalMinutes / 60);
    const m = Math.round(totalMinutes % 60);
    if (h > 0) return `${h}h ${m}min`;
    return `${m} min`;
  };

  const trams = useMemo(() => {
    if (patient.weight <= 0 || totalVolume <= 0) return [];

    const vialVolumes: number[] = [
      ...Array(vialCounts['10g']).fill(100),
      ...Array(vialCounts['5g']).fill(50),
      ...Array(vialCounts['2.5g']).fill(25),
    ];

    const result: AdminTram[] = [];
    let accumulatedVolume = 0;
    let currentTimeMin = 0;
    
    const baseRates = isFlexibleScale ? ADMIN_RATES_FLEXIBLE : ADMIN_RATES_STANDARD;
    const rates = [...baseRates];
    if (prescription.indication === Indication.IDP) {
      rates.push(IDP_EXTRA_RATE);
    }

    let vialPointer = 0;
    let volumeUsedInCurrentVial = 0;

    const getVialNote = (startVol: number, endVol: number) => {
      const notes: string[] = [];
      if (startVol === 0 && vialVolumes.length > 0) {
        notes.push(`Vial ${vialVolumes[0]}ml`);
        vialPointer = 0;
        volumeUsedInCurrentVial = 0;
      }

      let currentTramRemaining = endVol - startVol;
      const EPSILON = 0.01;

      while (currentTramRemaining > EPSILON && vialPointer < vialVolumes.length) {
        const capacityLeft = vialVolumes[vialPointer] - volumeUsedInCurrentVial;
        if (currentTramRemaining > capacityLeft + EPSILON) {
          currentTramRemaining -= capacityLeft;
          vialPointer++;
          if (vialPointer < vialVolumes.length) {
            notes.push(`Vial ${vialVolumes[vialPointer]}ml`);
            volumeUsedInCurrentVial = 0;
          }
        } else {
          volumeUsedInCurrentVial += currentTramRemaining;
          currentTramRemaining = 0;
        }
      }
      return notes.join(' + ');
    };

    let stepCounter = 1;
    for (let i = 0; i < rates.length; i++) {
      const rateMlKgH = rates[i];
      const rateMlh = rateMlKgH * patient.weight;
      const volPossibleIn30Min = rateMlh * 0.5;
      
      const remainingTotal = totalVolume - accumulatedVolume;
      const isLastOfTotal = volPossibleIn30Min >= (remainingTotal - 0.01);
      
      const actualVolInTram = isLastOfTotal ? remainingTotal : volPossibleIn30Min;
      const timeInTram = isLastOfTotal ? (actualVolInTram / rateMlh) * 60 : 30;

      const startVol = accumulatedVolume;
      accumulatedVolume += actualVolInTram;

      result.push({
        step: stepCounter++,
        timeRange: `${Math.round(currentTimeMin)}-${Math.round(currentTimeMin + timeInTram)} min`,
        rateMlKgH,
        rateMlh: Math.round(rateMlh * 10) / 10,
        volumeInTram: Math.round(actualVolInTram * 10) / 10,
        cumulativeVolume: Math.round(accumulatedVolume * 10) / 10,
        remainingVolume: Math.round(Math.max(0, totalVolume - accumulatedVolume) * 10) / 10,
        vialNote: getVialNote(startVol, accumulatedVolume)
      });

      currentTimeMin += timeInTram;
      if (isLastOfTotal) break;

      if (i === rates.length - 1 && accumulatedVolume < (totalVolume - 0.01)) {
        while (accumulatedVolume < (totalVolume - 0.01)) {
            const rem = totalVolume - accumulatedVolume;
            const extraVol = Math.min(volPossibleIn30Min, rem);
            const extraTime = (extraVol / rateMlh) * 60;
            const sVol = accumulatedVolume;
            accumulatedVolume += extraVol;
            result.push({
                step: stepCounter++,
                timeRange: `${Math.round(currentTimeMin)}-${Math.round(currentTimeMin + extraTime)} min`,
                rateMlKgH,
                rateMlh: Math.round(rateMlh * 10) / 10,
                volumeInTram: Math.round(extraVol * 10) / 10,
                cumulativeVolume: Math.round(accumulatedVolume * 10) / 10,
                remainingVolume: Math.round(Math.max(0, totalVolume - accumulatedVolume) * 10) / 10,
                vialNote: getVialNote(sVol, accumulatedVolume)
            });
            currentTimeMin += extraTime;
        }
      }
    }

    return result;
  }, [patient.weight, totalVolume, prescription.indication, vialCounts, isFlexibleScale]);

  const totalTime = useMemo(() => {
    if (trams.length === 0) return 0;
    const lastTimeStr = trams[trams.length - 1].timeRange.split('-')[1];
    return parseInt(lastTimeStr);
  }, [trams]);

  const exportPDF = () => {
    const doc = new jsPDF();
    const primaryColor = [0, 178, 169]; // #00B2A9

    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("GUÍA DE ADMINISTRACIÓN DE PRIVIGEN", 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text("Servicio de Farmacia - Hospital Quirón Salud Barcelona", 105, 22, { align: "center" });

    // Patient Data Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("DATOS DEL PACIENTE", 14, 40);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 42, 196, 42);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${patient.name || 'N/A'}`, 14, 50);
    doc.text(`NHC: ${patient.nhc || 'N/A'}`, 14, 55);
    doc.text(`Cama: ${patient.bed || 'N/A'}`, 100, 50);
    doc.text(`Peso: ${patient.weight || 0} kg`, 100, 55);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 60);

    // Clinical Prescription Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PRESCRIPCIÓN CLÍNICA", 14, 75);
    doc.line(14, 77, 196, 77);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Indicación: ${prescription.indication}`, 14, 85, { maxWidth: 180 });
    doc.text(`Dosis: ${prescription.dosePerKg} g/kg`, 14, 95);
    doc.text(`Dosis Total: ${prescription.totalDoseAdjusted} g`, 70, 95);
    doc.text(`Volumen Total: ${totalVolume} ml`, 130, 95);
    doc.text(`Tiempo de Infusión: ${formatTime(totalTime)}`, 14, 100);
    doc.text(`Escalado: ${isFlexibleScale ? 'Ajuste Fino' : 'Estándar'}`, 130, 100);

    // Administration Table
    const tableData = trams.map(t => [
      `#${t.step}`,
      t.timeRange,
      `${t.rateMlh} ml/h (${t.rateMlKgH} ml/kg/h)`,
      `${t.volumeInTram} ml`,
      t.vialNote || '-',
      `${t.cumulativeVolume} ml`,
      `${t.remainingVolume} ml`
    ]);

    autoTable(doc, {
      startY: 110,
      head: [['Tramo', 'Tiempo', 'Velocidad', 'Vol. Tramo', 'Vial', 'Acumulado', 'Restante']],
      body: tableData,
      headStyles: { fillColor: primaryColor, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      theme: 'grid',
    });

    // Reminders
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    if (finalY < 240) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("RECORDATORIOS A ENFERMERÍA", 14, finalY + 15);
      doc.line(14, finalY + 17, 196, finalY + 17);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      let offset = finalY + 25;
      REMINDERS.forEach(reminder => {
        const lines = doc.splitTextToSize(`• ${reminder}`, 180);
        doc.text(lines, 14, offset);
        offset += (lines.length * 4);
      });
    }

    doc.save(`Privigen_Report_${patient.nhc || 'Calculo'}.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-quiron-teal text-white py-6 px-4 shadow-md text-center relative">
        <h1 className="text-2xl font-bold uppercase tracking-wide">Guía de administración de Inmunoglobulinas</h1>
        <button 
          onClick={exportPDF}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-quiron-teal px-4 py-2 rounded-lg font-bold text-xs uppercase shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Exportar PDF
        </button>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Datos del Paciente
            </h2>
          </div>
          <div className="p-6">
            <PatientInfo data={patient} onChange={setPatient} />
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Prescripción Clínica
            </h2>
          </div>
          <div className="p-6">
            <ClinicalData 
                weight={patient.weight} 
                prescription={prescription} 
                onChange={setPrescription} 
            />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Dosis Total (g)</span>
                <div className="mt-1">
                   <input 
                    type="number" 
                    step="0.1"
                    className="text-2xl font-bold text-quiron-teal w-24 text-center border-b-2 border-quiron-teal focus:outline-none"
                    value={prescription.totalDoseAdjusted}
                    onChange={(e) => setPrescription(p => ({...p, totalDoseAdjusted: parseFloat(e.target.value) || 0}))}
                   />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">*Ajustable Farmacia</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Volumen Total</span>
                <span className="text-2xl font-bold text-quiron-teal mt-1">{totalVolume.toFixed(1)} ml</span>
                <p className="text-[10px] text-slate-400 mt-1">Privigen 10% (0.1g/ml)</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Tiempo Infusión</span>
                <span className="text-2xl font-bold text-quiron-teal mt-1">{formatTime(totalTime)}</span>
            </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Viales (Rectificable)</span>
                <div className="mt-1 flex flex-col gap-1 w-full px-2">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                        <span>10g</span>
                        <input type="number" value={vialCounts['10g']} onChange={e => setVialCounts(v => ({...v, '10g': parseInt(e.target.value) || 0}))} className="w-8 border-b border-slate-300 text-center text-quiron-teal outline-none" />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                        <span>5g</span>
                        <input type="number" value={vialCounts['5g']} onChange={e => setVialCounts(v => ({...v, '5g': parseInt(e.target.value) || 0}))} className="w-8 border-b border-slate-300 text-center text-quiron-teal outline-none" />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                        <span>2.5g</span>
                        <input type="number" value={vialCounts['2.5g']} onChange={e => setVialCounts(v => ({...v, '2.5g': parseInt(e.target.value) || 0}))} className="w-8 border-b border-slate-300 text-center text-quiron-teal outline-none" />
                    </div>
                </div>
            </div>
        </section>

        {trams.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-col">
                  <h2 className="font-semibold text-slate-700">Guía de Administración por Tramos (30 min)</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Progresión según tolerancia clínica</p>
                </div>
                
                <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-inner">
                    <button 
                      onClick={() => setIsFlexibleScale(false)}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${!isFlexibleScale ? 'bg-quiron-teal text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Estándar
                    </button>
                    <button 
                      onClick={() => setIsFlexibleScale(true)}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${isFlexibleScale ? 'bg-quiron-red text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Ajuste Fino
                    </button>
                </div>
            </div>
            <div className="p-0 overflow-x-auto">
              <AdminTable trams={trams} />
            </div>
            <div className="bg-slate-50 px-6 py-3 flex flex-wrap gap-4 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-quiron-teal"></div> Escalado Estándar: Saltos de ficha técnica (X2).</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-quiron-red"></div> Ajuste Fino: Incrementos suaves (+0.3 / +0.6 / +1.2).</span>
            </div>
          </section>
        )}

        <NursingReminders />
      </main>

      <footer className="bg-slate-100 border-t border-slate-200 py-4 px-6 text-right">
        <p className="text-xs text-slate-500 font-medium">Servicio de Farmacia. Hospital Quirón Salud Barcelona.</p>
      </footer>
    </div>
  );
};

export default App;
