import React, { useState } from 'react';
import { User, AttendanceRecord, VerificationResult } from '../types';
import WebcamCapture from './WebcamCapture';
import { verifyUser } from '../services/geminiService';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface AttendanceViewProps {
  users: User[];
  onAddAttendance: (user: User) => Promise<void>;
}

type Status = 'idle' | 'verifying' | 'success' | 'failure' | 'no_users';

const AttendanceView: React.FC<AttendanceViewProps> = ({ users, onAddAttendance }) => {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState('');

  const handleVerification = async (liveImagesBase64: string[]) => {
    if (liveImagesBase64.length === 0) {
      setStatus('failure');
      setMessage('Verification Failed');
      setDetails('Could not capture an image. Please try again.');
      return;
    }
    const liveImageBase64 = liveImagesBase64[0];

    if (users.length === 0) {
      setStatus('no_users');
      setMessage('No Users Registered');
      setDetails('Please register users in the admin view before marking attendance.');
      return;
    }

    setStatus('verifying');
    setMessage('Verifying your identity...');
    setDetails('Please hold still. This may take a moment.');

    let matchFound = false;
    let finalFailureReason = 'Could not verify your identity. Please try again.';
    let livenessFailed = false;

    for (const user of users) {
      const result: VerificationResult | null = await verifyUser(liveImageBase64, user.profileImageBase64);
      
      if (result && result.isLive && result.isMatch) {
        
        await onAddAttendance(user);

        setStatus('success');
        setMessage(`Attendance Marked for ${user.name}`);
        setDetails(`Welcome, ${user.name}! Your check-in at ${new Date().toLocaleTimeString()} was successful.`);
        matchFound = true;
        break; // Exit loop on successful match
      } else if (result) {
          // Log details for debugging purposes
          console.log(`Verification attempt for ${user.name}: Live=${result.isLive}, Match=${result.isMatch}`);
          console.log(`Liveness Reason: ${result.livenessReason}`);
          console.log(`Match Reason: ${result.matchReason}`);
          
          if (!result.isLive) {
            livenessFailed = true; // Prioritize liveness failure message
            finalFailureReason = `Liveness Check Failed: ${result.livenessReason}. Please make sure you are in a well-lit room and are not using a photo or screen.`;
          } else if (!result.isMatch && !livenessFailed) {
            // Only set match failure reason if a liveness check hasn't already failed
            finalFailureReason = "Identity Match Failed: We could not recognize you. Please ensure you are a registered user and your face is clearly visible.";
          }
      } else if (!livenessFailed) {
         // Handle cases where the API call might fail for a user
         finalFailureReason = "An error occurred during verification. Please try again.";
      }
    }

    if (!matchFound) {
      setStatus('failure');
      setMessage('Verification Failed');
      setDetails(finalFailureReason);
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'verifying':
        return { icon: <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />, color: 'text-blue-500' };
      case 'success':
        return { icon: <CheckCircle className="h-16 w-16 text-green-500" />, color: 'text-green-500' };
      case 'failure':
        return { icon: <XCircle className="h-16 w-16 text-red-500" />, color: 'text-red-500' };
      case 'no_users':
        return { icon: <AlertTriangle className="h-16 w-16 text-yellow-500" />, color: 'text-yellow-500' };
      default:
        return null;
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 text-center">
        {status === 'idle' ? (
          <>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Mark Your Attendance</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Position your face clearly in the camera frame and press the button.</p>
            <WebcamCapture onCapture={handleVerification} buttonText="Mark Attendance" />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            {statusContent && (
              <div className="mb-4">
                {statusContent.icon}
              </div>
            )}
            <h2 className={`text-3xl font-bold ${statusContent?.color}`}>{message}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md">{details}</p>
            <button
              onClick={() => {
                setStatus('idle');
                setMessage('');
                setDetails('');
              }}
              className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              {status === 'success' || status === 'no_users' ? 'Go Back' : 'Try Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceView;
