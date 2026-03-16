import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Upload, X, Loader2, CheckCircle2, FileText, Pill, Activity, AlertCircle, Info, ArrowRight, Heart, Thermometer, ShieldCheck, Stethoscope, Trash2 } from 'lucide-react';
import { analyzeMedicalImages } from '../services/geminiService';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, writeBatch, doc as firestoreDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import CameraScanner from '../components/CameraScanner';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { compressImage } from '../utils/imageCompression';

const LabResultVisualizer: React.FC<{ result: any }> = ({ result }) => {
  const { value, min_ref, max_ref, unit, status, parameter } = result;
  const numValue = parseFloat(value);
  
  // Calculate position percentage if we have refs
  let position = 50; // Default center
  if (min_ref !== null && max_ref !== null && !isNaN(numValue)) {
    const range = max_ref - min_ref;
    const offset = numValue - min_ref;
    position = (offset / range) * 100;
    // Clamp between 0 and 100
    position = Math.max(0, Math.min(100, position));
  }

  const getStatusColor = () => {
    switch (status) {
      case 'High': return 'text-rose-500';
      case 'Low': return 'text-amber-500';
      default: return 'text-emerald-500';
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'High': return 'bg-rose-500';
      case 'Low': return 'bg-amber-500';
      default: return 'bg-emerald-500';
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-slate-800 text-sm">{parameter}</h4>
          <p className="text-[10px] text-slate-400 font-medium">Ref: {result.reference_range}</p>
        </div>
        <div className="text-right">
          <span className={`text-lg font-black ${getStatusColor()}`}>{value}</span>
          <span className="text-[10px] text-slate-400 ml-1 font-bold uppercase">{unit}</span>
        </div>
      </div>

      {/* Visual Range Bar */}
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
        {/* Normal Range Highlight */}
        <div className="absolute inset-y-0 left-[25%] right-[25%] bg-emerald-100/50"></div>
        {/* Current Value Indicator */}
        <motion.div 
          initial={{ left: '50%' }}
          animate={{ left: `${position}%` }}
          className={`absolute top-0 w-2 h-full ${getBgColor()} shadow-[0_0_8px_rgba(0,0,0,0.2)] z-10`}
        ></motion.div>
      </div>

      <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
        <span>Low</span>
        <span>Normal</span>
        <span>High</span>
      </div>

      {result.explanation && (
        <p className="text-[10px] text-slate-500 mt-3 leading-tight bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
          "{result.explanation}"
        </p>
      )}
    </div>
  );
};

const Scan: React.FC = () => {
  const [imageBlobs, setImageBlobs] = useState<Blob[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const docType = searchParams.get('type');

  const getStatusTheme = (status: string) => {
    switch (status) {
      case 'Critical': return { bg: 'bg-rose-600', text: 'text-white', icon: <AlertCircle size={24} /> };
      case 'Attention Needed': return { bg: 'bg-amber-500', text: 'text-white', icon: <Info size={24} /> };
      default: return { bg: 'bg-emerald-600', text: 'text-white', icon: <ShieldCheck size={24} /> };
    }
  };

  const getTitle = () => {
    switch (docType) {
      case 'prescription': return 'Scan Prescriptions';
      case 'lab_report': return 'Scan Lab Reports';
      default: return 'Scan Documents';
    }
  };

  const getIcon = () => {
    switch (docType) {
      case 'prescription': return <Pill size={48} />;
      case 'lab_report': return <Activity size={48} />;
      default: return <FileText size={48} />;
    }
  };

  const getAccentColor = () => {
    switch (docType) {
      case 'prescription': return 'text-emerald-500';
      case 'lab_report': return 'text-blue-500';
      default: return 'text-primary';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageBlobs(prev => [...prev, ...files]);
      const newPreviews = files.map(file => 
        file.type === 'application/pdf' ? 'pdf-placeholder' : URL.createObjectURL(file)
      );
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const handleCameraCapture = (blob: Blob) => {
    setImageBlobs(prev => [...prev, blob]);
    setPreviewUrls(prev => [...prev, URL.createObjectURL(blob)]);
    setIsCameraOpen(false);
  };

  const removeImage = (index: number) => {
    setImageBlobs(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleScan = async () => {
    if (imageBlobs.length === 0 || !user) return;

    setLoading(true);
    setStatus('Optimizing documents...');
    
    try {
      const processedImages = await Promise.all(imageBlobs.map(async (blob) => {
        let finalBlob = blob;
        if (blob.type.startsWith('image/')) {
          try {
            finalBlob = await compressImage(blob, 700, 700, 0.3);
          } catch (e) {
            console.warn("Compression failed", e);
          }
        }
        
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(finalBlob);
        });
        
        return { base64, mimeType: finalBlob.type, blob: finalBlob };
      }));

      setStatus('Holistic AI Analysis...');
      const analysis = await analyzeMedicalImages(processedImages.map(img => ({ base64: img.base64, mimeType: img.mimeType })));

      if (!analysis) {
        throw new Error("The AI was unable to interpret these documents.");
      }

      setAnalysisResult(analysis);
      setLoading(false);
      setStatus('Analysis Complete');

      // Background Persistence
      (async () => {
        try {
          const batch = writeBatch(db);
          const reportsCollection = collection(db, 'reports');
          
          for (const img of processedImages) {
            const reportId = Math.random().toString(36).substring(2, 15);
            const extension = img.mimeType.split('/')[1] || 'jpg';
            const storagePath = `medical_reports/${user.uid}/${reportId}.${extension}`;
            const storageRef = ref(storage, storagePath);
            
            await uploadBytes(storageRef, img.blob);
            const imageUrl = await getDownloadURL(storageRef);
            
            const reportData = {
              user_id: user.uid,
              report_id: reportId,
              imageUrl: imageUrl,
              image_url: imageUrl,
              summary: analysis.holistic_summary || '',
              ai_analysis: JSON.stringify(analysis),
              created_at: serverTimestamp(),
              is_multi_scan: true
            };
            
            const newDocRef = firestoreDoc(reportsCollection);
            batch.set(newDocRef, reportData);
          }
          
          await batch.commit();
          console.log("Background multi-save complete");
        } catch (bgError) {
          console.error("Background multi-save failed:", bgError);
        }
      })();
    } catch (err: any) {
      console.error("Scanning error:", err);
      setStatus(`Failed: ${err.message || 'Please try again'}`);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-[80vh] pb-20">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{analysisResult ? 'Analysis Result' : getTitle()}</h2>
        <p className="text-slate-500">
          {analysisResult 
            ? 'Here is what our AI found in your document' 
            : `Capture your ${docType?.replace('_', ' ') || 'medical document'} for instant analysis`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {analysisResult ? (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Holistic Diagnosis Guess */}
            {analysisResult.potential_diagnosis_guess && (
              <div className={`card ${getStatusTheme(analysisResult.overall_health_status).bg} ${getStatusTheme(analysisResult.overall_health_status).text} border-none p-6 shadow-xl relative overflow-hidden`}>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest opacity-80">Potential Diagnosis Guess</h3>
                    <p className="text-2xl font-black">{analysisResult.potential_diagnosis_guess}</p>
                    {analysisResult.urgency_level && (
                      <p className="text-[10px] font-bold uppercase tracking-tighter mt-1 bg-white/20 inline-block px-2 py-0.5 rounded">
                        Urgency: {analysisResult.urgency_level}
                      </p>
                    )}
                  </div>
                  {analysisResult.confidence_level && (
                    <div className="ml-auto bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-white/30">
                      Confidence: {analysisResult.confidence_level}
                    </div>
                  )}
                </div>
                <Activity className="absolute -right-8 -bottom-8 text-white/5" size={160} />
              </div>
            )}

            {/* Holistic Summary */}
            <div className="card p-6 bg-white border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Heart size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Holistic Patient View</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {analysisResult.holistic_summary || analysisResult.summary}
              </p>
              {analysisResult.easy_explanation && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-xs text-emerald-800 leading-relaxed italic">
                    <span className="font-bold">Simple Explanation: </span>
                    {analysisResult.easy_explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Combined Symptoms */}
            {analysisResult.combined_symptoms && analysisResult.combined_symptoms.length > 0 && (
              <div className="card p-6 border-amber-100 bg-amber-50/30">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Thermometer size={20} className="text-amber-500" />
                  Combined Symptoms Found
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.combined_symptoms.map((symptom: string, i: number) => (
                    <span key={i} className="text-xs font-bold bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full shadow-sm">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dietary Recommendations */}
            {analysisResult.dietary_recommendations && analysisResult.dietary_recommendations.length > 0 && (
              <div className="card p-6 border-emerald-100 bg-emerald-50/30">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Heart size={20} className="text-emerald-500" />
                  Dietary Recommendations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analysisResult.dietary_recommendations.map((item: any, i: number) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                      <h4 className="font-bold text-emerald-800 text-sm mb-1">{item.food}</h4>
                      <p className="text-xs text-slate-600 leading-tight">{item.benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Breakdown */}
            {analysisResult.reports_breakdown && (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-slate-800 px-1">Reports Breakdown</h3>
                <div className="space-y-4">
                  {analysisResult.reports_breakdown.map((report: any, i: number) => (
                    <div key={i} className="card p-5 bg-white border-slate-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          <FileText size={16} />
                        </div>
                        <h4 className="font-bold text-slate-800 capitalize">{report.type.replace('_', ' ')}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mb-3">{report.summary}</p>
                      <ul className="space-y-1">
                        {report.findings.map((finding: string, j: number) => (
                          <li key={j} className="text-[11px] text-slate-500 flex items-start gap-2">
                            <div className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lab Results Visualization */}
            {analysisResult.lab_results && analysisResult.lab_results.length > 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-slate-800 px-1">Lab Analysis</h3>
                <div className="grid grid-cols-1 gap-4">
                  {analysisResult.lab_results.map((result: any, i: number) => (
                    <LabResultVisualizer key={i} result={result} />
                  ))}
                </div>
              </div>
            )}

            {/* Prescription Guide */}
            {analysisResult.medicine_list && analysisResult.medicine_list.length > 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-slate-800 px-1">Prescription Guide</h3>
                <div className="space-y-4">
                  {analysisResult.medicine_list.map((med: any, i: number) => (
                    <div key={i} className="card p-5 border-l-4 border-l-blue-500 bg-blue-50/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <Pill size={20} />
                          </div>
                          <h4 className="font-bold text-slate-800">{med.name}</h4>
                        </div>
                        <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-1 rounded-md uppercase">{med.timing}</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="mt-1 text-blue-500"><Info size={14} /></div>
                          <p className="text-xs text-slate-600 font-medium">
                            <span className="font-bold text-slate-800">Why: </span>
                            {med.simple_explanation || med.purpose}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="mt-1 text-emerald-500"><Thermometer size={14} /></div>
                          <p className="text-xs text-slate-600 font-medium">
                            <span className="font-bold text-slate-800">Dosage: </span>
                            {med.dosage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Findings */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-500" />
                Key Findings
              </h3>
              <ul className="space-y-3">
                {analysisResult.main_findings?.map((finding: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-primary">{i + 1}.</span>
                    {finding}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button 
                onClick={() => { setAnalysisResult(null); setImageBlobs([]); setPreviewUrls([]); }}
                className="btn-primary py-4 flex items-center justify-center gap-2"
              >
                Scan Another <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => navigate('/reports')}
                className="btn-secondary py-4"
              >
                Go to Medical History
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="scanner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            <div 
              className="flex-1 min-h-[300px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 bg-slate-50 overflow-hidden relative shadow-inner p-4"
            >
              {previewUrls.length > 0 ? (
                <>
                  <div className="flex justify-between items-center w-full px-2 mb-2">
                    <span className="text-xs font-bold text-slate-500">{imageBlobs.length} Documents Selected</span>
                    <button 
                      onClick={() => { setImageBlobs([]); setPreviewUrls([]); }}
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full h-full overflow-y-auto p-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
                      {url === 'pdf-placeholder' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-red-500 gap-2">
                          <FileText size={32} />
                          <p className="text-[10px] font-bold truncate px-2 w-full text-center">{(imageBlobs[index] as File)?.name}</p>
                        </div>
                      ) : (
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      <button 
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-slate-100 transition-colors"
                  >
                    <Upload size={24} />
                    <span className="text-[10px] font-bold">Add More</span>
                  </button>
                </div>
              </>
            ) : (
                <div className="flex flex-col items-center gap-6 p-8">
                  <div className={`w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center ${getAccentColor()}`}>
                    {getIcon()}
                  </div>
                  <div className="text-center">
                    <p className="text-slate-600 font-medium">No documents selected</p>
                    <p className="text-slate-400 text-sm mt-1">Scan or upload multiple reports at once</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setIsCameraOpen(true)}
                className="btn-primary py-5 flex items-center justify-center gap-3 text-lg shadow-lg shadow-primary/20"
              >
                <Camera size={24} /> Open Scanner
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary py-4 flex items-center justify-center gap-2"
                >
                  <Upload size={20} /> Upload Files
                </button>
                
                <button 
                  disabled={imageBlobs.length === 0 || loading || !user}
                  onClick={handleScan}
                  className={`py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all text-lg ${
                    imageBlobs.length === 0 || loading || !user
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 active:scale-95 hover:bg-emerald-700'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <><CheckCircle2 size={20} /> Analyze All</>
                  )}
                </button>
              </div>
              {!user && (
                <p className="text-center text-red-500 text-sm font-medium">
                  Please sign in to analyze and save your documents.
                </p>
              )}
            </div>

            {/* Step-by-Step Guide */}
            <div className="mt-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" />
                How your history is saved
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Secure Upload</p>
                    <p className="text-[10px] text-slate-500">Your document is encrypted and stored in our private medical cloud.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">AI Processing</p>
                    <p className="text-[10px] text-slate-500">Our medical-grade AI reads and interprets the document in seconds.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Database Entry</p>
                    <p className="text-[10px] text-slate-500">A structured record is created in your personal history database.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">4</div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Instant Access</p>
                    <p className="text-[10px] text-slate-500">You can view your full medical history anytime from the Reports tab.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input 
        type="file" 
        multiple
        accept="image/*,application/pdf" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <AnimatePresence>
        {isCameraOpen && (
          <CameraScanner 
            onCapture={handleCameraCapture}
            onClose={() => setIsCameraOpen(false)}
          />
        )}

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-md z-[110] flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-slate-100 rounded-full"></div>
              <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                <Loader2 size={32} className="animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{status}</h3>
            <p className="text-slate-500 max-w-xs">
              {status.includes('Analyzing') 
                ? 'Our AI is reading your document to extract key findings and medical details...' 
                : 'Securing your medical data in our cloud storage...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Scan;

