import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Upload, X, Loader2, CheckCircle2, FileText, Pill, Activity, AlertCircle, Info, ArrowRight, Heart, Thermometer, ShieldCheck } from 'lucide-react';
import { analyzeMedicalImage } from '../services/geminiService';
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
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
      case 'prescription': return 'Scan Prescription';
      case 'lab_report': return 'Scan Lab Report';
      default: return 'Scan Document';
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
    const file = e.target.files?.[0];
    if (file) {
      setImageBlob(file);
      if (file.type === 'application/pdf') {
        setPreviewUrl('pdf-placeholder');
      } else {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleCameraCapture = (blob: Blob) => {
    setImageBlob(blob);
    setPreviewUrl(URL.createObjectURL(blob));
    setIsCameraOpen(false);
  };

  const handleScan = async () => {
    if (!imageBlob || !user) return;

    setLoading(true);
    setStatus('Optimizing document...');
    
    try {
      // 1. Ultra-Aggressive Compression for maximum speed
      let finalBlob = imageBlob;
      if (imageBlob.type.startsWith('image/')) {
        try {
          // 700px is the "sweet spot" for speed vs OCR accuracy
          // Lowering quality to 0.3 significantly reduces payload size
          finalBlob = await compressImage(imageBlob, 700, 700, 0.3);
          console.log(`Ultra-Optimized: ${(imageBlob.size / 1024).toFixed(1)}KB -> ${(finalBlob.size / 1024).toFixed(1)}KB`);
        } catch (e) {
          console.warn("Compression failed", e);
        }
      }

      const reportId = Math.random().toString(36).substring(2, 15);
      let extension = 'jpg';
      if (finalBlob.type === 'application/pdf') {
        extension = 'pdf';
      } else if (finalBlob.type.startsWith('image/')) {
        extension = finalBlob.type.split('/')[1] || 'jpg';
      }
      
      const storagePath = `medical_reports/${user.uid}/${reportId}.${extension}`;
      const storageRef = ref(storage, storagePath);
      
      setStatus('Uploading to Cloud...');

      // 2. Start all processes in parallel
      // Convert to base64 for Gemini
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          setStatus('Performing OCR & Vision Analysis...');
          resolve(reader.result as string);
        };
        reader.onerror = () => reject(new Error("Local read failed"));
        reader.readAsDataURL(finalBlob);
      });

      // Start the upload immediately
      const uploadPromise = uploadBytes(storageRef, finalBlob).then(() => {
        return getDownloadURL(storageRef);
      });
      
      // Start the AI analysis as soon as base64 is ready
      const analysisPromise = base64Promise.then(async (base64) => {
        const result = await analyzeMedicalImage(base64, finalBlob.type);
        setStatus('Extracting Medicines & Lab Data...');
        return result;
      });

      // 3. Wait ONLY for AI analysis to show results immediately
      // This is the "Speed Optimization": we don't wait for the upload or firestore save to show the answer
      const analysis = await analysisPromise;

      if (!analysis || typeof analysis !== 'object' || Array.isArray(analysis)) {
        throw new Error("The AI was unable to interpret this document. Please ensure the image is clear.");
      }

      // Show results to user immediately
      setAnalysisResult(analysis);
      setLoading(false);
      setStatus('Analysis Complete');

      // 4. Background Persistence (Fire and Forget)
      // We continue the upload and save in the background so the user doesn't have to wait
      (async () => {
        try {
          const imageUrl = await uploadPromise;
          
          const validTypes = ['prescription', 'lab_report', 'imaging_report', 'ecg', 'discharge_summary', 'raw_medical_image', 'other'];
          const reportType = validTypes.includes(analysis.report_type) ? analysis.report_type : 'other';

          const reportData = {
            user_id: user.uid,
            report_id: reportId,
            report_type: reportType,
            type: reportType,
            imageUrl: imageUrl,
            image_url: imageUrl,
            ocr_text: analysis.ocr_text || '',
            summary: analysis.summary || '',
            main_findings: analysis.main_findings || [],
            ai_analysis: analysis.ai_analysis || '',
            medicine_list: analysis.medicine_list || [],
            lab_results: analysis.lab_results || [],
            imaging_details: analysis.imaging_details || null,
            ecg_details: analysis.ecg_details || null,
            analysis: JSON.stringify(analysis),
            created_at: serverTimestamp(),
          };

          const reportsCollection = collection(db, 'reports');
          const reportRef = await addDoc(reportsCollection, reportData);

          if (analysis.medicine_list && Array.isArray(analysis.medicine_list) && analysis.medicine_list.length > 0) {
            const batch = writeBatch(db);
            for (const med of analysis.medicine_list) {
              const medRef = firestoreDoc(collection(db, 'medicines'));
              batch.set(medRef, {
                reportId: reportRef.id,
                userId: user.uid,
                name: med.name || 'Unknown Medicine',
                dosage: med.dosage || '',
                frequency: med.timing || med.frequency || '',
                purpose: med.purpose || '',
                side_effects: med.side_effects || '',
                createdAt: serverTimestamp(),
              });
            }
            await batch.commit();
          }
          console.log("Background save complete");
        } catch (bgError) {
          console.error("Background save failed:", bgError);
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
            {/* Health Status Header */}
            <div className={`card ${getStatusTheme(analysisResult.overall_health_status).bg} ${getStatusTheme(analysisResult.overall_health_status).text} border-none p-6 shadow-xl relative overflow-hidden`}>
              <div className="relative z-10 flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  {getStatusTheme(analysisResult.overall_health_status).icon}
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest opacity-80">Health Status</h3>
                  <p className="text-2xl font-black">{analysisResult.overall_health_status || 'Analyzed'}</p>
                </div>
                {analysisResult.urgency_level && (
                  <div className="ml-auto bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-white/30">
                    Urgency: {analysisResult.urgency_level}/5
                  </div>
                )}
              </div>
              <Activity className="absolute -right-8 -bottom-8 text-white/5" size={160} />
            </div>

            {/* AI Summary */}
            <div className="card p-6 bg-white border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Heart size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Doctor's Summary</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {analysisResult.summary}
              </p>
            </div>

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
                onClick={() => { setAnalysisResult(null); setImageBlob(null); setPreviewUrl(null); }}
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
              className="flex-1 min-h-[300px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 bg-slate-50 overflow-hidden relative shadow-inner"
            >
              {previewUrl ? (
                <div className="w-full h-full relative group flex items-center justify-center">
                  {previewUrl === 'pdf-placeholder' ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-32 h-32 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                        <FileText size={64} />
                      </div>
                      <p className="font-bold text-slate-700">{(imageBlob as File)?.name}</p>
                    </div>
                  ) : (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => { setPreviewUrl(null); setImageBlob(null); }}
                      className="bg-white p-3 rounded-full shadow-lg text-red-500 hover:scale-110 transition-transform"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 p-8">
                  <div className={`w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center ${getAccentColor()}`}>
                    {getIcon()}
                  </div>
                  <div className="text-center">
                    <p className="text-slate-600 font-medium">No document selected</p>
                    <p className="text-slate-400 text-sm mt-1">Use the camera to scan or upload a file</p>
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
                  <Upload size={20} /> Upload File
                </button>
                
                <button 
                  disabled={!imageBlob || loading || !user}
                  onClick={handleScan}
                  className={`py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                    !imageBlob || loading || !user
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 active:scale-95'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <><CheckCircle2 size={20} /> Analyze</>
                  )}
                </button>
              </div>
              {!user && (
                <p className="text-center text-red-500 text-sm font-medium">
                  Please sign in to analyze and save your documents.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input 
        type="file" 
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

