import React, { useState, useMemo } from 'react';
import { Pill, Activity, AlertCircle, CheckCircle2, Info, FileText, ArrowRight, Stethoscope, Heart, Download, Share2, Loader2, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { downloadPDF, shareReport } from '../utils/reportGenerator';

interface Medicine {
  name: string;
  dosage: string;
  timing?: string;
  frequency?: string;
  purpose: string;
  simple_explanation?: string;
}

interface LabResult {
  parameter?: string;
  testName?: string;
  value: string;
  unit?: string;
  min_ref?: number;
  max_ref?: number;
  referenceRange?: string;
  interpretation?: string;
  explanation?: string;
  is_abnormal?: boolean;
  status?: string;
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
    easy_explanation?: string;
    potential_symptoms?: string[];
    overall_health_status?: string;
    urgency_level?: string;
    holistic_summary?: string;
    potential_diagnosis_guess?: string;
    confidence_level?: string;
    combined_symptoms?: string[];
    dietary_recommendations?: { food: string; benefit: string }[];
    diet_recommendations?: { 
      to_eat: { food: string; reason: string; linked_to?: string }[]; 
      to_avoid: { food: string; reason: string; linked_to?: string }[];
      lifestyle_habits?: string[];
    };
    key_findings?: string[];
    health_insights?: string[];
    precautions?: string[];
    next_steps?: string[];
    clinical_interpretation?: string;
    possible_explanations?: string[];
    lifestyle_guidance?: string[];
    urgent_medical_advice?: string;
    confidence_and_limitations?: string;
    reports_breakdown?: any[];
    main_findings?: string[];
    ai_analysis?: string;
    medicine_list?: Medicine[];
    lab_results?: LabResult[];
    imaging_details?: ImagingDetails;
    ecg_details?: EcgDetails;
    analysis?: any; // Can be object or string
  };
}

