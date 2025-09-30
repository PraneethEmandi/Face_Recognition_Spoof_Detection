
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (imagesBase64: string[]) => void;
  buttonText: string;
}

const CAPTURE_COUNT = 5;
const CAPTURE_INTERVAL = 400; // milliseconds

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, buttonText }) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureIntervalRef = useRef<number | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
    } catch (err) {
      console.error("Error accessing webcam:", err);
      alert("Could not access webcam. Please check permissions and try again.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
       if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, [stopCamera]);


  const handleStartCaptureSequence = () => {
    if (!videoRef.current || isCapturing) return;
  
    setIsCapturing(true);
    setCaptureProgress(0);
    const images: string[] = [];
  
    const captureFrame = () => {
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg');
          images.push(dataUrl);
          setCaptureProgress(images.length / CAPTURE_COUNT);
        }
      }
    };
  
    captureIntervalRef.current = window.setInterval(() => {
      if (images.length < CAPTURE_COUNT) {
        captureFrame();
      } else {
        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current);
        }
        setIsCapturing(false);
        onCapture(images);
        stopCamera();
      }
    }, CAPTURE_INTERVAL);
  };


  const handleToggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-inner aspect-video mb-4">
        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${!isCameraOn && 'hidden'}`}></video>
        {!isCameraOn && (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <CameraOff size={48} />
                <p className="mt-2">Camera is off</p>
            </div>
        )}
         {isCapturing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
            <div className="w-3/4 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${captureProgress * 100}%` }}></div>
            </div>
            <p className="text-white font-bold mt-2 text-lg">Capturing... {Math.round(captureProgress*CAPTURE_COUNT)}/{CAPTURE_COUNT}</p>
          </div>
        )}
      </div>
      <div className="flex space-x-4">
        <button
            onClick={handleToggleCamera}
            disabled={isCapturing}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
        >
            {isCameraOn ? <CameraOff className="mr-2 h-5 w-5" /> : <Camera className="mr-2 h-5 w-5" />}
            {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
        </button>
        {isCameraOn && (
            <button
                onClick={handleStartCaptureSequence}
                disabled={isCapturing}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
            >
                {buttonText}
            </button>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;