import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RotateCcw, Check, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraScannerProps {
  onCapture: (imageBlob: Blob) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStream(null);
  }, []);

  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    
    try {
      stopStream();

      // Try with high resolution first
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      let newStream: MediaStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        console.warn('Failed to get 1080p stream, falling back to default video', e);
        // Fallback to simpler constraints if 1080p fails
        newStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }, 
          audio: false 
        });
      }

      streamRef.current = newStream;
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        // Ensure video plays
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.error('Error playing video:', playErr);
        }
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is already in use by another application or tab.');
      } else {
        setError(`Error accessing camera: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsInitializing(false);
    }
  }, [stopStream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
  }, [startCamera, stopStream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Use actual video dimensions
        canvas.width = video.videoWidth || video.clientWidth;
        canvas.height = video.videoHeight || video.clientHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.5);
        setCapturedImage(imageData);
        
        stopStream();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          onCapture(blob);
        }
      }, 'image/jpeg', 0.5);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="text-white p-2 rounded-full bg-black/20 backdrop-blur-md">
          <X size={24} />
        </button>
        <div className="text-white font-medium">Scan Document</div>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Camera View / Preview */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {isInitializing && !capturedImage && (
          <div className="flex flex-col items-center gap-4 text-white">
            <RefreshCw className="animate-spin" size={40} />
            <p>Initializing Camera...</p>
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-white flex flex-col items-center gap-4">
            <div className="bg-red-500/20 p-4 rounded-full text-red-500">
              <X size={40} />
            </div>
            <p>{error}</p>
            <button onClick={startCamera} className="btn-primary px-6">Try Again</button>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${capturedImage ? 'hidden' : 'block'}`}
        />

        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain"
          />
        )}

        {/* Scan Overlay Guide */}
        {!capturedImage && !error && !isInitializing && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[85%] h-[70%] border-2 border-white/50 rounded-2xl relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black p-8 pb-12 flex items-center justify-around">
        <AnimatePresence mode="wait">
          {!capturedImage ? (
            <motion.button
              key="capture"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={capturePhoto}
              disabled={isInitializing || !!error}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-transparent active:scale-90 transition-transform disabled:opacity-50"
            >
              <div className="w-16 h-16 rounded-full bg-white"></div>
            </motion.button>
          ) : (
            <div className="flex items-center justify-around w-full max-w-xs">
              <motion.button
                key="retake"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                onClick={retakePhoto}
                className="flex flex-col items-center gap-2 text-white"
              >
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                  <RotateCcw size={24} />
                </div>
                <span className="text-xs">Retake</span>
              </motion.button>

              <motion.button
                key="confirm"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={confirmPhoto}
                className="flex flex-col items-center gap-2 text-white"
              >
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Check size={40} />
                </div>
                <span className="text-sm font-bold">Process</span>
              </motion.button>
            </div>
          )}
        </AnimatePresence>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraScanner;
