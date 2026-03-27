import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Upload, X, Loader2, CheckCircle2, FileText, Pill, Activity, AlertCircle, Info, ArrowRight, Heart, Thermometer, ShieldCheck, Stethoscope, Trash2 } from 'lucide-react';
import { analyzeMedicalImages } from '../services/geminiService';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, writeBatch, doc as firestoreDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import CameraScanner from '../components/CameraScanner';
// Lazy load heavy component
const InterpretationView = lazy(() => import('../components/InterpretationView'));
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
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Analyzing your report...');
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
      
      // Dynamic loading messages
      const messages = [
        "Analyzing your report...",
        "Checking medical values...",
        "Generating health insights...",
        "Structuring diet recommendations...",
        "Finalizing interpretation..."
      ];
      let msgIndex = 0;
      const msgInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        setLoadingMessage(messages[msgIndex]);
      }, 2500);

      // 1. Start Gemini Analysis
      const analysisPromise = analyzeMedicalImages(processedImages.map(img => ({ base64: img.base64, mimeType: img.mimeType })));
      
      // 2. Start Storage Uploads in parallel with Gemini
      const storageUploadPromises = processedImages.map(async (img) => {
        const formData = new FormData();
        formData.append('file', img.blob, (img.blob as File).name || 'report.jpg');
        formData.append('userId', user.uid);

        console.log(`Uploading to server proxy: /api/upload`);
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Server upload failed with status: ${response.status}`);
          }

          const data = await response.json();
          console.log(`Upload successful via proxy: ${data.imageUrl}`);
          return { ...img, fileUrl: data.imageUrl, reportId: data.reportId, extension: img.mimeType.split('/')[1] || 'jpg' };
        } catch (uploadErr: any) {
          console.error(`Upload failed via proxy:`, uploadErr);
          // Fallback to a placeholder if upload fails, so we still save the analysis
          return { ...img, fileUrl: 'https://picsum.photos/seed/medical/800/600', reportId: Math.random().toString(36).substring(2, 15), extension: img.mimeType.split('/')[1] || 'jpg' };
        }
      });

      // Wait for Gemini first to show results to user ASAP
      const analysis = await analysisPromise;
      clearInterval(msgInterval);

      if (!analysis) {
        throw new Error("The AI was unable to interpret these documents.");
      }

      setAnalysisResult(analysis);
      setLoading(false);
      setStatus('Analysis Complete');
      setSaving(true);

      // 3. Background Persistence (wait for storage and then save to Firestore)
      (async () => {
        try {
          const uploadedImages = await Promise.all(storageUploadPromises);
          const batch = writeBatch(db);
          const reportsCollection = collection(db, 'reports');
          const medicinesCollection = collection(db, 'medicines');
          
          console.log("Starting background Firestore persistence...");
          
          // Prepare ONE Report for the entire scan
          const reportDocRef = firestoreDoc(reportsCollection);
          const reportId = reportDocRef.id;
          
          const reportData = {
            userId: user.uid,
            fileNames: uploadedImages.map(img => (img.blob as File).name || `report_${img.reportId}.${img.extension}`),
            fileUrls: uploadedImages.map(img => img.fileUrl),
            type: analysis.reports_breakdown?.[0]?.type || 'medical_report',
            analysis: analysis,
            createdAt: serverTimestamp(),
          };
          batch.set(reportDocRef, reportData);

          // Prepare Medicines
          const medicineList = analysis.medicine_list || analysis.medicines || [];
          for (const med of medicineList) {
            const medDocRef = firestoreDoc(medicinesCollection);
            const medData = {
              userId: user.uid,
              reportId: reportId, // Link to the report
              medicine_name: med.name || 'Unknown Medicine',
              dosage: med.dosage || 'Not specified',
              timing: med.timing || 'Not specified',
              use: med.purpose || med.simple_explanation || 'Not specified',
              side_effects: med.side_effects || 'Not specified',
              createdAt: serverTimestamp(),
            };
            batch.set(medDocRef, medData);
          }
          
          await batch.commit();
          console.log("Background persistence complete");
          setSaving(false);
        } catch (bgError: any) {
          console.error("Background persistence failed:", bgError);
          setSaving(false);
          if (bgError.code?.startsWith('firestore/') || bgError.message?.includes('permission')) {
            handleFirestoreError(bgError, OperationType.WRITE, 'batch_save');
          }
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
        <h1 className="text-2xl font-bold">{analysisResult ? 'Analysis Result' : getTitle()}</h1>
        <p className="text-slate-500">
          {analysisResult 
            ? 'Here is what our AI found in your document' 
            : `Capture your ${docType?.replace('_', ' ') || 'medical document'} for instant analysis`}
        </p>
      </div>

      {loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-white/90 backdrop-blur-xl z-[200] flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full"
            ></motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity size={40} className="text-primary animate-pulse" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">{loadingMessage}</h3>
          <p className="text-slate-500 font-bold">This usually takes 10-15 seconds...</p>
          
          <div className="mt-12 max-w-xs w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 15, ease: "linear" }}
              className="h-full bg-primary"
            ></motion.div>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {analysisResult ? (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {saving && (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                <Loader2 size={20} className="text-emerald-500 animate-spin" />
                <p className="text-sm font-bold text-emerald-700">Saving to your medical history...</p>
              </div>
            )}

            <Suspense fallback={<div className="p-12 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm"><Loader2 className="animate-spin mx-auto text-primary mb-4" size={32} /><p className="text-slate-500 font-bold">Loading analysis view...</p></div>}>
              <InterpretationView report={analysisResult} />
            </Suspense>

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
                        <img src={url} alt="Preview" className="w-full h-full object-cover" loading="lazy" decoding="async" />
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
      <section className="mt-12">
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">How it works</h3>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Secure & Private</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {[
            { title: 'Secure Upload', desc: 'Your document is encrypted and stored in our private medical cloud.', icon: <Upload size={18} /> },
            { title: 'AI Processing', desc: 'Our medical-grade AI reads and interprets the document in seconds.', icon: <Activity size={18} /> },
            { title: 'Database Entry', desc: 'A structured record is created in your personal history database.', icon: <FileText size={18} /> },
            { title: 'Instant Access', desc: 'You can view your full medical history anytime from the Reports tab.', icon: <ArrowRight size={18} /> }
          ].map((step, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex gap-5 items-start">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 font-black text-sm">
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 mb-1">{step.title}</p>
                <p className="text-xs text-slate-500 font-bold leading-relaxed opacity-80">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
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

