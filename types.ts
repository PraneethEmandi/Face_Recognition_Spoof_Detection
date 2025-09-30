
export interface User {
  id: string;
  name: string;
  employeeId: string;
  profileImageBase64: string[];
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  employeeId: string;
  timestamp: string;
}

export interface VerificationResult {
  isLive: boolean;
  livenessReason: string;
  isMatch: boolean;
  matchReason: string;
}