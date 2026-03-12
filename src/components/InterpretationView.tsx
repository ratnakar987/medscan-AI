import React from 'react';
import { Pill, Activity, AlertCircle, CheckCircle2, Info, FileText, ArrowRight, Stethoscope } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';

interface Medicine {
  name: string;
  dosage: string;
  timing?: string;
  frequency?: string;
  purpose: string;
}

interface LabResult {
  parameter?: string;
  testName?: string;
  value: string;
  referenceRange?: string;
  interpretation?: string;
  explanation?: string;
  is_abnormal?: boolean;
}

interface ImagingDetails {
  impressions?: string;
  observations?: string;
}

interface EcgDetails {
  heart_rate?: string;
  rhythm?: string;
  interpretation?: string;
}

interface InterpretationProps {
  report: {
    type: string;
    summary?: string;
    main_findings?: string[];
    ai_analysis?: string;
    medicine_list?: Medicine[];
    lab_results?: LabResult[];
    imaging_details?: ImagingDetails;
    ecg_details?: EcgDetails;
    analysis?: string; // JSON string fallback
  };
}

const InterpretationView: React.FC<InterpretationProps> = ({ report }) => {
  // Parse legacy analysis if needed
  let legacyAnalysis: any = {};
  try {
    if (report.analysis) {
      legacyAnalysis = JSON.parse(report.analysis);
    }
  } catch (e) {
    console.error("Failed to parse legacy analysis", e);
  }

  const summary = report.summary || legacyAnalysis.summary;
  const mainFindings = report.main_findings || legacyAnalysis.main_findings || [];
  const medicines = report.medicine_list || legacyAnalysis.medicines || [];
  const labResults = report.lab_results || legacyAnalysis.labResults || [];
  const imagingDetails = report.imaging_details || legacyAnalysis.imaging_details;
  const ecgDetails = report.ecg_details || legacyAnalysis.ecg_details;
  const aiAnalysis = report.ai_analysis;
  const recommendations = legacyAnalysis.recommendations || [];

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Summary Section - Clean Utility Style */}
      {(summary || mainFindings.length > 0) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4 text-primary">
            <div className="bg-primary/10 p-2 rounded-xl">
              <FileText size={20} />
            </div>
            <h3 className="font-bold text-lg">Report Summary</h3>
          </div>
          
          {summary && (
            <p className="text-slate-700 leading-relaxed text-lg font-medium mb-4">
              {summary}
            </p>
          )}

          {mainFindings.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Key Findings</h4>
              <ul className="space-y-2">
                {mainFindings.map((finding: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Imaging Details Section */}
      {imagingDetails && (imagingDetails.impressions || imagingDetails.observations) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4 text-purple-600">
            <div className="bg-purple-50 p-2 rounded-xl">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-lg">Imaging Findings (CT/MRI/X-Ray)</h3>
          </div>
          
          {imagingDetails.impressions && (
            <div className="mb-4">
              <h4 className="text-sm font-bold text-slate-700 mb-1">Clinical Impressions</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{imagingDetails.impressions}</p>
            </div>
          )}
          
          {imagingDetails.observations && (
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-1">Key Observations</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{imagingDetails.observations}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ECG Details Section */}
      {ecgDetails && (ecgDetails.heart_rate || ecgDetails.rhythm || ecgDetails.interpretation) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4 text-rose-600">
            <div className="bg-rose-50 p-2 rounded-xl">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-lg">ECG Analysis</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {ecgDetails.heart_rate && (
              <div className="bg-slate-50 p-3 rounded-2xl">
                <h4 className="text-[10px] font-bold uppercase text-slate-400">Heart Rate</h4>
                <p className="text-lg font-bold text-slate-800">{ecgDetails.heart_rate}</p>
              </div>
            )}
            {ecgDetails.rhythm && (
              <div className="bg-slate-50 p-3 rounded-2xl">
                <h4 className="text-[10px] font-bold uppercase text-slate-400">Rhythm</h4>
                <p className="text-lg font-bold text-slate-800">{ecgDetails.rhythm}</p>
              </div>
            )}
          </div>
          
          {ecgDetails.interpretation && (
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-1">Interpretation</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{ecgDetails.interpretation}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* AI Insights - Editorial Style */}
      {aiAnalysis && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-slate max-w-none"
        >
          <div className="flex items-center gap-2 mb-4 text-indigo-600">
            <div className="bg-indigo-50 p-2 rounded-xl">
              <Stethoscope size={20} />
            </div>
            <h3 className="font-bold text-lg m-0">AI Interpretation & Insights</h3>
          </div>
          <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
            <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      {/* Medicines Section - Card Grid */}
      {medicines.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="bg-emerald-50 p-2 rounded-xl">
              <Pill size={20} />
            </div>
            <h3 className="font-bold text-lg">Prescribed Medications</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {medicines.map((med: Medicine, idx: number) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900">{med.name}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md">
                    Active
                  </span>
                </div>
                <div className="flex flex-col gap-1 mb-3">
                  <p className="text-sm text-slate-600 flex items-center gap-1.5">
                    <Activity size={14} className="text-slate-400" />
                    {med.dosage}
                  </p>
                  <p className="text-sm text-slate-600 flex items-center gap-1.5">
                    <Info size={14} className="text-slate-400" />
                    {med.timing || med.frequency}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-50">
                  <p className="text-xs text-slate-500 italic">
                    <span className="font-bold not-italic text-slate-400 mr-1">Purpose:</span>
                    {med.purpose}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Lab Results Section - Technical Grid Style */}
      {labResults.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-2 text-blue-600">
            <div className="bg-blue-50 p-2 rounded-xl">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-lg">Lab Parameters & Results</h3>
          </div>
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-4 p-4 bg-slate-800/50 border-bottom border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <div>Parameter</div>
              <div className="text-center">Value</div>
              <div className="text-right">Reference</div>
            </div>
            <div className="flex flex-col">
              {labResults.map((res: LabResult, idx: number) => {
                const isAbnormal = res.is_abnormal || 
                                  res.interpretation?.toLowerCase().includes('high') || 
                                  res.interpretation?.toLowerCase().includes('low') ||
                                  res.interpretation?.toLowerCase().includes('abnormal');
                
                return (
                  <div key={idx} className="flex flex-col border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-4 p-4 items-center">
                      <div className="font-medium text-slate-200 text-sm">
                        {res.parameter || res.testName}
                      </div>
                      <div className={`text-center font-mono text-base ${isAbnormal ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                        {res.value}
                      </div>
                      <div className="text-right font-mono text-xs text-slate-500">
                        {res.referenceRange || '--'}
                      </div>
                    </div>
                    {(res.explanation || res.interpretation) && (
                      <div className="px-4 pb-4 pt-0">
                        <div className={`text-xs p-3 rounded-xl flex gap-2 ${isAbnormal ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-slate-800 text-slate-400'}`}>
                          {isAbnormal ? <AlertCircle size={14} className="shrink-0" /> : <CheckCircle2 size={14} className="shrink-0" />}
                          <p className="m-0 leading-relaxed">{res.explanation || res.interpretation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-amber-50 rounded-3xl p-6 border border-amber-100"
        >
          <div className="flex items-center gap-2 mb-4 text-amber-700">
            <div className="bg-amber-100 p-2 rounded-xl">
              <ArrowRight size={20} />
            </div>
            <h3 className="font-bold text-lg">Recommended Next Steps</h3>
          </div>
          <ul className="space-y-3 m-0 p-0 list-none">
            {recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 text-amber-900/80 text-sm">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-[10px] text-slate-400 italic text-center leading-relaxed">
          <span className="font-bold uppercase not-italic block mb-1">Medical Disclaimer</span>
          This analysis is generated by AI for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </p>
      </div>
    </div>
  );
};

export default InterpretationView;