const InterpretationView: React.FC<InterpretationProps> = ({ report }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const reportId = useMemo(() => `RXD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, []);
  const dateGenerated = useMemo(() => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), []);

  // Parse analysis if needed
  let analysis: any = {};
  if (typeof report.analysis === 'object' && report.analysis !== null) {
    analysis = report.analysis;
  } else {
    try {
      if (typeof report.analysis === 'string') {
        analysis = JSON.parse(report.analysis);
      } else if (report.ai_analysis) {
        analysis = JSON.parse(report.ai_analysis);
      }
    } catch (e) {
      console.error("Failed to parse analysis", e);
    }
  }

  const summary = analysis.summary || report.summary || analysis.holistic_summary || report.holistic_summary;
  const easyExplanation = report.easy_explanation || analysis.easy_explanation;
  const keyFindings = report.key_findings || analysis.key_findings || report.main_findings || analysis.main_findings || [];
  const healthInsights = report.health_insights || analysis.health_insights || [];
  const clinicalInterpretation = analysis.clinical_interpretation || report.clinical_interpretation;
  const possibleExplanations = analysis.possible_explanations || report.possible_explanations || [];
  const lifestyleGuidance = analysis.lifestyle_guidance || report.lifestyle_guidance || [];
  const urgentMedicalAdvice = analysis.urgent_medical_advice || report.urgent_medical_advice;
  const confidenceAndLimitations = analysis.confidence_and_limitations || report.confidence_and_limitations;
  
  const precautions = report.precautions || analysis.precautions || [];
  const nextSteps = report.next_steps || analysis.next_steps || analysis.recommendations || [];
  const medicines = report.medicine_list || analysis.medicine_list || analysis.medicines || [];
  const labResults = report.lab_results || analysis.lab_results || analysis.labResults || [];
  const imagingDetails = report.imaging_details || analysis.imaging_details;
  const ecgDetails = report.ecg_details || analysis.ecg_details;
  const aiAnalysis = report.ai_analysis || analysis.ai_analysis;
  const diagnosisGuess = report.potential_diagnosis_guess || analysis.potential_diagnosis_guess;
  const confidence = report.confidence_level || analysis.confidence_level;
  const breakdown = report.reports_breakdown || analysis.reports_breakdown;
  const healthStatus = report.overall_health_status || analysis.overall_health_status || 'Good';
  const urgency = report.urgency_level || analysis.urgency_level;
  
  const reportObj = report as any;
  const patientDetails = analysis.patient_details || reportObj.patient_details || {};
  const patientName = patientDetails.name || analysis.patient_name || reportObj.patient_name || 'Valued User';
  const patientAge = patientDetails.age || analysis.patient_age || reportObj.patient_age || '';
  const patientGender = patientDetails.gender || analysis.patient_gender || reportObj.patient_gender || '';
  const labName = patientDetails.lab_name || analysis.lab_name || reportObj.lab_name || '';
  const doctorName = patientDetails.doctor_name || analysis.doctor_name || reportObj.doctor_name || '';
  const testDate = patientDetails.test_date || analysis.test_date || reportObj.test_date || '';
  
  const dietRecommendations = report.diet_recommendations || analysis.diet_recommendations || report.dietary_recommendations || analysis.dietary_recommendations || {};
  const toEat = Array.isArray(dietRecommendations) ? dietRecommendations : (dietRecommendations.to_eat || []);
  const toAvoid = Array.isArray(dietRecommendations) ? [] : (dietRecommendations.to_avoid || []);
  const lifestyleHabits = dietRecommendations.lifestyle_habits || [];
  const recommendations = nextSteps;

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Urgent medical attention':
      case 'Critical': 
        return 'bg-rose-600';
      case 'Significant Concern':
      case 'Attention Needed': 
        return 'bg-rose-500';
      case 'Moderate Concern':
        return 'bg-amber-500';
      case 'Mild Abnormality':
        return 'bg-blue-500';
      default: 
        return 'bg-emerald-600';
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const fileName = `Medical_Report_${diagnosisGuess || 'Analysis'}_${new Date().toISOString().split('T')[0]}`;
      await downloadPDF('report-content', fileName);
    } catch (error) {
      console.error('Download failed', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await shareReport(report);
    } catch (error) {
      console.error('Share failed', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 px-1">
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          {isSharing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
          Share
        </button>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
        >
          {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Download PDF
        </button>
      </div>

      <div id="report-content" className="flex flex-col gap-8 bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden break-words">
        {/* Professional Report Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pb-8 border-b-2 border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Activity size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">RXDecode AI</h1>
              <p className="text-sm font-bold text-primary uppercase tracking-widest">Medical Analysis Report</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex flex-col items-end mb-2">
              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full border border-rose-100 uppercase tracking-widest">Confidential</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report ID</span>
              <span className="text-sm font-mono font-bold text-slate-700">{reportId}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Generated</span>
              <span className="text-sm font-bold text-slate-700">{dateGenerated}</span>
            </div>
          </div>
        </div>

        {/* Patient & Laboratory Information Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-5 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Details</p>
            <p className="text-sm font-black text-slate-900 break-words">{patientName}</p>
            {(patientAge || patientGender) && (
              <p className="text-[11px] font-bold text-slate-500 mt-1">
                {[patientAge, patientGender].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Laboratory / Clinic</p>
            <p className="text-sm font-black text-slate-900 break-words">{labName || 'Not detected in document'}</p>
            {testDate && (
              <p className="text-[11px] font-bold text-slate-500 mt-1">Date: {testDate}</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prescribing Doctor</p>
            <p className="text-sm font-black text-slate-900 break-words">{doctorName || 'Not detected in document'}</p>
            {testDate && !labName && (
              <p className="text-[11px] font-bold text-slate-500 mt-1">Report Date: {testDate}</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Analysis Type</p>
            <p className="text-sm font-black text-slate-900 capitalize break-words">{report.type?.replace('_', ' ') || 'Medical Report'}</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1">Status: {healthStatus}</p>
          </div>
        </div>

        {/* Diagnosis Guess - Prominent */}
      {diagnosisGuess && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${getStatusBg(healthStatus)} text-white rounded-3xl p-8 shadow-xl relative overflow-hidden`}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                <Stethoscope size={32} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-1">Potential Diagnosis</h3>
                <p className="text-2xl md:text-3xl font-black tracking-tight break-words">{diagnosisGuess}</p>
                <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-3">
                  {urgency && (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/10">
                      Urgency: {urgency}
                    </span>
                  )}
                  {confidence && (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/10">
                      Confidence: {confidence}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
              <Activity size={18} />
              <span className="text-sm font-bold">Status: {healthStatus}</span>
            </div>
          </div>
          <Activity className="absolute -right-8 -bottom-8 text-white/5" size={200} />
        </motion.div>
      )}

      {/* Summary & Explanation */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <FileText size={20} />
            </div>
            <h3 className="font-black text-xl text-slate-900">Summary</h3>
          </div>
          <p className="text-base md:text-lg text-slate-700 leading-relaxed font-medium break-words">
            {summary}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-emerald-50 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-emerald-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <Info size={20} />
            </div>
            <h3 className="font-black text-xl text-emerald-900">Simple Explanation</h3>
          </div>
          <p className="text-base md:text-lg text-emerald-800 leading-relaxed font-medium italic break-words">
            "{easyExplanation}"
          </p>
        </motion.div>
      </div>

      {/* Clinical Interpretation & Urgent Advice */}
      <div className="flex flex-col gap-6">
        {clinicalInterpretation && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-50/50 rounded-[2.5rem] p-8 border border-indigo-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <Stethoscope size={20} />
              </div>
              <h3 className="font-black text-xl text-indigo-900">Clinical Interpretation</h3>
            </div>
            <p className="text-slate-700 leading-relaxed font-medium">
              {clinicalInterpretation}
            </p>
          </motion.div>
        )}

        {urgentMedicalAdvice && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 rounded-[2.5rem] p-8 border-2 border-rose-200 shadow-lg shadow-rose-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-black text-xl text-rose-900">Urgent Medical Advice</h3>
                <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">Immediate Attention Required</p>
              </div>
            </div>
            <p className="text-lg font-black text-rose-900 leading-relaxed">
              {urgentMedicalAdvice}
            </p>
          </motion.div>
        )}
      </div>

      {/* Key Findings & Possible Explanations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {keyFindings.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm"
          >
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Key Findings</h4>
            <div className="space-y-4">
              {keyFindings.map((finding: string, idx: number) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm font-bold text-slate-700 leading-relaxed break-words">{finding}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {possibleExplanations.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm"
          >
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Common Explanations</h4>
            <div className="space-y-4">
              {possibleExplanations.map((explanation: string, idx: number) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <p className="text-sm font-bold text-slate-700 leading-relaxed break-words">{explanation}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Health Insights (from old reports or other sources) */}
      {healthInsights.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm"
        >
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Additional Health Insights</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {healthInsights.map((insight: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-xs font-medium text-slate-600">{insight}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Lifestyle Guidance */}
      {lifestyleGuidance.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Activity size={20} />
            </div>
            <h3 className="font-black text-xl text-slate-900">Lifestyle Guidance</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {lifestyleGuidance.map((item: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <CheckCircle2 size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm font-bold text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Personalized Diet & Lifestyle */}
      {(toEat.length > 0 || toAvoid.length > 0 || lifestyleHabits.length > 0) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm overflow-hidden relative"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#28A745]/10 rounded-2xl flex items-center justify-center text-[#28A745]">
                <Heart size={24} />
              </div>
              <div>
                <h3 className="font-black text-2xl text-slate-900">Personalized Diet & Lifestyle</h3>
                <p className="text-sm font-bold text-slate-400">Nutritional roadmap based on your biomarkers</p>
              </div>
            </div>
  
            <div className="grid md:grid-cols-2 gap-8">
              {toEat.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#28A745] flex items-center gap-2 mb-2">
                    <CheckCircle2 size={14} /> Foods to Prioritize
                  </h4>
                  <div className="space-y-3">
                    {toEat.map((item: any, idx: number) => (
                      <div key={idx} className="p-5 bg-[#28A745]/5 rounded-2xl border border-[#28A745]/10 group hover:border-[#28A745]/30 transition-all">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <p className="text-base font-black text-slate-900">{item.food || item.name}</p>
                          {item.linked_to && (
                            <span className="shrink-0 text-[9px] font-black uppercase tracking-widest bg-[#28A745]/10 text-[#28A745] px-2 py-0.5 rounded-full">
                              Ref: {item.linked_to}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-bold leading-relaxed">{item.reason || item.benefit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
  
              {toAvoid.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 flex items-center gap-2 mb-2">
                    <AlertCircle size={14} /> Foods to Limit
                  </h4>
                  <div className="space-y-3">
                    {toAvoid.map((item: any, idx: number) => (
                      <div key={idx} className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100 group hover:border-rose-200 transition-all">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <p className="text-base font-black text-slate-900">{item.food || item.name}</p>
                          {item.linked_to && (
                            <span className="shrink-0 text-[9px] font-black uppercase tracking-widest bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                              Ref: {item.linked_to}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-bold leading-relaxed">{item.reason || item.benefit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {lifestyleHabits.length > 0 && (
              <div className="mt-10 pt-10 border-t border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2 mb-6">
                  <Activity size={14} /> Meal Habits & Lifestyle
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {lifestyleHabits.map((habit: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <p className="text-sm font-bold text-slate-700">{habit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#28A745]/5 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        </motion.div>
      )}

      {/* Precautions & Next Steps */}
      <div className="grid lg:grid-cols-2 gap-6">
        {precautions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100"
          >
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 mb-6">Precautions</h4>
            <ul className="space-y-4">
              {precautions.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-sm font-bold text-amber-900/80 break-words">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {nextSteps.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10"
          >
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">Next Steps</h4>
            <ul className="space-y-4">
              {nextSteps.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-sm font-bold text-slate-700 break-words">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Reports Breakdown */}
      {breakdown && breakdown.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-800 px-1">Reports Breakdown</h3>
          <div className="space-y-4">
            {breakdown.map((report: any, i: number) => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <FileText size={16} />
                  </div>
                  <h4 className="font-bold text-slate-800 capitalize">{report.type.replace('_', ' ')}</h4>
                </div>
                <p className="text-xs text-slate-600 mb-3">{report.summary}</p>
                <ul className="space-y-1">
                  {report.findings.map((finding: string, j: number) => (
                    <li key={j} className="text-[11px] text-slate-500 flex items-start gap-2 break-words">
                      <div className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                      <span className="flex-1">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
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
              <p className="text-slate-600 text-sm leading-relaxed break-words">{imagingDetails.impressions}</p>
            </div>
          )}
          
          {imagingDetails.observations && (
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-1">Key Observations</h4>
              <p className="text-slate-600 text-sm leading-relaxed break-words">{imagingDetails.observations}</p>
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
              <p className="text-slate-600 text-sm leading-relaxed break-words">{ecgDetails.interpretation}</p>
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
                  {med.simple_explanation && (
                    <p className="text-[11px] text-emerald-600 mt-2 bg-emerald-50/50 p-2 rounded-lg">
                      <span className="font-bold">Why:</span> {med.simple_explanation}
                    </p>
                  )}
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
            <div className="grid grid-cols-2 xs:grid-cols-[1.5fr_1fr_1fr] gap-2 md:gap-4 p-3 md:p-4 bg-slate-800/50 border-bottom border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <div>Parameter</div>
              <div className="text-center">Value</div>
              <div className="hidden xs:block text-right">Reference</div>
            </div>
            <div className="flex flex-col">
              {labResults.map((res: LabResult, idx: number) => {
                const isAbnormal = res.is_abnormal || 
                                  res.interpretation?.toLowerCase().includes('high') || 
                                  res.interpretation?.toLowerCase().includes('low') ||
                                  res.interpretation?.toLowerCase().includes('abnormal');
                
                return (
                  <div key={idx} className="flex flex-col border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <div className="grid grid-cols-2 xs:grid-cols-[1.5fr_1fr_1fr] gap-2 md:gap-4 p-3 md:p-4 items-center">
                      <div className="font-medium text-slate-200 text-xs md:text-sm break-words">
                        {res.parameter || res.testName}
                        <div className="xs:hidden text-[9px] text-slate-500 mt-1">Ref: {res.referenceRange || '--'}</div>
                      </div>
                      <div className={`text-center font-mono text-sm md:text-base ${isAbnormal ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                        {res.value}
                      </div>
                      <div className="hidden xs:block text-right font-mono text-xs text-slate-500">
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
              <li key={idx} className="flex items-start gap-3 text-amber-900/80 text-sm break-words">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="flex-1">{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Professional Footer */}
      <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-6">
        {confidenceAndLimitations && (
          <div className="max-w-xl text-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confidence & Limitations</p>
            <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
              {confidenceAndLimitations}
            </p>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck size={16} />
          <span className="text-xs font-black uppercase tracking-widest">Verified AI Analysis</span>
        </div>
        <p className="text-[10px] text-slate-400 text-center max-w-2xl leading-relaxed">
          This report was generated by RXDecode AI. It is intended for informational purposes only and should be reviewed by a qualified medical professional. RXDecode AI is not responsible for any diagnostic errors or health decisions made based on this report.
        </p>
        <div className="text-[10px] font-mono text-slate-300">
          Verification Code: {Math.random().toString(36).substr(2, 12).toUpperCase()}
        </div>
      </div>

      </div>

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
