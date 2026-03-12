import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X, Loader2, CheckCircle2, FileText } from 'lucide-react';
import { analyzeMedicalImage } from '../services/geminiService';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import CameraScanner from '../components/CameraScanner';

const Scan: React.FC = () => {
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

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
    setStatus('Uploading document...');
    
    try {
      // 1. Upload to Cloud Storage via Backend (to bypass rule/CORS issues)
      const formData = new FormData();
      formData.append('file', imageBlob);
      formData.append('userId', user.uid);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      let responseData;
      const contentType = uploadResponse.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await uploadResponse.json();
      } else {
        const text = await uploadResponse.text();
        console.error('Non-JSON response received:', text);
        throw new Error('Server returned an unexpected response format. Please try again.');
      }

      if (!uploadResponse.ok) {
        throw new Error(responseData.error || 'Failed to upload document');
      }

      const { imageUrl, reportId } = responseData;
      
      setStatus('Analyzing with AI...');

      // 2. Convert to base64 for Gemini (Frontend call)
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageBlob);
      });
      const base64Image = await base64Promise;

      // 3. Call Gemini API
      const analysis = await analyzeMedicalImage(base64Image, imageBlob.type);

      setStatus('Saving results...');

      // 4. Save to Firestore
      const reportData = {
        user_id: user.uid,
        report_id: reportId,
        report_type: analysis.report_type || 'prescription',
        type: analysis.report_type || 'prescription',
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

      // 5. Save medicines to dedicated collection if applicable
      if (analysis.medicine_list && Array.isArray(analysis.medicine_list) && analysis.medicine_list.length > 0) {
        const { writeBatch, doc: firestoreDoc } = await import('firebase/firestore');
        const batch = writeBatch(db);
        
        for (const med of analysis.medicine_list) {
          const medRef = firestoreDoc(collection(db, 'medicines'));
          batch.set(medRef, {
            reportId: reportRef.id,
            userId: user.uid,
            medicine_name: med.name,
            name: med.name,
            dosage: med.dosage,
            frequency: med.timing || '',
            use: med.purpose,
            purpose: med.purpose,
            side_effects: med.side_effects || 'Consult your doctor for potential side effects.',
            createdAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }
      
      const typeLabels: Record<string, string> = {
        'prescription': 'Prescription',
        'lab_report': 'Lab report',
        'imaging_report': 'Imaging report',
        'ecg': 'ECG report',
        'discharge_summary': 'Discharge summary',
        'other': 'Medical report'
      };
      const typeLabel = typeLabels[analysis.report_type] || 'Medical report';
      setStatus(`${typeLabel} analyzed successfully!`);
      setTimeout(() => navigate('/reports'), 1500);
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message || 'Please try again.'}`);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-[80vh]">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Scan Document</h2>
        <p className="text-slate-500">Capture your prescription, lab report, CT/MRI, or ECG</p>
      </div>

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
            <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center text-primary">
              <FileText size={48} />
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
            disabled={!imageBlob || loading}
            onClick={handleScan}
            className={`py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
              !imageBlob || loading 
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
      </div>

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

